"use client";

import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, MessageSquare, ShieldCheck, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function ExpedienteAlumno() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetch("/api/user/expediente")
            .then(res => res.json())
            .then(data => {
                if (data.ok) setHistorial(data.historial);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center">
            <p className="text-gold animate-pulse tracking-[0.5em] uppercase text-[10px] font-black">Consultando Archivos Históricos...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#050508] text-white p-8 md:p-24 animate-elegant">
            <div className="max-w-4xl mx-auto space-y-16">
                
                {/* Header */}
                <header className="space-y-6 border-b border-white/10 pb-12">
                    <div className="flex items-center gap-4">
                        <GraduationCap className="text-gold" size={32} />
                        <h1 className="text-5xl font-serif italic tracking-tighter">Mi Expediente Académico</h1>
                    </div>
                    <p className="text-sm text-gray-500 max-w-xl font-light leading-relaxed">
                        Bienvenido a su registro histórico de formación. Aquí residen sus manuscritos, evaluaciones y el veredicto de integridad de la Caja de Cristal.
                    </p>
                </header>

                {/* List of Records */}
                <section className="space-y-8">
                    {historial.length > 0 ? (
                        historial.map((item, idx) => (
                            <div 
                                key={item.id} 
                                className={`royal-card transition-all duration-500 overflow-hidden ${expanded === item.id ? 'border-gold/40' : 'border-white/5 bg-white/[0.02]'}`}
                            >
                                <div 
                                    className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:bg-white/[0.02]"
                                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-black tracking-widest uppercase ${item.isExamen ? 'bg-blue-600 text-white' : 'bg-gold/20 text-gold'}`}>
                                                {item.isExamen ? 'Examen Oficial' : 'Arena Creativa'}
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                                {new Date(item.fecha).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight">{item.concurso}</h3>
                                        <p className="text-xs text-gray-400 italic">Mandato: {item.mandato}</p>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-center">
                                            <p className="text-[9px] uppercase opacity-40 mb-1">Calificación</p>
                                            <p className={`text-3xl font-serif italic ${item.calificacion >= 7 ? 'text-gold' : item.calificacion ? 'text-red-400' : 'text-gray-600'}`}>
                                                {item.calificacion != null ? item.calificacion.toFixed(1) : "Pnd"}
                                            </p>
                                        </div>
                                        {expanded === item.id ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expanded === item.id && (
                                    <div className="px-8 pb-8 space-y-12 animate-elegant">
                                        
                                        {/* Feedback Area */}
                                        <div className="bg-gold/5 border border-gold/10 p-8 rounded-sm space-y-4">
                                            <div className="flex items-center gap-3 text-gold">
                                                <MessageSquare size={16} />
                                                <h4 className="text-[10px] tracking-[0.4em] uppercase font-black">Comentarios del Académico</h4>
                                            </div>
                                            <p className="text-sm leading-relaxed text-gray-300 italic">
                                                {item.feedback || "Aún no se ha emitido una retroalimentación detallada para esta entrega."}
                                            </p>
                                        </div>

                                        {/* Integrity & Manuscript Grid */}
                                        <div className="grid md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-gray-500">
                                                    <BookOpen size={16} />
                                                    <h4 className="text-[10px] tracking-[0.4em] uppercase font-black">Manuscrito Original</h4>
                                                </div>
                                                <div className="text-xs text-gray-400 leading-relaxed max-h-48 overflow-y-auto pr-4 font-serif italic bg-black/20 p-4 border border-white/5">
                                                    "{item.texto}"
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-gray-500">
                                                    <ShieldCheck size={16} />
                                                    <h4 className="text-[10px] tracking-[0.4em] uppercase font-black">Validación de Integridad</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                                                        <span className="opacity-40">SALIDAS DE FOCO:</span>
                                                        <span className={item.integridad.tabSwitches > 0 ? "text-amber-500" : "text-green-500"}>
                                                            {item.integridad.tabSwitches} eventos
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                                                        <span className="opacity-40">ESTADO DE CAJA:</span>
                                                        <span className={item.integridad.suspicious ? "text-red-500" : "text-green-500"}>
                                                            {item.integridad.suspicious ? "Ráfagas Sospechosas" : "Escritura Fluida"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-gray-600 leading-relaxed italic pt-2">
                                                        * Los datos de integridad son procesados por el motor Caja de Cristal v2 para garantizar la autoría humana.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 border border-dashed border-white/10 opacity-30">
                            <Clock size={40} className="mx-auto mb-4" />
                            <p className="text-xs uppercase tracking-widest">No hay registros en su expediente todavía.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
