/**
 * /api/upload/video/route.js
 * Hardened upload endpoint for Phase 11.
 * Enforces size limits, rate limits, and status tracking.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { withTransactionRetry } from "@/lib/resilientDb";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "videos", "approved");
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const DAILY_LIMIT = 5;

// Safety check for directory
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        // Identify user OR guest
        const userId = session?.user?.id;
        const guestId = request.headers.get("x-guest-id");

        if (!userId && !guestId) {
            return NextResponse.json({ success: false, error: "Identidad no verificada" }, { status: 401 });
        }

        const formData = await request.formData();
        const video = formData.get("video");
        const entryId = formData.get("entryId");

        if (!video) {
            return NextResponse.json({ success: false, error: "No se recibió video" }, { status: 400 });
        }

        // 1. Size Guard
        if (video.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, error: "El archivo excede los 15MB permitidos" }, { status: 413 });
        }

        // 2. MIME Guard
        if (!video.type.includes("webm")) {
            return NextResponse.json({ success: false, error: "Solo se permite formato .webm" }, { status: 415 });
        }

        // 3. Rate Limit Guard (Atomic Check & Increment)
        const canUpload = await withTransactionRetry(async (tx) => {
            let entity;
            if (userId) {
                entity = await tx.user.findUnique({ 
                    where: { id: userId }, 
                    select: { videoUploadsToday: true, lastVideoUpload: true } 
                });
            } else {
                entity = await tx.guestSession.findUnique({ 
                    where: { guestId }, 
                    select: { videoUploadsToday: true, lastVideoUpload: true } 
                });
            }

            if (!entity) return true; // Fail open if no record yet (first time)

            const now = new Date();
            const lastUpload = entity.lastVideoUpload ? new Date(entity.lastVideoUpload) : null;
            const isSameDay = lastUpload && 
                             lastUpload.getDate() === now.getDate() && 
                             lastUpload.getMonth() === now.getMonth() && 
                             lastUpload.getFullYear() === now.getFullYear();

            const currentCount = isSameDay ? entity.videoUploadsToday : 0;

            if (currentCount >= DAILY_LIMIT) {
                return false;
            }

            // Update count
            if (userId) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        videoUploadsToday: isSameDay ? { increment: 1 } : 1,
                        lastVideoUpload: now
                    }
                });
            } else {
                await tx.guestSession.update({
                    where: { guestId },
                    data: {
                        videoUploadsToday: isSameDay ? { increment: 1 } : 1,
                        lastVideoUpload: now
                    }
                });
            }

            return true;
        }, { maxRetries: 3, timeout: 15000 });

        if (!canUpload) {
            return NextResponse.json({ success: false, error: "Límite diario de subidas (5) alcanzado" }, { status: 429 });
        }

        // 4. File Save
        const filename = `${uuidv4()}_${Date.now()}.webm`;
        const filePath = path.join(UPLOAD_DIR, filename);
        const buffer = Buffer.from(await video.arrayBuffer());
        
        fs.writeFileSync(filePath, buffer);

        const videoUrl = `/videos/approved/${filename}`;

        // 5. Atomic Link to Entry (Optional if entryId provided)
        if (entryId) {
            await prisma.entrada.update({
                where: { id: entryId },
                data: { 
                    videoUrl,
                    videoStatus: "pending" // Moderation layer active
                }
            });
        }

        return NextResponse.json({ 
            success: true, 
            videoUrl, 
            message: "Crónica sellada. Pendiente de aprobación del Tribunal." 
        });

    } catch (error) {
        console.error("❌ Video Upload Error:", error);
        return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
    }
}
