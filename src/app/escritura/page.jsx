"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/components/UserContext";
import { useRouter } from "next/navigation";
import { PenTool, Timer, Zap, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function EscrituraPage() {
    const { userData, loading } = useUser();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050508] flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#050508] text-white p-6 md:p-24 animate-elegant">
            <div className="max-w-7xl mx-auto space-y-24">
                <header className="space-y-4">
                    <p className="text-gold text-[10px] tracking-[0.6em] uppercase opacity-60">— El Refugio del Escritor —</p>
                    <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-white">Escritura</h1>
                    <div className="h-[1px] w-24 bg-gold/40"></div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Puerta 1: La Arena */}
                    <section className="royal-card p-12 bg-gradient-to-br from-white/[0.03] to-transparent border-gold/20 hover:border-gold/50 transition-all group overflow-hidden relative flex flex-col justify-between min-h-[500px]">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={200} className="text-gold rotate-12" />
                        </div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                    <span className="text-[10px] tracking-[0.4em] uppercase text-red-500 font-bold">Clasificatoria</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-serif italic text-white/90 group-hover:text-gold transition-colors">
                                    La Arena
                                </h2>
                                <p className="text-gray-400 text-lg font-light leading-relaxed">
                                    El tiempo es la única moneda que no se recupera. Entra en la arena, forja tu legado y asciende en el Tribunal.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-8 py-8 border-y border-white/5">
                                <div className="flex items-center gap-3">
                                    <Timer className="text-gold w-5 h-5" />
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Presión</p>
                                        <p className="text-white font-serif italic">Reloj Mortal</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="text-gold w-5 h-5" />
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Riesgo</p>
                                        <p className="text-white font-serif italic">Prestigio y Elo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative z-10 space-y-4 mt-8">
                            <button 
                                onClick={() => router.push(`/concursos`)}
                                className="royal-button w-full px-12 py-5 text-xs group flex items-center justify-center gap-4 bg-white/5 hover:bg-gold hover:text-black transition-colors"
                            >
                                <span>VER CONVOCATORIAS</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </section>

                    {/* Puerta 2: El Retiro */}
                    <section className="royal-card p-12 bg-gradient-to-br from-black to-white/[0.02] border-white/10 hover:border-white/30 transition-all group overflow-hidden relative flex flex-col justify-between min-h-[500px]">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <PenTool size={200} className="text-white -rotate-12" />
                        </div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                    <span className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-bold">Práctica de Élite</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-serif italic text-white/90 group-hover:text-white transition-colors">
                                    El Retiro
                                </h2>
                                <p className="text-gray-400 text-lg font-light leading-relaxed">
                                    El lugar donde se forman los verdaderos peligrosos. Sin reloj, sin castigo de Elo. Solo tú, el Oráculo y la disciplina pura.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-8 py-8 border-y border-white/5">
                                <div className="flex items-center gap-3">
                                    <PenTool className="text-gray-400 w-5 h-5" />
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Modo</p>
                                        <p className="text-white font-serif italic">Prueba Silenciosa</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="text-gray-400 w-5 h-5" />
                                    <div>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-1">Recompensa</p>
                                        <p className="text-white font-serif italic">Experiencia</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 space-y-4 mt-8">
                            <button 
                                onClick={() => router.push(`/retiro`)}
                                className="royal-button w-full px-12 py-5 text-xs group flex items-center justify-center gap-4 border-white/20 text-white hover:bg-white hover:text-black transition-colors"
                            >
                                <span>INGRESAR AL RETIRO</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
