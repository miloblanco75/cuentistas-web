"use client";

import { useState, useEffect, useCallback } from "react";
import { Share2, X, Copy, Check } from "lucide-react";

// Mapa de iconos y colores por galardón
const GALARDON_META = {
    "Favorito del Tribunal": { icon: "👑", color: "text-yellow-500", border: "border-yellow-500/40", glow: "shadow-[0_0_40px_rgba(234,179,8,0.2)]" },
    "Top 10%":               { icon: "🔥", color: "text-purple-400", border: "border-purple-500/40", glow: "shadow-[0_0_40px_rgba(168,85,247,0.15)]" },
    "Rozaste el Podio":      { icon: "⚔️", color: "text-gray-300",   border: "border-gray-400/40",  glow: "" },
    "Favorito del Público":  { icon: "👁️", color: "text-blue-400",   border: "border-blue-500/40",  glow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]" },
    "Sangre Nueva":          { icon: "🩸", color: "text-red-400",    border: "border-red-500/40",   glow: "shadow-[0_0_40px_rgba(239,68,68,0.15)]" },
    "Hierro Persistente":    { icon: "🛡️", color: "text-emerald-400",border: "border-emerald-500/40",glow: "shadow-[0_0_40px_rgba(52,211,153,0.15)]" },
};

// Helper de tracking — nunca bloquea UX, falla silencioso
function track(event, payload = {}) {
    fetch("/api/analytics/referral-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, ...payload })
    }).catch(() => {});
}

// AJUSTE #1: isAutoPopup distingue popup automático de share manual
export default function PrestigeSealModal({ entrada, username, elo, onClose, isAutoPopup = true }) {
    const [copied, setCopied] = useState(false);
    const [sealing, setSealing] = useState(false);

    if (!entrada || !entrada.premios || entrada.premios.length === 0) return null;

    const topPremio = entrada.premios[0];
    const meta = GALARDON_META[topPremio] || { icon: "🏆", color: "text-gold", border: "border-gold/40", glow: "" };

    // AJUSTE #5: Mandato del concurso
    const mandato = entrada.concurso?.temaExacto || entrada.concurso?.temaGeneral || entrada.concurso?.titulo;

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://cuentistasonline.com";
    const shareUrl = `${baseUrl}/biblioteca/${entrada.id}?ref=${username}`;

    const mandatoLine = mandato ? `\nBajo el Mandato: "${mandato}"` : "";
    const whatsappText = `El Tribunal me ha reconocido.\n\n"${entrada.texto?.slice(0, 80)}..."${mandatoLine}\n\n${meta.icon} ${topPremio} — ELO ${elo}\n\nObserva el veredicto: ${shareUrl}`;
    const twitterText = `El Tribunal me ha reconocido. ${meta.icon} ${topPremio}.${mandato ? ` Mandato: "${mandato.slice(0, 40)}"` : ""}\n\nELO ${elo} — CuentistasOnline`;

    // TRACKING: registrar que el sello fue mostrado + timestamp para Time to Share
    const sealShownAt = Date.now();
    useEffect(() => {
        track("seal_shown", { invocador: username, entradaId: entrada.id });
    }, []);

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        const secondsToShare = Math.round((Date.now() - sealShownAt) / 1000);
        track("seal_shared", { invocador: username, platform: "copy", entradaId: entrada.id, secondsToShare });
        setTimeout(() => setCopied(false), 2500);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${meta.icon} ${topPremio} — El Tribunal me ha reconocido`,
                    text: whatsappText,
                    url: shareUrl,
                });
                const secondsToShare = Math.round((Date.now() - sealShownAt) / 1000);
                track("seal_shared", { invocador: username, platform: "native", entradaId: entrada.id, secondsToShare });
            } catch (e) {
                // El usuario canceló — no es error
            }
        } else {
            handleCopyLink();
        }
    };

    // AJUSTE #1: shareClaimed solo aplica si es un popup automático
    const handleClose = async () => {
        if (isAutoPopup && !sealing) {
            setSealing(true);
            // Solo marcamos shareClaimed cuando es el popup auto — nunca en el share manual
            try {
                await fetch("/api/user/share-claimed", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ entradaId: entrada.id })
                });
            } catch (e) {
                // Falla silenciosa — el popup ya se cerró visualmente
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
            {/* Cerrar al clickar overlay */}
            <div className="absolute inset-0" onClick={handleClose} />

            <div className={`relative z-10 w-full max-w-lg mx-auto rounded-lg border ${meta.border} bg-[#060608] ${meta.glow} overflow-hidden`}>

                {/* Botón cierre sutil */}
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors z-20">
                    <X size={16} />
                </button>

                {/* SELLO DE VICTORIA */}
                <div className="p-10 space-y-8 text-center">

                    <div className="space-y-2">
                        <p className="text-[9px] tracking-[0.8em] uppercase text-gray-500 font-sans">— Veredicto del Tribunal —</p>
                        <p className="text-xs text-white/50 italic font-serif">El Tribunal ha registrado tu victoria en los anales.</p>
                    </div>

                    {/* EL SELLO */}
                    <div className={`relative mx-auto w-44 h-44 flex items-center justify-center rounded-full border-2 ${meta.border} ${meta.glow}`}>
                        <div className="absolute inset-0 rounded-full animate-pulse opacity-10" style={{ background: 'currentColor' }}></div>
                        <span className="text-7xl">{meta.icon}</span>
                    </div>

                    {/* Nombre + ELO */}
                    <div className="space-y-1">
                        <p className={`text-xl font-black tracking-widest uppercase ${meta.color}`}>{topPremio}</p>
                        <p className="text-[10px] tracking-widest text-gray-600 font-mono uppercase">ELO {elo} · {username}</p>
                    </div>

                    {/* AJUSTE #5: Mandato específico del concurso */}
                    {mandato && (
                        <p className={`text-[9px] tracking-[0.4em] uppercase font-sans italic ${meta.color} opacity-60`}>
                            Mandato: "{mandato}"
                        </p>
                    )}

                    {/* Extracto de la obra */}
                    {entrada.texto && (
                        <p className="text-sm font-serif italic text-gray-400 leading-relaxed border-y border-white/5 py-6 line-clamp-2">
                            "{entrada.texto.slice(0, 120)}{entrada.texto.length > 120 ? '...' : ''}"
                        </p>
                    )}

                    <p className="text-[8px] tracking-[0.6em] uppercase text-gray-700 font-sans">cuentistasonline.com</p>
                </div>

                {/* ACCIONES */}
                <div className="border-t border-white/5 bg-black/40 p-6 space-y-4">
                    <p className="text-center text-[10px] tracking-widest uppercase text-gray-500">
                        Es momento de que el mundo exterior lo sepa.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={() => track("seal_shared", { invocador: username, platform: "whatsapp", entradaId: entrada.id, secondsToShare: Math.round((Date.now() - sealShownAt) / 1000) })}
                            className="flex flex-col items-center gap-2 p-3 rounded border border-white/10 hover:border-green-500/40 hover:bg-green-500/5 transition-all group"
                        >
                            <span className="text-xl">💬</span>
                            <span className="text-[8px] tracking-widest uppercase text-gray-500 group-hover:text-green-400 transition-colors">WhatsApp</span>
                        </a>

                        <a
                            href={`https://x.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={() => track("seal_shared", { invocador: username, platform: "twitter", entradaId: entrada.id, secondsToShare: Math.round((Date.now() - sealShownAt) / 1000) })}
                            className="flex flex-col items-center gap-2 p-3 rounded border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group"
                        >
                            <span className="text-xl">𝕏</span>
                            <span className="text-[8px] tracking-widest uppercase text-gray-500 group-hover:text-white transition-colors">Twitter / X</span>
                        </a>

                        <button
                            onClick={handleNativeShare}
                            className="flex flex-col items-center gap-2 p-3 rounded border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
                        >
                            <Share2 size={20} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                            <span className="text-[8px] tracking-widest uppercase text-gray-500 group-hover:text-purple-400 transition-colors">Más</span>
                        </button>
                    </div>

                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 rounded text-[9px] tracking-widest uppercase text-gray-500 hover:border-gold/30 hover:text-gold transition-all"
                    >
                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copied ? "Link copiado en los anales" : "Copiar link de la obra"}
                    </button>
                </div>
            </div>
        </div>
    );
}
