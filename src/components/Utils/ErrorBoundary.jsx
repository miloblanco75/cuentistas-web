"use client";

import React from 'react';

/**
 * ErrorBoundary robusto para capturar fallos en el renderizado
 * y ofrecer una UI de recuperación.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 [ErrorBoundary] Fallo detected:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
          <div className="max-w-md space-y-6 border border-amber-900/30 bg-black/40 p-8 rounded-lg backdrop-blur-xl">
            <h2 className="text-2xl font-cinzel text-amber-500 uppercase tracking-widest">
              Ciudadela Inestable
            </h2>
            <p className="text-amber-200/70 font-serif leading-relaxed">
              Las corrientes del éter están agitadas. Un error inesperado ha ocurrido en la interfaz. 
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-colors uppercase text-sm tracking-tighter"
            >
              Reintentar Sincronización
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
