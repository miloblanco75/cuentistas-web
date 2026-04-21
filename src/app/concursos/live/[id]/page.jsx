"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { safeFetch } from "@/lib/api";
import { useUser } from "@/components/UserContext";

export default function LiveContestPage() {
    const { id } = useParams();
    const router = useRouter();
    const { userData, isGuest } = useUser();
    const [concurso, setConcurso] = useState(null);
    const [user, setUser] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [text, setText] = useState("");
    const [status, setStatus] = useState("loading");
    const [isSuspicious, setIsSuspicious] = useState(false);
    const [showAlarm, setShowAlarm] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    // Creator Mode & Recording
    const [isCreatorMode, setIsCreatorMode] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);

    const lastTextLen = useRef(0);

    useEffect(() => {
        async function load() {
            try {
                const dataU = await safeFetch("/api/user");
                setUser(dataU.user);

                const dataC = await safeFetch(`/api/concursos?id=${id}`);
                if (dataC.ok) {
                    setConcurso(dataC.concurso);
                    setStatus(dataC.concurso.status);
                    if (dataC.concurso.status === "active") {
                        const elapsed = Math.floor((Date.now() - dataC.concurso.startTime) / 1000);
                        const remaining = Math.max(0, dataC.concurso.duration - elapsed);
                        setTimeLeft(remaining);
                    }
                    if (dataC.concurso.status === "finished") setIsFinished(true);
                }
            } catch (err) {
                console.error("❌ Error al cargar datos del concurso:", err.message);
            }
        }
        load();
        const interval = setInterval(load, 5000);

        const handleVisibility = () => {
            if (document.visibilityState === "hidden" && status === "active") {
                setTabSwitches(prev => prev + 1);
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [id, status]);

    useEffect(() => {
        if (status === "active" && user) {
            const sync = setInterval(() => {
                const currentLen = text.length;
                const jump = currentLen - lastTextLen.current;
                let suspicious = isSuspicious;
                if (jump > 60) {
                    suspicious = true;
                    setIsSuspicious(true);
                }
                lastTextLen.current = currentLen;

                safeFetch("/api/hub", {
                    method: "POST",
                    body: JSON.stringify({
                        type: "draft",
                        concursoId: id,
                        userId: user.id,
                        texto: text,
                        suspicious,
                        tabSwitches
                    }),
                    headers: { "Content-Type": "application/json" }
                }).catch(err => console.warn("⚠️ Autosave failed:", err.message));
            }, 3000);
            return () => clearInterval(sync);
        }
    }, [status, text, user, id, isSuspicious, tabSwitches]);

    useEffect(() => {
        let timer;
        if (status === "active" && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsFinished(true);
                        return 0;
                    }
                    const next = prev - 1;
                    if (next === 3600 || next === 1800) {
                        setShowAlarm(true);
                        setTimeout(() => setShowAlarm(false), 5000);
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status, timeLeft]);

    const handleSubmit = async () => {
        if (isGuest) {
            // Simulación para invitados
            router.push("/hub");
            return;
        }
        try {
            const res = await safeFetch("/api/entradas", {
                method: "POST",
                body: JSON.stringify({
                    concursoId: id,
                    texto: text,
                    participante: user.nombre,
                    suspicious: isSuspicious,
                    tabSwitches
                }),
                headers: { "Content-Type": "application/json" }
            });
            
            // Mostrar feedback de boost si existe
            if (res.boostApplied) {
                alert("Tu +5% Boost fue aplicado a esta participación");
            }

            router.push("/hub");
        } catch (err) {
            alert(`Error al enviar: ${err.message}`);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                    logicalSurface: true,
                },
                audio: false
            });
            
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Cuentistas_${user.nombre}_${new Date().getTime()}.webm`;
                a.click();
                chunksRef.current = [];
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setRecordingStatus("recording");

            stream.getVideoTracks()[0].onended = () => stopRecording();
        } catch (err) {
            console.error("Error al iniciar grabación:", err);
            alert("No se pudo iniciar la captura. Asegúrate de dar los permisos necesarios.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            streamRef.current.getTracks().forEach(track => track.stop());
            setRecordingStatus("idle");
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        alert("Integridad Real: El pegado de texto está sellado.");
    };

    if (!concurso || !user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-sm">...</div>;

    const isPressureMode = timeLeft > 0 && timeLeft <= 600;    return (
        <main className={`min-h-screen animate-elegant font-serif relative overflow-hidden transition-colors duration-1000 ${isPressureMode ? 'mode-pressure' : 'bg-[#050508]'} text-[#ffffff]`}>
            {/* Security Seal Overlay */}
            {isFinished && (
                <div className="sello-overlay">
                    <div className="sello-content animate-elegant">
                        <div className="w-24 h-24 border border-gold rounded-full flex items-center justify-center mx-auto mb-8 royal-card">
                            <span className="text-gold text-4xl">🔱</span>
                        </div>
                        <h2 className="text-5xl font-light tracking-[0.5em] uppercase text-white mb-6">Crónica Sellada</h2>
                        <p className="text-gray-500 font-sans text-[11px] tracking-widest uppercase mb-16 italic opacity-60">
                            El Tribunal Supremo ha cerrado la recepción de runas.
                        </p>
                        <button onClick={handleSubmit} className="royal-button px-24">Entregar al Legado</button>
                    </div>
                </div>
            )}

            {/* Alarm Overlay */}
            {showAlarm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-pulse">
                    <div className="royal-card px-24 py-12 border-gold/40">
                        <p className="text-gold text-5xl font-light tracking-[0.6em] uppercase">Pulso de Tinta</p>
                        <p className="text-[11px] text-center mt-6 tracking-widest opacity-40 uppercase">30 minutos han transcurrido</p>
                    </div>
                </div>
            )}

            {/* Spectator Warning (V9) */}
            {isGuest && (
                <div className="fixed top-24 left-0 w-full z-[100] flex justify-center pointer-events-none">
                    <div className="royal-card px-12 py-3 border-gold/40 bg-gold/5 flex items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                        </span>
                        <p className="text-[10px] tracking-[0.4em] uppercase text-gold font-black">Modo Espectador Activo</p>
                    </div>
                </div>
            )}

            <header className="fixed top-0 left-0 w-full p-16 flex justify-between items-center z-50 pointer-events-none">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="w-4 h-[1px] bg-gold/50"></div>
                        <p className={`text-[11px] tracking-[0.5em] uppercase font-sans ${isPressureMode ? 'text-red-500 animate-pulse' : 'text-gold'}`}>
                            {isPressureMode ? 'PRESIÓN REAL' : (concurso?.titulo || "Concurso")}
                        </p>
                    </div>
                    {tabSwitches > 0 && <p className="text-[9px] tracking-[0.3em] text-red-500/60 uppercase font-sans pl-8">Integridad Comprometida: {tabSwitches}</p>}
                </div>
                <div className={`text-6xl font-light tracking-tighter transition-all duration-1000 ${isPressureMode ? 'text-pressure' : (timeLeft < 300 ? 'text-gold' : 'text-white/10')}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            </header>

            <div className="max-w-4xl mx-auto min-h-screen flex flex-col justify-center p-12 py-48 relative">
                {status === "active" ? (
                    <div className={`${isCreatorMode ? 'creator-viewport p-16' : 'space-y-32 w-full'}`}>
                        {isCreatorMode && (
                            <div className="flex justify-between items-center mb-12 border-b border-gold/10 pb-6">
                                <div className="space-y-1">
                                    <p className="creator-header-label">Autor en Vivo</p>
                                    <h2 className="text-xl font-serif text-white">{user.nombre}</h2>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <p className="creator-header-label">Tiempo</p>
                                    <p className={`text-2xl font-mono font-light tracking-tighter ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-8 animate-elegant">
                            {!isCreatorMode && <p className="text-[10px] tracking-[0.5em] uppercase text-gold/60 font-sans">Mandato Supremo</p>}
                            <div className={`${isCreatorMode ? 'p-8 text-center' : 'p-16 border-l border-gold/30'} royal-card bg-white/[0.01]`}>
                                <p className={`${isCreatorMode ? 'text-xl' : 'text-4xl'} font-light leading-relaxed italic text-white/90`}>
                                    "{concurso.temaExacto}"
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                className={`w-full ${isCreatorMode ? 'h-[40vh] text-2xl' : 'h-[60vh] text-3xl'} bg-transparent border-none leading-relaxed text-[#ffffff] outline-none resize-none placeholder:text-white/5 selection:bg-gold/20 scrollbar-hide font-serif italic`}
                                placeholder="Escriba la verdad..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onPaste={handlePaste}
                                disabled={isFinished}
                                autoFocus
                            ></textarea>

                            {!isCreatorMode && (
                                <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity font-sans">
                                    <div className="flex gap-12 items-center">
                                        <span className="text-[11px] tracking-[0.4em] uppercase font-light">{text.split(/\s+/).filter(Boolean).length} RUNAS</span>
                                        {isSuspicious && (
                                            <span className="text-[9px] text-red-500 font-bold tracking-[0.3em] border border-red-500/30 px-3 py-1 rounded-full uppercase">Alerta IA</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-2 h-2 rounded-full bg-gold/40 animate-pulse"></div>
                                        <span className="text-[10px] tracking-[0.4em] uppercase text-gray-700 font-thin">Caja de Cristal Activa</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isCreatorMode && (
                            <div className="mt-auto pt-12 flex flex-col items-center gap-6 border-t border-gold/5">
                                <div className="flex items-center gap-4 opacity-40">
                                    <div className="w-12 h-[1px] bg-gold/50"></div>
                                    <span className="text-[10px] tracking-[0.5em] text-gold uppercase font-cinzel">Cuentistas Web</span>
                                    <div className="w-12 h-[1px] bg-gold/50"></div>
                                </div>
                                <p className="text-[8px] tracking-[0.4em] uppercase text-gray-700 font-sans">Forjando el Legado en Vivo</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center space-y-12 opacity-30">
                        <div className="w-32 h-32 border border-gold/20 rounded-full flex items-center justify-center mx-auto royal-card">
                            <div className="w-1 h-1 bg-gold animate-ping rounded-full"></div>
                        </div>
                        <p className="text-xl tracking-[0.6em] uppercase text-gold font-light animate-pulse">Aguardando la sesión</p>
                        <p className="italic text-4xl font-serif">El tribunal revelará el tema al comenzar.</p>
                    </div>
                )}
            </div>

            {/* Recorder Toolbar - Floating at bottom of screen */}
            <div className="recorder-toolbar">
                <button 
                    onClick={() => setIsCreatorMode(!isCreatorMode)}
                    className={`text-[9px] tracking-widest uppercase font-bold px-6 py-2 rounded-full transition-all border ${isCreatorMode ? 'bg-gold text-black border-gold' : 'text-gold border-gold/30 hover:bg-gold/10'}`}
                >
                    {isCreatorMode ? 'Cerrar Modo TikTok' : 'Modo TikTok 📱'}
                </button>
                
                <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
                
                {recordingStatus === "idle" ? (
                    <button 
                        onClick={startRecording}
                        className="flex items-center gap-3 text-[9px] tracking-widest uppercase font-bold text-white hover:text-red-500 transition-all group"
                    >
                        <div className="w-3 h-3 rounded-full border-2 border-red-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:scale-125 transition-transform"></div>
                        </div>
                        Grabar Clip
                    </button>
                ) : (
                    <button 
                        onClick={stopRecording}
                        className="flex items-center gap-3 text-[9px] tracking-widest uppercase font-bold text-red-500 animate-pulse"
                    >
                        <div className="on-air-lamp"></div>
                        Detener Grabación
                    </button>
                )}
            </div>
        </main>
    );
}
