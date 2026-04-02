import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationHost from "@/components/new/NotificationHost";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
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
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
