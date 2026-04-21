import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BibliotecaPage() {
    const session = await getServerSession(authOptions);
    // HOTFIX 5: Permite acceso a invitados para aumentar retención

    const obras = await prisma.entrada.findMany({
        where: { concurso: { status: "finished" } },
        include: { concurso: true },
        orderBy: { timestamp: "desc" }
    });

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant font-sans">
            <div className="max-w-7xl mx-auto space-y-48">
                <header className="space-y-8 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-light">— Galería de Autores —</p>
                        <h1 className="text-8xl font-light tracking-tighter text-white font-serif italic uppercase">Biblioteca</h1>
                    </div>
                    <Link href="/hub" className="royal-button px-8 py-3 text-sm">Volver al Hub</Link>
                </header>

                <div className="grid md:grid-cols-2 gap-20">
                    {obras.length === 0 ? (
                        <p className="text-gray-500 italic text-xl">Los anaqueles están vacíos por ahora.</p>
                    ) : (
                        obras.map(obra => (
                            <div key={obra.id} className="royal-card p-12 space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-serif italic text-white/90">{obra.concurso.titulo}</h3>
                                    <div className="flex gap-4 items-center">
                                        <p className="text-[10px] tracking-[0.3em] font-sans text-gold uppercase">{obra.participante}</p>
                                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                        <p className="text-[10px] tracking-[0.3em] font-sans text-gray-500 uppercase">{new Date(obra.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-xl text-zinc-400 font-serif leading-relaxed line-clamp-6">"{obra.texto}"</p>
                                
                                <div className="pt-8 border-t border-white/5 opacity-50 space-y-2">
                                    <p className="text-[9px] font-sans tracking-widest uppercase text-gray-500">
                                        Propiedad Intelectual
                                    </p>
                                    <p className="text-xs font-serif italic text-gray-400">
                                        "Los derechos morales y patrimoniales de la presente rúbrica digital pertenecen a {obra.participante}. Consagrado en los anales del Tribunal Cuentistas."
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
