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
        if (status !== "authenticated") return;
        
        setLoading(true);
        const startTime = Date.now();
        
        // V85: Trigger visual feedback for slow connection (> 3s)
        const slowTrigger = setTimeout(() => {
            setConnectionStatus("unstable");
        }, 3000);

        try {
            // Sincronización oficial con backend real
            const data = await safeFetch("/api/user", {
                retries: 1,
                timeout: 7000 
            });
            
            clearTimeout(slowTrigger);
            const elapsedTime = Date.now() - startTime;

            if (data && data.ok && data.user) {
                setUserData(data.user);
                setConnectionStatus("stable");
                setRetryCount(0);
            } else {
                throw new APIError("Respuesta de API inválida", "SERVER");
            }
        } catch (err) {
            clearTimeout(slowTrigger);
            // ... (keeping the improved catch block)
            console.error(`❌ [UserContext] Atrapado en catch: [${err.type || 'UNKNOWN'}] ${err.message}`, err);
            
            // V85: No tratar errores de autenticación o "not found" como fallos de infraestructura.
            if (err.status === 401 || err.status === 404) {
                setUserData(null);
                setConnectionStatus("stable");
                setRetryCount(0);
                setLoading(false);
                return;
            }

            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);

            if (err.type === "SERVER" || err.type === "TIMEOUT" || err.type === "INVALID_JSON") {
                if (newRetryCount >= 3) {
                    setConnectionStatus("maintenance");
                } else {
                    setConnectionStatus("critical");
                }
            } else {
                setConnectionStatus("unstable");
            }
        } finally {
            setLoading(false);
        }
    }, [status, retryCount]);

    useEffect(() => {
        // V85: Eliminado desfibrilador (hacks de tiempo)
        // La sincronización es reactiva al estado de NextAuth únicamente
        if (status === "authenticated") {
            refreshUser();
        } else if (status === "unauthenticated") {
            setUserData(null);
            setLoading(false);
            setConnectionStatus("stable");
            setRetryCount(0);
        }
    }, [status]); // Solo reaccionamos a cambios de status

    return (
        <UserContext.Provider value={{ 
            userData, 
            loading, 
            refreshUser, 
            setUserData,
            connectionStatus,
            isMaintenance: connectionStatus === "maintenance"
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
