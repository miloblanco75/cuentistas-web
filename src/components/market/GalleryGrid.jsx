"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LaurelButton from './LaurelButton';
import JudgeScorePanel from './JudgeScorePanel';
import Link from 'next/link';
import { castLaurelVote, castJudgeJudgment } from '@/app/actions/votingActions';
import { useRouter } from 'next/navigation';

export default function GalleryGrid({ initialObras, userRole, userPoints }) {
  const [judgingId, setJudgingId] = useState(null);
  const [readingObra, setReadingObra] = useState(null);
  const router = useRouter();

  const isJudge = userRole === "JUDGE" || userRole === "ARCHITECT" || userPoints >= 1000;

  return (
    <div className="space-y-32">
      {/* Sección: Gloria Eterna (Top 3) */}
      <section className="space-y-16">
        <header className="flex items-center gap-6">
            <span className="w-12 h-px bg-gold"></span>
            <h2 className="text-2xl font-serif italic text-gold tracking-[0.3em] uppercase">Gloria Eterna</h2>
        </header>
        <div className="grid md:grid-cols-3 gap-12">
            {initialObras.slice(0, 3).map((obra, idx) => (
                <div key={obra.id} className="royal-card p-12 bg-gold/[0.03] border-gold/30 relative group overflow-hidden">
                    <div className="absolute -top-10 -right-10 text-9xl text-gold/5 font-serif italic select-none">{idx + 1}</div>
                    <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                             <p className="text-[9px] tracking-widest text-gold uppercase">{obra.concurso.titulo}</p>
                             <h3 className="text-3xl font-serif italic text-white/90">{obra.participante}</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400 italic line-clamp-3">"{obra.texto}"</p>
                            <button onClick={() => setReadingObra(obra)} className="text-[9px] uppercase text-gold hover:text-white transition-colors tracking-widest font-sans flex items-center gap-2">
                                Leer Manuscrito <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-gold/10">
                            <div className="text-[9px] tracking-widest uppercase text-gray-500">Escala Real</div>
                            <div className="text-lg font-serif italic text-gold">{obra.puntajeTotal?.toFixed(1)} <span className="text-[9px]">Pts</span></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Grid General: El Museo Real */}
      <section className="grid md:grid-cols-2 gap-20">
        {initialObras.map(obra => (
            <div key={obra.id} className="royal-card p-12 space-y-12 border-white/5 hover:border-gold/20 transition-all group">
                <header className="flex justify-between items-start">
                    <div className="space-y-4">
                        <h3 className="text-4xl font-serif italic text-white/90 group-hover:text-gold transition-colors">{obra.concurso.titulo}</h3>
                        <div className="flex gap-4 items-center">
                            <Link href={`/autor/${obra.user?.username || ''}`} className="text-[10px] tracking-[0.3em] font-sans text-gold uppercase hover:underline">{obra.participante}</Link>
                            <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <p className="text-[9px] tracking-widest text-gray-500 uppercase">Híbrido 60/40</p>
                        <p className="text-2xl font-serif italic text-white">{obra.puntajeTotal?.toFixed(1)}</p>
                    </div>
                </header>

                <div className="space-y-6">
                    <p className="text-xl text-zinc-400 font-serif leading-relaxed line-clamp-6">"{obra.texto}"</p>
                    <button onClick={() => setReadingObra(obra)} className="text-[10px] uppercase text-gold hover:text-white transition-colors tracking-[0.2em] font-sans flex items-center gap-2">
                        Leer Manuscrito Completo <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Voting & Judgment Controls */}
                <div className="pt-12 border-t border-white/5 flex flex-wrap justify-between items-center gap-8">
                     <LaurelButton 
                        entradaId={obra.id} 
                        totalVotos={obra.votos} 
                        onVote={() => router.refresh()}
                     />

                     <div className="flex gap-12 items-center">
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] tracking-widest uppercase text-gray-500">Voz Popular (40%)</p>
                            <p className="text-xs font-serif italic text-white">{obra.popularScore?.toFixed(1)} Pts</p>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] tracking-widest uppercase text-gold">Cómite (60%)</p>
                            <p className="text-xs font-serif italic text-white">{obra.expertScore?.toFixed(1)} Pts</p>
                        </div>
                     </div>
                </div>

                {isJudge && (
                    <div className="pt-8 text-center">
                        <button 
                            onClick={() => setJudgingId(judgingId === obra.id ? null : obra.id)}
                            className="text-[10px] tracking-[0.4em] uppercase text-gold/60 hover:text-gold transition-colors"
                        >
                            {judgingId === obra.id ? "Cerrar Panel de Juicio" : "— Abrir Libro de Sentencias —"}
                        </button>
                    </div>
                )}

                {judgingId === obra.id && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-12"
                    >
                        <JudgeScorePanel 
                            entradaId={obra.id} 
                            onSuccess={() => {
                                setJudgingId(null);
                                router.refresh();
                            }}
                        />
                    </motion.div>
                )}
            </div>
        ))}
      </section>

      {/* Modal de Lectura Total */}
      {readingObra && (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 overflow-y-auto" 
            onClick={() => setReadingObra(null)}
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full royal-card p-12 md:p-24 space-y-16 my-auto border-gold/30" 
                onClick={e => e.stopPropagation()}
            >
                <header className="space-y-6 text-center border-b border-white/5 pb-10">
                     <p className="text-[10px] tracking-widest text-gold uppercase">{readingObra.concurso.titulo}</p>
                     <h3 className="text-4xl md:text-5xl font-serif italic text-white/90">{readingObra.participante}</h3>
                     <div className="flex justify-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest">
                         <span>Escala Real: {readingObra.puntajeTotal?.toFixed(1)} Pts</span>
                         <span>•</span>
                         <span>Votos Populares: {readingObra.votos}</span>
                     </div>
                </header>
                <div className="text-xl md:text-2xl text-zinc-300 font-serif leading-loose whitespace-pre-wrap">
                    {readingObra.texto}
                </div>
                <div className="text-center pt-16 border-t border-white/5">
                    <button 
                        onClick={() => setReadingObra(null)} 
                        className="text-[11px] tracking-[0.4em] uppercase text-gray-400 hover:text-gold transition-colors py-4 px-8 border border-white/10 hover:border-gold/30 rounded-full"
                    >
                        Cerrar Manuscrito
                    </button>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}
