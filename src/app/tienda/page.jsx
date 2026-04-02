"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PRODUCTOS = [
    { id: "ink-10", nombre: "Gotita de Tinta", cantidad: 10, precio: 1.99, color: "from-blue-400 to-blue-600" },
    { id: "ink-50", nombre: "Frasco de Tinta", cantidad: 50, precio: 7.99, color: "from-purple-400 to-purple-600" },
    { id: "ink-100", nombre: "Tintero Real", cantidad: 100, precio: 12.99, color: "from-pink-400 to-pink-600" },
    { id: "ink-500", nombre: "Reserva Legendaria", cantidad: 500, precio: 49.99, color: "from-yellow-400 to-orange-600" },
];

export default function TiendaPage() {
    const [user, setUser] = useState(null);
    const [buying, setBuying] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/user")
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, []);

    const handleBuy = async (producto) => {
        setBuying(producto);
        // Simular retraso de pasarela de pago
        await new Promise(r => setTimeout(r, 2000));

        const res = await fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({ action: "buy", cantidad: producto.cantidad }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            const data = await res.json();
            setUser(prev => ({ ...prev, tinta: data.tinta }));
            setBuying(null);
            alert(`¡Gracias! Has recibido ${producto.cantidad} de Tinta.`);
        }
    };

    return (
        <main className="min-h-screen p-10 bg-[#050509] text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-5xl font-bold mb-2">Tienda de Tinta</h1>
                        <p className="text-gray-400">Abastécete para los concursos más prestigiosos.</p>
                    </div>
                    <div className="bg-[#101018] border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold">Tu Balance</p>
                            <p className="text-2xl font-mono text-purple-400">{user?.tinta || 0} TINTA</p>
                        </div>
                        <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">✒️</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRODUCTOS.map(p => (
                        <div key={p.id} className="bg-[#101018] border border-gray-800 rounded-3xl p-8 flex flex-col items-center hover:border-purple-500/50 transition relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${p.color}`}></div>
                            <div className="text-4xl mb-6">✒️</div>
                            <h3 className="text-xl font-bold mb-2">{p.nombre}</h3>
                            <p className="text-purple-400 font-bold text-3xl mb-6">+{p.cantidad}</p>
                            <p className="text-gray-500 mb-8">${p.precio} USD</p>
                            <button
                                onClick={() => handleBuy(p)}
                                disabled={buying !== null}
                                className={`w-full py-4 rounded-xl font-bold transition ${buying === p ? 'bg-gray-700 animate-pulse' : 'bg-white text-black hover:bg-gray-200'}`}
                            >
                                {buying === p ? "Procesando..." : "Comprar Ahora"}
                            </button>
                        </div>
                    ))}
                </div>

                {buying && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-[#101018] border border-gray-800 p-10 rounded-3xl text-center max-w-sm">
                            <div className="animate-spin h-16 w-16 border-t-4 border-purple-500 rounded-full mx-auto mb-6"></div>
                            <h2 className="text-2xl font-bold mb-4">Procesando Pago</h2>
                            <p className="text-gray-400">Estamos conectando con la pasarela segura para procesar tu compra de ${buying.precio} USD...</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
