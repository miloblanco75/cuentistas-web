"use client";

import { useLanguage } from "@/components/LanguageContext";
import { CASAS, niveles } from "@/lib/constants";

export default function ManualPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant">
            <div className="max-w-4xl mx-auto space-y-32">
                <header className="space-y-6">
                    <a href="/" className="text-[10px] tracking-[0.5em] uppercase text-gold/60 hover:text-gold transition-all font-sans">{t("btn_back_home")}</a>
                    <h1 className="text-8xl font-light tracking-tighter font-serif italic">{t("manual_title")}</h1>
                    <div className="h-[1px] w-24 bg-gold"></div>
                </header>

                <section className="space-y-20">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-serif italic text-gold">{t("manual_sec_i")}</h2>
                        <div className="royal-card p-10 space-y-6 bg-white/[0.02] border-white/5">
                            <p className="text-lg leading-relaxed text-gray-300">
                                {t("manual_sec_i_p1")}
                            </p>
                            <ul className="space-y-4 text-sm text-gray-400 font-sans">
                                <li className="flex gap-4">
                                    <span className="text-gold">•</span>
                                    <span>{t("manual_sec_i_li1")}</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-gold">•</span>
                                    <span>{t("manual_sec_i_li2")}</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-gold">•</span>
                                    <span>{t("manual_sec_i_li3")}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-serif italic text-gold">{t("manual_sec_ii")}</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {niveles.map((n, idx) => (
                                <div key={idx} className="royal-card p-8 border-gold/10 hover:border-gold/30 transition-all">
                                    <h4 className="text-xl font-serif italic mb-2">{n.nombre}</h4>
                                    <p className="text-[10px] tracking-widest text-gray-500 uppercase">Requiere {n.min} Puntos</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400 italic">
                            {t("manual_sec_ii_desc")}
                        </p>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-serif italic text-gold">{t("manual_sec_iii")}</h2>
                        <div className="grid gap-8">
                            {CASAS.map(casa => (
                                <div key={casa.id} className="royal-card p-10 flex flex-col md:flex-row gap-8 items-center bg-white/[0.01] border-white/5">
                                    <div className="text-6xl text-gold">{casa.logo}</div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-serif italic" style={{ color: casa.color }}>{casa.nombre}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">{casa.descripcion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-serif italic text-gold">{t("manual_sec_iv")}</h2>
                        <div className="royal-card p-12 space-y-8 border-gold/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                            <p className="text-lg leading-relaxed text-gray-300">
                                {t("manual_sec_iv_p1")}
                            </p>
                            <div className="grid gap-12 md:grid-cols-3 text-center">
                                <div className="space-y-4">
                                    <div className="text-3xl">⏱️</div>
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-gold">{t("manual_sec_iv_li1_t")}</p>
                                    <p className="text-xs text-gray-500">{t("manual_sec_iv_li1_d")}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-3xl">🛡️</div>
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-gold">{t("manual_sec_iv_li2_t")}</p>
                                    <p className="text-xs text-gray-500">{t("manual_sec_iv_li2_d")}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-3xl">📡</div>
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-gold">{t("manual_sec_iv_li3_t")}</p>
                                    <p className="text-xs text-gray-500">{t("manual_sec_iv_li3_d")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-serif italic text-gold">{t("manual_sec_v")}</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="royal-card p-10 space-y-4 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                                <div className="text-2xl text-gold">📚</div>
                                <h3 className="text-xl font-serif italic">{t("manual_pilar_escritura_t")}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{t("manual_pilar_escritura_d")}</p>
                            </div>
                            <div className="royal-card p-10 space-y-4 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                                <div className="text-2xl text-gold">⚖️</div>
                                <h3 className="text-xl font-serif italic">{t("manual_pilar_tribunal_t")}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{t("manual_pilar_tribunal_d")}</p>
                            </div>
                            <div className="royal-card p-10 space-y-4 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                                <div className="text-2xl text-gold">🏆</div>
                                <h3 className="text-xl font-serif italic">{t("manual_pilar_galeria_t")}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{t("manual_pilar_galeria_d")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-serif italic text-gold">{t("manual_sec_vi")}</h2>
                        <div className="royal-card p-12 space-y-10 border-gold/5 bg-gradient-to-t from-gold/[0.02] to-transparent">
                            <p className="text-lg text-gray-300 italic">{t("manual_sec_vi_p1")}</p>
                            <div className="grid gap-12 md:grid-cols-2">
                                <div className="flex gap-6 items-start">
                                    <div className="p-4 bg-gold/10 rounded-full text-2xl">🖋️</div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gold uppercase tracking-tighter">{t("manual_comercio_tinta_t")}</h4>
                                        <p className="text-sm text-gray-400">{t("manual_comercio_tinta_d")}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="p-4 bg-gold/10 rounded-full text-2xl">💎</div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gold uppercase tracking-tighter">{t("manual_comercio_artefactos_t")}</h4>
                                        <p className="text-sm text-gray-400">{t("manual_comercio_artefactos_d")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="pt-24 border-t border-white/5 flex flex-col items-center gap-8">
                    <p className="text-[10px] tracking-[0.5em] uppercase text-gray-500">{t("footer_destiny")}</p>
                    <a href="/registro" className="royal-button px-16 py-4">{t("btn_start_legacy_manual")}</a>
                </footer>
            </div>
        </main>
    );
}
