"use client";

import React from 'react';

export function ArtifactCard({ item, onPurchase, purchasing, userTinta }) {
  const { nombre, descripcion, precio, precioTinta, tipo, locked, lockReason, imagenUrl, categoria } = item;

  const isCurrency = tipo === "tinta";
  const displayPrice = isCurrency ? `$${precio} USD` : `${precioTinta} 💧`;
  
  const canAfford = isCurrency || (userTinta >= (precioTinta || 0));
  const missingInk = !canAfford ? (precioTinta - userTinta) : 0;

  return (
    <div className={`royal-card p-8 group relative transition-all duration-500 santuario-glow flex flex-col h-full ${locked ? 'cursor-not-allowed opacity-80' : ''} ${!canAfford && !locked ? 'opacity-60 saturate-50' : ''}`}>
      {/* Rank/House Lock Overlay */}
      {locked && (
        <div className="absolute inset-0 z-20 rank-lock text-center p-6 rounded-sm flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-gold/10 p-4 rounded-full mb-4 border border-gold/40 gold-icon-glow">
            <span className="text-3xl">🔒</span>
          </div>
          <p className="text-[10px] tracking-[0.3em] font-sans uppercase text-gold font-bold">{lockReason || "Bloqueado"}</p>
        </div>
      )}

      {/* Item Image/Icon */}
      <div className="h-40 flex items-center justify-center mb-6 relative z-10">
        <div className="text-7xl group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          {imagenUrl && imagenUrl.length < 5 ? imagenUrl : (isCurrency ? "💧" : "📜")}
        </div>
        {categoria === "Especial" && (
            <div className="absolute -top-2 -right-2 bg-purple-600/20 text-purple-400 border border-purple-500/40 text-[8px] px-2 py-1 tracking-widest uppercase rounded">
                Exclusivo
            </div>
        )}
      </div>

      {/* Item info */}
      <div className="flex-grow space-y-4 relative z-10">
        <div className="space-y-1">
            <p className="text-[9px] tracking-[0.4em] uppercase text-gold/60">{categoria || tipo}</p>
            <h3 className="text-xl font-serif italic text-white group-hover:text-gold transition-colors">{nombre}</h3>
        </div>
        <p className="text-xs text-foreground/70 leading-relaxed font-sans line-clamp-3">
          {descripcion}
        </p>
      </div>

      {/* Purchase Footer */}
      <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] tracking-widest uppercase text-gray-500">Ofrenda</span>
            <span className={`text-2xl font-serif italic ${canAfford ? 'text-gold' : 'text-red-500/70'}`}>{displayPrice}</span>
            {!canAfford && !locked && (
                <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest mt-1 animate-pulse">
                    Te faltan {missingInk} 💧
                </span>
            )}
          </div>
          <button
            onClick={() => onPurchase(item)}
            disabled={purchasing || locked || !canAfford}
            className={`royal-button py-2 px-6 text-[10px] ${locked || !canAfford ? 'opacity-20 grayscale cursor-not-allowed' : 'shimmer-effect'}`}
          >
            {purchasing ? "Invocando..." : (isCurrency ? "Comprar" : "Adquirir")}
          </button>
        </div>
      </div>
    </div>
  );
}
