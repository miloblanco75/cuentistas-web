import React from "react";
import prisma from "@/lib/db";
import Link from "next/link";
import { User, BookOpen, Share2, Award } from "lucide-react";

export async function generateMetadata({ params }) {
    const entry = await prisma.entrada.findUnique({
        where: { id: params.id },
        include: { user: true, concurso: true }
    });

    if (!entry) return { title: "Cuentistas | Relato no encontrado" };

    const author = entry.user?.nombre || entry.participante;
    const title = `Relato de ${author} en ${entry.concurso.titulo}`;
    const description = entry.texto.substring(0, 160) + "...";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            images: [entry.user?.image || "https://cuentistas.com/og-default.png"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [entry.user?.image || "https://cuentistas.com/og-default.png"],
        }
    };
}

export default async function PublicStoryPage({ params }) {
    const entry = await prisma.entrada.findUnique({
        where: { id: params.id },
        include: { 
            user: {
                select: {
                    nombre: true,
                    username: true,
                    image: true,
                    nivel: true
                }
            },
            concurso: {
                select: {
                    titulo: true,
                    temaGeneral: true
                }
            }
        }
    });

    if (!entry) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-white/40">
                El relato ha sido consumido por las sombras...
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050508] text-white font-serif selection:bg-gold/20">
            <div className="max-w-4xl mx-auto p-8 pt-32 pb-64 space-y-24">
                
                {/* Header Context */}
                <header className="space-y-6 text-center animate-elegant">
                    <p className="text-[10px] tracking-[0.5em] uppercase text-gold/60 font-sans">Crónica del Tribunal Supremo</p>
                    <h1 className="text-6xl font-light tracking-tighter text-white uppercase italic">{entry.concurso.titulo}</h1>
                    <div className="flex items-center justify-center gap-8 opacity-60">
                        <div className="h-px w-12 bg-white/10"></div>
                        <p className="text-sm font-sans tracking-widest italic">{entry.concurso.temaGeneral}</p>
                        <div className="h-px w-12 bg-white/10"></div>
                    </div>
                </header>

                {/* The Story */}
                <article className="royal-card p-12 md:p-24 relative overflow-hidden bg-white/[0.01] border-white/5 animate-elegant" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
                    <div className="text-4xl leading-[1.6] text-white/90 italic first-letter:text-8xl first-letter:font-black first-letter:mr-6 first-letter:float-left first-letter:text-gold selection:text-gold whitespace-pre-wrap">
                        "{entry.texto}"
                    </div>
                    
                    <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full border border-gold/20 overflow-hidden bg-black flex items-center justify-center">
                                {entry.user?.image ? (
                                    <img src={entry.user.image} alt="Autor" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-gold/40 w-6 h-6" />
                                ) }
                            </div>
                            <div>
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-black">Autor del Legado</p>
                                <p className="text-2xl font-serif text-white/80">{entry.user?.nombre || entry.participante}</p>
                            </div>
                        </div>
                        
                        <div className="text-right flex items-center gap-12">
                            <div className="space-y-1">
                                <p className="text-[9px] tracking-widest text-white/30 uppercase font-black font-sans">Juicio del Tribunal</p>
                                <div className="text-4xl font-light text-gold font-mono tracking-tighter">{entry.expertScore.toFixed(1)}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] tracking-widest text-white/30 uppercase font-black font-sans">Vox Populi</p>
                                <div className="text-4xl font-light text-white font-mono tracking-tighter">{entry.votos}</div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Conversion Hook (V10 Polished) */}
                <section className="bg-gold/5 border border-gold/20 rounded-sm p-12 text-center space-y-8 animate-elegant" style={{ animationDelay: '0.4s' }}>
                    <div className="space-y-2">
                        <h2 className="text-[11px] tracking-[0.6em] uppercase text-gold font-black">¿Tienes el Criterio Suficiente?</h2>
                        <p className="text-[9px] text-gold/40 uppercase tracking-widest italic">El Tribunal lo calificó con {entry.expertScore.toFixed(0)} puntos</p>
                    </div>
                    
                    <p className="text-xl font-serif italic text-white/70 max-w-xl mx-auto">
                        "¿Tú lo habrías juzgado igual? Descubre si tu criterio supera al Tribunal Supremo."
                    </p>

                    <div className="pt-6 flex flex-col items-center gap-6">
                        <Link href="/arena" className="royal-button px-20 py-5 text-sm group">
                            Probar mi Criterio <span className="ml-3 group-hover:translate-x-2 transition-transform inline-block">⚖️</span>
                        </Link>
                        <p className="text-[10px] tracking-widest text-white/20 uppercase">No requiere registro previo</p>
                    </div>
                    
                    <p className="text-[9px] text-gold/40 uppercase tracking-[0.2em] animate-pulse">Tu estilo de juicio se está definiendo</p>
                </section>
                
                <footer className="text-center opacity-20 hover:opacity-100 transition-opacity">
                    <Link href="/" className="text-[9px] tracking-[0.6em] uppercase font-cinzel text-white">Cuentistas Online — MMXVI</Link>
                </footer>
            </div>
        </main>
    );
}
