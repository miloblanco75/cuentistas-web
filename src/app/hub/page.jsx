"use client";

import { useLanguage } from "@/components/LanguageContext";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PlatformHub() {
    const [userData, setUserData] = useState(null);
    const { t } = useLanguage();
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetch("/api/user")
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        setUserData(data.user);
                    } else {
                        setUserData({
                            nombre: session.user.name || "Espectador",
                            rol: "spectator",
                            nivel: "Principiante",
                            tinta: 0,
                        });
                    }
                })
                .catch(() => {
                    setUserData({
                        nombre: session.user.name || "Espectador",
                        rol: "spectator",
                        nivel: "Principiante",
                        tinta: 0,
                    });
                });
        }
    }, [status, session, router]);

    const SECTIONS = [
        { title: t("mod_escritura"), href: "/concursos", icon: "🖋️" },
        { title: t("mod_examenes"), href: "/examenes", icon: "📜" },
        { title: t("mod_comunidad"), href: "/comunidad", icon: "🤝" },
        { title: "Biblioteca Pública", href: "/biblioteca", icon: "📚" },
        { title: t("mod_mercado"), href: "/mercado", icon: "🏛️" },
        { title: t("mod_perfil"), href: "/perfil", icon: "💠" },
        { title: t("mod_tribunal"), href: "/panel", icon: "⚖️" },
    ];

    // Estado de carga mejorado
    if (status === "loading" || (status === "authenticated" && !userData)) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-serif gap-8">
                <div className="text-6xl animate-pulse">✒️</div>
                <div className="space-y-2 text-center">
                    <p className="text-xl italic tracking-tighter opacity-80">Abriendo la Arena...</p>
                    <p className="text-[10px] tracking-[0.4em] uppercase opacity-40">Verificando credenciales</p>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant">
            <div className="max-w-7xl mx-auto space-y-48">
                <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/5 pb-12">
                    <div>
                        <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-sans font-light mb-4 text-amber-500">
                            — {t("hero_title")} —
                        </p>
                        <h1 className="text-8xl font-light tracking-tighter italic">{t("hero_title")}</h1>
                    </div>
                    <div className="font-sans text-[10px] tracking-[0.3em] uppercase text-right opacity-60 flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-white font-bold">{userData.nombre}</span>
                            <span className="text-amber-500/80">{userData.rol === 'Escritor' ? 'Sello' : userData.rol === 'spectator' ? 'Espectador' : 'Tribunal'} {userData.nivel}</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full transition-all text-white font-bold hover:text-amber-500"
                        >
                            Salir de la Arena
                        </button>
                    </div>
                </header>

                <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    {SECTIONS.map((s, idx) => (
                        <a
                            key={idx}
                            href={s.href}
                            className="royal-card p-20 h-96 flex flex-col items-center justify-center group transition-all duration-1000 relative overflow-hidden text-center bg-white/[0.02] border border-white/5 hover:border-amber-500/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 via-amber-500/0 to-amber-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative z-10 space-y-12">
                                <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 drop-shadow-[0_0_15px_rgba(255,191,0,0.1)]">
                                    {s.icon}
                                </div>
                                <h3 className="text-4xl font-serif italic text-white/80 group-hover:text-amber-500 transition-all duration-700 tracking-tight">
                                    {s.title}
                                </h3>
                                <div className="w-12 h-[1px] bg-white/10 mx-auto group-hover:w-24 group-hover:bg-amber-500/50 transition-all duration-1000"></div>
                            </div>
                        </a>
                    ))}
                </nav>

                <footer className="pt-24 flex justify-between items-center text-[10px] tracking-[0.4em] uppercase font-sans font-extralight text-gray-500">
                    <div className="flex gap-12 items-center">
                        <span>© MMXXVI</span>
                        <div className="w-12 h-[1px] bg-white/10"></div>
                        <a href="/manual" className="text-amber-500 hover:text-white transition-colors font-bold">{t("footer_manual")}</a>
                        <div className="w-12 h-[1px] bg-white/10"></div>
                        <a href="/panel" className="hover:text-amber-500 transition-colors">{t("footer_tribunal")}</a>
                    </div>
                    <button 
                        onClick={() => signOut({ callbackUrl: '/login' })} 
                        className="hover:text-amber-500 transition-colors italic border-b border-transparent hover:border-amber-500 pb-1"
                    >
                        {t("footer_disconnect")}
                    </button>
                </footer>
            </div>
        </main>
    );
}
