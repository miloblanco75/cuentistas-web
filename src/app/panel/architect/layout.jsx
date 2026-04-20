"use client";

import React from "react";

export default function ArchitectLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#020204] text-[#e0d7c6] font-mono selection:bg-gold/30 selection:text-white">
      {/* HUD Header */}
      <header className="h-16 border-b border-gold/20 flex items-center justify-between px-8 bg-[#050508]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-gold animate-pulse rounded-full shadow-[0_0_10px_#d4af37]"></div>
          <h1 className="text-sm tracking-[0.4em] uppercase font-bold gold-gradient-text">
            Architect Vault // Command Center v2.0
          </h1>
        </div>
        <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase opacity-60">
          <span>Shield Status: Active</span>
          <div className="w-px h-4 bg-white/10"></div>
          <span>Uptime: 99.99%</span>
          <div className="w-px h-4 bg-white/10"></div>
          <a href="/hub" className="hover:text-gold transition-colors">Terminate Connection [ESC]</a>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar Mini-Terminal */}
        <aside className="w-20 hidden lg:flex flex-col items-center py-12 border-r border-gold/10 gap-12 sticky top-16 h-[calc(100vh-64px)]">
            <div className="rotate-90 origin-center text-[9px] tracking-[0.8em] whitespace-nowrap opacity-20 uppercase">
                Systems Monitor // Active
            </div>
            <div className="space-y-4 text-gold/40">
                <div className="w-1.5 h-1.5 bg-current rounded-full mx-auto"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full mx-auto opacity-50"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full mx-auto opacity-20"></div>
            </div>
        </aside>

        <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Scanline / HUD Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
}
