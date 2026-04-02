# Script: setup-cuentistas-demo.ps1
# Ejecutar desde la raíz del proyecto (donde está package.json)

Write-Host "Creando estructura de Cuentistas Demo..." -ForegroundColor Cyan

# Crear carpetas principales
New-Item -ItemType Directory -Path "src\app" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\api" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\api\concursos" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\api\concursos\[id]" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\api\entradas" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\api\enviar" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\api\calificar" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\api\ranking" -Force | Out-Null

New-Item -ItemType Directory -Path "src\app\concursos\[id]" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\panel\juez" -Force | Out-Null
New-Item -ItemType Directory -Path "src\app\ranking" -Force | Out-Null

# ---------- _data.js ----------
@"
export const concursos = [
  {
    id: "historias-sur",
    titulo: "Historias del Sureste",
    descripcion: "Microrrelatos de hasta 150 palabras inspirados en el sureste mexicano."
  },
  {
    id: "relatos-futuro",
    titulo: "Relatos de Futuro",
    descripcion: "Cuentos de ciencia ficción y futuros posibles. Máx. 800 palabras."
  }
];

export const entradas = [];

export function findConcurso(id) {
  return concursos.find((c) => c.id === id);
}

export function addEntrada(concursoId, texto) {
  const id = String(entradas.length + 1);
  const nueva = {
    id,
    concursoId,
    texto,
    puntajeTotal: 0,
    votos: 0
  };
  entradas.push(nueva);
  return nueva;
}

export function listEntradas() {
  return entradas;
}

export function addScore(entradaId, score) {
  const entrada = entradas.find((e) => e.id === String(entradaId));
  if (!entrada) return null;

  entrada.puntajeTotal += Number(score);
  entrada.votos += 1;

  return entrada;
}

export function getRanking() {
  return [...entradas]
    .map((e) => ({
      ...e,
      puntaje:
        e.votos === 0
          ? 0
          : Math.round((e.puntajeTotal / e.votos) * 100) / 100
    }))
    .sort((a, b) => b.puntaje - a.puntaje);
}
"@ | Set-Content -Path "src\app\_data.js" -Encoding UTF8

# ---------- API: /api/concursos ----------
@"
import { NextResponse } from "next/server";
import { concursos, findConcurso } from "../../_data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const concurso = findConcurso(id);
    if (!concurso) {
      return NextResponse.json(
        { ok: false, error: "Concurso no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, concurso }, { status: 200 });
  }

  return NextResponse.json(
    {
      ok: true,
      total: concursos.length,
      concursos
    },
    { status: 200 }
  );
}
"@ | Set-Content -Path "src\app\api\concursos\route.js" -Encoding UTF8

# ---------- API: /api/concursos/[id] (opcional) ----------
@"
import { NextResponse } from "next/server";
import { concursos } from "../../../_data";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const concurso = concursos.find((c) => c.id === id);

    if (!concurso) {
      return NextResponse.json(
        { ok: false, error: `No existe un concurso con id '\${id}'` },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, concurso }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Error al obtener el concurso por ID",
        details: error.message
      },
      { status: 500 }
    );
  }
}
"@ | Set-Content -Path "src\app\api\concursos\[id]\route.js" -Encoding UTF8

# ---------- API: /api/enviar ----------
@"
import { NextResponse } from "next/server";
import { addEntrada, findConcurso } from "../../_data";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 }
    );
  }

  const { id, texto } = body || {};

  if (!id || !texto || !texto.trim()) {
    return NextResponse.json(
      { message: "Faltan datos para enviar el cuento." },
      { status: 400 }
    );
  }

  const concurso = findConcurso(id);
  if (!concurso) {
    return NextResponse.json(
      { message: "El concurso no existe." },
      { status: 404 }
    );
  }

  const entrada = addEntrada(id, texto.trim());
  return NextResponse.json(
    {
      message: "Tu cuento fue enviado correctamente ✨",
      entrada
    },
    { status: 200 }
  );
}
"@ | Set-Content -Path "src\app\api\enviar\route.js" -Encoding UTF8

# ---------- API: /api/entradas ----------
@"
import { NextResponse } from "next/server";
import { listEntradas, concursos } from "../../_data";

export async function GET() {
  const lista = listEntradas().map((e) => ({
    ...e,
    concursoTitulo:
      concursos.find((c) => c.id === e.concursoId)?.titulo || "Sin concurso"
  }));

  return NextResponse.json(
    {
      ok: true,
      total: lista.length,
      entradas: lista
    },
    { status: 200 }
  );
}
"@ | Set-Content -Path "src\app\api\entradas\route.js" -Encoding UTF8

# ---------- API: /api/calificar ----------
@"
import { NextResponse } from "next/server";
import { addScore } from "../../_data";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json(
      { message: "Cuerpo de la petición inválido." },
      { status: 400 }
    );
  }

  const { id, score } = body || {};

  if (!id || score === undefined || score === null) {
    return NextResponse.json(
      { message: "Faltan datos para calificar." },
      { status: 400 }
    );
  }

  const actualizada = addScore(id, score);

  if (!actualizada) {
    return NextResponse.json(
      { message: "No se encontró la entrada." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: `Calificación registrada (\${score}).`,
      entrada: actualizada
    },
    { status: 200 }
  );
}
"@ | Set-Content -Path "src\app\api\calificar\route.js" -Encoding UTF8

# ---------- API: /api/ranking ----------
@"
import { NextResponse } from "next/server";
import { getRanking, concursos } from "../../_data";

export async function GET() {
  const ranking = getRanking().map((e) => ({
    ...e,
    concursoTitulo:
      concursos.find((c) => c.id === e.concursoId)?.titulo || "Sin concurso"
  }));

  return NextResponse.json(
    {
      ok: true,
      total: ranking.length,
      ranking
    },
    { status: 200 }
  );
}
"@ | Set-Content -Path "src\app\api\ranking\route.js" -Encoding UTF8

# ---------- Home page ----------
@"
export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] text-white px-6'>
      <h1 className='text-5xl md:text-6xl font-bold mb-4 text-center'>
        Cuentistas <span className='text-purple-400'>Beta</span>
      </h1>
      <p className='text-center text-gray-300 max-w-2xl mb-10 text-lg'>
        Concursos de escritura, panel de jueces y ranking en tiempo real.
        Demo público para escuelas, empresas y amantes de las historias.
      </p>
      <div className='flex flex-col md:flex-row gap-4'>
        <a
          href='/concursos'
          className='px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-lg font-medium transition shadow-lg shadow-purple-600/20 text-center'
        >
          Ver Concursos Demo
        </a>
        <a
          href='/panel'
          className='px-8 py-4 border border-gray-500 hover:border-purple-400 rounded-xl text-lg font-medium transition text-center'
        >
          Panel (juez y ranking)
        </a>
      </div>
      <p className='mt-10 text-sm text-gray-500'>
        Demo local – datos en memoria.
      </p>
    </main>
  );
}
"@ | Set-Content -Path "src\app\page.jsx" -Encoding UTF8

# ---------- /concursos ----------
@"
"use client";

import { useEffect, useState } from "react";

export default function ConcursosPage() {
  const [concursos, setConcursos] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/concursos");
      const data = await res.json();
      setConcursos(data.concursos || []);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen p-10 bg-[#050509] text-white">
      <h1 className="text-4xl font-bold mb-2">Concursos activos</h1>
      <p className="text-gray-400 mb-8">
        Elige un concurso, escribe tu historia y entra al ranking.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {concursos.map((c) => (
          <a
            href={`/concursos/\${c.id}`}
            key={c.id}
            className="block bg-[#101018] border border-purple-600/40 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{c.titulo}</h2>
            <p className="text-gray-300">{c.descripcion}</p>
          </a>
        ))}
        {concursos.length === 0 && (
          <p className="text-gray-400">No hay concursos todavía.</p>
        )}
      </div>
    </main>
  );
}
"@ | Set-Content -Path "src\app\concursos\page.jsx" -Encoding UTF8

# ---------- /concursos/[id] ----------
@"
"use client";

import { useEffect, useState } from "react";

export default function ConcursoDetalle({ params }) {
  const { id } = params;
  const [concurso, setConcurso] = useState(null);
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/concursos?id=\${id}`);
      const data = await res.json();
      setConcurso(data.concurso || null);
    }
    load();
  }, [id]);

  async function enviar() {
    setMsg("");
    if (!texto.trim()) {
      setMsg("Escribe tu cuento antes de enviar.");
      return;
    }

    const res = await fetch("/api/enviar", {
      method: "POST",
      body: JSON.stringify({ id, texto })
    });

    const data = await res.json();
    setMsg(data.message || "Listo.");
    if (res.ok) setTexto("");
  }

  if (!concurso) {
    return (
      <main className="min-h-screen p-10 bg-[#050509] text-white">
        Cargando…
      </main>
    );
  }

  return (
    <main className="min-h-screen p-10 bg-[#050509] text-white">
      <a href="/concursos" className="text-sm text-purple-300 underline">
        ← Volver a concursos
      </a>

      <h1 className="text-4xl font-bold mt-4 mb-2">{concurso.titulo}</h1>
      <p className="text-gray-300 mb-6">{concurso.descripcion}</p>

      <textarea
        className="w-full h-60 p-4 bg-[#101018] border border-gray-700 rounded-xl text-white mb-4"
        placeholder="Escribe aquí tu historia…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button
        onClick={enviar}
        className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold"
      >
        Enviar cuento
      </button>

      {msg && <p className="mt-4 text-purple-300">{msg}</p>}
    </main>
  );
}
"@ | Set-Content -Path "src\app\concursos\[id]\page.jsx" -Encoding UTF8

# ---------- /panel ----------
@"
"use client";

export default function PanelPage() {
  return (
    <main className="min-h-screen p-10 bg-[#050509] text-white">
      <h1 className="text-4xl font-bold mb-4">Panel Cuentistas</h1>
      <p className="text-gray-300 mb-8">
        Desde aquí puedes revisar las participaciones, calificar y ver el
        ranking general.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <a
          href="/panel/juez"
          className="bg-[#101018] border border-purple-600/40 rounded-xl p-6 hover:border-purple-400 transition"
        >
          <h2 className="text-2xl font-semibold mb-2">Panel del juez</h2>
          <p className="text-gray-300">
            Lee los cuentos enviados y asigna calificaciones.
          </p>
        </a>

        <a
          href="/ranking"
          className="bg-[#101018] border border-purple-600/40 rounded-xl p-6 hover:border-purple-400 transition"
        >
          <h2 className="text-2xl font-semibold mb-2">Ranking</h2>
          <p className="text-gray-300">
            Consulta qué cuentos van ganando según el puntaje.
          </p>
        </a>
      </div>
    </main>
  );
}
"@ | Set-Content -Path "src\app\panel\page.jsx" -Encoding UTF8

# ---------- /panel/juez ----------
@"
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
        ← Volver al panel
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
"@ | Set-Content -Path "src\app\panel\juez\page.jsx" -Encoding UTF8

# ---------- /ranking ----------
@"
"use client";

import { useEffect, useState } from "react";

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/ranking");
      const data = await res.json();
      setRanking(data.ranking || []);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen p-10 bg-[#050509] text-white">
      <a href="/panel" className="text-sm text-purple-300 underline">
        ← Volver al panel
      </a>

      <h1 className="text-4xl font-bold mt-4 mb-6">Ranking de cuentos</h1>

      {ranking.length === 0 && (
        <p className="text-gray-400">
          Aún no hay suficientes calificaciones para mostrar el ranking.
        </p>
      )}

      {ranking.map((r, i) => (
        <div
          key={r.id}
          className="mb-4 p-6 bg-[#101018] border border-gray-700 rounded-xl"
        >
          <p className="text-sm text-gray-400 mb-1">
            Concurso: {r.concursoTitulo}
          </p>
          <h2 className="text-xl font-semibold mb-2">
            #{i + 1} — Entrada {r.id}
          </h2>
          <p className="text-gray-200 whitespace-pre-line mb-3">{r.texto}</p>
          <p className="text-purple-300 font-bold">
            Puntaje promedio: {r.puntaje}
          </p>
        </div>
      ))}
    </main>
  );
}
"@ | Set-Content -Path "src\app\ranking\page.jsx" -Encoding UTF8

Write-Host "Listo. Archivos de Cuentistas Demo creados." -ForegroundColor Green