import React, { useEffect, useState } from 'react';
import { Incident, MonitoredSource } from './types';
import { fetchLatestIncidents } from './services/gemini';
import Map from './components/Map.tsx';
import IncidentFeed from './components/IncidentFeed.tsx';
import StatsPanel from './components/StatsPanel.tsx';
import { RefreshCw, ShieldAlert, Twitter, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {

const [incidents, setIncidents] = useState<Incident[]>([]);
const [loading, setLoading] = useState(true);
const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
const [lastUpdated, setLastUpdated] = useState(new Date());
const [newIncidentToast, setNewIncidentToast] = useState<Incident | null>(null);

const monitoredSources: MonitoredSource[] = [
{ id: '1', url: 'https://x.com/MonitorX99800', handle: '@MonitorX99800', label: 'MonitorX' },
{ id: '2', url: 'https://x.com/ALERTX360', handle: '@ALERTX360', label: 'AlertX360' }
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

if (selectedIncident) {

  const updated = data.find(i => i.id === selectedIncident.id);

  if (updated) setSelectedIncident(updated);

}

setLoading(false);
setLastUpdated(new Date());

};

useEffect(() => {

loadData(true);

const interval = setInterval(() => loadData(false), 2 * 60 * 1000);

return () => clearInterval(interval);

}, []);

return (

<div className="flex flex-col h-screen bg-[#050505] text-white font-sans">

  <AnimatePresence>
    {newIncidentToast && (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 20, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 px-6 py-3 rounded-full flex items-center gap-3 shadow-xl"
      >
        <Twitter size={16} />
        <span className="text-xs uppercase tracking-widest font-bold">
          Intelligence Alert: {newIncidentToast.title}
        </span>
      </motion.div>
    )}
  </AnimatePresence>

  <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">

    <div className="flex items-center gap-3">

      <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
        <ShieldAlert size={18} />
      </div>

      <div>
        <h1 className="text-sm font-bold uppercase">
          Global Conflict Monitor
        </h1>
        <span className="text-[9px] font-mono text-white/40 uppercase">
          Strategic Intelligence Network
        </span>
      </div>

    </div>

    <div className="flex items-center gap-6">

      {monitoredSources.map(source => (
        <div key={source.id} className="flex flex-col text-right">
          <span className="text-[8px] text-white/40 uppercase">
            Monitoring
          </span>
          <span className="text-[10px] text-blue-400 flex items-center gap-1">
            <Twitter size={10}/> {source.handle}
          </span>
        </div>
      ))}

      <button
        onClick={() => loadData(false)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
        <span className="text-[10px] uppercase">Sync</span>
      </button>

    </div>

  </header>

  <main className="flex flex-1 overflow-hidden">

    <aside className="w-80 hidden md:block">
      <IncidentFeed
        incidents={incidents}
        onSelectIncident={setSelectedIncident}
        selectedIncidentId={selectedIncident?.id}
      />
    </aside>

    <section className="flex-1 flex flex-col relative">

      <StatsPanel incidents={incidents}/>

      <div className="flex-1 p-4">
        <Map
          incidents={incidents}
          onSelectIncident={setSelectedIncident}
          selectedIncidentId={selectedIncident?.id}
        />
      </div>

      <AnimatePresence>

        {selectedIncident && (

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-96 h-full bg-[#0d0d0d] border-l border-white/10 p-6"
          >

            <div className="flex justify-between mb-4">

              <h2 className="font-bold">
                {selectedIncident.title}
              </h2>

              <button onClick={() => setSelectedIncident(null)}>
                <X size={18}/>
              </button>

            </div>

            <p className="text-sm text-white/70 mb-4">
              {selectedIncident.description}
            </p>

            {selectedIncident.sourceUrl && (
              <a
                href={selectedIncident.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs flex items-center gap-1"
              >
                View Source <ExternalLink size={12}/>
              </a>
            )}

          </motion.div>

        )}

      </AnimatePresence>

    </section>

  </main>

  <footer className="h-8 bg-[#111] border-t border-white/10 flex items-center px-4 text-[10px] text-white/40">

    Last Sync: {lastUpdated.toLocaleTimeString()}

  </footer>

</div>

);

}
