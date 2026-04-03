import { CASAS } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";

export default function PublicAuthorProfilePage() {
    const { username } = useParams();
    const [autor, setAutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        if (username) {
            fetch(`/api/public/autor/${username}`)
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        setAutor(data.autor);
                    }
                    setLoading(false);
                });
        }
    }, [username]);

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-amber-500">{t("loading")}</div>;
    if (!autor) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-serif text-amber-500">
        <h1 className="text-4xl mb-4">{t("public_lost")}</h1>
        <p className="text-gray-500 italic">{t("public_no_records")}</p>
        <a href="/" className="mt-8 text-xs tracking-widest border-b border-amber-500/20 pb-1">{t("share_btn_back")}</a>
    </div>;

    const casaData = CASAS.find(c => c.id === autor.casa) || CASAS[0];

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant">
            <div className="max-w-5xl mx-auto space-y-40">
                <header className="space-y-16">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12 text-center md:text-left">
                        <div>
                            <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                                <div className="w-8 h-[1px] bg-amber-500/50"></div>
                                <p className="text-[10px] tracking-[0.4em] uppercase text-amber-500 font-sans font-medium">{t("public_chronicler")}</p>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white font-serif italic">{autor.nombre}</h1>
                            <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mt-4">@{autor.username}</p>
                        </div>
                        <div className="text-center md:text-right royal-card p-6 px-10 border-amber-500/20 bg-amber-500/5">
                            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-2 font-sans">{t("profile_seal")}</p>
                            <p className="text-xl font-serif italic text-amber-500">{t(`casa_${casaData.id}`)}</p>
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-gradient-to-r from-white/0 via-white/5 to-white/0"></div>
                </header>

                <section className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="royal-card p-8 text-center space-y-3 border-amber-500/10 hover:border-amber-500/30 transition-all">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 font-sans">{t("stat_rank")}</p>
                        <p className="text-2xl font-serif italic text-white/90">{t(`rango_${autor.nivel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`)}</p>
                    </div>
                    <div className="royal-card p-8 text-center space-y-3 border-amber-500/10 hover:border-amber-500/30 transition-all">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 font-sans">{t("stat_prestige")}</p>
                        <p className="text-2xl font-serif italic text-amber-500">{autor.puntos} <span className="text-[10px] text-gray-600">Pts</span></p>
                    </div>
                    <div className="royal-card p-8 text-center space-y-3 border-amber-500/10 hover:border-amber-500/30 transition-all">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 font-sans">{t("stat_wins")}</p>
                        <p className="text-2xl font-serif italic text-white/90">{autor.victorias}</p>
                    </div>
                    <div className="royal-card p-8 text-center space-y-3 border-amber-500/20 bg-amber-500/5 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-amber-500 font-sans font-bold">{t("streak_days")}</p>
                        <p className="text-2xl font-serif italic text-white animate-pulse">🔥 {autor.streak}</p>
                    </div>
                </section>

                <section className="space-y-16">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-8">
                        <h2 className="text-3xl font-serif italic text-white/90 tracking-widest">{t("public_archive")}</h2>
                        <span className="text-[10px] tracking-[0.5em] text-gray-600 uppercase font-sans">{autor.obras.length} {t("public_forged")}</span>
                    </div>

                    <div className="grid gap-12">
                        {autor.obras?.map((o, idx) => (
                            <div key={idx} className="royal-card p-12 group border-transparent hover:border-amber-500/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-3">
                                        <h3 className="text-3xl md:text-4xl font-serif italic text-white/90 group-hover:text-amber-500 transition-all duration-700">{o.titulo}</h3>
                                        <p className="text-[9px] tracking-[0.3em] text-gray-600 uppercase font-sans">Forjado el {o.fecha}</p>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-500 italic font-serif leading-relaxed opacity-60 group-hover:opacity-100 transition-all">
                                    "{o.texto}"
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="pt-40 text-center border-t border-white/5">
                    <div className="space-y-8">
                        <p className="text-xs tracking-[0.4em] uppercase text-gray-500 font-sans italic">"{t("public_motto_footer")}"</p>
                        <div className="flex justify-center gap-8 items-center">
                            <a href="/login" className="royal-button px-12 py-4 text-[10px] tracking-[0.3em] uppercase">{t("public_join")}</a>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
}
