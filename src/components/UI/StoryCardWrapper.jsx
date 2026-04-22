"use client";

import { useEffect, useRef, useState } from "react";
import StoryCard from "./StoryCard";
import { useFeed } from "../FeedContext";
import { useGuest } from "../GuestContext";
import { useRouter } from "next/navigation";

/**
 * StoryCardWrapper.jsx - V3 Release Candidate
 * Client-side observer for Phase 11 Feed.
 * Manages IntersectionObserver (70% threshold) and the "Natural Transition" Guest Funnel.
 */
export default function StoryCardWrapper({ entry, index, total }) {
    const [isVisible, setIsVisible] = useState(false);
    const [interactionCount, setInteractionCount] = useState(0);
    const { isBlocked: globalBlocked, status } = useGuest();
    const [localBlocked, setLocalBlocked] = useState(false);
    const [funnelState, setFunnelState] = useState("free"); // free, fade, message, blocked
    const router = useRouter();
    const { setActiveEntryId } = useFeed();
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entryObs]) => {
                setIsVisible(isIntersecting);
                
                // V3 RC: Activate entry only if visible enough
                if (isIntersecting && status === "unauthenticated") {
                    setActiveEntryId(entry.id);
                    processInteraction();
                } else if (isIntersecting) {
                    setActiveEntryId(entry.id);
                }
            },
            { threshold: 0.7 } 
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, [entry.id, setActiveEntryId]);

    const processInteraction = () => {
        setInteractionCount((prev) => {
            const next = prev + 1;
            
            // V3 RC: Progressive Funnel Logic
            if (next === 2) {
                // Background tracking: Show subtle message
            } else if (next === 3) {
                // RC Stage 3: Natural Transition Sequence
                triggerFunnelTransition();
            }
            
            return next;
        });
    };

    const triggerFunnelTransition = () => {
        setFunnelState("fade");
        
        /**
         * V3 RC SEQUENCE:
         * 1st Delay: 650ms (Fade)
         * 2nd Delay: 400ms (Message)
         * Final: Blocked
         */
        setTimeout(() => {
            setFunnelState("message");
            
            setTimeout(() => {
                setFunnelState("blocked");
                setLocalBlocked(true);
            }, 400);
        }, 650);
    };

    const isEffectivelyBlocked = (status === "unauthenticated" && (globalBlocked || localBlocked));

    return (
        <div ref={containerRef} className="w-full h-full snap-start relative">
            <div className={`w-full h-full transition-all duration-1000 ${funnelState !== 'free' ? 'opacity-20 blur-md pointer-events-none grayscale' : 'opacity-100'}`}>
                <StoryCard entry={entry} isVisible={isVisible} />
            </div>

            {/* V3 RC PROGRESSIVE OVERLAYS */}
            {interactionCount === 2 && isVisible && funnelState === 'free' && (
                <div className="absolute top-24 inset-x-0 z-50 flex justify-center animate-field pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-xl px-10 py-3 rounded-full border border-gold/20 shadow-2xl">
                        <p className="text-gold text-[10px] font-black tracking-[0.4em] uppercase">Tu criterio se está definiendo…</p>
                    </div>
                </div>
            )}

            {funnelState === 'message' && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center animate-elegant bg-black/40">
                    <p className="text-white text-2xl font-serif italic text-center px-12 leading-relaxed shadow-gold/20">"Tu criterio está listo para el Tribunal"</p>
                </div>
            )}
            
            {isEffectivelyBlocked && (
                <div className="absolute inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-12 text-center animate-elegant">
                    <div className="royal-card p-12 space-y-12 border-gold/30 border-2 max-w-sm bg-black/80 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
                        <div className="space-y-6">
                            <span className="text-6xl animate-pulse-subtle block">🔱</span>
                            <h2 className="text-3xl font-serif italic text-white uppercase tracking-[0.3em] leading-normal">Santuario del Tribunal</h2>
                        </div>
                        
                        <div className="space-y-6">
                             <div className="bg-gold/5 border border-gold/20 py-2 rounded-full">
                                <p className="text-gold text-[11px] font-black tracking-[0.4em] uppercase">
                                    {globalBlocked ? "Tiempo de Gracia Agotado" : "Precisión estimada: 72%"}
                                </p>
                             </div>
                             <p className="text-gray-400 text-[12px] leading-relaxed font-serif italic opacity-80 antialiased">
                                {globalBlocked 
                                    ? "Has explorado la Ciudadela por más de 5 minutos." 
                                    : "Has alcanzado el límite de visión gratuita."}
                                <br/>Únete al Tribunal para sellar tu propio criterio en la Arena.
                             </p>
                        </div>

                        <div className="flex flex-col gap-6 pt-4">
                            <button onClick={() => router.push('/registro')} className="royal-button py-6 font-black tracking-[0.1em] text-sm shadow-[0_0_50px_rgba(212,175,55,0.2)]">Unirme Ahora 🔱</button>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] italic">Evolución bloqueada para invitados</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
