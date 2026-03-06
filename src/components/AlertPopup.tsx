import React, { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

function detectFlag(text:string){

text = text.toLowerCase()

/* Middle East */

if(text.includes("iran")) return "🇮🇷"
if(text.includes("iraq")) return "🇮🇶"
if(text.includes("israel")) return "🇮🇱"

/* Gulf countries */

if(text.includes("saudi")) return "🇸🇦"
if(text.includes("saudi arabia")) return "🇸🇦"
if(text.includes("uae")) return "🇦🇪"
if(text.includes("dubai")) return "🇦🇪"
if(text.includes("abu dhabi")) return "🇦🇪"
if(text.includes("qatar")) return "🇶🇦"
if(text.includes("kuwait")) return "🇰🇼"
if(text.includes("bahrain")) return "🇧🇭"
if(text.includes("oman")) return "🇴🇲"

/* Global */

if(text.includes("us") || text.includes("america") || text.includes("american")) return "🇺🇸"
if(text.includes("russia")) return "🇷🇺"
if(text.includes("ukraine")) return "🇺🇦"
if(text.includes("china")) return "🇨🇳"

return "🌍"

}

function cleanText(text:string){

let t = text || ""

/* remove RSS CDATA */

t = t.replace("<![CDATA[","")
t = t.replace("]]>","")

/* remove OSINT codes like IRUS IRQUS */

t = t.replace(/^[A-Z]{4,6}⚡?\s*—?\s*/,"")

/* remove emojis */

t = t.replace(/[\u{1F300}-\u{1FAFF}]/gu,"")

return t.trim()

}

export default function AlertPopup({incident}){

useEffect(()=>{

if(!incident) return

/* play alert sound */

const sound = new Audio("/sounds/alert.mp3")
sound.volume = 0.6
sound.play().catch(()=>{})

/* radar flash */

document.body.classList.add("radar-flash")

setTimeout(()=>{
document.body.classList.remove("radar-flash")
},1200)

},[incident])

if(!incident) return null

const text = cleanText(incident.title)
const flag = detectFlag(text)

return(

<AnimatePresence>

<motion.div
initial={{y:-120,opacity:0}}
animate={{y:30,opacity:1}}
exit={{y:-120,opacity:0}}
transition={{duration:0.35}}
className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
>

<div className="bg-red-600/95 backdrop-blur-xl rounded-xl shadow-[0_0_70px_rgba(255,0,0,0.45)] border border-red-400/40 px-6 py-5 w-[520px]">

<div className="flex items-center gap-3 mb-2">

<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
<line x1="12" y1="9" x2="12" y2="13"/>
<line x1="12" y1="17" x2="12.01" y2="17"/>
</svg>

<span className="text-lg font-bold tracking-wide">
SIGNAL DETECTED
</span>

</div>

<div className="text-lg font-semibold leading-snug">

<span className="mr-2">{flag}</span>
{text}

</div>

<div className="text-sm text-white/80 mt-3 flex items-center gap-2">

📍 Signal Intelligence

</div>

</div>

</motion.div>

</AnimatePresence>

)

}
