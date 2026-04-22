"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const GuestContext = createContext();

export function GuestProvider({ children }) {
    const { status } = useSession();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isBlocked, setIsBlocked] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            const savedStartTime = localStorage.getItem("cuentistas_guest_start");
            const now = Math.floor(Date.now() / 1000);

            if (!savedStartTime) {
                localStorage.setItem("cuentistas_guest_start", now.toString());
            } else {
                const elapsed = now - parseInt(savedStartTime);
                const remaining = 300 - elapsed;
                
                if (remaining <= 0) {
                    setIsBlocked(true);
                    setTimeLeft(0);
                } else {
                    setTimeLeft(remaining);
                }
            }
            setIsInitialized(true);
        } else if (status === "authenticated") {
            setIsBlocked(false);
            setIsInitialized(true);
        }
    }, [status]);

    useEffect(() => {
        if (status === "unauthenticated" && isInitialized && !isBlocked) {
            const interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsBlocked(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status, isInitialized, isBlocked]);

    return (
        <GuestContext.Provider value={{ timeLeft, isBlocked, status }}>
            {children}
        </GuestContext.Provider>
    );
}

export function useGuest() {
    return useContext(GuestContext);
}
