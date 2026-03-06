import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { Incident } from '../types'

interface MapProps {
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
  selectedIncidentId?: string
}

const Map: React.FC<MapProps> = ({ incidents, onSelectIncident }) => {

const svgRef = useRef<SVGSVGElement>(null)
const gRef = useRef<any>(null)

const [worldData, setWorldData] = useState<any>(null)

useEffect(() => {
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
.then(res => res.json())
.then(data => setWorldData(data))
}, [])

useEffect(() => {

if (!worldData || !svgRef.current) return

const svg = d3.select(svgRef.current)
const width = svgRef.current.clientWidth
const height = svgRef.current.clientHeight

/* draw map only once */
if (!gRef.current) {

const projection = d3.geoMercator()
.scale(width / 6.5)
.translate([width / 2, height / 1.5])

const path = d3.geoPath().projection(projection)

const g = svg.append('g')

gRef.current = { g, projection }

const countries = topojson.feature(worldData, worldData.objects.countries) as any

g.selectAll('path')
.data(countries.features)
.enter()
.append('path')
.attr('d', path as any)
.attr('fill', '#1a1a1a')
.attr('stroke', '#333')
.attr('stroke-width', 0.5)

/* zoom */
const zoom = d3.zoom()
.scaleExtent([1,8])
.on('zoom', (event) => {
g.attr('transform', event.transform)
})

svg.call(zoom as any)

}

const { g, projection } = gRef.current

/* update incidents */

const points = g.selectAll('.incident-point')
.data(incidents, (d:any) => d.id)

points.exit().remove()

const newPoints = points.enter()
.append('g')
.attr('class','incident-point')
.style('cursor','pointer')
.on('click',function(event,d){
event.stopPropagation()
onSelectIncident(d)
})

newPoints.append('circle')
.attr('r', d => d.severity === 'critical' ? 8 : 4)
.attr('fill', d => {
if (d.severity === 'critical') return '#ef4444'
if (d.severity === 'high') return '#f97316'
return '#eab308'
})
.attr('opacity',0.8)

newPoints.filter(d => d.severity === 'critical' || d.severity === 'high')
.append('circle')
.attr('r',4)
.attr('fill','none')
.attr('stroke', d => d.severity === 'critical' ? '#ef4444' : '#f97316')
.attr('stroke-width',1)
.append('animate')
.attr('attributeName','r')
.attr('from','4')
.attr('to','20')
.attr('dur','1.5s')
.attr('repeatCount','indefinite')

newPoints.filter(d => d.severity === 'critical' || d.severity === 'high')
.select('circle:last-child')
.append('animate')
.attr('attributeName','opacity')
.attr('from','0.8')
.attr('to','0')
.attr('dur','1.5s')
.attr('repeatCount','indefinite')

g.selectAll('.incident-point')
.attr('transform', (d:any)=>{
const coords = projection([d.location.lng, d.location.lat])
return coords ? `translate(${coords[0]},${coords[1]})` : ''
})

}, [worldData, incidents])

return (

<div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5">

<svg ref={svgRef} className="w-full h-full" />

<div className="radar-overlay"></div>

{incidents.length === 0 && (

<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">

<div className="flex flex-col items-center gap-4">

<div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />

<div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
Synchronizing Global Intelligence...
</div>

</div>

</div>

)}

<style>{`

.radar-overlay{
position:absolute;
top:0;
left:0;
width:100%;
height:100%;
pointer-events:none;
background: radial-gradient(circle at center, transparent 60%, rgba(0,255,150,0.05) 100%);
}

.radar-overlay::after{
content:"";
position:absolute;
width:60%;
height:60%;
top:20%;
left:20%;
border-radius:50%;
border:2px solid rgba(0,255,150,0.2);
animation:radarSweep 6s linear infinite;
}

@keyframes radarSweep{
0%{transform:rotate(0deg);}
100%{transform:rotate(360deg);}
}

`}</style>

</div>

)

}

export default Map
