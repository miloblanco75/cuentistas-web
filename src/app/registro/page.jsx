"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASAS } from "@/lib/constants";

export default function RegistroPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: "",
        nombre: "",
        password: "",
        escritor: "",
        genero: "",
        casa: ""
    });
    const router = useRouter();

    const GENEROS = ["Fantasía", "Terror", "Ciencia Ficción", "Realismo Mágico", "Poesía"];

    const handleNext = () => setStep(step + 1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Register en BD Real
        const res = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            // Auto-login con NextAuth
            import("next-auth/react").then(({ signIn }) => {
                signIn("credentials", {
                    username: formData.username,
                    password: formData.password,
                    callbackUrl: "/comunidad"
                });
            });
        } else {
            const data = await res.json();
            alert(data.error || "Error en el rito de iniciación. Intente de nuevo.");
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-[#ffffff] flex items-center justify-center p-12 font-serif relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-radial-gradient from-gold/10 to-transparent opacity-30"></div>

            <div className="max-w-2xl w-full space-y-32 animate-elegant relative z-10">
                <header className="text-center space-y-8">
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-gold text-2xl">🏛️</span>
                        <p className="text-[10px] tracking-[0.6em] uppercase text-gold font-sans font-light">— Rito de Iniciación —</p>
                    </div>
                    <h1 className="text-7xl font-light tracking-tighter italic">Comenzar Legado</h1>
                </header>

                <form onSubmit={handleSubmit} className="royal-card p-16 space-y-20 border-gold/10">
                    {step === 1 && (
                        <div className="space-y-16">
                            <div className="space-y-4">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-sans">Sello Identitario</p>
                                <input
                                    required
                                    className="royal-input text-4xl"
                                    placeholder="Nombre Real"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-600 font-sans">Firma Digital (Usuario)</p>
                                <input
                                    required
                                    className="royal-input !text-xl !font-sans !tracking-[0.2em] uppercase opacity-40 placeholder:opacity-50"
                                    placeholder="pseudonimo"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(" ", "") })}
                                />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-600 font-sans">Contraseña Vitalicia</p>
                                <input
                                    required
                                    type="password"
                                    className="royal-input !text-xl !font-sans !tracking-[0.2em] opacity-40 placeholder:opacity-50"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <button type="button" onClick={handleNext} className="royal-button w-full mt-12">Continuar Rito</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-16">
                            <div className="space-y-10">
                                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 font-sans">Género de su Crónica</p>
                                <div className="flex flex-wrap gap-8 justify-center">
                                    {GENEROS.map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, genero: g })}
                                            className={`text-[12px] tracking-[0.3em] uppercase transition-all duration-700 font-sans pb-2 border-b-2 ${formData.genero === g ? 'text-gold border-gold' : 'text-gray-600 border-transparent hover:text-white'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 font-sans">Autor de Referencia</p>
                                <input
                                    required
                                    className="royal-input text-3xl"
                                    placeholder="Maestro Referente"
                                    value={formData.escritor}
                                    onChange={(e) => setFormData({ ...formData, escritor: e.target.value })}
                                />
                            </div>
                            <button type="button" onClick={handleNext} className="royal-button w-full mt-12">Hacia el Juramento</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-16">
                            <div className="grid grid-cols-1 gap-8">
                                <p className="text-[10px] tracking-[0.5em] uppercase text-gray-500 font-sans text-center mb-4">Elección de la Casa Real</p>
                                {CASAS.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, casa: c.id })}
                                        className={`royal-card p-10 text-left transition-all duration-1000 border-transparent ${formData.casa === c.id ? 'border-gold bg-gold/[0.03]' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <div className="flex items-center gap-10">
                                            <span className="text-5xl">{c.logo}</span>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl italic font-serif text-white/90">{c.nombre}</h3>
                                                <p className="text-[9px] font-sans tracking-[0.4em] text-gray-600 uppercase mt-1">{c.descripcion}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button type="submit" className="royal-button w-full mt-12">Sellar Compromiso</button>
                        </div>
                    )}
                </form>
            </div>
        </main>
    );
}
