"use client";

import { useLanguage } from "./LanguageContext";

export default function LanguageToggle() {
    const { lang, toggleLang } = useLanguage();

    return (
        <button
            onClick={toggleLang}
            className="fixed bottom-10 right-10 z-50 bg-[#101018] border border-gold/30 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center gap-3 relative z-10">
                <span className="text-xl">{lang === "es" ? "🇪🇸" : "🇺🇸"}</span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-sans font-bold text-gold">
                    {lang === "es" ? "ES" : "EN"}
                </span>
            </div>
        </button>
    );
}
