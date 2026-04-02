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
                        // Si la API falla, usamos los datos de la sesión de Google directamente
                        setUserData({
                            nombre: session.user.name || "Espectador",
                            rol: "spectator",
                            nivel: "Principiante",
                            tinta: 0,
                        });
                    }
                })
                .catch(() => {
                    // Fallback: usar datos de la sesión
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

    // Estado de carga
    if (status === "loading" || (status === "authenticated" && !userData)) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-serif gap-4">
                <div className="text-3xl animate-pulse">✒️</div>
                <p className="text-sm tracking-widest uppercase text-white/40">Abriendo las puertas...</p>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant">
            <div className="max-w-7xl mx-auto space-y-48">
                <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/5 pb-12">
                    <div>
                        <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-sans font-light mb-4">
                            — {t("hero_title")} —
                        </p>
                        <h1 className="text-8xl font-light tracking-tighter italic">{t("hero_title")}</h1>
                    </div>
                    <div className="font-sans text-[10px] tracking-[0.3em] uppercase text-right opacity-60 flex items-center gap-6">
                        <span>{userData.nombre}</span>
                        <div className="w-1 h-1 bg-gold rounded-full"></div>
                        <span>{userData.rol === 'Escritor' ? 'Sello' : userData.rol === 'spectator' ? 'Espectador' : 'Tribunal'} {userData.nivel}</span>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="text-white/30 hover:text-white/70 transition-colors ml-4"
                        >
                            Salir
                        </button>
                    </div>
                </header>

                <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    {SECTIONS.map((s, idx) => (
                        <a
                            key={idx}
                            href={s.href}
                            className="royal-card p-20 h-96 flex flex-col items-center justify-center group transition-all duration-1000 relative overflow-hidden text-center bg-white/[0.02] border border-white/5 hover:border-gold/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-gold/0 via-gold/0 to-gold/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative z-10 space-y-12">
                                <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    {s.icon}
                                </div>
                                <h3 className="text-4xl font-serif italic text-white/80 group-hover:text-gold transition-all duration-700 tracking-tight">
                                    {s.title}
                                </h3>
                                <div className="w-12 h-[1px] bg-white/10 mx-auto group-hover:w-24 group-hover:bg-gold/50 transition-all duration-1000"></div>
                            </div>
                        </a>
                    ))}
                </nav>

                <footer className="pt-24 flex justify-between items-center text-[10px] tracking-[0.4em] uppercase font-sans font-extralight text-gray-500">
                    <div className="flex gap-12 items-center">
                        <span>© MMXXVI</span>
                        <div className="w-12 h-[1px] bg-white/10"></div>
                        <a href="/manual" className="text-gold hover:text-white transition-colors font-bold">{t("footer_manual")}</a>
                        <div className="w-12 h-[1px] bg-white/10"></div>
                        <a href="/panel" className="hover:text-gold transition-colors">{t("footer_tribunal")}</a>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="hover:text-gold transition-colors italic border-b border-transparent hover:border-gold pb-1">{t("footer_disconnect")}</button>
                </footer>
            </div>
        </main>
    );
}
