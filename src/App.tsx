import React, { useEffect, useState } from 'react';
import { Incident, MonitoredSource } from './types';
import { fetchLatestIncidents } from './services/gemini';
import Map from './components/Map.tsx';
import IncidentFeed from './components/IncidentFeed.tsx';
import StatsPanel from './components/StatsPanel.tsx';
import { RefreshCw, ShieldAlert, Info, ExternalLink, X, Twitter, Plus, Trash2, Settings, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newIncidentToast, setNewIncidentToast] = useState<Incident | null>(null);
  
  // Hardcoded sole authentic intelligence source
  const monitoredSources: MonitoredSource[] = [
    { id: '1', url: 'https://x.com/MonitorX99800', handle: '@MonitorX99800', label: 'MonitorX' }
  ];

  const loadData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const data = await fetchLatestIncidents(monitoredSources);
    
    // Check for new incidents to show toast
    if (!isInitial && data.length > 0 && incidents.length > 0) {
      const latestExisting = new Date(incidents[0].timestamp).getTime();
      const trulyNew = data.filter(item => new Date(item.timestamp).getTime() > latestExisting);
      if (trulyNew.length > 0) {
        setNewIncidentToast(trulyNew[0]);
        setTimeout(() => setNewIncidentToast(null), 8000);
      }
    }

    setIncidents(data);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    loadData(true);
    // High-frequency refresh for "Live" feel (every 2 minutes)
    const interval = setInterval(() => loadData(false), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-red-500/30">
      {/* Notification Toast */}
      <AnimatePresence>
        {newIncidentToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            onClick={() => {
              setSelectedIncident(newIncidentToast);
              setNewIncidentToast(null);
            }}
            className={cn(
              "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer border border-white/20",
              newIncidentToast.isTweet ? "bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)]" : "bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
            )}
          >
            {newIncidentToast.isTweet ? <Twitter size={16} /> : <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
            <span className="text-xs font-bold uppercase tracking-widest">
              MonitorX Alert: {newIncidentToast.title}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase italic">Global Conflict Monitor</h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">Strategic Intelligence Network</span>
              <span className="text-[9px] font-mono text-red-500 animate-pulse font-bold uppercase tracking-widest">[Signal Active]</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-6 mr-4">
            {monitoredSources.map(source => (
              <div key={source.id} className="flex flex-col items-start">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Monitoring</span>
                <span className="text-[10px] font-mono text-blue-400 uppercase flex items-center gap-1">
                  <Twitter size={8} /> {source.handle}
                </span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => loadData(false)}
            disabled={loading}
            className="group flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            <span className="text-[10px] font-mono uppercase tracking-widest">Sync</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Feed */}
        <aside className="w-80 flex-shrink-0 hidden md:block">
          <IncidentFeed 
            incidents={incidents} 
            onSelectIncident={setSelectedIncident}
            selectedIncidentId={selectedIncident?.id}
          />
        </aside>

        {/* Center: Map & Stats */}
        <section className="flex-1 flex flex-col relative">
          <StatsPanel incidents={incidents} />
          <div className="flex-1 p-4">
            <Map 
              incidents={incidents} 
              onSelectIncident={setSelectedIncident}
              selectedIncidentId={selectedIncident?.id}
            />
          </div>

          {/* Incident Detail Modal/Overlay */}
          <AnimatePresence>
            {selectedIncident && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 w-96 h-full bg-[#0d0d0d] border-l border-white/10 shadow-2xl z-40 p-6 overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Intelligence Report</span>
                    <h2 className="text-xl font-bold leading-tight">{selectedIncident.title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedIncident(null)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded border border-white/5">
                      <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Severity</div>
                      <div className={`text-xs font-bold uppercase ${
                        selectedIncident.severity === 'critical' ? 'text-red-500' :
                        selectedIncident.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
                      }`}>{selectedIncident.severity}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/5">
                      <div className="text-[10px] font-mono text-white/30 uppercase mb-1">Category</div>
                      <div className="text-xs font-bold uppercase text-white/80">{selectedIncident.category}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-white/30 uppercase">Location</div>
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <div className="p-1.5 bg-white/5 rounded">
                        <Info size={14} className="text-blue-400" />
                      </div>
                      {selectedIncident.location.name}
                      <span className="text-[10px] text-white/30">({selectedIncident.location.lat.toFixed(2)}, {selectedIncident.location.lng.toFixed(2)})</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-white/30 uppercase">Description</div>
                    <p className="text-sm text-white/70 leading-relaxed font-light">
                      {selectedIncident.description}
                    </p>
                  </div>

                  {selectedIncident.sourceUrl && (
                    <a 
                      href={selectedIncident.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-4"
                    >
                      View Intelligence Source <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer / Ticker */}
      <footer className="h-8 bg-[#111] border-t border-white/10 flex items-center px-4 overflow-hidden">
        <div className="flex-shrink-0 flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">Live Ticker</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            {incidents.map((incident, i) => (
              <span key={i} className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                <span className="text-white/80 font-bold mr-2">[{incident.location.name}]</span>
                {incident.title}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 ml-4 border-l border-white/10 pl-4">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            Last Sync: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </footer>

      <style>{`
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
