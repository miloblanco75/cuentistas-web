"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const GuestContext = createContext();

export function GuestProvider({ children }) {
    const { status } = useSession();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isBlocked, setIsBlocked] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [interactionCount, setInteractionCount] = useState(0);
    const [showConversionModal, setShowConversionModal] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            const savedCount = localStorage.getItem("cuentistas_guest_interactions") || "0";
            setInteractionCount(parseInt(savedCount));
            
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

    const trackInteraction = () => {
        if (status !== "unauthenticated") return;
        
        const newCount = interactionCount + 1;
        setInteractionCount(newCount);
        localStorage.setItem("cuentistas_guest_interactions", newCount.toString());
        
        if (newCount === 3) {
            setShowConversionModal(true);
        }
    };

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
        <GuestContext.Provider value={{ 
            timeLeft, 
            isBlocked, 
            status, 
            interactionCount, 
            trackInteraction,
            showConversionModal,
            setShowConversionModal
        }}>
            {children}
        </GuestContext.Provider>
    );
}

export function useGuest() {
    return useContext(GuestContext);
}
