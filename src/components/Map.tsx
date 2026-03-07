import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"

const warCountries = [
  { name: "Iran", lat: 32, lng: 53 },
  { name: "Israel", lat: 31.5, lng: 35 },
  { name: "USA", lat: 38, lng: -97 },
  { name: "Kuwait", lat: 29.3, lng: 47.5 },
  { name: "Bahrain", lat: 26, lng: 50.5 },
  { name: "Oman", lat: 21, lng: 57 },
  { name: "Saudi Arabia", lat: 24, lng: 45 },
  { name: "Qatar", lat: 25.3, lng: 51.2 },
  { name: "UAE", lat: 24, lng: 54 },
  { name: "Jordan", lat: 31, lng: 36 }
]

const Map = () => {

const svgRef = useRef<SVGSVGElement>(null)

useEffect(() => {

const width = 1200
const height = 600

const svg = d3.select(svgRef.current)

const projection = d3.geoMercator()
.scale(180)
.translate([width / 2, height / 1.6])

const path = d3.geoPath().projection(projection)

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
.then((data:any)=>{

const countries = topojson.feature(
data,
data.objects.countries
)

svg.append("g")
.selectAll("path")
.data(countries.features)
.enter()
.append("path")
.attr("d", path)
.attr("fill", "#0f172a")
.attr("stroke", "#334155")
.attr("stroke-width",0.5)



/* COUNTRY LABELS */

svg.append("g")
.selectAll("text")
.data(warCountries)
.enter()
.append("text")
.attr("x",(d)=>{
const coords = projection([d.lng,d.lat])
return coords ? coords[0] : 0
})
.attr("y",(d)=>{
const coords = projection([d.lng,d.lat])
return coords ? coords[1] : 0
})
.text(d=>d.name)
.attr("fill","#f97316")
.attr("font-size","12px")
.attr("text-anchor","middle")



/* RADAR PULSE */

const radar = svg.append("g")

warCountries.forEach((c)=>{

const coords = projection([c.lng,c.lat])

if(!coords) return

const circle = radar.append("circle")
.attr("cx",coords[0])
.attr("cy",coords[1])
.attr("r",4)
.attr("fill","#fb923c")

function pulse(){

circle
.transition()
.duration(1500)
.attr("r",40)
.style("opacity",0)
.on("end",()=>{
circle
.attr("r",4)
.style("opacity",1)
pulse()
})

}

pulse()

})



/* MISSILE TRAJECTORY EXAMPLE */

const iran = projection([53,32])
const israel = projection([35,31.5])

if(iran && israel){

const line = d3.line().curve(d3.curveBasis)

const pathData = line([
[iran[0],iran[1]],
[(iran[0]+israel[0])/2 , iran[1]-120],
[israel[0],israel[1]]
])

svg.append("path")
.attr("d",pathData!)
.attr("stroke","#ef4444")
.attr("stroke-width",2)
.attr("fill","none")
.attr("stroke-dasharray","5,5")

}

})

},[])

return (
<div className="w-full h-full bg-black rounded-xl">
<svg ref={svgRef} width="100%" height="100%" />
</div>
)

}

export default Map
