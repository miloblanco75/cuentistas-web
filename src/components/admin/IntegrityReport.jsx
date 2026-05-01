"use client";

import React from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis,
  ReferenceArea
} from "recharts";
import { ShieldAlert, MousePointer2, Zap, Clock } from "lucide-react";

export default function IntegrityReport({ data, participante }) {
  if (!data || !data.timeline || data.timeline.length === 0) {
    return (
      <div className="p-12 border border-white/5 bg-black/40 text-center space-y-4">
        <ShieldAlert size={40} className="mx-auto text-gray-600" />
        <p className="text-xs uppercase tracking-widest opacity-40">Evidencia insuficiente para generar reporte</p>
      </div>
    );
  }

  const timeline = data.timeline.map(entry => ({
    time: new Date(entry.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: new Date(entry.t).getTime(),
    length: entry.l,
    suspicious: entry.s,
    tabSwitches: entry.ts
  }));

  const startTime = timeline[0].timestamp;
  const chartData = timeline.map(entry => ({
    ...entry,
    relativeMinutes: Math.round((entry.timestamp - startTime) / 60000 * 100) / 100
  }));

  const alerts = chartData.filter(d => d.suspicious || d.tabSwitches > 0);
  const maxSwitches = Math.max(...chartData.map(d => d.tabSwitches));

  return (
    <div className="space-y-8 animate-elegant bg-[#050508] p-8 border border-white/10 rounded-sm">
      <header className="flex justify-between items-start border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tighter text-white">Reporte de Honestidad Literaria</h3>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold">Caja de Cristal v2.0 // {participante}</p>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[9px] uppercase opacity-40">Alertas IA</p>
                <p className={`text-xl font-mono ${alerts.some(a => a.suspicious) ? 'text-red-500' : 'text-green-500'}`}>
                    {chartData.filter(d => d.suspicious).length}
                </p>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <div className="text-right">
                <p className="text-[9px] uppercase opacity-40">Salidas de Foco</p>
                <p className="text-xl font-mono text-amber-500">{maxSwitches}</p>
            </div>
        </div>
      </header>

      {/* Main Heatmap / Progress Chart */}
      <div className="space-y-4">
        <p className="text-[9px] tracking-widest uppercase opacity-40 flex items-center gap-2">
            <Zap size={10} /> Flujo de Escritura vs Tiempo (Minutos)
        </p>
        <div className="h-[300px] w-full bg-black/20 p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis 
                dataKey="relativeMinutes" 
                stroke="#444" 
                fontSize={10} 
                tickFormatter={(val) => `${val}m`}
              />
              <YAxis stroke="#444" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #333', fontSize: '10px' }}
                itemStyle={{ color: '#d4af37' }}
              />
              <Line 
                type="monotone" 
                dataKey="length" 
                stroke="#d4af37" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, fill: '#fff' }}
              />
              {/* Highlight suspicious jumps */}
              {chartData.map((entry, index) => (
                entry.suspicious && (
                    <ReferenceArea 
                        key={index}
                        x1={chartData[index-1]?.relativeMinutes || entry.relativeMinutes} 
                        x2={entry.relativeMinutes} 
                        fill="rgba(255, 0, 0, 0.1)" 
                    />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evidence Timeline */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h4 className="text-[10px] tracking-widest uppercase opacity-40 flex items-center gap-2">
                <Clock size={10} /> Bitácora de Eventos Críticos
            </h4>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {alerts.length > 0 ? alerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.02] text-[10px]">
                        <span className="opacity-40">{alert.time}</span>
                        <div className="flex items-center gap-3">
                            {alert.suspicious && <span className="text-red-500 font-bold tracking-widest uppercase flex items-center gap-1"><ShieldAlert size={10} /> Ráfaga Sospechosa</span>}
                            {alert.tabSwitches > 0 && <span className="text-amber-500 font-bold tracking-widest uppercase flex items-center gap-1"><MousePointer2 size={10} /> Cambio de Pestaña ({alert.tabSwitches})</span>}
                        </div>
                    </div>
                )) : (
                    <p className="text-[10px] italic opacity-20 text-center py-8 italic">No se detectaron anomalías durante la sesión.</p>
                )}
            </div>
        </div>

        <div className="border border-gold/10 bg-gold/5 p-6 space-y-4">
            <h4 className="text-[10px] tracking-widest uppercase text-gold font-black">Veredicto de Integridad</h4>
            <p className="text-xs leading-relaxed text-gray-400">
                {maxSwitches > 5 || alerts.filter(a => a.suspicious).length > 3 
                    ? "ALTO RIESGO: El patrón de escritura muestra múltiples desincronizaciones y ráfagas no humanas. Se recomienda auditoría manual del texto."
                    : maxSwitches > 0 
                    ? "RIESGO MODERADO: Se detectaron salidas de la pestaña de examen. El flujo de escritura parece humano pero hubo distracciones externas."
                    : "INTEGRIDAD VALIDADA: El flujo de escritura es consistente y el alumno mantuvo el foco absoluto en la caja de cristal."}
            </p>
        </div>
      </div>
    </div>
  );
}
