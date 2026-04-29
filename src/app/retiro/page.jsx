"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/UserContext";
import { PenTool, Send, XCircle } from "lucide-react";

export default function RetiroPage() {
    const { userData, loading } = useUser();
    const router = useRouter();
    const [texto, setTexto] = useState("");
    const [status, setStatus] = useState("writing"); // writing, submitting, done, error
    const [feedback, setFeedback] = useState("");

    if (loading) return null;

    if (!userData) {
        router.push("/auth/signin");
        return null;
    }

    const handleSubmit = async () => {
        if (texto.length < 50) {
            setStatus("error");
            setFeedback("El Oráculo rechaza ofrendas vacías. Escribe al menos 50 caracteres.");
            setTimeout(() => setStatus("writing"), 3000);
            return;
        }

        setStatus("submitting");

        try {
            const res = await fetch("/api/entradas/retiro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto })
            });

            const data = await res.json();

            if (data.ok) {
                setStatus("done");
                setFeedback(data.message);
            } else {
                setStatus("error");
                setFeedback(data.error);
                setTimeout(() => setStatus("writing"), 3000);
            }
        } catch (error) {
            setStatus("error");
            setFeedback("El santuario está colapsando.");
            setTimeout(() => setStatus("writing"), 3000);
        }
    };

    if (status === "done") {
        return (
            <main className="min-h-screen bg-[#050508] flex items-center justify-center p-6 animate-elegant">
                <div className="max-w-xl mx-auto text-center space-y-12">
                    <div className="inline-flex p-8 bg-white/5 rounded-full mb-8">
                        <PenTool size={48} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif italic text-white/90 leading-tight">
                        "{feedback}"
                    </h1>
                    <p className="text-gray-500 tracking-[0.2em] uppercase text-xs">
                        +15 XP de Disciplina Otorgada
                    </p>
                    <div className="pt-12">
                        <button 
                            onClick={() => router.push("/escritura")}
                            className="royal-button px-12 py-4 text-xs"
                        >
                            ABANDONAR EL SANTUARIO
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050508] text-white p-6 md:p-12 animate-elegant flex flex-col">
            <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto w-full">
                <div className="space-y-2">
                    <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 font-bold">
                        <span className="w-2 h-2 inline-block bg-gray-500 rounded-full mr-3"></span>
                        Prueba Silenciosa
                    </p>
                    <h1 className="text-3xl font-serif italic text-white/90">El Retiro</h1>
                </div>
                <button 
                    onClick={() => router.push("/escritura")}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <XCircle size={24} />
                </button>
            </header>

            <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col gap-8 relative">
                
                {status === "error" && (
                    <div className="absolute top-0 left-0 right-0 p-4 bg-red-900/50 border border-red-500/50 text-red-200 text-sm text-center rounded">
                        {feedback}
                    </div>
                )}

                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded p-8 relative flex flex-col group focus-within:border-white/30 transition-colors">
                    <textarea
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="El Tribunal observa en silencio. Forja tu obra aquí..."
                        className="w-full h-full bg-transparent border-none outline-none resize-none font-serif text-lg md:text-xl text-white/80 placeholder:text-gray-700 leading-relaxed"
                        disabled={status === "submitting"}
                    />
                    
                    <div className="absolute bottom-6 right-8 text-xs text-gray-600 font-mono">
                        {texto.length} caracteres
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 italic max-w-md hidden md:block">
                        El tiempo no existe en este santuario. No arriesgas Elo, ni Sello, ni Prestigio. Solo vienes a volverte peligroso.
                    </p>

                    <button
                        onClick={handleSubmit}
                        disabled={status === "submitting" || texto.length < 50}
                        className={`royal-button px-12 py-4 flex items-center gap-4 text-xs ${status === "submitting" ? 'opacity-50' : ''}`}
                    >
                        {status === "submitting" ? (
                            <span className="animate-pulse">OFRECIENDO...</span>
                        ) : (
                            <>
                                <span>OFRECER AL ORÁCULO</span>
                                <Send size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}
