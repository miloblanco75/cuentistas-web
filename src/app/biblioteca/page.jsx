import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import Link from "next/link";

export default async function BibliotecaPage() {
    const session = await getServerSession(authOptions);

    // HOTFIX 9: Master Resilience Polish
    const obras = await prisma.entrada.findMany({
        where: {
            OR: [
                { concurso: { status: "finished" } },
                { concurso: { status: "active" } },
                { isPublished: true }
            ]
        },
        include: { 
            concurso: true,
            user: { select: { username: true, nombre: true } }
        },
        orderBy: { timestamp: "desc" },
        take: 50
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
                            <div key={obra.id} className="royal-card p-12 space-y-12 relative animate-elegant">
                                {session?.user?.id === obra.userId && (
                                    <div className="absolute top-8 right-8 animate-pulse-subtle">
                                        <span className="bg-gold/20 text-gold text-[8px] tracking-[0.3em] font-black uppercase px-3 py-1 rounded-full border border-gold/40">Tu Entrada</span>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-serif italic text-white/90">{obra.concurso?.titulo || "Obra Maestra"}</h3>
                                    <div className="flex gap-4 items-center">
                                        <p className="text-[10px] tracking-[0.3em] font-sans text-gold uppercase">
                                            {obra.user?.nombre || obra.user?.username || obra.participante}
                                        </p>
                                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                        <p className="text-[10px] tracking-[0.3em] font-sans text-gray-500 uppercase">
                                            {new Date(obra.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xl text-zinc-400 font-serif leading-relaxed line-clamp-3 italic">"{obra.texto}"</p>
                                
                                <div className="pt-4">
                                    <Link 
                                        href={`/biblioteca/${obra.id}`}
                                        className="inline-flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase text-gold hover:text-white transition-all font-black group"
                                    >
                                        <span>Cruzalar el Umbral</span>
                                        <span className="w-12 h-[1px] bg-gold/50 group-hover:w-20 transition-all duration-700"></span>
                                        <span>Leer Completo 📖</span>
                                    </Link>
                                </div>

                                <div className="pt-8 border-t border-white/5 opacity-50 space-y-2">
                                    <p className="text-[9px] font-sans tracking-widest uppercase text-gray-500">
                                        Propiedad Intelectual
                                    </p>
                                    <p className="text-xs font-serif italic text-gray-400">
                                        "Los derechos morales y patrimoniales de la presente rúbrica digital pertenecen a {obra.user?.nombre || obra.participante}. Consagrado en los anales del Tribunal Cuentistas."
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
