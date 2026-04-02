"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../lib/i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState("es");

    useEffect(() => {
        const savedLang = localStorage.getItem("app_lang");
        if (savedLang && (savedLang === "es" || savedLang === "en")) {
            setLang(savedLang);
        }
    }, []);

    const toggleLang = () => {
        const newLang = lang === "es" ? "en" : "es";
        setLang(newLang);
        localStorage.setItem("app_lang", newLang);
    };

    const t = (key) => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
