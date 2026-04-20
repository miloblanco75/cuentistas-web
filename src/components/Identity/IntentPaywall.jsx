"use client";

import { useState, useEffect } from "react";
import { X, Zap, Crown, Shield, Droplet, Gift, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

const PAYWALL_VARIANTS = [
    { headline: "14 escritores ya están dentro...", sub: "tu lugar se cierra en" },
    { headline: "Quedan pocos lugares...", sub: "el torneo ya comenzó sin ti" },
    { headline: "18 contendientes ya están compitiendo...", sub: "cada segundo cuenta" },
    { headline: "El velo está por cerrarse...", sub: "entra ahora o observa desde fuera" }
];

export default function IntentPaywall({ 
    isOpen, 
    onClose, 
    tintaMissing, 
    onIntentClick, 
    onSimulatePurchase, 
    overrideHeadline, 
    overrideSub,
    context // "defeat" or null
}) {
    const { data: session } = useSession();
    const [variant, setVariant] = useState(null);
    const [timeLeft, setTimeLeft] = useState(179); // 2:59

    useEffect(() => {
        if (isOpen) {
            // Select variant
            if (context === "defeat") {
                setVariant({ headline: "Después de estar tan cerca...", sub: "¿te vas a quedar fuera?" });
            } else if (overrideHeadline) {
                setVariant({ headline: overrideHeadline, sub: overrideSub });
            } else {
                setVariant(PAYWALL_VARIANTS[Math.floor(Math.random() * PAYWALL_VARIANTS.length)]);
            }

            // Track View
            const currentVariant = context === "defeat" ? "defeat_special" : (overrideHeadline ? "manual_override" : "random_emotion");
            fetch("/api/analytics/paywall", {
                method: "POST",
                body: JSON.stringify({
                    event: "paywall_viewed",
                    contestId: onIntentClick,
                    tintaMissing,
                    variantShown: currentVariant,
                    context
                })
            }).catch(e => console.error("Tracking error:", e));

            const timer = setInterval(() => {
                setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen, context, overrideHeadline, overrideSub, onIntentClick, tintaMissing]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `0${m}:${s.toString().padStart(2, '0')}`;
    };
    if (!isOpen || !variant) return null;

    const isFirst = session?.user?.isFirstPurchase || onSimulatePurchase;

    const packages = [
        { id: "pack_basic", name: "Sello de Inicio", amount: 40, bonus: 10, price: "$19 MXN", icon: Shield, color: "text-blue-400", copy: "Entra ahora mismo" },
        { id: "pack_competitor", name: "Reserva del Competidor", amount: 140, bonus: 30, price: "$49 MXN", icon: Zap, color: "text-gold", popular: true, copy: "Compite varias veces" },
        { id: "pack_sovereign", name: "Cofre Soberano", amount: 420, bonus: 80, price: "$129 MXN", icon: Crown, color: "text-purple-400", copy: "Domina la arena" }
    ];

    const [loading, setLoading] = useState(null);

    const handlePackClick = async (pkg) => {
        setLoading(pkg.id);

        // Track Click
        fetch("/api/analytics/paywall", {
            method: "POST",
            body: JSON.stringify({
                event: "paywall_clicked",
                contestId: onIntentClick,
                tintaMissing,
                variantShown: variant.headline,
                itemId: pkg.id,
                context
            })
        }).catch(e => console.error("Tracking error:", e));
        
        if (onSimulatePurchase) {
            setTimeout(() => {
                onSimulatePurchase(pkg);
                setLoading(null);
            }, 3000);
            return;
        }

        // Log intent before redirecting
        try {
            await fetch("/api/analytics/intent", {
                method: "POST",
                body: JSON.stringify({ 
                    itemId: pkg.id,
                    contestId: onIntentClick, // contestId
                    tintaMissing,
                    contexto: { isGranSello: tintaMissing > 50, price: pkg.price } 
                })
            });

            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                body: JSON.stringify({ 
                    itemId: pkg.id,
                    contestId: onIntentClick // contestId for auto-enrollment
                })
            });
            const data = await res.json();
            if (data.ok && data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            console.error("Error en checkout:", e);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] relative">
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20"
                >
                    <X size={20} />
                </button>

                {/* OVERLAY DE FREEZE */}
                <div className={`absolute inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center transition-all duration-700 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="w-16 h-16 border-t-2 border-gold rounded-full animate-spin mb-8"></div>
                    <p className="text-gold font-serif italic text-3xl tracking-widest uppercase animate-pulse text-center px-6">
                        El Consejo detiene el tiempo para ti...
                    </p>
                    <p className="text-gray-500 text-xs tracking-[0.3em] font-sans uppercase mt-6">
                        Asegurando tu posición en la forja
                    </p>
                </div>

                <div className="p-12 space-y-12">
                    <header className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="bg-red-500/10 border border-red-500/20 px-8 py-3 rounded-full flex items-center gap-3">
                                <Clock className="text-red-500 animate-pulse" size={18} />
                                <span className="text-red-500 font-bold tracking-[0.2em] font-mono text-xl">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-serif italic text-white/90">{variant.headline}</h2>
                            <p className="text-gray-400 font-sans text-sm tracking-widest uppercase">
                                {variant.sub} Faltan <span className="text-red-400 font-bold">{tintaMissing} 💧</span>
                            </p>
                        </div>
                        
                        <div className="pt-2 border-t border-white/5 inline-block px-12">
                            <p className="text-gold font-bold text-[9px] uppercase tracking-[0.3em]">
                                ✨ Entra ahora desde $19
                            </p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {packages.map((pkg) => {
                            const isFeatured = pkg.popular;
                            const displayAmount = isFirst ? pkg.amount + pkg.bonus : pkg.amount;
                            
                            return (
                                <button
                                    key={pkg.id}
                                    onClick={() => handlePackClick(pkg)}
                                    disabled={loading !== null}
                                    className={`relative p-8 rounded-2xl border transition-all duration-700 flex flex-col items-center gap-6 group overflow-hidden ${
                                        isFeatured 
                                            ? 'border-gold bg-gold/5 shadow-[0_0_40px_rgba(212,175,55,0.15)] scale-110 z-10' 
                                            : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                                    } ${loading === pkg.id ? 'animate-pulse opacity-50' : ''}`}
                                >
                                    {isFeatured && (
                                        <div className="absolute top-0 right-0 bg-gold text-black text-[8px] font-black uppercase px-3 py-1 tracking-tighter rounded-bl-lg">
                                            🔥 Más elegido
                                        </div>
                                    )}

                                    {isFirst && (
                                        <div className="absolute top-0 left-0 bg-blue-500 text-white text-[7px] font-black uppercase px-2 py-1 flex items-center gap-1 rounded-br-lg animate-pulse">
                                            <Gift size={8} /> Primer Sacrificio
                                        </div>
                                    )}

                                    <pkg.icon className={`${pkg.color} ${isFeatured ? 'scale-125' : ''} group-hover:scale-110 transition-transform`} size={isFeatured ? 32 : 24} />
                                    
                                    <div className="text-center space-y-1">
                                        <p className={`font-sans tracking-widest uppercase ${isFeatured ? 'text-[10px] text-white font-bold' : 'text-[9px] text-gray-500'}`}>
                                            {pkg.name}
                                        </p>
                                        <p className={`font-bold text-white ${isFeatured ? 'text-3xl' : 'text-xl'}`}>
                                            {loading === pkg.id ? "..." : `+${displayAmount} 💧`}
                                        </p>
                                        {isFirst && (
                                            <p className="text-blue-400 text-[8px] font-bold tracking-widest uppercase">
                                                Incluye Bono +{pkg.bonus}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3 w-full mt-2">
                                        <div className={`py-3 px-4 rounded border text-[11px] font-black tracking-[0.2em] uppercase transition-all shadow-lg ${
                                            isFeatured 
                                                ? 'bg-gold text-black border-gold shadow-gold/20 hover:bg-white' 
                                                : 'border-white/10 text-white hover:bg-white hover:text-black hover:border-white'
                                        }`}>
                                            {isFeatured ? 'ENTRAR AHORA' : `Comprar por ${pkg.price}`}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <footer className="text-center">
                         <p className="text-[9px] text-gray-600 uppercase tracking-widest italic">
                            Tu tinta ha sido restaurada... El Consejo observa.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
