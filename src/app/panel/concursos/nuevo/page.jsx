"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevoConcursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [judges, setJudges] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    scheduledTime: "",
    duration: "5400", // 90 min default
    temaGeneral: "",
    temaExacto: "",
    categoria: "Principiante",
    costoTinta: "0",
    juezId: "",
    tipo: "normal"
  });

  useEffect(() => {
    // Cargar potenciales jueces (Maestros)
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setJudges(data.users.filter(u => u.rol === "Maestro"));
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/concursos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.ok) {
        alert("¡Concurso forjado y destino sellado!");
        router.push("/panel");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Error al conectar con el servidor arcaico");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-[#050509] text-white flex flex-col items-center">
      <div className="max-w-2xl w-full bg-[#101018] border border-amber-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Divine Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl"></div>

        <h1 className="text-3xl font-black mb-2 font-cinzel tracking-widest text-[#d4af37]">
          FORJAR DESTINO
        </h1>
        <p className="text-gray-400 mb-8 text-sm italic font-serif">
          "Define el certamen y designa al arquitecto de la justicia (Juez)."
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Título del Desafío</label>
              <input
                required
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-amber-500 outline-none transition font-serif"
                placeholder="Ej. El Enigma del Fénix"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Categoría Requerida</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-amber-500 outline-none transition"
              >
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
                <option>Maestro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Tipo de Certamen</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-amber-500 outline-none transition"
              >
                <option value="normal">Personal (Individual)</option>
                <option value="casa">Batalla de Casas (Facciones)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Juez Designado</label>
              <select
                name="juezId"
                value={formData.juezId}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-amber-500 outline-none transition"
              >
                <option value="">Seleccionar Juez...</option>
                {judges.map(j => (
                  <option key={j.id} value={j.id}>{j.nombre || j.name} (@{j.username})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Proemio (Descripción)</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="2"
              className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-amber-500 outline-none transition font-serif italic"
              placeholder="Una breve introducción al certamen..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Fecha Apertura</label>
              <input
                required
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 text-sm focus:border-amber-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Duración (seg)</label>
              <input
                required
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 text-sm focus:border-amber-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-500 font-bold">Tributo (Tinta)</label>
              <input
                type="number"
                name="costoTinta"
                value={formData.costoTinta}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 text-sm focus:border-amber-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-800/50">
            <h2 className="text-sm font-semibold text-[#d4af37] font-cinzel tracking-widest">Temática del Misterio</h2>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-blue-400 font-bold">Revelación Pública (Tema General)</label>
              <input
                required
                type="text"
                name="temaGeneral"
                value={formData.temaGeneral}
                onChange={handleChange}
                className="w-full bg-[#0a0a14] border border-blue-900/30 rounded-lg p-3 focus:border-blue-500 outline-none transition"
                placeholder="Visible para todos antes del inicio"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-red-400 font-bold">Revelación Secreta (Tema Específico)</label>
              <textarea
                required
                name="temaExacto"
                value={formData.temaExacto}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[#0a0a14] border border-red-900/30 rounded-lg p-3 focus:border-red-500 outline-none transition ring-1 ring-red-500/10 font-serif"
                placeholder="SOLO se revelará al momento exacto del inicio"
              ></textarea>
              <p className="text-[10px] text-gray-500 italic opacity-60">Esta información está custodiada por el sistema hasta el momento de la verdad.</p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-800 rounded-full hover:bg-gray-800 transition text-sm font-bold uppercase tracking-widest"
            >
              Cerrar Pergamino
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] bg-[#d4af37] text-[#050509] px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              {loading ? "Evocando..." : "Forjar Certamen"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
