import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import { Incident } from "../types"

interface MapProps {
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
}

const monitoredCountries = [
{ name:"Iran", lat:32.4, lng:53.7 },
{ name:"Israel", lat:31.5, lng:34.8 },
{ name:"Saudi Arabia", lat:23.9, lng:45.0 },
{ name:"Qatar", lat:25.3, lng:51.2 },
{ name:"UAE", lat:24.3, lng:54.4 },
{ name:"Kuwait", lat:29.3, lng:47.5 },
{ name:"Bahrain", lat:26.0, lng:50.5 },
{ name:"Oman", lat:21.5, lng:55.9 },
{ name:"Jordan", lat:31.2, lng:36.3 },
{ name:"Iraq", lat:33.2, lng:44.4 }
]

const Map: React.FC<MapProps> = ({ incidents, onSelectIncident }) => {

const svgRef = useRef<SVGSVGElement>(null)
const projectionRef = useRef<any>(null)
const layerRef = useRef<any>(null)

const [worldData,setWorldData] = useState<any>(null)

useEffect(()=>{
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
.then(res=>res.json())
.then(data=>setWorldData(data))
},[])

useEffect(()=>{

if(!worldData || !svgRef.current) return

const svg = d3.select(svgRef.current)

const width = svgRef.current.clientWidth
const height = svgRef.current.clientHeight

svg.selectAll("*").remove()

const projection = d3.geoMercator()
.scale(width/6.5)
.translate([width/2,height/1.5])

projectionRef.current = projection

const path = d3.geoPath().projection(projection)

const g = svg.append("g")
layerRef.current = g

const countries = topojson.feature(
worldData,
worldData.objects.countries
) as any

g.selectAll("path")
.data(countries.features)
.enter()
.append("path")
.attr("d",path as any)
.attr("fill","#111")
.attr("stroke","#333")
.attr("stroke-width",0.5)

},[worldData])

useEffect(()=>{

if(!layerRef.current || !projectionRef.current) return

const g = layerRef.current
const projection = projectionRef.current

const nodes = g.selectAll(".node")
.data(monitoredCountries)

nodes.enter()
.append("circle")
.attr("class","node")
.attr("r",3)
.attr("fill","#00ffaa")
.attr("opacity",0.6)
.attr("transform",(d:any)=>{

const coords = projection([d.lng,d.lat])

return `translate(${coords[0]},${coords[1]})`

})

.append("animate")
.attr("attributeName","r")
.attr("from","3")
.attr("to","7")
.attr("dur","2s")
.attr("repeatCount","indefinite")

},[worldData])

useEffect(()=>{

if(!layerRef.current || !projectionRef.current) return

const g = layerRef.current
const projection = projectionRef.current

const points = g.selectAll(".incident")
.data(incidents,(d:any)=>d.id)

points.exit().remove()

const enter = points.enter()
.append("circle")
.attr("class","incident")
.attr("r",6)
.attr("fill","#ff4444")
.attr("opacity",0.9)
.style("cursor","pointer")
.on("click",(event,d)=>{
onSelectIncident(d)
})

enter.append("animate")
.attr("attributeName","r")
.attr("from","6")
.attr("to","16")
.attr("dur","1.5s")
.attr("repeatCount","indefinite")

g.selectAll(".incident")
.attr("transform",(d:any)=>{

const coords = projection([d.location.lng,d.location.lat])

return `translate(${coords[0]},${coords[1]})`

})

},[incidents])

return (

<div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5">

<svg ref={svgRef} className="w-full h-full"/>

</div>

)

}

export default Map
