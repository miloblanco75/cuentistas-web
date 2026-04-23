"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CASAS } from "@/lib/constants";
import OnboardingTransitions from "./OnboardingTransitions";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function OnboardingWizard({ onComplete }) {
    const [step, setStep] = useState(1);
    const [stats, setStats] = useState({ activeHumans: 0, activeContest: "Cónclave Permanente", hasActiveLive: false });
    const [formData, setFormData] = useState({
        username: "",
        nombre: "",
        casa: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transitionPhase, setTransitionPhase] = useState(null); // 'connecting', 'preparing'
    const router = useRouter();

    useEffect(() => {
        // CARGA SEGURA DE ESTADÍSTICAS — nunca crashea ante respuestas inválidas
        (async () => {
            try {
                const res = await fetch("/api/stats/live");
                const text = await res.text();
                const data = text ? JSON.parse(text) : null;
                if (data?.ok && data.stats) setStats(data.stats);
            } catch (e) {
                console.warn("[Onboarding] Pulso de Ciudadela débil, usando valores por defecto.");
            }
        })();

        // Divine Shortcut for the Architect (Shift + A)
        const handleKeyDown = (e) => {
            if (e.shiftKey && (e.key === "A" || e.key === "a")) {
                router.push("/login");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    const nextStep = () => setStep(prev => prev + 1);

    const handleRegisterGuest = async () => {
        setIsSubmitting(true);
        const autoPassword = "12345678"; // LLAVE UNIVERSAL DE INVITADO (V46)
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                body: JSON.stringify({
                    username: formData.username,
                    nombre: formData.username,
                    password: autoPassword,
                    genero: "Fantasía",
                    escritor: "Anónimo"
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                // BREVE PAUSA DE SINCRONIZACIÓN LÁVICA (V40)
                // Permitir que la base de datos de producción persista al nuevo ser
                await new Promise(resolve => setTimeout(resolve, 2000));

                // AUTO-LOGIN UNIFICADO (V46)
                const authRes = await signIn("credentials", {
                    username: formData.username,
                    password: autoPassword,
                    redirect: false
                });

                if (authRes?.ok) {
                    nextStep();
                } else {
                    console.error("Auth Fail:", authRes);
                    alert("Error al sincronizar el alma. Inténtalo de nuevo.");
                }
            } else {
                const data = await res.json();
                alert(data.error || "Algo falló en el vínculo.");
            }
        } catch (e) {
            console.error("Registro Fallido:", e);
            alert("La Ciudadela está bajo presión. Inténtalo de nuevo en unos instantes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectHouse = async (casaId) => {
        setFormData({ ...formData, casa: casaId });
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/user", {
                method: "POST",
                body: JSON.stringify({ action: "joinHouse", casa: casaId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                nextStep();
            } else {
                alert("Error al sellar tu Casa. Reintenta.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteOnboarding = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/user", {
                method: "POST",
                body: JSON.stringify({ action: "completeOnboarding" }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                nextStep();
            } else {
                alert("Error al consagrar tu entrada. Reintenta.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalActivate = async () => {
        setTransitionPhase('connecting');
        
        // Simular latencia inmersiva
        setTimeout(() => {
            setTransitionPhase('preparing');
            setTimeout(() => {
                // REDIRECCIÓN UNIFICADA CON RECARGA TOTAL (V41)
                // Usamos window.location para limpiar la memoria del navegador y cargar sesión fresca
                const targetId = 'arena-activa-default';
                window.location.href = `/concursos/live/${targetId}?onboarding=true`;
                if (onComplete) onComplete();
            }, 800);
        }, 1200);
    };

    if (transitionPhase) return <OnboardingTransitions phase={transitionPhase} />;

    return (
        <div className="absolute inset-0 z-[400] bg-[#050505] text-white flex items-center justify-center overflow-hidden font-sans select-none">
            
            {/* Header de Identidad: Integrado, no bloqueante */}
            <header className="absolute top-0 left-0 w-full p-6 md:p-10 z-[300] flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="w-8 h-8 border border-gold/30 rounded-full flex items-center justify-center">
                         <span className="text-[10px] text-gold font-cinzel">C</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-5 pointer-events-auto">
                    <button 
                        onClick={() => signIn("google", { callbackUrl: "/hub" })}
                        className="hidden sm:flex items-center gap-2 px-5 py-2 hover:bg-white/5 transition-all text-[8px] tracking-[0.3em] uppercase text-white/40 hover:text-white"
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        </svg>
                        Google
                    </button>
                    <button 
                        onClick={() => router.push("/login")}
                        className="bg-gold/10 border border-gold/40 px-6 py-2 text-gold text-[8px] font-black tracking-[0.3em] uppercase hover:bg-gold hover:text-black transition-all"
                    >
                        Entrar
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                
                {/* STEP 1: HOOK + CLARIDAD + SOCIAL PROOF */}
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={nextStep}
                        className="max-w-xl text-center space-y-16 p-8 cursor-pointer"
                    >
                        <div className="space-y-6">
                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-6xl font-serif italic text-white tracking-widest leading-tight"
                            >
                                Las máquinas controlan el lenguaje.<br/>
                                <span className="text-gold">Usted es la última defensa humana.</span>
                            </motion.h1>
                            <p className="text-gold text-[10px] tracking-[0.6em] uppercase opacity-60">— El Despertar —</p>
                        </div>
                        
                        <div className="space-y-8 bg-white/5 p-10 border border-white/10 rounded-sm relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gold/5 animate-pulse"></div>
                             <h2 className="text-2xl font-light tracking-tight relative z-10 leading-relaxed">
                                Compite escribiendo en tiempo real contra otros humanos.
                             </h2>
                             <div className="flex justify-center gap-10 text-[10px] tracking-[0.3em] uppercase text-gray-400 font-bold relative z-10">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                                    {stats.activeHumans} Humanos en Línea
                                </span>
                                <span>🏆 {stats.activeContest}</span>
                             </div>
                        </div>

                        <p className="text-white/20 text-[9px] tracking-[0.5em] uppercase font-black">Tap en cualquier lugar para continuar</p>

                        <div className="pt-8 border-t border-white/5">
                            <button 
                                onClick={(e) => { e.stopPropagation(); router.push("/login"); }}
                                className="text-[10px] tracking-[0.3em] uppercase text-gold hover:text-white transition-colors"
                            >
                                Ya soy miembro del Cónclave → Iniciar Sesión
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: IDENTIDAD (Registro Guest) */}
                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="max-w-lg w-full text-center space-y-16 p-8"
                    >
                        <div className="space-y-4">
                             <p className="text-gold text-[10px] tracking-[0.5em] uppercase opacity-60">Vínculo de Sangre</p>
                             <h2 className="text-4xl font-serif italic">¿Cómo te recordará la historia?</h2>
                        </div>
                        
                        <div className="relative group">
                            <input 
                                autoFocus
                                disabled={isSubmitting}
                                className="w-full bg-transparent border-b-2 border-white/20 p-6 text-5xl text-center outline-none focus:border-gold transition-colors font-serif italic selection:bg-gold/20"
                                placeholder="Tu Pseudónimo..."
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                                onKeyDown={(e) => e.key === "Enter" && formData.username.length > 2 && handleRegisterGuest()}
                            />
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700"></div>
                        </div>

                        <div className="space-y-6">
                            <button 
                                disabled={formData.username.length < 3 || isSubmitting}
                                onClick={handleRegisterGuest}
                                className={`w-full py-8 text-[12px] font-black tracking-[0.8em] rounded-sm transition-all duration-500 flex items-center justify-center gap-4 ${
                                    formData.username.length < 3 
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10' 
                                    : 'bg-gold text-black shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:shadow-[0_0_80px_rgba(212,175,55,0.6)] hover:bg-amber-400 animate-pulse'
                                }`}
                            >
                                <span className="relative z-10">{isSubmitting ? "FORJANDO VÍNCULO..." : "ENTRAR AL MUNDO"}</span>
                                {!isSubmitting && <span className="text-black/40 text-[9px] font-bold group-hover:text-black transition-colors">(ACCESO INSTANTÁNEO)</span>}
                            </button>

                            <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase italic">
                                No necesitas contraseña. Tu nombre es tu llave.
                            </p>

                            <div className="flex items-center gap-4 py-6">
                                <div className="h-px flex-1 bg-white/10"></div>
                                <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">o usa tu cuenta de</span>
                                <div className="h-px flex-1 bg-white/10"></div>
                            </div>

                            <button 
                                onClick={() => signIn("google")}
                                className="w-full py-5 border-2 border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-[11px] tracking-[0.5em] uppercase flex items-center justify-center gap-4 group"
                            >
                                <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Vincular con Google
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: CASAS (Claridad Funcional) */}
                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="max-w-4xl w-full text-center space-y-16 p-8"
                    >
                        <div className="space-y-4">
                             <p className="text-gold text-[10px] tracking-[0.5em] uppercase opacity-60">El Linaje</p>
                             <h2 className="text-4xl font-serif italic">Elige tu casa</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {CASAS.map(casa => (
                                <button
                                    key={casa.id}
                                    disabled={isSubmitting}
                                    onClick={() => handleSelectHouse(casa.id)}
                                    className={`group royal-card p-10 text-center transition-all duration-700 border-white/10 hover:border-gold/50 flex flex-col items-center gap-6 ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{casa.logo}</span>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-serif italic text-white group-hover:text-gold transition-colors">{casa.nombre}</h3>
                                        <p className="text-[11px] tracking-wide text-gray-400 font-light italic leading-relaxed">
                                            {casa.id === 'lobo' ? 'Feros y rápidos. Escriben sin pensar y atacan primero.' : 
                                             casa.id === 'lechuza' ? 'Estrategas precisos. Analizan y golpean con técnica.' : 
                                             'Creativos impredecibles. Rompen las reglas para ganar.'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: RECOMPENSA + PROGRESO (Dopamina) */}
                {step === 4 && (
                    <motion.div 
                        key="step4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-lg text-center space-y-12 p-8"
                    >
                        <div className="relative inline-block">
                             <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="absolute inset-x-[-40px] inset-y-[-40px] bg-gold/20 blur-[80px] rounded-full"
                             ></motion.div>
                             <motion.span 
                                initial={{ y: 20 }}
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="text-[120px] relative z-10 drop-shadow-[0_0_30px_rgba(212,175,55,0.8)] block"
                            >🪙</motion.span>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-5xl font-serif italic text-gold animate-bounce">+10 Gotas de Tinta</h2>
                                <p className="text-xs tracking-[0.4em] uppercase text-gray-400 font-bold">Úsalas para entrar a torneos y subir de nivel.</p>
                            </div>
                            
                            <div className="py-8 border-y border-white/10 max-w-xs mx-auto">
                                <p className="text-2xl font-serif italic mb-4 text-white">Ya puedes entrar a tu primer torneo</p>
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full">
                                    <span className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse"></span>
                                    <span className="text-[10px] tracking-[0.5em] uppercase text-gold font-black">Nivel 1 — Principiante</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={isSubmitting}
                            onClick={handleCompleteOnboarding}
                            className="royal-button px-16 py-6 shimmer-effect w-full text-xs tracking-[0.5em]"
                        >
                            {isSubmitting ? "Consagrando..." : "ENTRAR A LA CIUDADELA"}
                        </button>
                    </motion.div>
                )}

                {/* STEP 5: ACTIVACIÓN CON URGENCIA */}
                {step === 5 && (
                    <motion.div 
                        key="step5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-xl text-center space-y-16 p-8"
                    >
                        <div className="space-y-8">
                            <div className="flex justify-center flex-col items-center gap-6">
                                <span className="text-5xl animate-bounce">🏛️</span>
                                <h2 className="text-6xl font-serif italic tracking-tighter leading-tight text-white">La Ciudadela te espera.</h2>
                            </div>
                            
                            <div className="space-y-4 py-8 bg-white/5 border border-white/10 rounded-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-gold text-[12px] tracking-[0.4em] font-black uppercase flex items-center justify-center gap-3">
                                     <span className="animate-pulse">⏳</span> {stats.hasActiveLive ? "El torneo actual ya comenzó" : "No hay torneo en este segundo... "}
                                </p>
                                <p className="text-white text-[11px] tracking-[0.5em] uppercase opacity-70 flex items-center justify-center gap-3">
                                     <span className="text-orange-500 animate-bounce">🔥</span> {stats.hasActiveLive ? `${stats.activeHumans} humanos compitiendo` : "Tu escritura ya cuenta"}
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleFinalActivate}
                            className="w-full py-10 bg-gold text-black font-black text-[12px] tracking-[0.6em] uppercase hover:bg-amber-400 transition-all rounded-sm shadow-[0_0_80px_rgba(212,175,55,0.5)] animate-pulse border-none active:scale-[0.97] flex items-center justify-center gap-4"
                        >
                            <span>⚔️ ENTRAR A COMBATIR AHORA</span>
                            <span className="text-black/40 text-[9px] font-bold">(QUEDAN POCOS LUGARES)</span>
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* Cinematic Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/10 rounded-full blur-[150px] animate-pulse"></div>
            </div>
        </div>
    );
}
