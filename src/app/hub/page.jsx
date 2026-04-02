"use client";

import { useLanguage } from "@/components/LanguageContext";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Iconos dorados de trazo fino
const Icons = {
  Escritura: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 md:w-16 md:h-16">
      <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-1.5M15.5 10.5l-1.5-1.5M13 8l-1.5-1.5M11 6l-1.5-1.5M9 4L7.5 2.5" />
      <path d="M3 21l3-3M3 21v-3M3 21h3" />
      <path d="M12 19L5 12" />
    </svg>
  ),
  Examenes: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 md:w-16 md:h-16">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  Comunidad: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 md:w-16 md:h-16">
      <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
      <path d="M12 6v6l4 2" />
      <path d="M8 12h8" />
    </svg>
  ),
  Biblioteca: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 md:w-16 md:h-16">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5V4.5z" />
      <path d="M10 6h6M10 10h6M10 14h6" />
    </svg>
  ),
  Mercado: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 md:w-16 md:h-16">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
      <path d="M12 11l-2-2m2 2l2-2m-2 6l-2 2m2-2l2 2" />
    </svg>
  ),
  Perfil: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 md:w-16 md:h-16">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Tribunal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 md:w-16 md:h-16">
      <path d="M4 10h16M12 4v16M8 21h8M7 10l-3 4m16-4l3 4" />
      <circle cx="4" cy="14" r="2" />
      <circle cx="20" cy="14" r="2" />
    </svg>
  )
};

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
                            nombre: session.user.name || "Mago de las Letras",
                            rol: "spectator",
                            nivel: "Iniciado",
                            tinta: 0,
                        });
                    }
                })
                .catch(() => {
                    setUserData({
                        nombre: session.user.name || "Visitante Arcano",
                        rol: "spectator",
                        nivel: "Iniciado",
                        tinta: 0,
                    });
                });
        }
    }, [status, session, router]);

    const SECTIONS = [
        { title: t("mod_escritura"), href: "/concursos", icon: <Icons.Escritura /> },
        { title: t("mod_examenes"), href: "/examenes", icon: <Icons.Examenes /> },
        { title: t("mod_comunidad"), href: "/comunidad", icon: <Icons.Comunidad /> },
        { title: "Santuario de Libros", href: "/biblioteca", icon: <Icons.Biblioteca /> },
        { title: t("mod_mercado"), href: "/mercado", icon: <Icons.Mercado /> },
        { title: t("mod_perfil"), href: "/perfil", icon: <Icons.Perfil /> },
        { title: t("mod_tribunal"), href: "/panel", icon: <Icons.Tribunal /> },
    ];

    if (status === "loading" || (status === "authenticated" && !userData)) {
        return (
            <div className="min-h-screen bg-[#050508] text-[#d4af37] flex flex-col items-center justify-center gap-8">
                <div className="w-16 h-16 border-t-2 border-amber-500 rounded-full animate-spin"></div>
                <div className="space-y-4 text-center font-cinzel">
                    <p className="text-xl md:text-2xl tracking-[0.3em] uppercase opacity-80">Convocando el Cónclave...</p>
                    <p className="text-[10px] tracking-[0.5em] uppercase opacity-40">Consultando Pergaminos Arcanos</p>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <main className="min-h-screen bg-[#050508] text-[#e0d7c6] p-6 md:p-24 lg:p-32 animate-elegant">
            <div className="max-w-7xl mx-auto space-y-24 md:space-y-48">
                <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12 border-b border-amber-500/10 pb-12 md:pb-16 text-center md:text-left">
                    <div className="space-y-4">
                        <p className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.6em] uppercase text-[#d4af37] font-cinzel mb-2">
                             La Gran Arena Literaria
                        </p>
                        <h1 className="text-5xl md:text-8xl font-black italic title-gradient pr-0 md:pr-8">Cuentistas</h1>
                    </div>
                    <div className="font-cinzel text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-center md:text-right flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <span className="text-[#ffffff] font-bold text-xs md:text-sm tracking-widest">{userData.nombre}</span>
                            <span className="text-[#d4af37] font-bold opacity-80">{userData.rol === 'Escritor' ? 'Autor' : 'Espectador'} — {userData.nivel}</span>
                        </div>
                        <div className="w-16 md:w-px h-px md:h-12 bg-amber-500/20"></div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 px-8 py-4 md:py-5 rounded-sm transition-all text-[#d4af37] font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] tracking-[0.3em] md:tracking-[0.4em]"
                        >
                            Abandonar
                        </button>
                    </div>
                </header>

                <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                    {SECTIONS.map((s, idx) => (
                        <a
                            key={idx}
                            href={s.href}
                            className="royal-card p-12 md:p-20 h-72 md:h-96 flex flex-col items-center justify-center group text-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative z-10 space-y-8 md:space-y-12">
                                <div className="text-[#d4af37] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 filter drop-shadow-[0_0_10px_rgba(212,175,55,0.2)] flex justify-center">
                                    {s.icon}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-cinzel text-white/90 group-hover:text-[#d4af37] transition-all duration-700 tracking-widest uppercase">
                                    {s.title}
                                </h3>
                                <div className="w-8 md:w-12 h-[1px] bg-amber-500/10 mx-auto group-hover:w-32 group-hover:bg-amber-500/40 transition-all duration-1000"></div>
                            </div>
                        </a>
                    ))}
                </nav>

                <footer className="pt-24 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.5em] uppercase font-cinzel text-gray-500 text-center">
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                        <span className="opacity-60 italic text-gray-400">Fundado en el año MMXXVI</span>
                        <div className="w-8 h-[1px] bg-amber-500/10 hidden md:block"></div>
                        <a href="/manual" className="text-amber-500/80 hover:text-amber-500 transition-colors font-bold">Manual Arcano</a>
                        <div className="w-8 h-[1px] bg-amber-500/10 hidden md:block"></div>
                        <a href="/panel" className="text-amber-500/60 hover:text-amber-500 transition-colors">Juicio de Autores</a>
                    </div>
                </footer>
            </div>
        </main>
    );
}
