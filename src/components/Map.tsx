import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Incident } from '../types';

interface MapProps {
incidents: Incident[];
onSelectIncident: (incident: Incident) => void;
selectedIncidentId?: string;
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

if (!worldData || !svgRef.current) return;

const svg = d3.select(svgRef.current);
const width = svgRef.current.clientWidth;
const height = svgRef.current.clientHeight;

svg.selectAll('*').remove();

const projection = d3.geoMercator()
  .scale(width / 6.5)
  .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

const g = svg.append('g');

const countries = topojson.feature(worldData, worldData.objects.countries) as any;

g.selectAll('path')
  .data(countries.features)
  .enter()
  .append('path')
  .attr('d', path as any)
  .attr('fill', '#1a1a1a')
  .attr('stroke', '#333')
  .attr('stroke-width', 0.5);

const points = g.selectAll('.incident-point')
  .data(incidents)
  .enter()
  .append('g')
  .attr('class', 'incident-point')
  .attr('transform', d => {
    const coords = projection([d.location.lng, d.location.lat]);
    return coords ? `translate(${coords[0]}, ${coords[1]})` : '';
  })
  .style('cursor', 'pointer')
  .on('click', function (event, d) {
    event.stopPropagation();
    onSelectIncident(d);
  });

points.append('circle')
  .attr('r', d => d.severity === 'critical' ? 8 : 4)
  .attr('fill', d => {
    if (d.severity === 'critical') return '#ef4444';
    if (d.severity === 'high') return '#f97316';
    return '#eab308';
  })
  .attr('opacity', 0.8);

const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });

zoomRef.current = zoom;

svg.call(zoom as any);

}, [worldData, incidents]);

const zoomIn = () => {
if (!svgRef.current || !zoomRef.current) return;
d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.3);
};

const zoomOut = () => {
if (!svgRef.current || !zoomRef.current) return;
d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.7);
};

const toggleFullscreen = () => {
if (!containerRef.current) return;
if (!document.fullscreenElement) {
containerRef.current.requestFullscreen();
} else {
document.exitFullscreen();
}
};

return (

<div ref={containerRef} className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5">

  <svg ref={svgRef} className="w-full h-full" />

  {/* Radar Sweep */}
  <div className="radar-overlay"></div>

  {/* Controls */}
  <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">

    <button
      onClick={zoomIn}
      className="w-9 h-9 bg-black/60 border border-white/20 rounded flex items-center justify-center hover:bg-black/80"
    >
      +
    </button>

    <button
      onClick={zoomOut}
      className="w-9 h-9 bg-black/60 border border-white/20 rounded flex items-center justify-center hover:bg-black/80"
    >
      −
    </button>

    <button
      onClick={toggleFullscreen}
      className="w-9 h-9 bg-black/60 border border-white/20 rounded flex items-center justify-center hover:bg-black/80"
    >
      ⛶
    </button>

  </div>

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
      border:2px solid rgba(0,255,150,0.25);
      animation:radarSweep 5s linear infinite;
    }

    @keyframes radarSweep{
      0%{transform:rotate(0deg);}
      100%{transform:rotate(360deg);}
    }

  `}</style>

</div>

);

};

export default Map;
