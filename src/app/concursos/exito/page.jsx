"use client";

export default function ConcursoExito() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif italic text-gold">Manifestación Recibida</h1>
        <p className="text-gray-400">Tu obra ha sido entregada al Cónclave.</p>
        <a href="/hub" className="text-gold underline">Volver al Hub</a>
      </div>
    </div>
  );
}
