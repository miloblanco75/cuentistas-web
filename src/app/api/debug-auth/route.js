import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "ermiloblanco75@gmail.com";

    try {
        const user = await db.user.findUnique({
            where: { email },
            include: {
                accounts: true,
                sessions: true
            }
        });

        return NextResponse.json({
            ok: true,
            user: user ? {
                id: user.id,
                email: user.email,
                rol: user.rol,
                accounts: user.accounts.map(a => ({ provider: a.provider, id: a.id })),
                hasPassword: !!user.password
            } : "User not found"
        });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message });
    }
}
