import React from "react";
import type { Metadata } from "next";
import { Cinzel, Crimson_Pro } from "next/font/google";
import "./globals.css";
import NotificationHost from "@/components/new/NotificationHost";

const cinzel = Cinzel({
    variable: "--font-cinzel",
    subsets: ["latin"],
    weight: ["400", "700", "900"],
});

const crimsonPro = Crimson_Pro({
    variable: "--font-crimson-pro",
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
    title: "Cuentistas - La Arena Literaria",
    description: "Concursos de escritura y comunidad literaria en tiempo real.",
};

import { LanguageProvider } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { Providers } from "@/components/Providers";
import ErrorBoundary from "@/components/Utils/ErrorBoundary";
import StatusBanner from "@/components/Utils/StatusBanner";
import GlobalRecorderFAB from "@/components/UI/GlobalRecorderFAB";
import GuestConversionModal from "@/components/GuestConversionModal";

import TribunalCall from "@/components/TribunalCall";
import { Suspense } from "react";
import ReferralTracker from "@/components/ReferralTracker";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body
                className={`${cinzel.variable} ${crimsonPro.variable} antialiased`}
                suppressHydrationWarning
            >
                <ErrorBoundary>
                    <Providers>
                        <LanguageProvider>
                            <NotificationHost />
                            {children}
                            <StatusBanner />
                            <LanguageToggle />
                            <GlobalRecorderFAB />
                            <GuestConversionModal />
                            <TribunalCall />
                            {/* AJUSTE #2: localStorage backup layer — Suspense necesario por useSearchParams */}
                            <Suspense fallback={null}>
                                <ReferralTracker />
                            </Suspense>
                        </LanguageProvider>
                    </Providers>
                </ErrorBoundary>
            </body>
        </html>
    );
}
