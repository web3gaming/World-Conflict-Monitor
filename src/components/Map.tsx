import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import { Incident } from "../types"

interface Props {
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
}

const monitoredCountries = [
{ name:"Iran",lat:32.4279,lng:53.6880 },
{ name:"Israel",lat:31.0461,lng:34.8516 },
{ name:"Jordan",lat:30.5852,lng:36.2384 },
{ name:"Iraq",lat:33.2232,lng:43.6793 },
{ name:"Kuwait",lat:29.3117,lng:47.4818 },
{ name:"Saudi Arabia",lat:23.8859,lng:45.0792 },
{ name:"Qatar",lat:25.3548,lng:51.1839 },
{ name:"Bahrain",lat:26.0667,lng:50.5577 },
{ name:"UAE",lat:24.4539,lng:54.3773 },
{ name:"Oman",lat:20.4730,lng:57.9990 }
]

export default function Map({ incidents, onSelectIncident }: Props){

const svgRef = useRef<SVGSVGElement | null>(null)

useEffect(()=>{

if(!svgRef.current) return

const width = svgRef.current.clientWidth
const height = svgRef.current.clientHeight

const svg = d3.select(svgRef.current)

svg.selectAll("*").remove()

const projection = d3.geoMercator()
.center([47,26])
.scale(width*1.6)
.translate([width/2,height/2])

const path = d3.geoPath().projection(projection)

const g = svg.append("g")

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
.then((world:any)=>{

const countries = topojson.feature(
world,
world.objects.countries
)

g.selectAll("path")
.data(countries.features)
.enter()
.append("path")
.attr("d",path as any)
.attr("fill",(d:any)=>{

const name = d.properties.name

if(
name==="Iran"||
name==="Israel"||
name==="Jordan"||
name==="Iraq"||
name==="Kuwait"||
name==="Saudi Arabia"||
name==="Qatar"||
name==="Bahrain"||
name==="United Arab Emirates"||
name==="Oman"
){
return "#1f4c7d"
}

return "#0b0b0b"

})
.attr("stroke","#888")
.attr("stroke-width",0.6)

})

},[])



useEffect(()=>{

if(!svgRef.current) return

const svg = d3.select(svgRef.current)

const projection = d3.geoMercator()
.center([47,26])
.scale(svgRef.current.clientWidth*1.6)
.translate([
svgRef.current.clientWidth/2,
svgRef.current.clientHeight/2
])

const nodes = svg.selectAll(".countryNode")
.data(monitoredCountries)

const enter = nodes.enter()
.append("g")
.attr("class","countryNode")

/* core dot */

enter.append("circle")
.attr("r",4)
.attr("fill","#00ffaa")

/* glowing radar pulse */

enter.append("circle")
.attr("r",4)
.attr("fill","none")
.attr("stroke","#00ffaa")
.attr("stroke-width",1)
.append("animate")
.attr("attributeName","r")
.attr("from","4")
.attr("to","12")
.attr("dur","2s")
.attr("repeatCount","indefinite")

/* country label */

enter.append("text")
.text((d:any)=>d.name)
.attr("font-size","10px")
.attr("fill","#d1d5db")
.attr("dx",6)
.attr("dy",-6)

svg.selectAll(".countryNode")
.attr("transform",(d:any)=>{

const p = projection([d.lng,d.lat])

return `translate(${p[0]},${p[1]})`

})

},[])



useEffect(()=>{

if(!svgRef.current) return

const svg = d3.select(svgRef.current)

const projection = d3.geoMercator()
.center([47,26])
.scale(svgRef.current.clientWidth*1.6)
.translate([
svgRef.current.clientWidth/2,
svgRef.current.clientHeight/2
])

const alerts = svg.selectAll(".incident")
.data(incidents,(d:any)=>d.id)

alerts.exit().remove()

const enter = alerts.enter()
.append("g")
.attr("class","incident")
.style("cursor","pointer")
.on("click",(event,d)=>{

event.stopPropagation()

onSelectIncident(d)

})

/* red alert center */

enter.append("circle")
.attr("r",7)
.attr("fill","#ff3b3b")

/* radar expansion */

enter.append("circle")
.attr("r",7)
.attr("stroke","#ff3b3b")
.attr("fill","none")
.attr("stroke-width",2)
.append("animate")
.attr("attributeName","r")
.attr("from","7")
.attr("to","20")
.attr("dur","1.5s")
.attr("repeatCount","indefinite")

svg.selectAll(".incident")
.attr("transform",(d:any)=>{

const p = projection([d.location.lng,d.location.lat])

return `translate(${p[0]},${p[1]})`

})

},[incidents])



return(

<div className="w-full h-full bg-[#050505] rounded-xl overflow-hidden">

<svg
ref={svgRef}
className="w-full h-full"
/>

</div>

)

}
