import React, { useEffect, useState } from 'react';
import { Incident, MonitoredSource } from './types';
import { fetchLatestIncidents } from './services/gemini';
import Map from './components/Map.tsx';
import IncidentFeed from './components/IncidentFeed.tsx';
import StatsPanel from './components/StatsPanel.tsx';
import { RefreshCw, ShieldAlert, Info, ExternalLink, X, Twitter } from 'lucide-react';
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

/* MONITORED TWITTER SOURCES */
const monitoredSources: MonitoredSource[] = [
{
id: '1',
url: 'https://x.com/MonitorX99800',
handle: '@MonitorX99800',
label: 'MonitorX'
},
{
id: '2',
url: 'https://x.com/ALERTX360',
handle: '@ALERTX360',
label: 'AlertX'
}
];

const loadData = async (isInitial = false) => {

if (isInitial) setLoading(true);

const data = await fetchLatestIncidents(monitoredSources);

if (!isInitial && data.length > 0 && incidents.length > 0) {

  const latestExisting = new Date(incidents[0].timestamp).getTime();

  const trulyNew = data.filter(
    item => new Date(item.timestamp).getTime() > latestExisting
  );

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

/* Refresh every 2 minutes */

const interval = setInterval(
  () => loadData(false),
  2 * 60 * 1000
);

return () => clearInterval(interval);

}, []);

return (

<div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-red-500/30">

  {/* ALERT POPUP */}

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
          newIncidentToast.isTweet
            ? "bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)]"
            : "bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
        )}

      >

        {newIncidentToast.isTweet
          ? <Twitter size={16} />
          : <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        }

        <span className="text-xs font-bold uppercase tracking-widest">

          Intelligence Alert: {newIncidentToast.title}

        </span>

      </motion.div>

    )}

  </AnimatePresence>

  {/* HEADER */}

  <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] z-50">

    <div className="flex items-center gap-3">

      <div className="relative">

        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
          <ShieldAlert size={20} />
        </div>

        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />

      </div>

      <div>

        <h1 className="text-sm font-black tracking-tighter uppercase italic">
          Global Conflict Monitor
        </h1>

        <div className="flex items-center gap-2">

          <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">
            Strategic Intelligence Network
          </span>

          <span className="text-[9px] font-mono text-red-500 animate-pulse font-bold uppercase tracking-widest">
            [Signal Active]
          </span>

        </div>

      </div>

    </div>

    <div className="flex items-center gap-4">

      <div className="hidden lg:flex items-center gap-6 mr-4">

        {monitoredSources.map(source => (

          <div key={source.id} className="flex flex-col items-start">

            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
              Monitoring
            </span>

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

        <RefreshCw
          size={14}
          className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}
        />

        <span className="text-[10px] font-mono uppercase tracking-widest">
          Sync
        </span>

      </button>

    </div>

  </header>

  {/* MAIN */}

  <main className="flex-1 flex overflow-hidden">

    <aside className="w-80 flex-shrink-0 hidden md:block">

      <IncidentFeed
        incidents={incidents}
        onSelectIncident={setSelectedIncident}
        selectedIncidentId={selectedIncident?.id}
      />

    </aside>

    <section className="flex-1 flex flex-col relative">

      <StatsPanel incidents={incidents} />

      <div className="flex-1 p-4">

        <Map
          incidents={incidents}
          onSelectIncident={setSelectedIncident}
          selectedIncidentId={selectedIncident?.id}
        />

      </div>

    </section>

  </main>

  {/* FOOTER */}

  <footer className="h-8 bg-[#111] border-t border-white/10 flex items-center px-4 overflow-hidden">

    <div className="flex-shrink-0 flex items-center gap-2 mr-4 border-r border-white/10 pr-4">

      <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />

      <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold">
        Live Ticker
      </span>

    </div>

    <div className="flex-1 overflow-hidden">

      <div className="flex animate-marquee whitespace-nowrap gap-12">

        {incidents.map((incident, i) => (

          <span key={i} className="text-[10px] font-mono text-white/50 uppercase tracking-widest">

            <span className="text-white/80 font-bold mr-2">
              [{incident.location.name}]
            </span>

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

</div>

);
}
