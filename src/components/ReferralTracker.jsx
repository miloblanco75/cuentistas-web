"use client";

// AJUSTE #2 — CAPA SECUNDARIA DE TRACKING DE REFERRALS
// Este componente no renderiza nada visible.
// Su único trabajo: leer ?ref= de la URL y guardarlo en localStorage
// como backup para Safari/iOS/modo privado que destruyen cookies.
//
// Flujo:
//   1. Middleware (servidor) → cookie "referrer" (30 días)
//   2. Este hook (cliente) → localStorage "referrer_backup" (indefinido)
//   3. /api/user route → lee cookie, si no existe lee localStorage via header
//
// ANTI-FRAUDE preparado: también guarda el timestamp del referral
// para futuras validaciones de ventana de tiempo.

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams?.get("ref");
        
        if (ref) {
            // Guardar en localStorage solo si no existe atribución previa (first-touch wins)
            const existing = localStorage.getItem("referrer_backup");
            if (!existing) {
                localStorage.setItem("referrer_backup", ref);
                localStorage.setItem("referrer_ts", Date.now().toString());
            }
            // Backup en sessionStorage también
            try { sessionStorage.setItem("referrer_session", ref); } catch (e) {}
        }

        // Enviar backup al servidor si hay referral en LS pero puede que no haya cookie
        // Esto protege a Safari/iOS que matan cookies entre sesiones
        const lsRef = localStorage.getItem("referrer_backup");
        if (lsRef) {
            // Ping silencioso: el servidor lo leerá del header X-Referrer-Backup
            fetch("/api/user", {
                method: "GET",
                headers: { "X-Referrer-Backup": lsRef }
            }).catch(() => {}); // Completamente silencioso
        }
    }, [searchParams]);

    return null; // No renderiza nada
}
