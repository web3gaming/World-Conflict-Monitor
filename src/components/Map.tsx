import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import { Incident } from "../types"

interface MapProps {
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
}

const Map: React.FC<MapProps> = ({ incidents, onSelectIncident }) => {

const svgRef = useRef<SVGSVGElement>(null)
const mapLayer = useRef<any>(null)
const projectionRef = useRef<any>(null)

const [worldData, setWorldData] = useState<any>(null)

useEffect(() => {
fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
.then(res => res.json())
.then(data => setWorldData(data))
}, [])

/* CREATE MAP */

useEffect(() => {

if (!worldData || !svgRef.current) return
if (mapLayer.current) return

const svg = d3.select(svgRef.current)

const width = svgRef.current.clientWidth
const height = svgRef.current.clientHeight

const projection = d3.geoMercator()
.scale(width / 6.5)
.translate([width / 2, height / 1.5])

projectionRef.current = projection

const path = d3.geoPath().projection(projection)

const g = svg.append("g")

mapLayer.current = g

const countries = topojson.feature(
worldData,
worldData.objects.countries
) as any

g.selectAll("path")
.data(countries.features)
.enter()
.append("path")
.attr("d", path as any)
.attr("fill", "#1a1a1a")
.attr("stroke", "#333")
.attr("stroke-width", 0.5)

/* DRAG / PAN */

const drag = d3.drag()
.on("drag", (event) => {

const currentTransform = g.attr("transform")

let x = 0
let y = 0

if (currentTransform) {
const match = currentTransform.match(/translate\(([^,]+),([^)]+)\)/)
if (match) {
x = parseFloat(match[1])
y = parseFloat(match[2])
}
}

x += event.dx
y += event.dy

g.attr("transform", `translate(${x},${y})`)

})

svg.call(drag as any)

}, [worldData])


/* INCIDENT UPDATE */

useEffect(() => {

if (!mapLayer.current || !projectionRef.current) return

const g = mapLayer.current
const projection = projectionRef.current

const points = g.selectAll(".incident")
.data(incidents, (d:any)=>d.id)

points.exit().remove()

const enter = points.enter()
.append("g")
.attr("class","incident")
.style("cursor","pointer")
.on("click",(event,d)=>{
event.stopPropagation()
onSelectIncident(d)
})

enter.append("circle")
.attr("r",6)
.attr("fill","#f97316")
.attr("opacity",0.9)

enter.append("circle")
.attr("r",4)
.attr("fill","none")
.attr("stroke","#f97316")
.attr("stroke-width",1)
.append("animate")
.attr("attributeName","r")
.attr("from","4")
.attr("to","18")
.attr("dur","1.6s")
.attr("repeatCount","indefinite")

enter.select("circle:last-child")
.append("animate")
.attr("attributeName","opacity")
.attr("from","0.8")
.attr("to","0")
.attr("dur","1.6s")
.attr("repeatCount","indefinite")

g.selectAll(".incident")
.attr("transform",(d:any)=>{
const coords = projection([d.location.lng,d.location.lat])
return coords ? `translate(${coords[0]},${coords[1]})` : ""
})

/* MAP FLASH WHEN NEW INCIDENT */

const latest = incidents[0]

if(latest){

const coords = projection([latest.location.lng, latest.location.lat])

if(coords){

const flash = g.append("circle")
.attr("cx",coords[0])
.attr("cy",coords[1])
.attr("r",10)
.attr("fill","none")
.attr("stroke","#ff3b3b")
.attr("stroke-width",2)

flash.transition()
.duration(900)
.attr("r",60)
.style("opacity",0)
.remove()

}

}

},[incidents])


/* DRONE / MISSILE TRAJECTORY */

useEffect(()=>{

if(!mapLayer.current || !projectionRef.current) return
if(incidents.length < 2) return

const g = mapLayer.current
const projection = projectionRef.current

const from = incidents[1]
const to = incidents[0]

const start = projection([from.location.lng,from.location.lat])
const end = projection([to.location.lng,to.location.lat])

if(!start || !end) return

const line = g.append("line")
.attr("x1",start[0])
.attr("y1",start[1])
.attr("x2",start[0])
.attr("y2",start[1])
.attr("stroke","#ff3b3b")
.attr("stroke-width",2)
.attr("stroke-dasharray","6 4")

line.transition()
.duration(1200)
.attr("x2",end[0])
.attr("y2",end[1])
.remove()

const impact = g.append("circle")
.attr("cx",end[0])
.attr("cy",end[1])
.attr("r",6)
.attr("fill","#ff3b3b")

impact.transition()
.duration(800)
.attr("r",30)
.style("opacity",0)
.remove()

},[incidents])


return (

<div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5">

<svg ref={svgRef} className="w-full h-full"/>

</div>

)

}

export default Map
