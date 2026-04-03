"use client";

import { useEffect, useState } from "react";

export default function PanelJuez() {
  const [entradas, setEntradas] = useState([]);
  const [msg, setMsg] = useState("");

  async function cargar() {
    const res = await fetch("/api/entradas");
    const data = await res.json();
    setEntradas(data.entradas || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function calificar(id, score) {
    setMsg("");
    const res = await fetch("/api/calificar", {
      method: "POST",
      body: JSON.stringify({ id, score })
    });
    const data = await res.json();
    setMsg(data.message || "");

    if (res.ok) {
      cargar();
    }
  }

  return (
    <main className="min-h-screen p-10 bg-[#050509] text-white">
      <a href="/panel" className="text-sm text-purple-300 underline">
        &larr; Volver al panel
      </a>

      <h1 className="text-4xl font-bold mt-4 mb-6">Panel del juez</h1>

      {entradas.length === 0 && (
        <p className="text-gray-400">Todavía no hay cuentos enviados.</p>
      )}

      {entradas.map((e) => (
        <div
          key={e.id}
          className="mb-6 p-6 bg-[#101018] border border-gray-700 rounded-xl"
        >
          <p className="text-sm text-gray-400 mb-1">
            Concurso: {e.concursoTitulo}
          </p>
          <h2 className="text-xl font-semibold mb-2">Entrada #{e.id}</h2>
          <p className="text-gray-200 whitespace-pre-line mb-4">{e.texto}</p>

          <div className="flex gap-3 flex-wrap">
            {[7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => calificar(e.id, n)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      {msg && <p className="mt-4 text-purple-300">{msg}</p>}
    </main>
  );
}
