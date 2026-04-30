/**
 * /feed/page.jsx
 * Vertical discovery engine for Phase 11.
 * TikTok-style scroll + Guest interaction limits.
 */

import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import StoryCardWrapper from "@/components/UI/StoryCardWrapper";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Hardened Quality Query for Zero-Regression Launch
    const entries = await prisma.entrada.findMany({
        where: {
            isTraining: false,
            OR: [
                { videoUrl: null }, // Show all text-only entries
                { AND: [{ videoUrl: { not: null } }, { videoStatus: "approved" }] } // Only approved videos
            ]
        },
        include: {
            concurso: { select: { titulo: true } },
            user: { select: { nombre: true, username: true, casa: true } }
        },
        orderBy: [
            { boostApplied: "desc" },
            { puntajeTotal: "desc" },
            { updatedAt: "desc" }
        ],
        take: 50 // Guardrails for performance
    });

    return (
        <main className="h-screen w-full bg-black overflow-hidden relative">
            
            {/* Minimal Global Nav Overlay */}
            <div className="fixed top-0 inset-x-0 z-[50] p-10 flex justify-between items-center pointer-events-none">
                <Link href="/hub" className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-[10px] tracking-[0.4em] uppercase text-gold font-bold hover:bg-gold hover:text-black transition-all">
                    Hub 🔱
                </Link>
                <div className="flex gap-4">
                    <Link href="/arena" className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-[10px] tracking-[0.4em] uppercase text-white font-bold">
                        Arena ⚔️
                    </Link>
                </div>
            </div>

            {/* Vertical Scroll Container (Snap Mandatory) */}
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
                {entries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-20">
                        <span className="text-6xl animate-pulse">🔱</span>
                        <h2 className="text-white text-2xl font-serif italic uppercase tracking-widest text-white/40">Los anales están vacíos</h2>
                        <p className="text-gray-500 text-xs tracking-widest uppercase">Sé el primero en sellar una leyenda</p>
                    </div>
                ) : (
                    entries.map((entry, idx) => (
                        <StoryCardWrapper key={entry.id} entry={entry} index={idx} total={entries.length} />
                    ))
                )}
            </div>

            {/* Participation Progress (Viral Hook) */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[40] flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-1 h-3 bg-white/10 rounded-full"></div>
                ))}
            </div>

        </main>
    );
}

// Sub-component wrapper to handle IntersectionObserver at client-level
// Note: This needs to be a separate Client Component file or defined here if using "use client"
