"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoConcursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    scheduledTime: "",
    duration: "5400", // 90 min default
    temaGeneral: "",
    temaExacto: "",
    categoria: "Principiante",
    costoTinta: "0"
  });

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
        alert("¡Concurso creado y miembros invitados!");
        router.push("/panel");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-[#050509] text-white flex flex-col items-center">
      <div className="max-w-2xl w-full bg-[#101018] border border-purple-900/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Royal Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>

        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Forjar Nuevo Concurso
        </h1>
        <p className="text-gray-400 mb-8 text-sm italic">
          "Define el destino de los nuevos cuentistas."
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-purple-400 font-bold">Título del Desafío</label>
              <input
                required
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-purple-500 outline-none transition"
                placeholder="Ej. El Enigmas del Crepúsculo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-purple-400 font-bold">Categoría</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-purple-500 outline-none transition"
              >
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
                <option>Maestro</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-purple-400 font-bold">Breve Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="2"
              className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 focus:border-purple-500 outline-none transition"
              placeholder="Una breve introducción al concurso..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-purple-400 font-bold">Fecha y Hora</label>
              <input
                required
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-purple-400 font-bold">Duración (s)</label>
              <input
                required
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-purple-400 font-bold">Costo Tinta</label>
              <input
                type="number"
                name="costoTinta"
                value={formData.costoTinta}
                onChange={handleChange}
                className="w-full bg-[#050509] border border-gray-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-800/50">
            <h2 className="text-sm font-semibold text-gray-300">Configuración Temática</h2>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-blue-400 font-bold">Tema Público (General)</label>
              <input
                required
                type="text"
                name="temaGeneral"
                value={formData.temaGeneral}
                onChange={handleChange}
                className="w-full bg-[#0a0a14] border border-blue-900/30 rounded-lg p-3 focus:border-blue-500 outline-none transition"
                placeholder="Visible para todos antes de iniciar"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-red-400 font-bold">Tema Secreto (Específico)</label>
              <textarea
                required
                name="temaExacto"
                value={formData.temaExacto}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[#0a0a14] border border-red-900/30 rounded-lg p-3 focus:border-red-500 outline-none transition ring-1 ring-red-500/10"
                placeholder="SOLO se revelará al momento del inicio"
              ></textarea>
              <p className="text-[10px] text-gray-500">Este tema está protegido y no se mostrará hasta que el concurso pase a estado 'Activo'.</p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-800 rounded-full hover:bg-gray-800 transition text-sm font-bold uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
            >
              {loading ? "Invocando..." : "Crear Concurso"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
