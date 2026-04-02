"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter as useNextRouter } from "next/navigation";

function LoginContent() {
    const searchParams = useSearchParams();
    const authError = searchParams.get("error");
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(authError ? "El sello de acceso ha fallado. Revisa tus pergaminos." : null);
    const [loading, setLoading] = useState(false);
    const router = useNextRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res.error) {
            setError(res.error === "CredentialsSignin" ? "Firma o contraseña incorrecta" : "Conflicto Arcano detectado.");
            setLoading(false);
        } else {
            router.push("/hub");
            router.refresh();
        }
    };

    return (
        <main className="min-h-screen bg-[#050508] text-[#e0d7c6] flex flex-col items-center justify-center p-6 font-serif relative overflow-hidden">
            {/* Elementos de Ambientación */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.05),transparent_70%)]"></div>
            
            {/* Botón de Regresar */}
            <div className="fixed top-12 left-12 z-50">
                <a href="/" className="flex items-center gap-4 text-[10px] tracking-[0.4em] font-cinzel text-amber-500/60 hover:text-amber-500 transition-all group">
                    <span className="transform group-hover:-translate-x-2 transition-transform duration-500 text-lg">←</span>
                    Regresar al Umbral
                </a>
            </div>

            <div className="max-w-md w-full space-y-20 animate-elegant relative z-10 text-center">
                <header className="space-y-6">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 border border-amber-500/30 rounded-full flex items-center justify-center p-4 filter drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                             <svg viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                             </svg>
                        </div>
                    </div>
                    <p className="text-[10px] tracking-[0.6em] uppercase text-amber-500 font-cinzel">Invocación de Identidad</p>
                    <h1 className="text-7xl font-cinzel tracking-widest title-gradient">Entrar</h1>
                </header>

                <form onSubmit={handleLogin} className="royal-card p-16 space-y-12 border-amber-500/10">
                    {error && (
                        <div className="bg-red-500/5 text-red-400 p-4 rounded-sm text-xs font-cinzel border border-red-500/20 italic tracking-widest animate-pulse">
                           ⚠️ {error}
                        </div>
                    )}
                    
                    <div className="space-y-4 text-left">
                        <label className="text-[9px] tracking-[0.5em] uppercase text-amber-500/80 font-cinzel">Firma Geográfica / Usuario</label>
                        <input
                            required
                            name="username"
                            type="text"
                            className="royal-input"
                            placeholder="tu_pseudonimo"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4 text-left">
                        <label className="text-[9px] tracking-[0.5em] uppercase text-amber-500/80 font-cinzel">Clave del Guardián</label>
                        <input
                            required
                            name="password"
                            type="password"
                            className="royal-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`royal-button w-full ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? "Descifrando..." : "Cruzar el Umbral"}
                    </button>

                    <div className="pt-8 border-t border-amber-500/5 flex flex-col gap-6">
                        <p className="text-[8px] tracking-[0.3em] uppercase text-gray-600 font-cinzel">O usa tu Sello Universal</p>
                        <button 
                            type="button" 
                            onClick={() => signIn('google', { callbackUrl: '/hub' })}
                            className="bg-transparent hover:bg-amber-500/5 border border-amber-500/20 w-full py-5 flex items-center justify-center gap-6 text-[10px] tracking-[0.3em] font-cinzel text-[#d4af37] transition-all group"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#d4af37"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" opacity="0.4"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" opacity="0.4"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" opacity="0.4"/>
                            </svg>
                            Sello de Google
                        </button>
                    </div>

                    <footer className="pt-6">
                        <a href="/registro" className="text-[9px] tracking-[0.4em] uppercase text-gray-500 hover:text-amber-500 transition-colors duration-700 font-cinzel">Crear nuevo legado literario</a>
                    </footer>
                </form>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050508] flex items-center justify-center font-cinzel text-amber-500 tracking-[0.5em] animate-pulse">Cargando...</div>}>
            <LoginContent />
        </Suspense>
    );
}
