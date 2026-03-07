import React, { useEffect, useState } from "react"
import { Incident, MonitoredSource } from "./types"
import { fetchLatestIncidents } from "./services/gemini"
import Map from "./components/Map"
import IncidentFeed from "./components/IncidentFeed"
import StatsPanel from "./components/StatsPanel"
import { RefreshCw, ShieldAlert } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

export default function App() {

const [incidents,setIncidents] = useState<Incident[]>([])
const [loading,setLoading] = useState(true)
const [selectedIncident,setSelectedIncident] = useState<Incident | null>(null)
const [lastUpdated,setLastUpdated] = useState(new Date())
const [alertIncident,setAlertIncident] = useState<Incident | null>(null)
const [lastTweetId,setLastTweetId] = useState<string | null>(null)

const monitoredSources: MonitoredSource[] = [
{ id:"1", url:"https://x.com/ALERTX360", handle:"@ALERTX360", label:"AlertX360" },
{ id:"2", url:"https://x.com/MonitorX99800", handle:"@MonitorX99800", label:"MonitorX" }
]

const loadData = async (isInitial=false) => {

if(isInitial) setLoading(true)

const data = await fetchLatestIncidents(monitoredSources)

setIncidents(data)

if(selectedIncident){

const updated = data.find(i => i.id === selectedIncident.id)

if(updated) setSelectedIncident(updated)

}

setLoading(false)
setLastUpdated(new Date())

}

useEffect(()=>{

loadData(true)

const interval = setInterval(()=>loadData(false),60000)

return ()=>clearInterval(interval)

},[])



/* CITY DETECTION MAP */

const cityMap:any = {

"haifa":{name:"Israel",lat:31.0461,lng:34.8516},
"tel aviv":{name:"Israel",lat:31.0461,lng:34.8516},
"jerusalem":{name:"Israel",lat:31.0461,lng:34.8516},

"tehran":{name:"Iran",lat:32.4279,lng:53.6880},
"isfahan":{name:"Iran",lat:32.4279,lng:53.6880},
"tabriz":{name:"Iran",lat:32.4279,lng:53.6880},

"riyadh":{name:"Saudi Arabia",lat:23.8859,lng:45.0792},
"jeddah":{name:"Saudi Arabia",lat:23.8859,lng:45.0792},
"mecca":{name:"Saudi Arabia",lat:23.8859,lng:45.0792},

"dubai":{name:"UAE",lat:24.4539,lng:54.3773},
"abu dhabi":{name:"UAE",lat:24.4539,lng:54.3773},
"sharjah":{name:"UAE",lat:24.4539,lng:54.3773},

"doha":{name:"Qatar",lat:25.3548,lng:51.1839},

"manama":{name:"Bahrain",lat:26.0667,lng:50.5577},

"muscat":{name:"Oman",lat:20.4730,lng:57.9990},

"baghdad":{name:"Iraq",lat:33.2232,lng:43.6793},
"basra":{name:"Iraq",lat:33.2232,lng:43.6793}

}



/* TWITTER MONITORING */

useEffect(()=>{

const checkTwitter = async () => {

try{

const res = await fetch("/api/twitter")
const data = await res.json()

if(!data.success) return

const tweet = data.tweets?.[0]

if(!tweet) return

const tweetId = tweet.url

if(tweetId === lastTweetId) return

const cleanText = tweet.text
.replace(/<!\[CDATA\[/g,"")
.replace(/\]\]>/g,"")
.replace(/<[^>]*>/g,"")
.trim()

const text = cleanText.toLowerCase()

let location = {name:"Middle East",lat:31,lng:45}

for(const city in cityMap){

if(text.includes(city)){

location = cityMap[city]
break

}

}

const incident: Incident = {
id:tweetId,
title:cleanText,
description:cleanText,
timestamp:tweet.time,
location:location,
severity:"high",
sourceUrl:tweet.url
}

setAlertIncident(incident)

setIncidents(prev => [incident,...prev])

setTimeout(()=>{
setAlertIncident(null)
},7000)

setLastTweetId(tweetId)

}catch(err){

console.error("Twitter monitor error",err)

}

}

checkTwitter()

const interval = setInterval(checkTwitter,15000)

return ()=>clearInterval(interval)

},[lastTweetId])



/* TWITTER FEED AUTO REFRESH */

useEffect(()=>{

const reloadTwitterFeed = () => {

const container = document.getElementById("twitter-feed-container")

if(!container) return

const html = container.innerHTML

container.innerHTML = ""

setTimeout(()=>{

container.innerHTML = html

if((window as any).twttr){

(window as any).twttr.widgets.load()

}

},100)

}

const interval = setInterval(reloadTwitterFeed,60000)

return ()=>clearInterval(interval)

},[])



return (

<div className="flex flex-col h-screen bg-[#050505] text-white font-sans">

<AnimatePresence>

{alertIncident && (

<motion.div
initial={{ y:-120, opacity:0 }}
animate={{ y:20, opacity:1 }}
exit={{ y:-120, opacity:0 }}
className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 px-6 py-4 rounded-xl flex items-center gap-4 shadow-2xl max-w-xl"
>

<div className="flex flex-col">

<span className="text-xs uppercase tracking-widest font-bold">
SIGNAL DETECTED
</span>

<span className="text-sm font-semibold">
{alertIncident.title}
</span>

<span className="text-[11px] text-white/80">
Location: {alertIncident.location.name}
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

<button
onClick={()=>loadData(false)}
disabled={loading}
className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded"
>

<RefreshCw size={14} className={loading ? "animate-spin" : ""}/>

<span className="text-[10px] uppercase">
Sync
</span>

</button>

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
/>

</div>



<div className="w-[360px] hidden lg:block">

<div className="h-full bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">

<div className="px-4 py-2 border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
Live Signal Feed
</div>

<div className="h-[calc(100%-32px)] overflow-y-auto p-2">

<div id="twitter-feed-container">

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

</div>

</section>

</main>



<footer className="h-8 bg-[#111] border-t border-white/10 flex items-center px-4 text-[10px] text-white/40">

Last Sync: {lastUpdated.toLocaleTimeString()}

</footer>

</div>

)

}
