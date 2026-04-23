"use client";

import { useState, useRef, useEffect } from "react";
import { RecorderCore } from "./RecorderCore";

/**
 * RecorderModal.jsx - V3 Release Candidate
 * Premium UI for video recording.
 * Hardened for production with pre-record state, nested error handling, and viral UX.
 */
export default function RecorderModal({ isOpen, onClose, onSave, targetEntryId, textToRead = "" }) {
    const [mode, setMode] = useState("narrator"); // narrator or camera
    const [status, setStatus] = useState("idle"); // idle, preparing, recording, preview, uploading
    const [timeLeft, setTimeLeft] = useState(30);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [toast, setToast] = useState(null); // { message, type, action }
    const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState(true);
    const [isVoiceLoading, setIsVoiceLoading] = useState(false);
    
    const voiceAudioRef = useRef(null);

    const recorderRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!recorderRef.current && typeof window !== 'undefined') {
            recorderRef.current = new RecorderCore({
                onStop: (blob) => {
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                    setRecordedBlob(blob);
                    setStatus("preview");
                    clearInterval(timerRef.current);
                },
                onError: (err) => {
                    handleRecorderError(err);
                }
            });
        }
        return () => {
            if (recorderRef.current) recorderRef.current.cleanup();
            clearInterval(timerRef.current);
        };
    }, []);

    const handleRecorderError = (err) => {
        if (err.message === "SCREEN_PERMISSION_DENIED") {
            showToast("Acceso a pantalla denegado. Se requiere para el Tribunal.", "error", { label: "Reintentar", onClick: startRecording });
        } else if (err.message === "EMPTY_VIDEO") {
            showToast("Video demasiado corto o corrupto. Intenta de nuevo.", "error", { label: "Reintentar", onClick: startRecording });
        } else {
            showToast("Fallo crítico en el Tribunal Audiovisual.", "error");
        }
        resetRecorder();
    };

    const showToast = (message, type = "info", action = null) => {
        setToast({ message, type, action });
        setTimeout(() => setToast(null), 5000);
    };

    const resetRecorder = () => {
        setStatus("idle");
        setTimeLeft(30);
        setPreviewUrl(null);
        setRecordedBlob(null);
        setToast(null);
        if (voiceAudioRef.current) {
            voiceAudioRef.current.pause();
            voiceAudioRef.current = null;
        }
        if (recorderRef.current) recorderRef.current.cleanup();
    };

    const startRecording = async () => {
        try {
            setStatus("preparing");
            setToast(null);

            let audioUrl = null;
            if (isVoiceoverEnabled && textToRead.length > 5) {
                setIsVoiceLoading(true);
                try {
                    const res = await fetch("/api/ai/voiceover", {
                        method: "POST",
                        body: JSON.stringify({ text: textToRead })
                    });
                    if (res.ok) {
                        const blob = await res.blob();
                        audioUrl = URL.createObjectURL(blob);
                    }
                } catch(e) {
                    console.error("⚠️ Error vocal:", e);
                }
                setIsVoiceLoading(false);
            }

            // V3 RC: 500-800ms "Preparing" state
            setTimeout(async () => {
                try {
                    let audioEl = null;
                    if (audioUrl) {
                        audioEl = new Audio(audioUrl);
                        voiceAudioRef.current = audioEl;
                        // Important: ensure crossOrigin or same-origin for MediaElementSource
                    }

                    await recorderRef.current.start(mode, audioEl);
                    setStatus("recording");
                    setTimeLeft(30);
                    
                    if (audioEl) {
                        audioEl.play().catch(e => console.warn("Autoplay hint", e));
                    }

                    timerRef.current = setInterval(() => {
                        setTimeLeft((prev) => {
                            if (prev <= 1) {
                                stopRecording();
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                } catch (err) {
                    handleRecorderError(err);
                }
            }, 650);
        } catch (err) {
            setStatus("idle");
        }
    };

    const stopRecording = () => {
        if (voiceAudioRef.current) {
            voiceAudioRef.current.pause();
        }
        if (recorderRef.current) {
            recorderRef.current.stop();
            clearInterval(timerRef.current);
        }
    };

    const handleUpload = async () => {
        if (!recordedBlob) return;
        setStatus("uploading");

        try {
            const formData = new FormData();
            formData.append("video", recordedBlob);
            formData.append("entryId", targetEntryId || "");

            const res = await fetch("/api/upload/video", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                onSave(data.videoUrl);
                onClose();
                resetRecorder();
            } else {
                throw new Error(data.error || "Fallo en la subida");
            }
        } catch (err) {
            showToast("Fallo al Sellar en el Feed: " + err.message, "error");
            setStatus("preview");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-elegant">
            <div className="w-full max-w-lg h-[80vh] bg-[#0A0A0F] border border-white/10 rounded-[2.5rem] relative overflow-hidden flex flex-col shadow-2xl">
                
                {/* Header */}
                <div className="p-8 flex items-center justify-between border-b border-white/5 bg-black/20">
                    <div>
                        <h2 className="text-xl font-serif italic text-white leading-tight">Tribunal Audiovisual</h2>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-gold opacity-70">Motor de Criterio — V3 RC</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-white/50 text-2xl">&times;</button>
                </div>

                {/* Main View Area */}
                <div className="flex-1 relative bg-black/40 group overflow-hidden">
                    
                    {/* TOAST SYSTEM */}
                    {toast && (
                        <div className="absolute top-4 inset-x-4 z-50 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between animate-elegant shadow-2xl">
                            <span className="text-[10px] text-white/80 uppercase tracking-widest font-bold">{toast.message}</span>
                            {toast.action && (
                                <button 
                                    onClick={toast.action.onClick}
                                    className="px-4 py-1.5 bg-gold text-black text-[9px] font-black rounded-full uppercase transition-all hover:scale-105 active:scale-95"
                                >{toast.action.label}</button>
                            )}
                        </div>
                    )}

                    {status === "idle" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-12 p-12 text-center animate-field">
                            <div className="w-32 h-32 rounded-full border-2 border-gold/40 flex items-center justify-center bg-gold/5 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                                <span className="text-4xl animate-pulse-subtle">🎥</span>
                            </div>
                            <div className="space-y-6">
                                <p className="text-white text-xl font-serif italic mb-8">Define tu estilo de juicio</p>
                                <div className="flex gap-4 p-1.5 bg-white/5 rounded-3xl border border-white/10">
                                    <button 
                                        onClick={() => setMode("narrator")}
                                        className={`px-8 py-3 rounded-2xl text-[10px] tracking-widest uppercase transition-all duration-500 ${mode === "narrator" ? "bg-gold text-black font-black shadow-lg shadow-gold/20" : "text-white/40 hover:text-white/60"}`}
                                    >Narrador 🎙️</button>
                                     <button 
                                        onClick={() => setMode("camera")}
                                        className={`px-8 py-3 rounded-2xl text-[10px] tracking-widest uppercase transition-all duration-500 ${mode === "camera" ? "bg-gold text-black font-black shadow-lg shadow-gold/20" : "text-white/40 hover:text-white/60"}`}
                                     >Cámara 📷</button>
                                </div>

                                {/* Voiceover Toggle */}
                                <div className="pt-4 flex justify-center">
                                    <button 
                                        onClick={() => setIsVoiceoverEnabled(!isVoiceoverEnabled)}
                                        className={`flex items-center gap-4 px-6 py-2 rounded-full border transition-all ${isVoiceoverEnabled ? 'border-gold/50 bg-gold/5 text-gold' : 'border-white/10 text-white/20'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${isVoiceoverEnabled ? 'bg-gold animate-pulse' : 'bg-white/20'}`}></div>
                                        <span className="text-[9px] font-black tracking-widest uppercase">
                                            {isVoiceoverEnabled ? "Narrador IA Activo 🎙️" : "Narrador IA Silenciado"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === "preparing" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-black/40 backdrop-blur-sm animate-elegant">
                            <div className="w-16 h-16 border-b-2 border-gold rounded-full animate-spin"></div>
                            <p className="text-gold text-[10px] tracking-[0.4em] uppercase font-bold animate-pulse">
                                {isVoiceLoading ? "Invocando al Narrador..." : "Preparando cámara..."}
                            </p>
                        </div>
                    )}

                    {status === "recording" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600/20 border border-red-500/40 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.2)] z-20">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-red-500">GRABANDO</span>
                                <span className="text-white font-mono">{timeLeft}s / 30s</span>
                             </div>
                             
                             <div className="text-center space-y-6 px-12 z-10">
                                <p className="text-white/90 font-serif italic text-2xl leading-relaxed animate-field">"Tu estilo de juicio está tomando forma"</p>
                                <p className="text-gold/50 text-[9px] uppercase tracking-[0.4em] font-medium">Esto definirá tu criterio</p>
                             </div>

                             {/* Progress Bar (Bottom) */}
                             <div className="absolute bottom-0 left-0 w-full h-2 bg-white/5 overflow-hidden">
                                <div 
                                    className="h-full bg-gold shadow-[0_-10px_20px_rgba(212,175,55,0.5)] transition-all duration-1000 ease-linear" 
                                    style={{ width: `${(timeLeft/30)*100}%` }}
                                ></div>
                             </div>
                        </div>
                    )}

                    {status === "preview" && previewUrl && (
                        <video 
                            src={previewUrl} 
                            controls={false}
                            autoPlay 
                            loop 
                            className="absolute inset-0 w-full h-full object-cover animate-elegant"
                        />
                    )}

                    {status === "uploading" && (
                        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl space-y-8 animate-elegant">
                            <div className="relative">
                                <div className="w-24 h-24 border-2 border-gold/10 rounded-full"></div>
                                <div className="absolute inset-0 border-t-2 border-gold rounded-full animate-spin"></div>
                            </div>
                            <div className="text-center space-y-3">
                                <p className="text-gold text-[10px] tracking-[0.5em] uppercase font-black animate-pulse">Sellando Clip...</p>
                                <p className="text-white/20 text-[8px] uppercase tracking-[0.3em]">Integrando al Tribunal</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Footer */}
                <div className="p-10 border-t border-white/5 bg-black/20">
                    <div className="flex justify-center flex-col items-center space-y-6">
                        {status === "idle" && (
                            <button 
                                onClick={startRecording}
                                className="royal-button px-16 py-5 text-sm w-full group relative overflow-hidden shadow-2xl transition-all"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3 font-bold">
                                    Iniciar Grabación 🔴
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-white/20 to-gold/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        )}

                        {status === "recording" && (
                            <button 
                                onClick={stopRecording}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-5 px-16 rounded-2xl w-full transition-all active:scale-[0.97] text-sm shadow-xl shadow-red-600/10 flex items-center justify-center gap-3"
                            >
                                Detener y Guardar 🏁
                            </button>
                        )}

                        {status === "preview" && (
                            <div className="flex gap-4 w-full animate-field">
                                <button 
                                    onClick={resetRecorder}
                                    className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
                                >Reintentar</button>
                                <button 
                                    onClick={handleUpload}
                                    className="flex-[2] royal-button py-5 text-sm shadow-2xl font-bold"
                                >Sellar en el Feed 🔱</button>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-4 opacity-30 select-none">
                             <div className="h-[1px] w-12 bg-white/20"></div>
                             <p className="text-[9px] text-white uppercase tracking-[0.4em] italic font-medium">
                                Límite Viral: 30s
                             </p>
                             <div className="h-[1px] w-12 bg-white/20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
