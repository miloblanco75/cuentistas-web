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
import SystemBar from "@/components/UI/SystemBar";

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
                            <SystemBar />
                            <NotificationHost />
                            <div className="pt-[72px]">
                                {children}
                            </div>
                            <StatusBanner />
                            <LanguageToggle />
                            <GlobalRecorderFAB />
                        </LanguageProvider>
                    </Providers>
                </ErrorBoundary>
            </body>
        </html>
    );
}
