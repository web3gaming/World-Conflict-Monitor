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

const zoom = d3.zoom()
.scaleExtent([1,8])
.on('zoom', (event) => {
g.attr('transform', event.transform)
})

svg.call(zoom as any)

gRef.current.zoom = zoom
gRef.current.svg = svg

}

const { g, projection } = gRef.current

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

const zoomIn = () => {
if (!gRef.current) return
gRef.current.svg.transition().call(
gRef.current.zoom.scaleBy,
1.2
)
}

const zoomOut = () => {
if (!gRef.current) return
gRef.current.svg.transition().call(
gRef.current.zoom.scaleBy,
0.8
)
}

const fullscreen = () => {
const element = svgRef.current?.parentElement
if (!element) return

if (!document.fullscreenElement) {
element.requestFullscreen()
} else {
document.exitFullscreen()
}
}

return (

<div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5">

<svg ref={svgRef} className="w-full h-full" />

<div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">

<button
onClick={zoomIn}
className="w-9 h-9 bg-black/70 border border-white/20 rounded flex items-center justify-center text-white hover:bg-black"
>
+
</button>

<button
onClick={zoomOut}
className="w-9 h-9 bg-black/70 border border-white/20 rounded flex items-center justify-center text-white hover:bg-black"
>
-
</button>

<button
onClick={fullscreen}
className="w-9 h-9 bg-black/70 border border-white/20 rounded flex items-center justify-center text-white hover:bg-black"
>
⛶
</button>

</div>

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

</div>

)

}

export default Map
