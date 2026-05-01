"use client";

import React, { useState } from "react";
import { BookOpen, FileText, Upload, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function ExamConsole() {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    isExamen: true,
    preguntas: "",
    pdfUrl: "",
    duration: 3600,
    costoTinta: 0,
    tipo: "examen"
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/concursos/crear", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ type: "success", text: "Acta de Examen forjada con éxito. Protocolo activado." });
        setFormData({
          titulo: "",
          descripcion: "",
          isExamen: true,
          preguntas: "",
          pdfUrl: "",
          duration: 3600,
          costoTinta: 0,
          tipo: "examen"
        });
      } else {
        setMsg({ type: "error", text: data.error || "Fallo en la forja del examen." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de conexión con el Gran Archivo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-12 animate-elegant">
      {/* Formulario */}
      <div className="lg:col-span-3 space-y-10">
        <header className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="text-gold" size={20} /> Forja de Exámenes (B2B)
          </h3>
          <p className="text-[10px] tracking-widest uppercase opacity-40">Módulo de Integridad Académica y Corporativa</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-black/40 border border-white/5 p-10 rounded-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] tracking-widest uppercase opacity-60">Título del Examen / Acta</label>
              <input 
                type="text" 
                required
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                placeholder="Ej: Examen de Ingreso - Literatura Hispana II" 
                className="w-full bg-[#0a0a0f] border border-white/10 p-4 text-sm focus:border-gold outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] tracking-widest uppercase opacity-60">Instrucciones / Descripción</label>
              <textarea 
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Indica las reglas del examen..." 
                className="w-full bg-[#0a0a0f] border border-white/10 p-4 text-sm focus:border-gold outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] tracking-widest uppercase opacity-60">Duración (segundos)</label>
                <input 
                  type="number" 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full bg-[#0a0a0f] border border-white/10 p-4 text-sm focus:border-gold outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] tracking-widest uppercase opacity-60">URL del PDF (Opcional)</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={formData.pdfUrl}
                        onChange={(e) => setFormData({...formData, pdfUrl: e.target.value})}
                        placeholder="https://..." 
                        className="flex-1 bg-[#0a0a0f] border border-white/10 p-4 text-[10px] focus:border-gold outline-none transition-all"
                    />
                    <div className="bg-white/5 p-4 border border-white/10">
                        <Upload size={14} className="opacity-40" />
                    </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] tracking-widest uppercase opacity-60">Preguntas o Guía de Redacción</label>
              <textarea 
                rows={6}
                value={formData.preguntas}
                onChange={(e) => setFormData({...formData, preguntas: e.target.value})}
                placeholder="Escribe aquí las preguntas que el alumno deberá responder..." 
                className="w-full bg-[#0a0a0f] border border-white/10 p-4 text-sm font-mono focus:border-gold outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold text-black font-bold text-[11px] tracking-[0.4em] py-6 uppercase hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
          >
            {loading ? "Sincronizando con el Gran Archivo..." : "Crear y Publicar Examen 🏛️"}
            <Plus size={16} />
          </button>

          {msg && (
            <div className={`p-5 text-[10px] tracking-widest uppercase flex items-center gap-3 ${msg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {msg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {msg.text}
            </div>
          )}
        </form>
      </div>

      {/* Preview Info & Secondary Action */}
      <div className="lg:col-span-2 space-y-8">
        <div className="border border-gold/10 bg-gold/5 p-8 space-y-8 sticky top-24">
          <div className="space-y-2">
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold">Estado de la Forja</h4>
            <p className="text-[9px] opacity-40 uppercase tracking-[0.2em]">Listo para el despliegue institucional</p>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white/5 border border-gold/40 text-gold font-bold text-[9px] tracking-[0.3em] py-4 uppercase hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-2"
          >
            {loading ? "..." : "Lanzar Ahora 🔱"}
          </button>

          <div className="h-[1px] bg-white/5"></div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
               <div className="p-3 bg-gold/10 rounded-full"><FileText size={16} className="text-gold" /></div>
               <div>
                  <p className="text-[10px] font-bold text-white uppercase mb-1">Caja de Cristal Activada</p>
                  <p className="text-[9px] opacity-60 leading-relaxed uppercase tracking-wider">Monitoreo síncrono letra por letra.</p>
               </div>
            </div>
            <div className="flex gap-4 items-start">
               <div className="p-3 bg-gold/10 rounded-full"><Plus size={16} className="text-gold" /></div>
               <div>
                  <p className="text-[10px] font-bold text-white uppercase mb-1">Detección de Fraude</p>
                  <p className="text-[9px] opacity-60 leading-relaxed uppercase tracking-wider">Alertas de tab-switching y ráfagas sospechosas.</p>
               </div>
            </div>
          </div>
        </div>

        <div className="border border-white/5 p-8 bg-black/20 space-y-4">
           <p className="text-[9px] tracking-widest uppercase opacity-40">Consejo del Arquitecto</p>
           <p className="text-xs italic text-gray-400 leading-relaxed">"Un examen en Cuentistas no solo evalúa el resultado, sino el proceso creativo y la honestidad del flujo de ideas."</p>
        </div>
      </div>
    </div>
  );
}
