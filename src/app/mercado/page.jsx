"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function MercadoContent() {
    const router = useRouter();

    useEffect(() => {
        // Redirigir a la nueva Forja de Prestigio (V13)
        router.push("/tienda");
    }, [router]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gold font-serif tracking-widest uppercase animate-pulse">
            Sincronizando con la Forja...
        </div>
    );
}

export default function MercadoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">...</div>}>
            <MercadoContent />
        </Suspense>
    );
}
