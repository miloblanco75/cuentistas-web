"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PanelPage() {
  const { data: session } = useSession();
  const [adminData, setAdminData] = useState(null);
  const isMaster = session?.user?.rol === "Maestro";

  useEffect(() => {
    if (isMaster) {
      // Cargar datos administrativos y de casas
      fetch("/api/admin/users")
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
              // Calcular ranking de casas
              const houseScores = data.users.reduce((acc, user) => {
                  if (user.casa) {
                      acc[user.casa] = (acc[user.casa] || 0) + (user.puntosCasa || 0);
                  }
                  return acc;
              }, {});
              
              const sortedHouses = Object.entries(houseScores)
                  .map(([name, score]) => ({ name, score }))
                  .sort((a, b) => b.score - a.score);

              setAdminData({
                  stats: data.stats,
                  houses: sortedHouses
              });
          }
        });
    }
  }, [isMaster]);

  return (
    <main className="min-h-screen p-8 md:p-16 bg-[#050508] text-[#e0d7c6] font-sans relative overflow-hidden">
      {/* Luz Arcaica */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(212,175,55,0.03),transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10 animate-elegant">
        <header className="mb-12 space-y-4 border-b border-amber-500/10 pb-12">
          <div className="flex items-center gap-4 text-amber-500 mb-2 font-cinzel">
            <span className="text-sm tracking-[0.6em] uppercase">Panel de Mando Supremo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-cinzel tracking-widest title-gradient">
            {isMaster ? "Trono del Cónclave" : "Panel de Autor"}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl font-serif italic">
            "Donde el destino de las palabras es forjado por la voluntad del Gran Maestro y la justicia del Jurado."
          </p>
        </header>

        {isMaster && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Stats Rápidas */}
            <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="royal-card p-8 border-amber-500/30 bg-amber-500/5">
                  <p className="text-[10px] tracking-widest uppercase text-amber-500 mb-2 font-cinzel">Habitantes Totales</p>
                  <div className="text-4xl font-cinzel text-white">{adminData?.stats?.total || "..."}</div>
              </div>
              <div className="royal-card p-8 border-blue-500/30 bg-blue-500/5">
                  <p className="text-[10px] tracking-widest uppercase text-blue-400 mb-2 font-cinzel">Nuevas Almas (24h)</p>
                  <div className="text-4xl font-cinzel text-white">{adminData?.stats?.recientes || "..."}</div>
              </div>
              <div className="royal-card p-8 border-purple-500/30 bg-purple-500/5">
                  <p className="text-[10px] tracking-widest uppercase text-purple-400 mb-2 font-cinzel">Maestros Aliados</p>
                  <div className="text-4xl font-cinzel text-white">{adminData?.stats?.maestros || "..."}</div>
              </div>
              
              {/* Botones de Acción Mística */}
              <div className="md:col-span-3 flex flex-wrap gap-6 pt-4">
                <a 
                    href="/panel/concursos/nuevo"
                    className="royal-button px-12 py-4 text-lg shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                    + Forjar Nuevo Concurso
                </a>
                <button className="bg-purple-900/10 hover:bg-purple-900/20 border border-purple-500/20 px-8 py-4 rounded-sm text-purple-400 font-bold tracking-widest text-sm transition-all">
                    ⚖️ Revisar Calificaciones
                </button>
              </div>
            </section>

            {/* Ranking de Casas */}
            <aside className="royal-card p-8 border-amber-500/20 bg-[#0a0a0f]">
                <h2 className="text-xl font-cinzel tracking-widest text-amber-500 mb-8 border-b border-amber-500/10 pb-4">Ranking de Casas</h2>
                <div className="space-y-6">
                    {adminData?.houses?.map((h, i) => (
                        <div key={h.name} className="flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-bold ${i === 0 ? 'text-amber-400' : 'text-gray-600'}`}>#{i+1}</span>
                                <span className="capitalize font-cinzel tracking-wider text-sm">{h.name}</span>
                            </div>
                            <span className="text-amber-500/80 font-bold font-serif">{h.score} <span className="text-[10px] opacity-40">pts</span></span>
                        </div>
                    )) || <p className="text-center text-xs opacity-40 py-8 italic">Consultando pergaminos famliares...</p>}
                </div>
            </aside>
          </div>
        )}

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/panel/juez"
            className="royal-card p-12 group hover:scale-[1.02] transition-all border-amber-500/10"
          >
            <div className="flex flex-col h-full space-y-8">
              <span className="text-5xl text-amber-500 group-hover:animate-pulse">⚖️</span>
              <h2 className="text-2xl font-cinzel tracking-widest text-[#ffffff]">Entradas al Tribunal</h2>
              <p className="text-gray-400 leading-relaxed font-serif italic">
                Evalúa los relatos inspirados por el Cónclave y dicta tu veredicto arcaico.
              </p>
              <div className="w-12 h-px bg-amber-500/20 group-hover:w-full transition-all duration-700"></div>
            </div>
          </a>

          <div className="royal-card p-12 border-amber-500/10">
            <div className="flex flex-col h-full space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl">📡</span>
                <h2 className="text-2xl font-cinzel tracking-widest text-[#ffffff]">Relojes de Arena</h2>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] text-amber-500/50 uppercase tracking-[0.3em] font-cinzel">Certámenes Activos</p>
                <div className="p-4 bg-amber-500/5 rounded-sm border border-amber-500/10 text-xs text-gray-400 italic">
                  No hay certámenes en curso en este momento.
                </div>
              </div>
            </div>
          </div>

          <a
            href="/ranking"
            className="royal-card p-12 group hover:scale-[1.02] transition-all border-amber-500/10"
          >
            <div className="flex flex-col h-full space-y-8">
              <span className="text-5xl text-amber-500">📈</span>
              <h2 className="text-2xl font-cinzel tracking-widest text-[#ffffff]">Anales de la Fama</h2>
              <p className="text-gray-400 leading-relaxed font-serif italic">
                Observa el ascenso de los nuevos talentos y su posición en la Gran Tabla.
              </p>
              <div className="w-12 h-px bg-amber-500/20 group-hover:w-full transition-all duration-700"></div>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
