/**
 * PanelJuez.jsx
 * Upgraded with Phase 11 Audiovisual Verdicts.
 */

"use client";

import { useEffect, useState } from "react";
import RecorderModal from "@/components/recorder/RecorderModal";

export default function PanelJuez() {
  const [entradas, setEntradas] = useState([]);
  const [msg, setMsg] = useState("");
  
  // Phase 11 Feedback State
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [tempVideoUrl, setTempVideoUrl] = useState(null);
  const [tempComment, setTempComment] = useState("");

  async function cargar() {
    const res = await fetch("/api/entradas");
    const data = await res.json();
    setEntradas(data.entradas || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  const openRecorder = (entryId) => {
    setActiveEntryId(entryId);
    setIsRecorderOpen(true);
  };

  async function calificar(id, score) {
    setMsg("Sellando veredicto...");
    const res = await fetch("/api/calificar", {
      method: "POST",
      body: JSON.stringify({ 
        id, 
        score,
        judgeVideoUrl: tempVideoUrl,
        judgeComment: tempComment 
      })
    });
    const data = await res.json();
    setMsg(data.message || "");

    if (res.ok) {
      setTempVideoUrl(null);
      setTempComment("");
      cargar();
    }
  }

  return (
    <main className="min-h-screen p-10 bg-[#05050A] text-white font-serif">
      <div className="max-w-4xl mx-auto">
        <a href="/panel" className="text-xs tracking-widest uppercase text-gold/60 hover:text-gold transition-all">
          &larr; Volver al santuario
        </a>

        <h1 className="text-5xl font-light tracking-[0.2em] uppercase mt-8 mb-12 border-b border-white/5 pb-8">
          Panel del Tribunal
        </h1>

        {entradas.length === 0 && (
          <div className="p-20 text-center border border-dashed border-white/10 rounded-3xl">
             <p className="text-gray-500 tracking-widest uppercase text-xs">No hay crónicas pendientes de vuestro juicio.</p>
          </div>
        )}

        {entradas.map((e) => (
          <div
            key={e.id}
            className="mb-12 p-10 bg-[#101018] border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-8">
                <div>
                     <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                        {e.concursoTitulo || "Concurso Desconocido"}
                    </p>
                    <h2 className="text-2xl font-light italic text-white/90">Crónica #{e.id.slice(0,8)}</h2>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-[10px] tracking-widest uppercase text-white/40">
                    Autor: {e.user?.nombre || e.participante}
                </div>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-10 whitespace-pre-line font-light italic">
                "{e.texto}"
            </p>

            <div className="pt-8 border-t border-white/5 space-y-8">
                
                {/* Audiovisual Feedback Section */}
                <div className="flex gap-6 items-center">
                    <button 
                        onClick={() => openRecorder(e.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl border text-[10px] tracking-widest uppercase font-bold transition-all ${tempVideoUrl ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-gold/10 border-gold/40 text-gold hover:bg-gold hover:text-black'}`}
                    >
                        {tempVideoUrl ? "✅ Veredicto Video Grabado" : "🎥 Grabar Veredicto Video"}
                    </button>
                    {tempVideoUrl && (
                        <input 
                            type="text"
                            placeholder="Comentario del Juez..."
                            value={tempComment}
                            onChange={(e) => setTempComment(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-3 text-xs text-white focus:border-gold outline-none transition-all"
                        />
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold">Emitir Sentencia:</span>
                    <div className="flex gap-2">
                        {[7, 8, 9, 10].map((n) => (
                        <button
                            key={n}
                            onClick={() => calificar(e.id, n)}
                            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-gold hover:text-black border border-white/10 rounded-full transition-all text-sm font-bold active:scale-90"
                        >
                            {n}
                        </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        ))}

        {msg && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-4 bg-gold text-black text-xs font-bold tracking-[0.4em] uppercase rounded-full shadow-2xl animate-bounce">
                {msg}
            </div>
        )}
      </div>

      <RecorderModal 
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSave={(url) => setTempVideoUrl(url)}
        targetEntryId={activeEntryId}
      />
    </main>
  );
}
