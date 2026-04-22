"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import RecorderModal from "../recorder/RecorderModal";
import { useFeed } from "../FeedContext";
import { useUser } from "../UserContext";

/**
 * GlobalRecorderFAB.jsx - V3 Release Candidate
 * Floating Action Button for global video recording.
 * Contextual: Changes text/behavior if there is an active story (activeEntryId).
 */
export default function GlobalRecorderFAB() {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { activeEntryId } = useFeed();
    const { isGuest } = useUser();

    // Visible only in discovery/competitive routes
    const visibleRoutes = ["/feed", "/arena", "/galeria", "/biblioteca"];
    const isVisible = visibleRoutes.includes(pathname);

    if (!isVisible) return null;

    const handleOpen = () => {
        if (isGuest) {
            alert("🔱 Solo los miembros del Tribunal pueden sellar historias. ¡Regístrate para participar!");
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <>
            <button 
                onClick={handleOpen}
                className="fixed bottom-10 right-32 z-[130] group flex items-center gap-5 bg-gold hover:bg-white text-black font-black py-5 px-10 rounded-full shadow-[0_0_60px_rgba(212,175,55,0.4)] transition-all hover:scale-105 active:scale-95 animate-elegant"
            >
                <div className="relative">
                    <span className="text-2xl">🎥</span>
                    {activeEntryId && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-gold animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                    )}
                </div>
                <span className="text-[11px] tracking-[0.4em] uppercase transition-all whitespace-nowrap">
                    {activeEntryId ? "Responder a este duelo" : "Grabar historia"}
                </span>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-gold/50 blur-2xl group-hover:bg-white/60 transition-all -z-10 group-hover:blur-3xl animate-pulse-subtle"></div>
            </button>

            <RecorderModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                targetEntryId={activeEntryId}
                onSave={(url) => {
                    console.log("🔱 Clip sellado en el Tribunal:", url);
                }}
            />
        </>
    );
}
