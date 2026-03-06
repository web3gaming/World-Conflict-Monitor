import React, { useEffect, useState } from "react";
import { Incident, MonitoredSource } from "./types";
import { fetchLatestIncidents } from "./services/gemini";
import Map from "./components/Map.tsx";
import IncidentFeed from "./components/IncidentFeed.tsx";
import StatsPanel from "./components/StatsPanel.tsx";
import { RefreshCw, ShieldAlert, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {

const [incidents, setIncidents] = useState<Incident[]>([]);
const [loading, setLoading] = useState(true);
const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
const [lastUpdated, setLastUpdated] = useState(new Date());
const [alertIncident, setAlertIncident] = useState<Incident | null>(null);
const [lastTweetId, setLastTweetId] = useState<string | null>(null);

const monitoredSources: MonitoredSource[] = [
{ id: "1", url: "https://x.com/ALERTX360", handle: "@ALERTX360", label: "AlertX360" },
{ id: "2", url: "https://x.com/MonitorX99800", handle: "@MonitorX99800", label: "MonitorX" }
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

const interval = setInterval(() => loadData(false), 30000);

return () => clearInterval(interval);

}, []);

/* TWITTER MONITOR */

useEffect(() => {

const checkTwitter = async () => {

try {

const res = await fetch("/api/twitter");
const data = await res.json();

if (!data.success) return;

const tweet = data.tweets?.[0];
if (!tweet) return;

const tweetId = tweet.url;

if (tweetId === lastTweetId) return;

const cleanText = tweet.text
.replace(/<!CDATA[/g,"")
.replace(/]>/g,"")
.replace(/<[^>]*>/g,"")
.trim();

const incident: Incident = {
id: tweetId,
title: cleanText,
description: cleanText,
timestamp: tweet.time,
location: { name: "Signal Intelligence", lat: 33, lng: 44 },
severity: "high",
sourceUrl: tweet.url
};

setAlertIncident(incident);

setTimeout(() => {
setAlertIncident(null);
}, 7000);

setLastTweetId(tweetId);

} catch (error) {

console.error("Twitter monitor error:", error);

}

};

checkTwitter();

const interval = setInterval(checkTwitter, 15000);

return () => clearInterval(interval);

}, [lastTweetId]);

return (

<div className="flex flex-col h-screen bg-[#050505] text-white font-sans"><AnimatePresence>{alertIncident && (

<motion.div
initial={{ y:-120, opacity:0 }}
animate={{ y:20, opacity:1 }}
exit={{ y:-120, opacity:0 }}
className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 px-6 py-4 rounded-xl flex items-center gap-4 shadow-2xl max-w-xl"

«»

<div className="flex flex-col"><span className="text-xs uppercase tracking-widest font-bold">
SIGNAL DETECTED
</span><span className="text-sm font-semibold">
{alertIncident.title}
</span><span className="text-[11px] text-white/80">
Location: {alertIncident.location.name}
</span></div></motion.div>

)}

</AnimatePresence><header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
<ShieldAlert size={18}/>
</div><div><h1 className="text-sm font-bold uppercase">
Global Conflict Monitor
</h1><span className="text-[9px] font-mono text-white/40 uppercase">
Strategic Intelligence Network
</span></div></div><button
onClick={() => loadData(false)}
disabled={loading}
className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded"

«»

<RefreshCw size={14} className={loading ? "animate-spin" : ""}/>

<span className="text-[10px] uppercase">
Sync
</span></button></header><main className="flex flex-1 overflow-hidden"><aside className="w-80 hidden md:block"><IncidentFeed
incidents={incidents}
onSelectIncident={setSelectedIncident}
selectedIncidentId={selectedIncident?.id}
/>

</aside><section className="flex-1 flex flex-col relative"><StatsPanel incidents={incidents}/><div className="flex flex-1 gap-4 p-4"><div className="flex-1"><Map
incidents={incidents}
onSelectIncident={setSelectedIncident}
selectedIncidentId={selectedIncident?.id}
/>

</div><div className="w-[360px] hidden lg:block"><div className="h-full bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden"><div className="px-4 py-2 border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
Live Signal Feed
</div><div className="h-[calc(100%-32px)] overflow-y-auto p-2"><a
className="twitter-timeline"
data-theme="dark"
data-height="700"
data-chrome="nofooter noborders transparent"
href="https://twitter.com/ALERTX360"

«»

Tweets by ALERTX360
</a>

</div></div></div></div><AnimatePresence>{selectedIncident && (

<motion.div
initial={{ x:"100%" }}
animate={{ x:0 }}
exit={{ x:"100%" }}
className="absolute top-0 right-0 w-96 h-full bg-[#0d0d0d] border-l border-white/10 p-6"

«»

<div className="flex justify-between mb-4"><h2 className="font-bold">
{selectedIncident.title}
</h2><button onClick={() => setSelectedIncident(null)}>
<X size={18}/>
</button>

</div><p className="text-sm text-white/70 mb-4">
{selectedIncident.description}
</p>{selectedIncident.sourceUrl && (

<a
href={selectedIncident.sourceUrl}
target="_blank"
rel="noopener noreferrer"
className="text-blue-400 text-xs flex items-center gap-1"

«»

View Source

<ExternalLink size={12}/></a>)}

</motion.div>

)}

</AnimatePresence></section></main><footer className="h-8 bg-[#111] border-t border-white/10 flex items-center px-4 text-[10px] text-white/40">Last Sync: {lastUpdated.toLocaleTimeString()}

</footer></div>);

}
