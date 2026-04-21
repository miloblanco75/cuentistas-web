"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { safeFetch, APIError } from "@/lib/api";

const UserContext = createContext();

/**
 * UserProvider Hardened for Production
 * Gestiona la sincronización del usuario basándose puramente en NextAuth
 * e implementando lógica de fallback para errores de servidor (502, timeouts).
 */
export function UserProvider({ children }) {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState("stable"); // stable, unstable, critical, maintenance
    const [retryCount, setRetryCount] = useState(0);

    const refreshUser = useCallback(async () => {
        // V9: Hardening Crítico - Bloquear durante la carga de sesión
        if (status === "loading") return;

        // V9: Caso Autenticado (Prioridad Total)
        if (status === "authenticated") {
            setLoading(true);
            try {
                const data = await safeFetch("/api/user", { retries: 1, timeout: 8000 });
                
                if (data && data.ok && data.user) {
                    setUserData({
                        ...data.user,
                        // V10: Trigger para Modal de Casa tras 1 interacción si no tiene casa
                        shouldShowHouseModal: !data.user.casa && (data.user.interactions >= 1)
                    });
                    setConnectionStatus("stable");
                    setRetryCount(0);
                } else {
                    throw new APIError("Sesión inválida en Backend", "SERVER");
                }
            } catch (err) {
                console.error(`❌ [UserContext] Error Autenticado: ${err.message}`);
                if (err.status === 401) {
                    setUserData(null);
                }
                setConnectionStatus("critical");
            } finally {
                setLoading(false);
            }
            return;
        }

        // V9: Caso Invitado (Solo si no hay sesión y NO está cargando)
        if (status === "unauthenticated") {
            setLoading(true);
            try {
                const guestRes = await safeFetch("/api/guest/status");
                if (guestRes && guestRes.ok) {
                    setUserData({
                        rol: 'GUEST',
                        guestId: guestRes.guestId,
                        interactions: guestRes.interactions,
                        limitReached: guestRes.limitReached,
                        reason: guestRes.reason,
                        isFirstAction: true
                    });
                }
            } catch (err) {
                console.warn("⚠️ [UserContext] Error en Guest Flow:", err.message);
                setUserData(null);
            } finally {
                setLoading(false);
            }
            return;
        }
    }, [status]);

    useEffect(() => {
        refreshUser();

        // V10: Poll para invitados (detectar expiración por tiempo sin interacción)
        let interval;
        if (status === "unauthenticated") {
            interval = setInterval(() => {
                refreshUser();
            }, 60000); // 60s
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, refreshUser]); 

    return (
        <UserContext.Provider value={{ 
            userData, 
            loading, 
            refreshUser, 
            setUserData,
            connectionStatus,
            isMaintenance: connectionStatus === "maintenance",
            isGuest: userData?.rol === 'GUEST' || (status === "unauthenticated"),
            limitReached: userData?.limitReached || false,
            activeBoost: userData?.activeBoost || 0,
            boostExpiresAt: userData?.boostExpiresAt
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser debe usarse dentro de un UserProvider");
    }
    return context;
}
