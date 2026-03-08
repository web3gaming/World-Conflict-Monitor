import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Incident } from "../types"

interface MapProps {
  incidents: Incident[]
}

const monitoredCountries = [

{ name:"Iran",lat:32.4279,lng:53.6880,labelOffset:[8,-8],markerOffset:[0,0]},
{ name:"Israel",lat:31.0461,lng:34.8516,labelOffset:[8,-6],markerOffset:[0,0]},
{ name:"Jordan",lat:30.5852,lng:36.2384,labelOffset:[8,-6],markerOffset:[0,0]},
{ name:"Iraq",lat:33.2232,lng:43.6793,labelOffset:[8,-6],markerOffset:[0,0]},
{ name:"Kuwait",lat:29.3117,lng:47.4818,labelOffset:[8,-6],markerOffset:[0,0]},
{ name:"Saudi Arabia",lat:23.8859,lng:45.0792,labelOffset:[8,12],markerOffset:[0,0]},

/* Gulf adjustments */

{ name:"Bahrain",lat:27.00,lng:49.90,labelOffset:[0,-10],markerOffset:[0,10]},
{ name:"Qatar",lat:25.3548,lng:51.1839,labelOffset:[0,-10],markerOffset:[0,10]},
{ name:"UAE",lat:24.4539,lng:54.3773,labelOffset:[0,-10],markerOffset:[0,10]},
{ name:"Oman",lat:21.20,lng:56.30,labelOffset:[0,-10],markerOffset:[0,10]}

]

export default function Map({ incidents }: MapProps){

const svgRef = useRef<SVGSVGElement>(null)
const [world,setWorld] = useState<any>(null)

/* Memory of shown tweet markers */
const shownIncidents = useRef<Set<string>>(new Set())

useEffect(()=>{

fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
.then(res=>res.json())
.then(data=>setWorld(data))

},[])

useEffect(()=>{

if(!world || !svgRef.current) return

const width = svgRef.current.clientWidth
const height = svgRef.current.clientHeight

const svg = d3.select(svgRef.current)

svg.selectAll("*").remove()

const projection = d3.geoMercator()
.center([46,25])
.scale(width*1.45)
.translate([width/2,height/2])

const path = d3.geoPath().projection(projection)

const g = svg.append("g")

g.selectAll("path")
.data(world.features)
.enter()
.append("path")
.attr("d",path as any)
.attr("fill","#0f172a")
.attr("stroke","#64748b")
.attr("stroke-width",0.4)

/* COUNTRY MARKERS */

const nodes = g.selectAll(".countryNode")
.data(monitoredCountries)
.enter()
.append("g")
.attr("class","countryNode")

nodes.append("circle")
.attr("r",4)
.attr("fill","#22c55e")

nodes.append("circle")
.attr("r",4)
.attr("stroke","#22c55e")
.attr("fill","none")
.attr("stroke-width",1)
.append("animate")
.attr("attributeName","r")
.attr("from","4")
.attr("to","12")
.attr("dur","2s")
.attr("repeatCount","indefinite")

nodes.append("text")
.text((d:any)=>d.name)
.attr("font-size","10px")
.attr("fill","#e2e8f0")

nodes.attr("transform",(d:any)=>{

const coords = projection([d.lng,d.lat])
if(!coords) return ""

const x = coords[0] + (d.markerOffset?.[0] || 0)
const y = coords[1] + (d.markerOffset?.[1] || 0)

return `translate(${x},${y})`

})

nodes.select("text")
.attr("dx",(d:any)=>d.labelOffset[0])
.attr("dy",(d:any)=>d.labelOffset[1])

},[world])

/* ALERT MARKERS */

useEffect(()=>{

if(!svgRef.current) return

const svg = d3.select(svgRef.current)

const projection = d3.geoMercator()
.center([46,25])
.scale(svgRef.current.clientWidth*1.45)
.translate([svgRef.current.clientWidth/2,svgRef.current.clientHeight/2])

/* Only allow NEW tweet markers */

const newIncidents = incidents.filter((d:any)=>{
if(shownIncidents.current.has(d.id)) return false
shownIncidents.current.add(d.id)
return true
})

const alerts = svg.selectAll(".incident")
.data(newIncidents,(d:any)=>d.id)

const enter = alerts.enter()
.append("g")
.attr("class","incident")

enter.append("circle")
.attr("r",7)
.attr("fill","#ef4444")

enter.append("circle")
.attr("r",7)
.attr("stroke","#ef4444")
.attr("fill","none")
.attr("stroke-width",2)
.append("animate")
.attr("attributeName","r")
.attr("from","7")
.attr("to","24")
.attr("dur","1.5s")
.attr("repeatCount","indefinite")

enter.attr("transform",(d:any)=>{

const coords = projection([d.location.lng,d.location.lat])
return coords ? `translate(${coords[0]},${coords[1]})` : ""

})

/* Remove marker after 20 seconds */

setTimeout(()=>{
svg.selectAll(".incident").remove()
},20000)

},[incidents])

return(

<div className="relative w-full h-full bg-[#020617] rounded-xl overflow-hidden border border-white/5">

<svg ref={svgRef} className="w-full h-full"/>

</div>

)

}
