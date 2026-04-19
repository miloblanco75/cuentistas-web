"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
    const searchParams = useSearchParams();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await signIn("credentials", { username, password, redirect: false });
        if (res.error) { setError("Acceso denegado."); setLoading(false); }
        else { router.push("/hub"); router.refresh(); }
    };

    return (
        <main className="min-h-screen bg-[#050508] text-[#e0d7c6] flex flex-col items-center justify-center p-12 font-serif relative overflow-hidden">
            <div className="max-w-md w-full space-y-20 relative z-10 text-center">
                <header className="space-y-6">
                    <h1 className="text-7xl font-cinzel tracking-widest title-gradient">Entrar</h1>
                </header>

                <form onSubmit={handleLogin} className="royal-card p-16 space-y-12 border-amber-500/10">
                    <div className="space-y-4 text-left">
                        <label className="text-[10px] tracking-[0.5em] uppercase text-amber-500/80 font-cinzel font-bold">Firma del Cuentista</label>
                        <input className="royal-input text-lg" placeholder="tu_pseudonimo" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <button type="submit" disabled={loading} className="royal-button w-full py-8 text-base">
                        {loading ? "Descifrando..." : "Cruzar el Umbral"}
                    </button>

                    <div className="pt-10 border-t border-amber-500/5 flex flex-col gap-8">
                        <p className="text-[11px] tracking-[0.4em] uppercase text-gray-600 font-cinzel font-bold">O Sello de Google</p>
                        <button 
                            type="button" 
                            onClick={() => signIn('google', { callbackUrl: '/hub' })}
                            className="bg-transparent hover:bg-amber-500/5 border border-gold/40 w-full py-10 flex items-center justify-center gap-8 text-sm md:text-base tracking-[0.3em] font-cinzel text-gold transition-all"
                        >
                            Continuar con Google
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <LoginContent />
        </Suspense>
    );
}
