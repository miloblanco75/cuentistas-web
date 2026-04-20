"use client";

import React from "react";
import { usePathname } from "next/navigation";
import SystemBar from "./SystemBar";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    
    // Rutas donde la barra de sistema NO debe aparecer o aparece en modo especial
    const isLanding = pathname === "/";
    const isLogin = pathname === "/login" || pathname === "/registro";
    const isArena = pathname.startsWith("/concursos/live/");
    
    // El sistema debe ser visible en toda la app excepto landing y pantallas de acceso
    const showBar = !isLanding && !isLogin && !isArena;

    return (
        <>
            {showBar && <SystemBar mode="full" />}
            {children}
        </>
    );
}
