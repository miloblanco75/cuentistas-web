"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Zap, Trophy, PenTool, Sword } from "lucide-react";
import { pusherClient } from "@/lib/pusherClient";

const STATIC_MESSAGES = [
    { text: "Casa Lobo ganó el último duelo regional", icon: <Trophy className="w-3 h-3 text-gold" /> },
    { text: "Nuevas reliquias de tinta detectadas en el Mercado", icon: <Zap className="w-3 h-3 text-gold" /> },
    { text: "El Cónclave de Cuentistas prepara un gran evento", icon: <Terminal className="w-3 h-3 text-gold" /> },
];

export default function ActivityTicker() {
    const [currentMsg, setCurrentMsg] = useState(STATIC_MESSAGES[0]);
    const [msgs, setMsgs] = useState([]);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!pusherClient) return;

        const globalChannel = pusherClient.subscribe("cuentistas-global");
        const communityChannel = pusherClient.subscribe("comunidad");

        globalChannel.bind("concurso-iniciado", (data) => {
            pushMessage(`🏆 Torneo Iniciado: ${data.titulo}`, <Trophy className="w-3 h-3 text-gold" />);
        });

        globalChannel.bind("entry-submitted", (data) => {
            pushMessage(`✍️ ${data.username} de Casa ${data.casa} avanzó en el ranking`, <PenTool className="w-3 h-3 text-gold" />);
        });

        communityChannel.bind("new-message", (data) => {
            pushMessage(`💬 ${data.user}: Nuevo mensaje en la Ciudadela`, <PenTool className="w-3 h-3 text-blue-400" />);
        });

        return () => {
            globalChannel.unbind();
            communityChannel.unbind();
            pusherClient.unsubscribe("cuentistas-global");
            pusherClient.unsubscribe("comunidad");
        };
    }, []);

    const pushMessage = (text, icon) => {
        setVisible(false);
        setTimeout(() => {
            setCurrentMsg({ text, icon });
            setVisible(true);
        }, 500);
    };

    // Cycle static messages and Pressure messages every 15 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            let extraMessages = [];
            
            // Try to fetch house ranking for smarter pressure
            try {
                const res = await fetch("/api/live-stats");
                const text = await res.text();
                const data = text ? JSON.parse(text) : null;
                
                if (data?.ok && data.stats) {
                    const topHouse = data.stats.topHouse || "lobo";
                    const humans = data.stats.activeHumans || 12;

                    extraMessages.push({ 
                        text: `🏰 Casa ${topHouse.toUpperCase()} domina el ranking esta semana`, 
                        icon: <Trophy className="w-3 h-3 text-gold" /> 
                    });
                    extraMessages.push({ 
                        text: `🟢 ${humans} Humanos en línea resistiendo al algoritmo`, 
                        icon: <Terminal className="w-3 h-3 text-green-500" /> 
                    });
                }
            } catch (e) {
                // Silent fail: el ticker sigue con mensajes estáticos
            }

            const pressureMessages = [
                { text: "⚠️ Te están superando en el ranking global...", icon: <Terminal className="w-3 h-3 text-red-500" /> },
                { text: `✍️ Escritores de tu casa están avanzando ahora`, icon: <PenTool className="w-3 h-3 text-gold" /> },
                { text: "Estás bajando posiciones: Alguien acaba de publicar", icon: <Terminal className="w-3 h-3 text-red-500" /> },
                ...extraMessages,
                ...STATIC_MESSAGES
            ];
            const index = Math.floor(Math.random() * pressureMessages.length);
            pushMessage(pressureMessages[index].text, pressureMessages[index].icon);
        }, 12000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 h-6 overflow-hidden">
            <div className={`flex items-center gap-2 transition-all duration-1000 transform ${visible ? 'opacity-40 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                {currentMsg.icon}
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium whitespace-nowrap">
                    {currentMsg.text}
                </span>
            </div>
        </div>
    );
}
