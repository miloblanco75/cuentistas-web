"use client";

import React from "react";
import { Shield, Target, Cpu, LineChart, Globe, Mail, ChevronRight, Lock, CheckCircle2, Monitor } from "lucide-react";

export default function BusinessLanding() {
  return (
    <main className="min-h-screen bg-[#050508] text-white selection:bg-blue-500/30 font-sans">
      
      {/* NAVIGATION (Minimalist) */}
      <nav className="fixed top-0 w-full z-50 bg-[#050508]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center font-black italic">C</div>
            <span className="font-cinzel tracking-widest text-lg font-bold">CUENTISTAS<span className="text-blue-500">_ENTERPRISE</span></span>
          </div>
          <div className="hidden md:flex gap-12 text-[11px] tracking-[0.3em] uppercase font-bold text-gray-400">
            <a href="#solucion" className="hover:text-blue-400 transition-colors">Solución</a>
            <a href="#tecnologia" className="hover:text-blue-400 transition-colors">Tecnología</a>
            <a href="#contacto" className="hover:text-blue-400 transition-colors">Contacto</a>
          </div>
          <a href="/panel/architect" className="bg-white text-black px-6 py-2 rounded-sm text-[10px] font-black tracking-widest uppercase hover:bg-blue-500 transition-all">
            Demo Portal
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[160px] animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-600 rounded-full blur-[140px] delay-700"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-8 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-[10px] tracking-[0.3em] uppercase font-black">
            <Shield size={12} /> Tecnología de Proctoring No Invasivo
          </div>
          <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            Integridad Académica <br /> en la Era de la IA.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 font-light leading-relaxed">
            Elimine el fraude académico sin invadir la privacidad de sus alumnos. 
            Cuentistas Enterprise utiliza biometría de escritura y análisis de comportamiento en tiempo real para validar la autoría de cada manuscrito.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-sm text-xs font-black tracking-[0.2em] uppercase transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3">
              Solicitar Demostración <ChevronRight size={16} />
            </button>
            <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-12 py-5 rounded-sm text-xs font-black tracking-[0.2em] uppercase transition-all">
              Ver Libro Blanco
            </button>
          </div>
        </div>
      </section>

      {/* CORE VALUE PROPOSITIONS */}
      <section id="solucion" className="py-32 bg-[#08080c]">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-16">
          {[
            { 
              icon: Monitor, 
              title: "Caja de Cristal v2", 
              desc: "Monitoreo síncrono del proceso creativo. Observe la evolución del texto en tiempo real, no solo el resultado final." 
            },
            { 
              icon: Cpu, 
              title: "IA Forense", 
              desc: "Detección de patrones de copiado, saltos rítmicos no humanos y uso de asistencia por IA mediante biometría de tecleo." 
            },
            { 
              icon: LineChart, 
              title: "Heatmap de Honestidad", 
              desc: "Genere evidencia visual del comportamiento del alumno. Reportes detallados de foco y consistencia para auditoría académica." 
            }
          ].map((item, i) => (
            <div key={i} className="group space-y-6">
              <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg group-hover:border-blue-500/50 transition-all">
                <item.icon className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DETAILED TECH SECTION */}
      <section id="tecnologia" className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <p className="text-[10px] tracking-[0.5em] text-blue-500 font-black uppercase">La Tecnología Detrás de la Verdad</p>
              <h2 className="text-5xl font-serif italic text-white leading-tight">Proctoring Ético: <br /> Privacidad sin Compromisos.</h2>
            </div>
            
            <div className="space-y-8">
              {[
                { title: "Zero Video Policy", desc: "A diferencia de otros sistemas, no requerimos acceso a la cámara ni al micrófono del alumno. La integridad se valida por el flujo de datos." },
                { title: "Detección de Tab-Switching", desc: "Alertas automáticas cuando el alumno pierde el foco de la aplicación para buscar información externa o usar prompts de IA." },
                { title: "Análisis de Cadencia", desc: "Algoritmos que diferencian la ráfaga de un 'copy-paste' frente a la escritura fluida y reflexiva de un ser humano." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 mt-1"><CheckCircle2 className="text-blue-500" size={18} /></div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">{feature.title}</h4>
                    <p className="text-gray-500 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-[100px] absolute -inset-20 opacity-30"></div>
            <div className="relative bg-[#0a0a0f] border border-white/10 p-12 rounded-lg shadow-2xl space-y-8">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <p className="text-[10px] tracking-widest text-blue-400 font-black uppercase">Sample Integrity Report</p>
                    <Lock size={14} className="opacity-20" />
                </div>
                <div className="h-64 flex items-end gap-2 px-2">
                    {[30, 45, 20, 80, 10, 40, 90, 60, 30, 50, 70, 40].map((h, i) => (
                        <div key={i} style={{ height: `${h}%` }} className={`flex-1 ${h > 75 ? 'bg-red-500/50' : 'bg-blue-600/30'} rounded-t-sm transition-all hover:bg-blue-400`}></div>
                    ))}
                </div>
                <div className="space-y-3 opacity-40">
                    <div className="h-1 bg-white/5 w-full"></div>
                    <div className="h-1 bg-white/5 w-3/4"></div>
                    <div className="h-1 bg-white/5 w-1/2"></div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER / CONTACT */}
      <section id="contacto" className="py-32 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-8 text-center space-y-12">
          <h2 className="text-4xl font-serif italic text-white">Lleve la integridad de su <br /> institución al siguiente nivel.</h2>
          <div className="space-y-6">
            <p className="text-gray-500 text-sm">Nuestro equipo de arquitectura está listo para diseñar su solución a medida.</p>
            <a href="mailto:negocios@cuentistasonline.com" className="inline-flex items-center gap-4 text-xl font-bold hover:text-blue-400 transition-colors">
              <Mail className="text-blue-500" /> negocios@cuentistasonline.com
            </a>
          </div>
          <p className="text-[10px] tracking-[0.5em] text-gray-700 uppercase pt-24">
            CUENTISTAS ENTERPRISE © 2026 // TECNOLOGÍA DE INTEGRIDAD ACADÉMICA
          </p>
        </div>
      </section>

    </main>
  );
}
