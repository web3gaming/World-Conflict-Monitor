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

points.filter(d => d.severity === 'critical' || d.severity === 'high')
  .append('circle')
  .attr('r', 4)
  .attr('fill', 'none')
  .attr('stroke', d => d.severity === 'critical' ? '#ef4444' : '#f97316')
  .attr('stroke-width', 1)
  .append('animate')
  .attr('attributeName', 'r')
  .attr('from', '4')
  .attr('to', '20')
  .attr('dur', '1.5s')
  .attr('repeatCount', 'indefinite');

points.filter(d => d.severity === 'critical' || d.severity === 'high')
  .select('circle:last-child')
  .append('animate')
  .attr('attributeName', 'opacity')
  .attr('from', '0.8')
  .attr('to', '0')
  .attr('dur', '1.5s')
  .attr('repeatCount', 'indefinite');

const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });

svg.call(zoom as any);

}, [worldData, incidents]);

return (

<div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5">

  <svg ref={svgRef} className="w-full h-full" />

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

  <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">

    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
      <div className="w-2 h-2 rounded-full bg-red-500" /> Critical Incident
    </div>

    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
      <div className="w-2 h-2 rounded-full bg-orange-500" /> High Alert
    </div>

    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
      <div className="w-2 h-2 rounded-full bg-yellow-500" /> Active Movement
    </div>

  </div>

</div>

);

};

export default Map;
