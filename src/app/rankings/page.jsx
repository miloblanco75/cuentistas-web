"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/ranking");
      const data = await res.json();
      setRanking(data.ranking || []);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen p-12 md:p-32 bg-[#050505] text-white animate-elegant">
      <div className="max-w-5xl mx-auto space-y-24">
        <header className="space-y-6">
          <a href="/hub" className="text-[10px] tracking-[0.5em] uppercase text-gold/60 hover:text-gold transition-all font-sans">{t("btn_back_hub")}</a>
          <h1 className="text-7xl font-light tracking-tighter font-serif italic text-white/90">{t("gallery_title")}</h1>
          <p className="text-sm text-gray-500 font-sans tracking-[0.2em] uppercase">{t("gallery_subtitle")}</p>
          <div className="h-[1px] w-full bg-white/5"></div>
        </header>

        {ranking.length === 0 && (
          <div className="royal-card p-20 text-center space-y-6 bg-white/[0.01]">
            <span className="text-4xl opacity-20 italic font-serif italic">{t("gallery_empty_t")}</span>
            <p className="text-xs tracking-widest text-gray-600 uppercase">{t("gallery_empty_d")}</p>
          </div>
        )}

        <div className="grid gap-16">
          {ranking.map((r, i) => (
            <article
              key={r.id}
              className="royal-card p-16 space-y-10 group bg-white/[0.02] border-white/5 hover:border-gold/20 transition-all duration-1000"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="space-y-2">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-gold font-sans font-bold">{t("gallery_consagración")} #{i + 1}</p>
                  <h3 className="text-sm text-gray-500 font-sans tracking-widest uppercase">{t("gallery_certamen")}: {r.concursoTitulo}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-gray-600 font-sans mb-1">{t("gallery_prestigio")}</p>
                  <p className="text-2xl font-serif italic text-gold">{r.puntaje}</p>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-2xl leading-relaxed text-gray-200 font-serif italic first-letter:text-5xl first-letter:font-bold first-letter:text-gold first-letter:mr-3 first-letter:float-left">
                  {r.texto}
                </p>
              </div>

              <div className="pt-8 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="flex gap-4 items-center">
                   <div className="w-6 h-[1px] bg-gold/50"></div>
                   <p className="text-[9px] tracking-widest uppercase text-gray-500">{t("gallery_id_legado")}: {r.id}</p>
                </div>
                <button className="text-[10px] tracking-[0.2em] font-sans uppercase text-gold/80 border-b border-transparent hover:border-gold transition-all">{t("gallery_btn_evolucion")}</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
