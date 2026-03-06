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
const [alertTweet, setAlertTweet] = useState<string | null>(null);

const monitoredSources: MonitoredSource[] = [
{ id: '1', url: 'https://x.com/ALERTX360', handle: '@ALERTX360', label: 'AlertX360' }
];

const loadData = async (isInitial = false) => {

if (isInitial) setLoading(true);

const data = await fetchLatestIncidents(monitoredSources);

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


// Twitter alert detector
useEffect(() => {

const checkTweets = () => {

const tweets = document.querySelectorAll('[data-testid="tweet"]');

if (tweets.length > 0) {

const latestTweet = tweets[0].innerText;

if (latestTweet && latestTweet !== alertTweet) {

setAlertTweet(latestTweet);

setTimeout(() => {
setAlertTweet(null);
}, 6000);

}

}

};

const interval = setInterval(checkTweets, 5000);

return () => clearInterval(interval);

}, [alertTweet]);


// Load X widget
useEffect(() => {

if (!(window as any).twttr) {

const script = document.createElement('script');
script.src = "https://platform.twitter.com/widgets.js";
script.async = true;
document.body.appendChild(script);

} else {

(window as any).twttr.widgets.load();

}

}, []);

return (

<div className="flex flex-col h-screen bg-[#050505] text-white font-sans">

<AnimatePresence>

{alertTweet && (

<motion.div
initial={{ y: -100, opacity: 0 }}
animate={{ y: 20, opacity: 1 }}
exit={{ y: -100, opacity: 0 }}
className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-xl"
>

<Twitter size={18} />

<div className="flex flex-col">

<span className="text-xs uppercase tracking-widest font-bold">
SIGNAL DETECTED
</span>

<span className="text-sm text-white/90 line-clamp-2">
{alertTweet}
</span>

</div>

</motion.div>

)}

</AnimatePresence>

<header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">

<div className="flex items-center gap-3">

<div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
<ShieldAlert size={18}/>
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

<div className="flex flex-col text-right">

<div className="flex items-center gap-2 justify-end">

<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>

<span className="text-[10px] text-green-400 uppercase tracking-widest">
INTEL GRID ACTIVE
</span>

</div>

<span className="text-[9px] text-white/40 uppercase">
Nodes: {monitoredSources.length} | Sync: 2m
</span>

</div>

<button
onClick={() => loadData(false)}
disabled={loading}
className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded"
>

<RefreshCw size={14} className={loading ? "animate-spin" : ""}/>

<span className="text-[10px] uppercase">
Sync
</span>

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

<div className="flex flex-1 gap-4 p-4">

<div className="flex-1">

<Map
incidents={incidents}
onSelectIncident={setSelectedIncident}
selectedIncidentId={selectedIncident?.id}
/>

</div>

<div className="w-[360px] hidden lg:block">

<div className="h-full bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">

<div className="px-4 py-2 border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
Live Signal Feed
</div>

<div className="h-[calc(100%-32px)] overflow-y-auto p-2">

<a
className="twitter-timeline"
data-theme="dark"
data-height="700"
data-chrome="nofooter noborders transparent"
href="https://twitter.com/ALERTX360"
>

Tweets by ALERTX360

</a>

</div>

</div>

</div>

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

View Source

<ExternalLink size={12}/>

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
