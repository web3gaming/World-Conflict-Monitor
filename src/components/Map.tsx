import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Incident } from '../types';

interface MapProps {
incidents: Incident[];
onSelectIncident: (incident: Incident) => void;
}

const Map: React.FC<MapProps> = ({ incidents, onSelectIncident }) => {

const svgRef = useRef<SVGSVGElement>(null);
const containerRef = useRef<HTMLDivElement>(null);
const zoomRef = useRef<any>(null);
const [worldData, setWorldData] = useState<any>(null);

useEffect(() => {
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
.then(res => res.json())
.then(data => setWorldData(data));
}, []);

useEffect(() => {

if (!worldData || !svgRef.current || !containerRef.current) return;

const width = containerRef.current.offsetWidth;
const height = containerRef.current.offsetHeight;

const svg = d3.select(svgRef.current)
.attr("width", width)
.attr("height", height);

svg.selectAll("*").remove();

const projection = d3.geoMercator()
.scale(width / 6)
.translate([width / 2, height / 1.55]);

const path = d3.geoPath().projection(projection);

const g = svg.append("g");

const countries = topojson.feature(worldData, worldData.objects.countries) as any;

g.selectAll("path")
.data(countries.features)
.enter()
.append("path")
.attr("d", path as any)
.attr("fill", "#1a1a1a")
.attr("stroke", "#333")
.attr("stroke-width", 0.5);

const points = g.selectAll(".incident")
.data(incidents)
.enter()
.append("circle")
.attr("class","incident")
.attr("cx", d => projection([d.location.lng, d.location.lat])?.[0] || 0)
.attr("cy", d => projection([d.location.lng, d.location.lat])?.[1] || 0)
.attr("r", d => d.severity === "critical" ? 7 : 4)
.attr("fill", d => {
if(d.severity==="critical") return "#ef4444";
if(d.severity==="high") return "#f97316";
return "#eab308";
})
.style("cursor","pointer")
.on("click", (_,d)=> onSelectIncident(d));

const zoom = d3.zoom()
.scaleExtent([1,8])
.on("zoom", (event)=>{
g.attr("transform",event.transform);
});

zoomRef.current = zoom;

svg.call(zoom as any);

},[worldData,incidents]);

const zoomIn = () => {
if(!svgRef.current || !zoomRef.current) return;
d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy,1.3);
};

const zoomOut = () => {
if(!svgRef.current || !zoomRef.current) return;
d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy,0.7);
};

const fullscreen = () => {
if(!containerRef.current) return;

if(!document.fullscreenElement){
containerRef.current.requestFullscreen();
}else{
document.exitFullscreen();
}
};

return (

<div
ref={containerRef}
className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5"
><svg ref={svgRef} className="absolute inset-0 w-full h-full" />{/* Radar */}

<div className="radar"></div>{/* Controls */}

<div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20"><button onClick={zoomIn}
className="w-9 h-9 bg-black/70 border border-white/20 rounded flex items-center justify-center text-white">
+
</button>

<button onClick={zoomOut}
className="w-9 h-9 bg-black/70 border border-white/20 rounded flex items-center justify-center text-white">
−
</button>

<button onClick={fullscreen}
className="w-9 h-9 bg-black/70 border border-white/20 rounded flex items-center justify-center text-white">
⛶
</button>

</div><style>{`

.radar{
position:absolute;
top:50%;
left:50%;
width:420px;
height:420px;
margin-left:-210px;
margin-top:-210px;
border-radius:50%;
border:2px solid rgba(0,255,150,0.35);
pointer-events:none;
animation:spin 6s linear infinite;
}

@keyframes spin{
0%{transform:rotate(0deg)}
100%{transform:rotate(360deg)}
}

`}</style></div>);

};

export default Map;
