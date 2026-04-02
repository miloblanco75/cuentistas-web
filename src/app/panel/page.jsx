"use client";

export default function PanelPage() {
  return (
    <main className="min-h-screen p-8 bg-[#fbfbfb] text-[#1d1d1f] font-sans bg-apple-gradient">
      <header className="mb-12 space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tight text-[#1d1d1f]">Panel de Autor</h1>
        <p className="text-zinc-500 text-xl max-w-2xl font-semibold">
          Gestiona tus obras, revisa participaciones y mantente al tanto del pulso literario en tiempo real.
        </p>
      </header>

      <div className="flex justify-start mb-12">
        <a 
          href="/panel/concursos/nuevo"
          className="royal-button px-8 py-3 text-base font-bold shadow-lg"
        >
          + Crear Nuevo Concurso
        </a>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-elegant">
        <a
          href="/panel/juez"
          className="royal-card p-10 group bg-white shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="flex flex-col h-full space-y-6">
            <span className="text-5xl group-hover:scale-110 transition-transform">⚖️</span>
            <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Panel de Calificación</h2>
            <p className="text-zinc-500 leading-relaxed font-semibold">
              Lee los cuentos enviados y asigna calificaciones con precisión quirúrgica.
            </p>
          </div>
        </a>

        <div className="royal-card p-10 bg-white shadow-xl">
          <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📡</span>
              <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Control en Vivo</h2>
            </div>
            <div className="space-y-3">
              <a href="/panel/concurso/historias-sur" className="block p-4 bg-zinc-50 hover:bg-[#5856d6] rounded-xl border border-zinc-200 transition-all font-bold text-zinc-700 hover:text-white">
                Historias del Sureste
              </a>
              <a href="/panel/concurso/relatos-futuro" className="block p-4 bg-zinc-50 hover:bg-[#5856d6] rounded-xl border border-zinc-200 transition-all font-bold text-zinc-700 hover:text-white">
                Relatos de Futuro
              </a>
            </div>
          </div>
        </div>

        <a
          href="/ranking"
          className="royal-card p-10 group bg-white shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="flex flex-col h-full space-y-6">
            <span className="text-5xl group-hover:scale-110 transition-transform">📈</span>
            <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Ranking General</h2>
            <p className="text-zinc-500 leading-relaxed font-semibold">
              Consulta el estado actual de la competición y descubre qué autores lideran la arena.
            </p>
          </div>
        </a>
      </div>
    </main>
  );
}
