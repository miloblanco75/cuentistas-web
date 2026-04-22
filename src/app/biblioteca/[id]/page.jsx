import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LecturaObraPage({ params }) {
    const { id } = params;

    const obra = await prisma.entrada.findUnique({
        where: { id },
        include: {
            concurso: true,
            user: { select: { nombre: true, username: true, image: true, casa: true } }
        }
    });

    if (!obra) return notFound();

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] selection:bg-gold/30">
            {/* Nav Minimalista */}
            <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 bg-gradient-to-b from-black to-transparent pointer-events-none">
                <Link href="/biblioteca" className="pointer-events-auto bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-full text-[10px] tracking-widest uppercase transition-all">
                    ← Volver a la Biblioteca
                </Link>
                <div className="flex items-center gap-4 opacity-40">
                   <div className="w-[1px] h-12 bg-white/10"></div>
                   <p className="text-[10px] tracking-[0.5em] uppercase font-black text-gold">Lectura Sagrada</p>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto pt-48 pb-64 px-8 md:px-0 space-y-24 animate-elegant">
                
                {/* Cabecera de la Obra */}
                <header className="space-y-8 text-center">
                    <p className="text-gold text-[10px] tracking-[0.6em] uppercase font-bold animate-pulse-subtle">
                        {obra.concurso?.titulo || "Obra Independiente"}
                    </p>
                    <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-none">
                        {obra.concurso?.temaExacto || "Manuscrito del Cónclave"}
                    </h1>
                    
                    <div className="flex flex-col items-center gap-6 pt-12">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gold/20 flex items-center justify-center bg-white/5">
                            {obra.user?.image ? <img src={obra.user.image} alt="Autor" /> : "🔱"}
                        </div>
                        <div className="space-y-2">
                             <p className="text-[10px] tracking-[0.4em] uppercase font-black">{obra.user?.nombre || obra.participante}</p>
                             <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase italic">Autor del Tribunal</p>
                        </div>
                    </div>
                </header>

                {/* El Cuerpo del Manuscrito (WATTPAD STYLE) */}
                <article className="prose prose-invert max-w-none">
                    <div className="space-y-12 text-2xl md:text-3xl font-serif leading-[1.8] text-zinc-300 first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-gold italic">
                        {obra.texto.split('\n').map((para, i) => (
                            para.trim() && <p key={i} className="mb-8">{para}</p>
                        ))}
                    </div>
                </article>

                {/* Footer de Sello */}
                <footer className="pt-32 border-t border-white/5 text-center space-y-8">
                     <div className="flex items-center justify-center gap-6">
                        <div className="h-[1px] w-24 bg-white/5"></div>
                        <span className="text-[10px] tracking-[0.5em] text-gray-600 uppercase">Fin del Manuscrito</span>
                        <div className="h-[1px] w-24 bg-white/5"></div>
                     </div>
                     <p className="text-sm text-gray-500 font-serif italic max-w-lg mx-auto leading-relaxed">
                        "Encomendado al Legado Arcaico de Cuentistas Online. Ningún rastro de esta tinta se perderá en el tiempo."
                     </p>
                     <div className="pt-12">
                        <Link href="/hub" className="royal-button px-16 py-4">Volver al Corazón de la Ciudadela</Link>
                     </div>
                </footer>

            </div>
        </main>
    );
}
