"use client";

import { useState, useEffect, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import IntentPaywall from "@/components/Identity/IntentPaywall";
import PostActionScreen from "@/components/Identity/PostActionScreen";
import { ShieldAlert, Droplet, Clock, Zap, Target, PenTool, BarChart3, RefreshCw, AlertTriangle } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const PAYWALL_MESSAGES = [
    { headline: "14 escritores ya están dentro...", sub: "Tu lugar se cierra en breve." },
    { headline: "18 contendientes ya están forjando...", sub: "Los cupos se agotan rápido." },
    { headline: "Quedan pocos lugares libres hoy...", sub: "El cónclave no espera a nadie." },
    { headline: "El velo está a punto de cerrarse...", sub: "Sólo los decididos entran a tiempo." },
];

const EMOTION_TAGS = {
    urgencia:  "🔴 Urgencia",
    perdida:   "💀 Pérdida",
    recompensa:"🏆 Recompensa",
    revancha:  "⚔️ Revancha",
    miedo:     "😨 Miedo al FOMO",
    panico:    "🚨 Pánico",
    alivio:    "😮‍💨 Alivio",
};

// ─────────────────────────────────────────────────────────────────────────────
// DEMO CONTENT
// ─────────────────────────────────────────────────────────────────────────────
function DemoContent() {
    // Estado principal
    const [tinta, setTinta]           = useState(100);
    const [view, setView]             = useState("hub"); // hub | arena | post
    const [paywallOpen, setPaywallOpen] = useState(false);
    const [paywallMsg, setPaywallMsg]  = useState(PAYWALL_MESSAGES[0]);
    const [rewards, setRewards]       = useState(null);

    // Arena
    const [timeLeft, setTimeLeft]     = useState(3600);
    const [arenaRunning, setArenaRunning] = useState(false);
    const [panicUsed, setPanicUsed]   = useState(false);
    const [timeFreeze, setTimeFreeze] = useState(false);

    // Panic visuals
    const [panicActive, setPanicActive] = useState(false);

    // Log
    const [logs, setLogs] = useState([
        { text: "[SISTEMA] Sandbox de auditoría iniciado.", emotion: null, time: "00:00" }
    ]);

    const startTime = useRef(Date.now());

    // ── Tick del reloj de arena ──
    useEffect(() => {
        if (!arenaRunning || timeFreeze) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) { clearInterval(t); setArenaRunning(false); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [arenaRunning, timeFreeze]);

    // ── Logger ──
    const log = (text, emotion = null) => {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
        const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
        const ss = String(elapsed % 60).padStart(2, "0");
        setLogs(prev => [{ text, emotion, time: `${mm}:${ss}` }, ...prev].slice(0, 14));
    };

    const fmt = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    // ── Entrar a arena ──
    const enterArena = () => {
        if (tinta < 20) {
            const msg = PAYWALL_MESSAGES[Math.floor(Math.random() * PAYWALL_MESSAGES.length)];
            setPaywallMsg(msg);
            setPaywallOpen(true);
            log("Intento de entrada fallido — tinta insuficiente. Paywall activado.", "urgencia");
        } else {
            setTinta(prev => prev - 20);
            setView("arena");
            setArenaRunning(true);
            setTimeLeft(3600);
            setPanicUsed(false);
            log("Entrada exitosa al Cónclave. -20 Tinta.", "recompensa");
        }
    };

    // ── Simular compra desde Paywall ──
    const handleSimulatePurchase = (pkg) => {
        log(`Checkout iniciado → Paquete [${pkg.name}]...`, "urgencia");
        setTimeFreeze(true);
        setPaywallOpen(false);

        setTimeout(() => {
            setTimeFreeze(false);
            setTinta(prev => prev + pkg.amount + pkg.bonus);
            log(`Pago completado. +${pkg.amount + pkg.bonus} Tinta inyectada.`, "alivio");
            // Inscripción automática y apertura directa del editor
            setTinka_then_arena(pkg.amount + pkg.bonus);
        }, 6000);
    };

    const setTinka_then_arena = (addAmount) => {
        setTinta(prev => {
            const next = prev;
            if (next >= 20) {
                setView("arena");
                setArenaRunning(true);
                setTimeLeft(3600);
                setPanicUsed(false);
                log("Auto-inscripción completada. Abriendo editor directo...", "recompensa");
            }
            return next;
        });
    };

    // ── Botón de pánico ──
    const handlePanic = () => {
        if (panicUsed) return;
        setPanicActive(true);
        log("Botón de Pánico activado — Checkout +5 Mins...", "panico");
        setTimeout(() => {
            setPanicActive(false);
            setTimeLeft(prev => prev + 300);
            setPanicUsed(true);
            log("5 minutos de emergencia inyectados al reloj.", "alivio");
        }, 3500);
    };

    // ── Near-Miss simulado ──
    const triggerNearMiss = () => {
        setView("post");
        setArenaRunning(false);
        setRewards({
            houseRank: "4º",
            houseLogo: "💀",
            streak: 0,
            streakReset: true,
            ink: 0,
            xp: 5,
            scorePercentile: 12,
            nearMissDelta: "1.2 puntos",
        });
        log("Derrota simulada — Near-Miss activado.", "revancha");
    };

    // ── Victoria simulada ──
    const triggerWin = () => {
        setView("post");
        setArenaRunning(false);
        setRewards({
            houseRank: "1º",
            houseLogo: "🐺",
            streak: 3,
            streakBonus: 10,
            ink: 50,
            xp: 100,
            streakReset: false,
        });
        log("Victoria simulada — Pantalla de recompensas activada.", "recompensa");
    };

    // ── Quedarse sin tinta (Recompra) ──
    const triggerBajaTinta = () => {
        setTinta(0);
        const msg = PAYWALL_MESSAGES[Math.floor(Math.random() * PAYWALL_MESSAGES.length)];
        setPaywallMsg(msg);
        setTimeout(() => {
            setPaywallOpen(true);
        }, 800);
        log("Tinta agotada. Disparando ciclo de recompra...", "perdida");
    };

    // ── Reset maestro ──
    const reset = () => {
        setTinta(100); setView("hub"); setPaywallOpen(false);
        setRewards(null); setArenaRunning(false); setTimeLeft(3600);
        setTimeFreeze(false); setPanicActive(false); setPanicUsed(false);
        setLogs([{ text: "[RESET] Estado reiniciado a cero.", emotion: null, time: "00:00" }]);
        startTime.current = Date.now();
    };

    const isCritical = timeLeft <= 180 && timeLeft > 0;
    const timeColor = isCritical ? "text-red-500" : timeLeft <= 600 ? "text-orange-400" : "text-white/80";

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row">

            {/* ── PANEL DE CONTROL ── */}
            <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-[#0a0a0a] flex flex-col h-auto md:h-screen md:overflow-y-auto">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-gold" />
                        <div>
                            <h2 className="text-gold font-serif italic text-lg uppercase tracking-widest">Sandbox</h2>
                            <p className="text-[9px] text-gray-500 tracking-widest uppercase">Herramienta de Auditoría</p>
                        </div>
                    </div>
                </div>

                {/* Estado */}
                <div className="p-4 border-b border-white/5 space-y-2">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Estado del Evaluador</p>
                    <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                        <span className="text-xs text-gray-400">Tinta Falsa</span>
                        <span className={`font-bold text-sm flex items-center gap-1 ${tinta === 0 ? "text-red-500 animate-pulse" : "text-gold"}`}>
                            {tinta} <Droplet className="w-3 h-3" />
                        </span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                        <span className="text-xs text-gray-400">Vista Activa</span>
                        <span className="text-[10px] font-mono text-white/60 uppercase">{view}</span>
                    </div>
                </div>

                {/* Controles */}
                <div className="p-4 space-y-2 border-b border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-3">Disparadores de Escenario</p>

                    <button onClick={() => { triggerBajaTinta(); }} className="w-full text-left p-3 text-[11px] bg-red-950/60 text-red-400 hover:bg-red-950 border border-red-900/50 rounded transition-all flex justify-between items-center group">
                        <span>💀 Simular Quiebra (Recompra)</span>
                        <Droplet className="w-3 h-3 group-hover:animate-pulse" />
                    </button>

                    <button onClick={() => { setTimeLeft(175); setArenaRunning(true); setView("arena"); log("Reloj forzado a últimos 3 minutos.", "panico"); }} className="w-full text-left p-3 text-[11px] bg-orange-950/60 text-orange-400 hover:bg-orange-950 border border-orange-900/50 rounded transition-all flex justify-between items-center">
                        <span>🚨 Forzar Últimos 3 Mins</span>
                        <Clock className="w-3 h-3" />
                    </button>

                    <button onClick={triggerNearMiss} className="w-full text-left p-3 text-[11px] bg-purple-950/60 text-purple-400 hover:bg-purple-950 border border-purple-900/50 rounded transition-all flex justify-between items-center">
                        <span>⚔️ Simular Near-Miss</span>
                        <Target className="w-3 h-3" />
                    </button>

                    <button onClick={triggerWin} className="w-full text-left p-3 text-[11px] bg-blue-950/60 text-blue-400 hover:bg-blue-950 border border-blue-900/50 rounded transition-all flex justify-between items-center">
                        <span>🏆 Simular Victoria</span>
                        <BarChart3 className="w-3 h-3" />
                    </button>

                    <button onClick={reset} className="w-full text-center p-2 text-[11px] text-gray-600 hover:text-white border border-white/5 hover:border-white/20 rounded transition-all flex justify-center items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Reinicio Maestro
                    </button>
                </div>

                {/* Log de eventos */}
                <div className="p-4 flex-1">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-3">Log de Comportamiento</p>
                    <div className="space-y-2">
                        {logs.map((l, i) => (
                            <div key={i} className={`transition-all ${i === 0 ? "opacity-100" : "opacity-40"}`}>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[8px] font-mono text-gray-600">{l.time}</span>
                                    {l.emotion && (
                                        <span className="text-[7px] font-black uppercase text-gold/70 tracking-wider">
                                            {EMOTION_TAGS[l.emotion]}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-[9px] font-mono leading-relaxed ${i === 0 ? "text-green-400" : "text-gray-600"}`}>
                                    {l.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* ── VIEWPORT ── */}
            <main className="flex-1 bg-[#0f0f0f] relative flex flex-col justify-center items-center overflow-hidden">

                {/* TIME FREEZE OVERLAY */}
                {timeFreeze && (
                    <div className="absolute inset-0 z-[300] flex flex-col items-center justify-center bg-black/97 backdrop-blur-3xl animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center mb-10">
                                <div className="w-16 h-16 rounded-full border-t-2 border-gold animate-spin"></div>
                                <Clock className="absolute w-6 h-6 text-gold/60" />
                            </div>
                        </div>
                        <p className="text-gold font-serif italic text-3xl md:text-5xl tracking-widest text-center px-8 leading-tight">
                            El Consejo ha detenido<br />el tiempo…
                        </p>
                        <p className="text-gray-400 text-xs tracking-[0.4em] font-sans uppercase mt-8 animate-pulse">
                            No desperdicies esta oportunidad.
                        </p>
                        <div className="mt-10 w-48 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
                    </div>
                )}

                {/* PANIC OVERLAY */}
                {panicActive && (
                    <div className="absolute inset-0 z-[200] pointer-events-none">
                        <div className="absolute inset-0 bg-red-950/30 animate-pulse"></div>
                        <div className="absolute inset-0 border-4 border-red-600/50 animate-pulse"></div>
                    </div>
                )}

                {/* HUD */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-sm z-10">
                    <div className="text-gold font-serif text-lg italic tracking-widest opacity-70">CUENTISTAS</div>
                    <div className="flex gap-4 items-center">
                        <span className={`font-bold text-sm flex items-center gap-1 ${tinta < 20 ? "text-red-500" : "text-gold"}`}>
                            {tinta} <Droplet className="w-3 h-3" />
                        </span>
                        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] text-gray-400">A</div>
                    </div>
                </div>

                {/* ── HUB VIEW ── */}
                {view === "hub" && (
                    <div className="max-w-lg w-full space-y-10 animate-in fade-in zoom-in-95 duration-700 px-6 mt-16">
                        <div className="text-center space-y-4">
                            <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em]">Concurso Activo — En vivo ahora</p>
                            <h1 className="text-5xl font-serif italic text-white leading-tight">El Torneo<br/>del Velo</h1>
                            <div className="flex justify-center gap-8 text-center">
                                <div>
                                    <p className="text-gold font-bold text-xl">18</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Compitiendo</p>
                                </div>
                                <div className="w-px bg-white/10"></div>
                                <div>
                                    <p className="text-gold font-bold text-xl">💧15,000</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Premio Total</p>
                                </div>
                                <div className="w-px bg-white/10"></div>
                                <div>
                                    <p className="text-gold font-bold text-xl">59:12</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Restante</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={enterArena}
                            className="w-full bg-white hover:bg-gold text-black py-6 text-[13px] font-black uppercase tracking-[0.4em] transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]"
                        >
                            Ingresar a la Arena (20 💧)
                        </button>

                        {tinta < 20 && (
                            <p className="text-center text-red-500 text-xs animate-pulse tracking-widest uppercase">
                                Tinta insuficiente — El paywall se activará
                            </p>
                        )}
                    </div>
                )}

                {/* ── ARENA VIEW ── */}
                {view === "arena" && (
                    <div className="w-full h-full flex flex-col pt-16">
                        {/* Timer bar */}
                        <div className={`px-8 py-4 border-b border-white/5 flex justify-between items-center ${isCritical ? "bg-red-950/20" : ""}`}>
                            <h2 className="text-sm text-gray-500 font-serif italic uppercase tracking-widest">Tu Manuscrito</h2>
                            <div className={`font-mono text-3xl font-bold transition-colors duration-1000 ${timeColor} ${isCritical ? "animate-pulse" : ""}`}>
                                {fmt(timeLeft)}
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 p-8 md:p-16">
                            <textarea
                                className="w-full h-full min-h-64 bg-transparent border-none outline-none text-xl resize-none font-serif text-gray-300 leading-loose placeholder:text-white/10"
                                placeholder="Escribe tu relato aquí..."
                                defaultValue="La niebla envolvía la ciudadela cuando decidí dar un paso al frente. No porque fuera valiente, sino porque detrás no quedaba nada que valiera la pena salvar."
                            />
                        </div>

                        {/* Botón de Pánico */}
                        {isCritical && !panicUsed && (
                            <button
                                onClick={handlePanic}
                                className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-500 text-white px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 rounded-full shadow-[0_0_60px_rgba(220,38,38,0.6)] border-2 border-red-400 animate-bounce hover:animate-none"
                            >
                                <Zap className="w-5 h-5" />
                                +5 MINS POR $19 MXN
                            </button>
                        )}

                        {panicUsed && (
                            <p className="fixed bottom-8 right-8 text-[9px] text-gray-600 uppercase tracking-widest">
                                Tiempo extra ya utilizado
                            </p>
                        )}

                        <div className="px-8 pb-6 flex justify-between items-center border-t border-white/5">
                            <button onClick={() => { setView("hub"); setArenaRunning(false); log("Abandono del cónclave.", "perdida"); }} className="text-xs text-gray-600 hover:text-white underline transition-colors">
                                Abandonar Cónclave
                            </button>
                            <div className="flex gap-4">
                                <button onClick={triggerNearMiss} className="text-[9px] text-gray-600 hover:text-purple-400 transition-colors uppercase tracking-widest">
                                    → Simular Derrota
                                </button>
                                <button onClick={triggerWin} className="text-[9px] text-gray-600 hover:text-gold transition-colors uppercase tracking-widest">
                                    → Simular Victoria
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ── OVERLAYS ── */}
            <IntentPaywall
                isOpen={paywallOpen}
                onClose={() => { setPaywallOpen(false); log("Paywall cerrado sin pagar.", "perdida"); }}
                tintaMissing={Math.max(0, 20 - tinta)}
                onIntentClick="demo_id"
                onSimulatePurchase={handleSimulatePurchase}
                overrideHeadline={paywallMsg.headline}
                overrideSub={paywallMsg.sub}
            />

            {view === "post" && rewards && (
                <PostActionScreen
                    rewards={rewards}
                    userStats={{ casaLogo: rewards?.houseLogo, streak: rewards?.streak }}
                    onClose={() => {
                        const wasNearMiss = rewards?.streakReset;
                        setView("hub");
                        setRewards(null);
                        if (wasNearMiss) {
                            log("Near-Miss cerrado. Evaluando si regresa a comprar...", "revancha");
                        } else {
                            log("Post-victoria cerrado. Posible segunda compra iniciada...", "recompensa");
                        }
                    }}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function DemoPage() {
    const mockSession = {
        user: {
            name: "Auditor",
            email: "demo@cuentistasonline.com",
            isFirstPurchase: true,
            totalSpent: 0,
        },
        expires: "2099-01-01T00:00:00Z",
    };

    return (
        <SessionProvider session={mockSession}>
            <DemoContent />
        </SessionProvider>
    );
}
