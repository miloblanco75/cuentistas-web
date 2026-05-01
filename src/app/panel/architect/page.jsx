"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Users, Shield, Zap, Database, Terminal, 
  Pause, Play, UserMinus, Star, AlertTriangle, Hammer,
  ArrowUpRight, Gavel, BarChart3, Clock, BookOpen
} from "lucide-react";
import dynamic from "next/dynamic";
const HouseDistributionChart = dynamic(() => import("@/components/admin/ArchitectCharts").then(m => m.HouseDistributionChart), { ssr: false });
const ActivityChart = dynamic(() => import("@/components/admin/ArchitectCharts").then(m => m.ActivityChart), { ssr: false });
import MarketConsole from "@/components/admin/MarketConsole";
import ExamConsole from "@/components/admin/ExamConsole";
import { pusherClient } from "@/lib/pusherClient";

const TABS = [
  { id: "arena", label: "Arena Monitor", icon: Activity },
  { id: "exams", label: "Exámenes (B2B)", icon: BookOpen },
  { id: "economy", label: "The Treasury", icon: Zap },
  { id: "moderation", label: "The High Court", icon: Gavel },
  { id: "analytics", label: "Ecosystem Health", icon: BarChart3 }
];

export default function ArchitectVault() {
  const [activeTab, setActiveTab] = useState("arena");
  const [data, setData] = useState({
    analytics: null,
    recentLogs: [],
    contests: [],
    inventory: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [aRes, cRes, eRes] = await Promise.all([
          fetch("/api/admin/architect/analytics"),
          fetch("/api/admin/architect/arena"),
          fetch("/api/admin/architect/economy")
        ]);
        const aData = await aRes.json();
        const cData = await cRes.json();
        const eData = await eRes.json();
        
        setData({
          analytics: aData.analytics || null,
          recentLogs: aData.recentLogs || [],
          contests: cData.contests || [],
          inventory: eData.inventory || []
        });
      } catch (e) {
        console.error("Vault Access Unstable:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Real-time Listeners
  useEffect(() => {
    if (!pusherClient) return;

    // 1. Global Events
    const globalChannel = pusherClient.subscribe("global");
    globalChannel.bind("event-start", (event) => {
      setData(prev => ({
        ...prev,
        recentLogs: [{
          timestamp: new Date(),
          admin: { username: "SYSTEM" },
          action: `GLOBAL EVENT: ${event.name}`,
          details: `Multiplier x${event.multiplier}`
        }, ...prev.recentLogs].slice(0, 50)
      }));
    });

    // 2. Community Messages
    const communityChannel = pusherClient.subscribe("comunidad");
    communityChannel.bind("new-message", (msg) => {
      setData(prev => ({
        ...prev,
        recentLogs: [{
          timestamp: new Date(),
          admin: { username: msg.author || "User" },
          action: "NEW MESSAGE",
          details: msg.content?.slice(0, 30)
        }, ...prev.recentLogs].slice(0, 50)
      }));
    });

    // 3. Specific Contest Arena Controls
    (data.contests || []).forEach(contest => {
      const channel = pusherClient.subscribe(`concurso-${contest.id}`);
      channel.bind("arena-control", (event) => {
        setData(prev => {
          const updatedContests = (prev.contests || []).map(c => {
            if (c.id === contest.id) {
               if (event.type === 'PAUSE') return {...c, status: 'paused'};
               if (event.type === 'RESUME') return {...c, status: 'active'};
            }
            return c;
          });

          return {
            ...prev,
            contests: updatedContests,
            recentLogs: [{
              timestamp: new Date(),
              admin: { username: "ARENA_CTRL" },
              action: event.type,
              details: `Contest ${contest.titulo}: ${event.msg}`
            }, ...prev.recentLogs].slice(0, 50)
          };
        });
      });
    });

    return () => {
      pusherClient.unsubscribe("global");
      pusherClient.unsubscribe("comunidad");
      (data.contests || []).forEach(c => pusherClient.unsubscribe(`concurso-${c.id}`));
    };
  }, [(data.contests || []).length]); // Re-subscribe if contest count changes

  const handleArenaAction = async (action, contestId, userId = null) => {
    try {
      const res = await fetch("/api/admin/architect/arena", {
        method: "POST",
        body: JSON.stringify({ action, contestId, userId }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        // Refresh local data (simplified)
        const updatedContests = (data.contests || []).map(c => {
          if (c.id === contestId) {
             if (action === 'pause') return {...c, status: 'paused'};
             if (action === 'resume') return {...c, status: 'active'};
          }
          return c;
        });
        setData({...data, contests: updatedContests});
      }
    } catch (e) {
        console.error("Transmission Error:", e);
    }
  };

  const handleGlobalEvent = async () => {
    const res = await fetch("/api/admin/architect/arena", {
        method: "POST",
        body: JSON.stringify({ 
            action: "global_event", 
            details: { multiplier: 2.0, name: "HORA DE LA QUIMERA" } 
        }),
        headers: { "Content-Type": "application/json" }
    });
    if (res.ok) alert("Protocolo de Evento Global Activado");
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-t border-gold rounded-full animate-spin"></div>
        <span className="text-[10px] tracking-[0.5em] text-gold uppercase opacity-60">Decrypting System Files...</span>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* HUD Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Souls", val: data.analytics?.totalUsers, icon: Users },
          { label: "Stability", val: "99.9%", icon: Shield },
          { label: "Ink Flux", val: "+500/hr", icon: Zap },
          { label: "Today's Tally", val: data.analytics?.activeToday, icon: Clock },
        ].map((stat, i) => (
           <div key={i} className="border border-gold/10 bg-[#050508]/40 p-6 flex items-center justify-between group hover:border-gold/30 transition-all">
              <div className="space-y-1">
                <p className="text-[9px] tracking-widest text-[#888] uppercase">{stat.label}</p>
                <p className="text-xl font-bold tracking-tighter group-hover:text-gold">{stat.val}</p>
              </div>
              <stat.icon size={20} className="text-gold/20 group-hover:text-gold" />
           </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="space-y-8">
        <nav className="flex gap-4 border-b border-white/5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-6 text-[10px] tracking-widest uppercase transition-all flex items-center gap-3 ${activeTab === tab.id ? 'border-b border-gold text-gold' : 'opacity-40 hover:opacity-100'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === "arena" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <header className="flex justify-between items-center">
                    <h2 className="text-xs tracking-widest uppercase gold-gradient-text flex items-center gap-2">
                        <Terminal size={14} /> Live Contest Monitor
                    </h2>
                    <button 
                        onClick={handleGlobalEvent}
                        className="text-[9px] bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold px-4 py-2 flex items-center gap-2 transition-all"
                    >
                        <Zap size={12} fill="currentColor" /> Global Event Protocol
                    </button>
                </header>
                <div className="space-y-4">
                  {data.contests.map(contest => (
                    <div key={contest.id} className="border border-white/5 bg-[#050508]/60 p-6 rounded-sm flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={`w-1.5 h-1.5 rounded-full ${contest.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="font-bold tracking-wider">{contest.titulo}</span>
                        </div>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">
                            ENTRIES: {contest._count.entradas} // STATUS: {contest.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {contest.status === 'active' ? (
                            <button onClick={() => handleArenaAction('pause', contest.id)} className="p-3 border border-white/10 hover:bg-white/5 text-amber-500">
                                <Pause size={16} />
                            </button>
                        ) : (
                            <button onClick={() => handleArenaAction('resume', contest.id)} className="p-3 border border-white/10 hover:bg-white/5 text-green-500">
                                <Play size={16} />
                            </button>
                        )}
                        <button className="p-3 border border-white/10 hover:bg-white/5 text-red-500">
                            <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                  <h2 className="text-xs tracking-widest uppercase opacity-60 flex items-center gap-2">
                     <Clock size={14} /> Critical Audit Log
                  </h2>
                  <div className="border border-white/5 bg-black/40 p-6 rounded-sm space-y-4 max-h-[400px] overflow-y-auto font-mono text-[9px] leading-relaxed">
                    {data.recentLogs.map((log, i) => (
                        <p key={i} className="flex gap-4 border-b border-white/[0.03] pb-2">
                            <span className="text-gold/40">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="text-white/80">{log.admin.username} {"->"} {log.action}</span>
                            <span className="text-white/20 italic ml-auto">{log.details?.slice(0, 30)}...</span>
                        </p>
                    ))}
                  </div>
              </div>
            </div>
          )}

          {activeTab === "exams" && (
            <ExamConsole />
          )}

          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="border border-white/5 p-8 bg-[#050508]/40 space-y-6">
                    <p className="text-[10px] tracking-widest uppercase opacity-40">House Loyalty Distribution</p>
                    <HouseDistributionChart data={data.analytics?.houseDistribution} />
                </div>
                <div className="border border-white/5 p-8 bg-[#050508]/40 space-y-6 md:col-span-2">
                    <p className="text-[10px] tracking-widest uppercase opacity-40">Cónclave Daily Activity</p>
                    <ActivityChart />
                </div>
            </div>
          )}

          {activeTab === "economy" && (
             <div className="space-y-8 animate-elegant">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="border-l-2 border-gold bg-gold/5 p-8 space-y-4">
                        <h4 className="text-xs font-bold tracking-widest uppercase text-gold">The Sovereign Airdrop</h4>
                        <p className="text-[10px] opacity-60">Injection of ink credits directly into all active annals. Proceed with absolute discretion.</p>
                        <div className="flex gap-4 mt-6">
                            <input type="number" placeholder="+50" className="bg-black/40 border border-white/10 px-4 py-3 text-[10px] w-24 outline-none focus:border-gold transition-all" />
                            <button className="bg-gold text-black text-[9px] font-bold px-8 py-3 tracking-[0.3em] hover:bg-amber-400 transition-all uppercase">Execute Protocol</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs tracking-[0.4em] uppercase opacity-40 mb-8 border-b border-white/5 pb-4">Vault Inventory Management</h3>
                    <MarketConsole initialItems={data.inventory} />
                </div>
             </div>
          )}
        </div>
      </div>

      <footer className="pt-24 border-t border-white/5 flex justify-between items-center opacity-40 text-[9px] tracking-[0.4em] uppercase">
        <span>ARCHITECT_VAULT_SYSTEMS_ONLINE_</span>
        <span>MMXXVI // Cuentistas OS</span>
      </footer>
    </div>
  );
}
