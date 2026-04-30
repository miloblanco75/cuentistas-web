"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConcursosPage() {
  const [concursos, setConcursos] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/concursos")
      .then(res => res.json())
      .then(data => setConcursos(data.concursos));

    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  if (!user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-sm">...</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant">
      <div className="max-w-6xl mx-auto space-y-40">
        <header className="space-y-8 flex flex-col md:flex-row justify-between items-end">
          <div className="space-y-4">
            <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-sans font-light">
              — Arena Real —
            </p>
            <h1 className="text-8xl font-light tracking-tighter text-white font-serif italic">Convocatorias</h1>
          </div>
          <div className="text-right pb-4">
            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-500 font-sans">Crónicas Disponibles</p>
            <p className="text-2xl font-serif italic text-gold">{concursos.length}</p>
          </div>
        </header>

        <div className="grid gap-8">
          {(() => {
            const isNovato = user.entradasTotales < 7;
            let displayConcursos = [...concursos];
            
            if (isNovato) {
                // Priorizar arenas de novato
                displayConcursos.sort((a, b) => (b.esParaNovatos ? 1 : 0) - (a.esParaNovatos ? 1 : 0));
            } else {
                // Veteranos no ven arenas de novato
                displayConcursos = displayConcursos.filter(c => !c.esParaNovatos);
            }

            return displayConcursos.map(c => {
              const userNivelIdx = ["Principiante", "Intermedio", "Avanzado", "Maestro", "Legendario"].indexOf(user.nivel);
              const contestNivelIdx = ["Principiante", "Intermedio", "Avanzado", "Maestro", "Legendario"].indexOf(c.categoria);
              
              const isHighRank = user.rol === "ARCHITECT" || user.nivel === "Soberano Arquitecto" || user.rol === "Maestro";
              
              // Lógica de Bloqueo Elo/Rango (Bypass para roles altos)
              const isHighEloLocked = !isHighRank && (isNovato && !c.esParaNovatos && c.minElo > user.elo);
              const isLevelLocked = !isHighRank && (userNivelIdx !== -1 && userNivelIdx < contestNivelIdx);
              const isInkLocked = !isHighRank && (user.tinta < c.costoTinta);
              
              const locked = isHighEloLocked || isLevelLocked || isInkLocked;
              
              let lockMessage = "";
              if (isHighEloLocked) lockMessage = "El Tribunal aún no te convoca";
              else if (isLevelLocked) lockMessage = "Rango Insuficiente";
              else if (isInkLocked) lockMessage = "Sello insuficiente";

              return (
                <div key={c.id} className={`royal-card p-12 group transition-all duration-700 ${locked ? 'opacity-30' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] tracking-widest uppercase text-gold font-sans border border-gold/30 px-3 py-1 rounded-full">{c.categoria}</span>
                      {c.costoTinta > 0 && (
                        <span className="text-[10px] text-gray-500 tracking-[0.2em] font-sans">
                          Acceso: {c.costoTinta} ✒️ Pura
                        </span>
                      )}
                    </div>
                    <h2 className="text-5xl font-serif italic text-white/90 group-hover:text-gold transition-all duration-700">{c.titulo}</h2>
                    <p className="text-xl text-gray-500 font-serif italic max-w-2xl leading-relaxed">{c.descripcion}</p>
                  </div>
                    <div className="w-full md:w-auto">
                      <button
                        onClick={() => router.push(`/concursos/live/${c.id}`)}
                        className="royal-button w-full"
                        disabled={locked}
                      >
                        {locked ? lockMessage : 'Escribir'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </main>
  );
}
