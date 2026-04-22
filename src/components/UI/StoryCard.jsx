"use client";

import { useEffect, useRef, useState } from "react";

/**
 * StoryCard.jsx - V3 Release Candidate
 * Vertical storytelling component with precise viral timing and iOS hardening.
 * Implements the Timeline: -1s (Overlay), 0s (Fade), +0.7s (Tribunal), +1.5s (CTA).
 */
export default function StoryCard({ entry, isVisible }) {
    const [isMuted, setIsMuted] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [viralState, setViralState] = useState("playing"); // playing, near_end, ended, hook_fade, hook_text, hook_cta
    const videoRef = useRef(null);

    // V3 RC: iOS Autoplay Hardening
    useEffect(() => {
        if (!videoRef.current) return;
        
        if (isVisible) {
            videoRef.current.muted = true; // Mandatory for mobile autoplay
            videoRef.current.play().catch(e => {
                // Silently catch and leave paused as per V3 spec
                console.warn("Autoplay blocked, leaving paused:", e);
            });
        } else {
            videoRef.current.pause();
            setViralState("playing"); // Reset viral state when scrolled away
        }
    }, [isVisible]);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        
        const duration = videoRef.current.duration;
        const currentTime = videoRef.current.currentTime;

        // V3 RC: -1s "Resultado en 1s..."
        if (duration > 0 && duration - currentTime <= 1.0 && viralState === "playing") {
            setViralState("near_end");
        }
    };

    const handleVideoEnd = () => {
        setViralState("ended");
        
        /**
         * V3 RC TIMELINE:
         * 0s: Video ends -> Fade dark.
         * +0.2s: Sequence starts.
         * +0.7s: “El Tribunal ya decidió…”
         * +1.5s: CTA appears.
         */
        setTimeout(() => {
            setViralState("hook_fade");
            
            // +0.7s Total
            setTimeout(() => {
                setViralState("hook_text");
                
                // +1.5s Total (0.7 + 0.8)
                setTimeout(() => {
                    setViralState("hook_cta");
                }, 800);
            }, 500); 
        }, 200);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const hasVideo = entry.videoUrl && entry.videoStatus === "approved";

    return (
        <div className={`relative w-full h-[100vh] snap-start bg-[#050508] overflow-hidden flex flex-col items-center justify-center transition-colors duration-700 ${viralState === 'ended' || viralState === 'hook_fade' || viralState === 'hook_text' || viralState === 'hook_cta' ? 'bg-black' : ''}`}>
            
            {/* Background Layer: Video or Animated Gradient */}
            {hasVideo ? (
                <div className={`absolute inset-0 z-0 select-none pointer-events-none transition-opacity duration-500 ${viralState === 'ended' || viralState === 'hook_fade' || viralState === 'hook_text' || viralState === 'hook_cta' ? 'opacity-20' : 'opacity-80'}`}>
                    <video 
                        ref={videoRef}
                        src={entry.videoUrl}
                        muted={isMuted}
                        loop={false}
                        playsInline
                        preload="metadata"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnd}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-black to-gold/5 animate-pulse-subtle opacity-50"></div>
            )}

            {/* CLICK SURFACE (Mute Toggle) */}
            <div 
                className="absolute inset-0 z-10 cursor-pointer" 
                onClick={toggleMute}
            >
                {isMuted && hasVideo && viralState === "playing" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-xl px-10 py-5 rounded-full border border-white/10 flex items-center gap-4 animate-bounce shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <span className="text-white text-[11px] font-black tracking-[0.3em] uppercase">Tap para Sonido 🔊</span>
                    </div>
                )}
            </div>

            {/* VIRAL OVERLAYS (Precise Timeline) */}
            {viralState === "near_end" && (
                <div className="absolute top-[20%] inset-x-0 z-40 flex justify-center animate-field">
                    <div className="px-10 py-3.5 bg-gold text-black font-black text-[11px] tracking-[0.4em] uppercase rounded-full shadow-[0_0_40px_rgba(212,175,55,0.3)] border border-white/20">
                        Resultado en 1s…
                    </div>
                </div>
            )}

            {(viralState === "hook_text" || viralState === "hook_cta") && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-12 animate-elegant">
                     <div className="royal-card p-12 text-center space-y-12 border-gold/40 border-2 max-w-sm w-full bg-black/60 backdrop-blur-2xl shadow-[0_0_100px_rgba(212,175,55,0.05)]">
                        <div className="space-y-6">
                            <span className="text-gold text-[8px] font-black tracking-[0.5em] uppercase opacity-60">Fallo Emitido</span>
                            <h2 className="text-4xl font-serif italic text-white mb-2 leading-tight animate-field">El Tribunal ya decidió…</h2>
                            <p className="text-gray-500 text-[10px] tracking-[0.2em] font-medium uppercase italic">¿Pocos usuarios coinciden en este nivel?</p>
                        </div>
                        
                        <div className={`flex flex-col gap-5 w-full transition-all duration-1000 ease-out ${viralState === 'hook_cta' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            <button className="royal-button py-6 px-12 text-sm font-black shadow-[0_0_40px_rgba(212,175,55,0.2)]">Demuestra tu criterio 🎥</button>
                            <button 
                                onClick={() => { setViralState("playing"); videoRef.current.currentTime = 0; videoRef.current.play(); }} 
                                className="bg-white/5 border border-white/10 text-white/40 py-4 px-12 rounded-2xl text-[9px] font-black tracking-[0.3em] uppercase hover:bg-white/10 hover:text-white transition-all transform hover:scale-[1.02]"
                            >Ver de nuevo ↺</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT LAYER */}
            <div className={`absolute inset-x-0 bottom-0 z-20 p-8 pb-44 bg-gradient-to-t from-black via-black/90 to-transparent space-y-8 transition-all duration-1000 ease-in-out ${viralState === "playing" || viralState === "near_end" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none"}`}>
                
                {/* Author Info */}
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full border-2 border-gold/40 flex items-center justify-center bg-black royal-card shadow-2xl overflow-hidden relative">
                        <span className="text-gold text-3xl">🔱</span>
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 to-transparent opacity-20"></div>
                    </div>
                    <div className="flex-1">
                        <p className="text-gold text-[11px] font-black tracking-[0.4em] uppercase mb-1">{entry.user?.nombre || entry.participante}</p>
                        <p className="text-white/40 text-[8px] tracking-[0.5em] uppercase font-black">Casa {entry.user?.casa || "Sin Rango"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 backdrop-blur-xl shadow-lg">
                         <span className="text-gold animate-pulse text-sm">✨</span>
                         <span className="text-white font-mono text-xl font-black">{entry.puntajeTotal || 0}</span>
                    </div>
                </div>

                {/* Story Content */}
                <div className="space-y-5">
                    <h3 className="text-2xl font-serif italic text-white leading-tight pr-12">
                        {entry.concurso?.titulo || "Crónica Sellada"}
                    </h3>
                    <p className={`text-gray-400 font-serif leading-relaxed text-sm antialiased ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {entry.texto}
                    </p>
                    {entry.texto.length > 150 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className="text-gold text-[10px] tracking-[0.4em] font-black uppercase hover:underline hover:text-white transition-colors"
                        >
                            {isExpanded ? "Contraer ⌃" : "Leer más v"}
                        </button>
                    )}
                </div>
            </div>

            {/* SIDE ACTIONS */}
            <div className={`absolute right-6 bottom-52 z-30 flex flex-col items-center gap-10 transition-all duration-1000 ease-in-out ${viralState === "playing" || viralState === "near_end" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
                <button className="flex flex-col items-center gap-3 group">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/40 transition-all shadow-2xl group-active:scale-90 group-active:rotate-[-10deg]">
                        <span className="text-3xl">⚔️</span>
                    </div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase group-hover:text-gold transition-colors">Duelo</span>
                </button>
                <button className="flex flex-col items-center gap-3 group">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-400/40 transition-all shadow-2xl group-active:scale-90 group-active:rotate-[10deg]">
                        <span className="text-3xl">✨</span>
                    </div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase group-hover:text-purple-400 transition-colors">{entry.votos || 0}</span>
                </button>
            </div>

        </div>
    );
}
