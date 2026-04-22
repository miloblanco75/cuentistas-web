"use client";

import { useState } from "react";
import { X, Shield, Monitor, Type, Lock } from "lucide-react";
import "@/styles/RarityStyles.css";

export default function ProfileCustomizationModal({ isOpen, onClose, inventory, items, onEquip }) {
    const [activeTab, setActiveTab] = useState("frame"); // frame, badge, title
    const [loading, setLoading] = useState(null);

    if (!isOpen) return null;

    const filteredItems = items.filter(item => item.type === activeTab);
    
    const handleEquip = async (inventoryId) => {
        setLoading(inventoryId);
        await onEquip(inventoryId);
        setLoading(null);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-elegant">
            <div className="bg-[#0a0a0a] border border-gold/20 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)] relative">
                
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                <div className="flex h-[600px]">
                    {/* Sidebar Tabs */}
                    <aside className="w-64 border-r border-white/5 p-8 flex flex-col gap-4">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-gold font-black mb-4">Criterio Visual</p>
                        
                        {[
                            { id: 'frame', label: 'Marcos', icon: Monitor },
                            { id: 'badge', label: 'Emblemas', icon: Shield },
                            { id: 'title', label: 'Títulos', icon: Type }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                                    activeTab === tab.id ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <tab.icon size={18} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{tab.label}</span>
                            </button>
                        ))}
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 p-12 overflow-y-auto">
                        <header className="mb-12">
                            <h2 className="text-3xl font-serif italic text-white capitalize">{activeTab} del Tribunal</h2>
                            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Define tu presencia en la Arena</p>
                        </header>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {filteredItems.map(item => {
                                const ownership = inventory.find(i => i.storeItemId === item.id);
                                const isOwned = !!ownership;
                                const isEquipped = ownership?.equipped;

                                return (
                                    <div 
                                        key={item.id}
                                        className={`royal-card p-6 flex flex-col items-center gap-4 transition-all group ${
                                            !isOwned ? 'opacity-40 grayscale' : `glow-${item.rarity}`
                                        }`}
                                    >
                                        <div className="relative">
                                            {activeTab === 'frame' && (
                                                <div className={`w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden ${isOwned ? `frame-${item.rarity}` : ''}`}>
                                                    <div className="w-12 h-12 bg-white/5 rounded-full" />
                                                </div>
                                            )}
                                            {activeTab === 'badge' && (
                                                <div className="text-3xl filter drop-shadow-lg">
                                                    {item.name.includes("🔱") ? "🔱" : 
                                                     item.name.includes("🩸") ? "🩸" : 
                                                     item.name.includes("👁️") ? "👁️" : "⚖️"}
                                                </div>
                                            )}
                                            {activeTab === 'title' && (
                                                <div className="bg-white/5 px-4 py-2 rounded text-[10px] text-white/40 uppercase tracking-widest scale-75">
                                                    Abc
                                                </div>
                                            )}

                                            {!isOwned && (
                                                <div className="absolute -top-1 -right-1 bg-black rounded-full p-1 border border-white/10">
                                                    <Lock size={10} className="text-gray-600" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center">
                                            <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${
                                                item.rarity === 'legendary' ? 'text-gold' : 
                                                item.rarity === 'epic' ? 'text-purple-400' : 
                                                item.rarity === 'rare' ? 'text-blue-400' : 'text-gray-500'
                                            }`}>
                                                {item.name}
                                            </p>
                                            <p className="text-[8px] text-gray-500 italic font-serif leading-tight">
                                                {item.description || "Prestigio puro del Tribunal"}
                                            </p>
                                        </div>

                                        <div className="w-full mt-2">
                                            {isOwned ? (
                                                <button
                                                    onClick={() => !isEquipped && handleEquip(ownership.id)}
                                                    disabled={isEquipped || loading === ownership.id}
                                                    className={`w-full py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        isEquipped ? 'bg-gold/20 text-gold cursor-default' : 'bg-white text-black hover:bg-gold hover:text-white'
                                                    }`}
                                                >
                                                    {loading === ownership.id ? (
                                                        <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto"></div>
                                                    ) : (isEquipped ? "Equipado" : "Equipar")}
                                                </button>
                                            ) : (
                                                <div className="bg-white/5 py-2 rounded text-[9px] text-white/20 font-black uppercase tracking-widest text-center">
                                                    Bloqueado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
