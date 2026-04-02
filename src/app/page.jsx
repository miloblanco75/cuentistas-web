"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-[#fbfbfb] text-[#1d1d1f] px-6 relative overflow-hidden font-sans bg-apple-gradient'>
      <div className="max-w-5xl w-full text-center space-y-24 animate-elegant relative z-10">
        <header className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <span className="text-6xl filter drop-shadow-sm">🖋️</span>
          </div>

          <h1 className='text-7xl md:text-9xl font-extrabold tracking-tight leading-none mb-4 text-[#1d1d1f]'>
            {t("hero_title")}
          </h1>

          <p className="text-xl md:text-3xl text-[#5856d6] font-semibold">
            {t("hero_subtitle")}
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <a
            href='/hub'
            className='royal-button px-12 py-5 text-xl'
          >
            {t("btn_enter")}
          </a>
          <div className="flex flex-col items-center md:items-start gap-4">
            <a
              href='/manual'
              className='text-base text-gold hover:text-white transition-colors font-bold uppercase tracking-[0.2em] font-sans text-[10px] border border-gold/20 px-6 py-2 rounded-full'
            >
              {t("btn_manual")}
            </a>
            <a
              href='/registro'
              className='text-base text-[#1d1d1f] hover:text-[#5856d6] transition-colors font-bold'
            >
              {t("btn_start_legacy")}
            </a>
            <a
              href='/login'
              className='text-sm text-zinc-500 hover:text-[#5856d6] transition-colors font-medium'
            >
              {t("btn_change_author")}
            </a>
          </div>
        </div>

        <footer className="pt-24 opacity-60">
          <p className="text-xs tracking-widest uppercase font-bold text-zinc-400">
            {t("footer_excellence")}
          </p>
        </footer>
      </div>
    </main>
  );
}
