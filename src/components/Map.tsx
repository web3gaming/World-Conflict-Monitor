import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import { Incident } from "../types"

interface MapProps {
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
}

const monitoredCountries = [
  { name: "Iran", lat: 32.4, lng: 53.7 },
  { name: "Israel", lat: 31.5, lng: 34.8 },
  { name: "Saudi Arabia", lat: 23.9, lng: 45.0 },
  { name: "Qatar", lat: 25.3, lng: 51.2 },
  { name: "UAE", lat: 24.3, lng: 54.4 },
  { name: "Kuwait", lat: 29.3, lng: 47.5 },
  { name: "Bahrain", lat: 26.0, lng: 50.5 },
  { name: "Oman", lat: 21.5, lng: 55.9 },
  { name: "Jordan", lat: 31.2, lng: 36.3 },
  { name: "Iraq", lat: 33.2, lng: 44.4 }
]

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

  useEffect(() => {

    if (!worldData || !svgRef.current) return
    if (mapLayer.current) return

    const svg = d3.select(svgRef.current)

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    /* Middle East focused projection */
    const projection = d3.geoMercator()
      .center([45, 27])
      .scale(width * 1.4)
      .translate([width / 2, height / 2])

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
      .attr("fill", "#111")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.6)

  }, [worldData])

  /* COUNTRY NODES */

  useEffect(() => {

    if (!mapLayer.current || !projectionRef.current) return

    const g = mapLayer.current
    const projection = projectionRef.current

    const nodes = g.selectAll(".country-node")
      .data(monitoredCountries)

    const enter = nodes.enter()
      .append("g")
      .attr("class", "country-node")

    enter.append("circle")
      .attr("r", 3)
      .attr("fill", "#00ffaa")

    enter.append("circle")
      .attr("r", 4)
      .attr("fill", "none")
      .attr("stroke", "#00ffaa")
      .attr("stroke-width", 1)
      .append("animate")
      .attr("attributeName", "r")
      .attr("from", "4")
      .attr("to", "10")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite")

    enter.append("text")
      .text((d: any) => d.name)
      .attr("fill", "#ccc")
      .attr("font-size", "10px")
      .attr("dx", 6)
      .attr("dy", -6)

    g.selectAll(".country-node")
      .attr("transform", (d: any) => {
        const coords = projection([d.lng, d.lat])
        return coords ? `translate(${coords[0]},${coords[1]})` : ""
      })

  }, [worldData])

  /* INCIDENT MARKERS */

  useEffect(() => {

    if (!mapLayer.current || !projectionRef.current) return

    const g = mapLayer.current
    const projection = projectionRef.current

    const points = g.selectAll(".incident")
      .data(incidents, (d: any) => d.id)

    points.exit().remove()

    const enter = points.enter()
      .append("g")
      .attr("class", "incident")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onSelectIncident(d)
      })

    enter.append("circle")
      .attr("r", 6)
      .attr("fill", "#ff4444")

    enter.append("circle")
      .attr("r", 6)
      .attr("fill", "none")
      .attr("stroke", "#ff4444")
      .attr("stroke-width", 1)
      .append("animate")
      .attr("attributeName", "r")
      .attr("from", "6")
      .attr("to", "18")
      .attr("dur", "1.6s")
      .attr("repeatCount", "indefinite")

    g.selectAll(".incident")
      .attr("transform", (d: any) => {
        const coords = projection([d.location.lng, d.location.lat])
        return coords ? `translate(${coords[0]},${coords[1]})` : ""
      })

  }, [incidents])

  return (

    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl border border-white/5">

      <svg ref={svgRef} className="w-full h-full" />

    </div>

  )

}

export default Map
