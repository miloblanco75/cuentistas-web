"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PanelPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const isMaster = session?.user?.rol === "Maestro";

  useEffect(() => {
    if (isMaster) {
      fetch("/api/admin/users")
        .then(res => res.json())
        .then(data => {
          if (data.ok) setStats(data.stats);
        });
    }
  }, [isMaster]);

  return (
    <main className="min-h-screen p-8 md:p-16 bg-[#050508] text-[#e0d7c6] font-sans relative overflow-hidden">
      {/* Luz Arcaica */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(212,175,55,0.03),transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10 animate-elegant">
        <header className="mb-12 space-y-4 border-b border-amber-500/10 pb-12">
          <div className="flex items-center gap-4 text-amber-500 mb-2">
            <span className="text-sm tracking-[0.6em] uppercase font-cinzel">Panel de Mando Supremo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-cinzel tracking-widest title-gradient">
            {isMaster ? "Trono del Cónclave" : "Panel de Autor"}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl font-serif italic">
            "Donde el destino de las palabras es forjado por la voluntad del Gran Maestro."
          </p>
        </header>

        {isMaster && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-pulse-slow">
            <div className="royal-card p-8 border-amber-500/30 bg-amber-500/5">
                <p className="text-[10px] tracking-widest uppercase text-amber-500 mb-2 font-cinzel">Habitantes Totales</p>
                <div className="text-4xl font-cinzel text-white">{stats?.total || "..."}</div>
            </div>
            <div className="royal-card p-8 border-blue-500/30 bg-blue-500/5">
                <p className="text-[10px] tracking-widest uppercase text-blue-400 mb-2 font-cinzel">Nuevas Almas (24h)</p>
                <div className="text-4xl font-cinzel text-white">{stats?.recientes || "..."}</div>
            </div>
            <div className="royal-card p-8 border-purple-500/30 bg-purple-500/5">
                <p className="text-[10px] tracking-widest uppercase text-purple-400 mb-2 font-cinzel">Maestros Aliados</p>
                <div className="text-4xl font-cinzel text-white">{stats?.maestros || "..."}</div>
            </div>
          </section>
        )}

        <div className="flex justify-start mb-12">
          <a 
            href="/panel/concursos/nuevo"
            className="royal-button px-12 py-4 text-lg"
          >
            + Forjar Nuevo Concurso
          </a>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/panel/juez"
            className="royal-card p-12 group hover:scale-[1.02] transition-all"
          >
            <div className="flex flex-col h-full space-y-8">
              <span className="text-5xl text-amber-500 group-hover:animate-pulse">⚖️</span>
              <h2 className="text-2xl font-cinzel tracking-widest text-[#ffffff]">Panel de Calificación</h2>
              <p className="text-gray-400 leading-relaxed font-serif italic">
                Lee los cuentos enviados y asigna calificaciones con precisión soberana.
              </p>
              <div className="w-12 h-px bg-amber-500/20 group-hover:w-full transition-all duration-700"></div>
            </div>
          </a>

          <div className="royal-card p-12">
            <div className="flex flex-col h-full space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl">📡</span>
                <h2 className="text-2xl font-cinzel tracking-widest text-[#ffffff]">Control en Vivo</h2>
              </div>
              <div className="space-y-4">
                <a href="/panel/concurso/historias-sur" className="block p-4 bg-amber-500/5 hover:bg-amber-500/20 rounded-sm border border-amber-500/10 transition-all font-cinzel text-amber-500 text-sm tracking-widest">
                  HISTORIAS DEL SURESTE
                </a>
                <a href="/panel/concurso/relatos-futuro" className="block p-4 bg-amber-500/5 hover:bg-amber-500/20 rounded-sm border border-amber-500/10 transition-all font-cinzel text-amber-500 text-sm tracking-widest">
                  RELATOS DE FUTURO
                </a>
              </div>
            </div>
          </div>

          <a
            href="/ranking"
            className="royal-card p-12 group hover:scale-[1.02] transition-all"
          >
            <div className="flex flex-col h-full space-y-8">
              <span className="text-5xl text-amber-500">📈</span>
              <h2 className="text-2xl font-cinzel tracking-widest text-[#ffffff]">Evolución Arcaica</h2>
              <p className="text-gray-400 leading-relaxed font-serif italic">
                Consulta el estado de la competición y descubre qué autores dominan la arena.
              </p>
              <div className="w-12 h-px bg-amber-500/20 group-hover:w-full transition-all duration-700"></div>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
