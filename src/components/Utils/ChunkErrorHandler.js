"use client";

import { useEffect } from "react";

/**
 * CHUNK ERROR HANDLER (V1.1)
 * Detecta fallos de carga de scripts críticos (usualmente tras un deploy) 
 * y fuerza un refresco de página para sincronizar con el nuevo build manifest.
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event) => {
      // 1. Detectar errores de carga en elementos <script>
      const isScriptError = event.target && event.target.tagName === "SCRIPT";
      const src = event.target?.src || "";
      const isNextChunk = src.includes("_next/static/chunks/");

      if (isScriptError && isNextChunk) {
        console.error("🚀 [CIUDADELA] Desincronización detectada (Chunk Error). Sincronizando nueva versión...");
        window.location.reload();
      }
    };

    const handlePromiseError = (event) => {
      // 2. Detectar fallos en promesas de importación dinámica (Next.js Dynamic Imports)
      const message = event.reason?.message || "";
      if (
        message.includes("Loading chunk") || 
        message.includes("Failed to fetch dynamically imported module")
      ) {
        console.warn("🔮 [CIUDADELA] Fragmento de realidad perdido. Reconstruyendo...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleChunkError, true);
    window.addEventListener("unhandledrejection", handlePromiseError);

    return () => {
      window.removeEventListener("error", handleChunkError, true);
      window.removeEventListener("unhandledrejection", handlePromiseError);
    };
  }, []);

  return null;
}
