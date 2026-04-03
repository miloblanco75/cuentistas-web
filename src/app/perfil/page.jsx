import { CASAS } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";
import { useSession, signOut } from "next-auth/react";

export default function PerfilPage() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("archive"); // 'obras' or 'archive'
    const { t } = useLanguage();
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        fetch("/api/user")
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, []);

    const handleLogout = async () => {
        const res = await fetch("/api/auth", {
            method: "POST",
            body: JSON.stringify({ action: "logout" }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            router.push("/");
        }
    };

    if (!user) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-serif text-sm">...</div>;

    const casaData = CASAS.find(c => c.id === user.casa) || CASAS[0];

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] p-12 md:p-32 animate-elegant">
            <div className="max-w-5xl mx-auto space-y-40">
                <header className="space-y-16">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-[1px] bg-gold/50"></div>
                                <div className="w-8 h-[1px] bg-gold/50"></div>
                                <p className="text-[10px] tracking-[0.4em] uppercase text-gold font-sans font-medium">{t("profile_legacy")}</p>
                            </div>
                            <h1 className="text-8xl font-light tracking-tighter text-white font-serif italic">{user.nombre || session?.user?.name}</h1>
                        </div>
                        <div className="flex flex-col items-end gap-6">
                            <div className="text-right royal-card p-6 px-10 border-gold/20">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-2 font-sans">{t("profile_seal")}</p>
                                <p className="text-xl font-serif italic text-gold">{t(`casa_${casaData.id}`)}</p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-[9px] tracking-[0.5em] uppercase text-red-500/50 hover:text-red-500 transition-all font-sans border-b border-transparent hover:border-red-500/20 pb-1"
                            >
                                {t("footer_disconnect")}
                            </button>
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
                    
                    <div className="flex justify-center">
                        <a 
                            href="/perfil/compartir"
                            className="royal-button px-12 py-5 text-xs tracking-[0.5em] uppercase animate-pulse shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                        >
                            {t("profile_btn_forge")}
                        </a>
                    </div>
                </header>

                <section className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div className="royal-card p-10 text-center space-y-4 border-gold/10">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-sans">{t("stat_rank")}</p>
                        <p className="text-3xl font-serif italic text-white/90">{t(`rango_${user.nivel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`)}</p>
                    </div>
                    <div className="royal-card p-10 text-center space-y-4 border-gold/10">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-sans">{t("stat_prestige")}</p>
                        <p className="text-3xl font-serif italic text-gold">{user.puntos} Pts</p>
                    </div>
                    <div className="royal-card p-10 text-center space-y-4 border-gold/10">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-sans">{t("stat_ink")}</p>
                        <p className="text-3xl font-serif italic text-white/90">{user.tinta}✒️</p>
                    </div>
                    {user.streak > 0 && (
                        <div className="royal-card p-10 text-center space-y-4 border-gold/20 bg-gold/5 col-span-2 md:col-span-3">
                            <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-sans font-bold">{t("streak_title")}</p>
                            <p className="text-5xl font-serif italic text-white animate-pulse">🔥 {user.streak} {t("streak_days")} 🔥</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest italic">{t("streak_motto")}</p>
                        </div>
                    )}
                </section>

                <section className="space-y-20">
                    <div className="flex gap-16 border-b border-white/5 pb-6 justify-center md:justify-start">
                        {["archive", "obras"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[11px] tracking-[0.5em] uppercase font-sans transition-all duration-700 relative pb-4 ${activeTab === tab ? 'text-gold' : 'text-gray-600 hover:text-white'}`}
                            >
                                {tab === 'archive' ? t("mod_examenes") : t("public_archive")}
                                {activeTab === tab && <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-gold"></div>}
                            </button>
                        ))}
                    </div>

                    <div className="grid gap-12">
                        {(activeTab === 'archive' ? user.archivoEvolucion : user.obras)?.map((a, idx) => (
                            <div key={idx} className="royal-card p-12 group cursor-pointer border-transparent hover:border-gold/20">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-3">
                                        <h3 className="text-4xl font-serif italic text-white/90 group-hover:text-gold transition-all duration-700">{a.titulo}</h3>
                                        <div className="flex gap-6 items-center">
                                            <span className="text-[9px] tracking-[0.3em] text-gray-600 uppercase font-sans">{a.fecha}</span>
                                            {a.pressure && <span className="text-[8px] bg-gold/10 text-gold px-3 py-1 rounded-full uppercase tracking-tighter">Bajo Presión</span>}
                                        </div>
                                    </div>
                                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">→</span>
                                </div>
                                <p className="text-lg text-gray-500 italic font-serif line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-all">
                                    "{a.texto || 'Crónica privada de alta tensión literaria.'}"
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="pt-24 space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-sans">Ascensión al Sello de Avanzado</p>
                        <p className="text-[11px] tracking-[0.2em] text-gold font-sans font-bold">{user.puntos} / 300</p>
                    </div>
                    <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-gold/50 via-gold to-gold/50 shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all duration-2000 ease-out"
                            style={{ width: `${(user.puntos / 300) * 100}%` }}
                        ></div>
                    </div>
                </section>
            </div>
        </main>
    );
}
