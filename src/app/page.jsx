"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-[#050508] text-[#e0d7c6] px-6 py-12 relative overflow-hidden font-serif'>
      {/* Luz Arcaica */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(212,175,55,0.05),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

      <div className="max-w-5xl w-full text-center space-y-20 md:space-y-32 animate-elegant relative z-10">
        <header className="space-y-8 md:space-y-12">
          <div className="flex flex-col items-center gap-6 md:gap-8">
            <div className="w-px h-16 md:h-24 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent"></div>
            <span className="text-6xl md:text-8xl filter drop-shadow-[0_0_20px_rgba(212,175,55,0.3)] animate-pulse">🖋️</span>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h1 className='text-5xl md:text-9xl font-cinzel leading-none tracking-widest title-gradient px-4'>
                {t("hero_title")}
            </h1>
            <p className="text-[8px] md:text-sm tracking-[0.6em] md:tracking-[0.8em] text-amber-500 font-cinzel uppercase opacity-80">
                {t("hero_subtitle")}
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-12 md:gap-16 justify-center items-center">
          <a
            href='/hub'
            className='royal-button px-12 md:px-20 py-6 md:py-8 text-lg md:text-xl'
          >
            {t("btn_enter")}
          </a>
          
          <div className="flex flex-col items-center md:items-start gap-4 md:gap-6 border-l-0 md:border-l border-amber-500/10 pl-0 md:pl-16">
            <a
              href='/manual'
              className='text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-cinzel text-amber-500/80 hover:text-white transition-all border-b border-amber-500/20 pb-2'
            >
              {t("btn_manual")}
            </a>
            <a
              href='/registro'
              className='text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-cinzel text-gray-300 hover:text-[#d4af37] transition-all'
            >
              {t("btn_start_legacy")}
            </a>
            <a
              href='/login'
              className='text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-cinzel text-gray-400 hover:text-gray-100 transition-all italic'
            >
              {t("btn_change_author")}
            </a>
          </div>
        </div>

        <footer className="pt-20 md:pt-32">
          <div className="w-12 md:w-16 h-px bg-amber-500/10 mx-auto mb-8 md:mb-12"></div>
          <p className="text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] uppercase font-cinzel text-gray-400">
            {t("footer_excellence")}
          </p>
        </footer>
      </div>
    </main>
  );
}
