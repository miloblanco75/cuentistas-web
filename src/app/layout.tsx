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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body
                className={`${cinzel.variable} ${crimsonPro.variable} antialiased`}
            >
                <Providers>
                    <LanguageProvider>
                        <NotificationHost />
                        {children}
                        <LanguageToggle />
                    </LanguageProvider>
                </Providers>
            </body>
        </html>
    );
}
