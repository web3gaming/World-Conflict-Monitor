import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Incident } from "../types"

interface MapProps {
  incidents: Incident[]
}

const monitoredCountries = [
{ name:"Iran",lat:32.4279,lng:53.6880,labelOffset:[8,-8]},
{ name:"Israel",lat:31.0461,lng:34.8516,labelOffset:[8,-6]},
{ name:"Jordan",lat:30.5852,lng:36.2384,labelOffset:[8,-6]},
{ name:"Iraq",lat:33.2232,lng:43.6793,labelOffset:[8,-6]},
{ name:"Kuwait",lat:29.3117,lng:47.4818,labelOffset:[8,-6]},
{ name:"Saudi Arabia",lat:23.8859,lng:45.0792,labelOffset:[8,12]},

{ name:"Qatar",lat:25.3548,lng:51.1839,labelOffset:[10,10]},
{ name:"Bahrain",lat:26.0667,lng:50.5577,labelOffset:[12,-10]},
{ name:"UAE",lat:24.4539,lng:54.3773,labelOffset:[-22,-6]},
{ name:"Oman",lat:20.4730,lng:57.9990,labelOffset:[-18,10]}
]

export default function Map({ incidents }: MapProps){

const svgRef = useRef<SVGSVGElement>(null)
const [world,setWorld] = useState<any>(null)

useEffect(()=>{

fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
.then(res=>res.json())
.then(data=>setWorld(data))

},[])

useEffect(()=>{

if(!world || !svgRef.current) return

const width = svgRef.current.clientWidth
const height = svgRef.current.clientHeight

const svg = d3.select(svgRef.current)

svg.selectAll("*").remove()

const projection = d3.geoMercator()
.center([47,25])
.scale(width*1.55)
.translate([width/2,height/2])

const path = d3.geoPath().projection(projection)

const g = svg.append("g")

g.selectAll("path")
.data(world.features)
.enter()
.append("path")
.attr("d",path as any)
.attr("fill","#0f172a")
.attr("stroke","#64748b")
.attr("stroke-width",0.4)

const nodes = g.selectAll(".countryNode")
.data(monitoredCountries)
.enter()
.append("g")
.attr("class","countryNode")

nodes.append("circle")
.attr("r",4)
.attr("fill","#22c55e")

nodes.append("circle")
.attr("r",4)
.attr("stroke","#22c55e")
.attr("fill","none")
.attr("stroke-width",1)
.append("animate")
.attr("attributeName","r")
.attr("from","4")
.attr("to","12")
.attr("dur","2s")
.attr("repeatCount","indefinite")

nodes.append("text")
.text((d:any)=>d.name)
.attr("font-size","10px")
.attr("fill","#e2e8f0")

nodes.attr("transform",(d:any)=>{

const coords = projection([d.lng,d.lat])
return coords ? `translate(${coords[0]},${coords[1]})` : ""

})

nodes.select("text")
.attr("dx",(d:any)=>d.labelOffset[0])
.attr("dy",(d:any)=>d.labelOffset[1])

},[world])

useEffect(()=>{

if(!svgRef.current) return

const svg = d3.select(svgRef.current)

const projection = d3.geoMercator()
.center([47,25])
.scale(svgRef.current.clientWidth*1.55)
.translate([svgRef.current.clientWidth/2,svgRef.current.clientHeight/2])

const alerts = svg.selectAll(".incident")
.data(incidents,(d:any)=>d.id)

alerts.exit().remove()

const enter = alerts.enter()
.append("g")
.attr("class","incident")

enter.append("circle")
.attr("r",7)
.attr("fill","#ef4444")

enter.append("circle")
.attr("r",7)
.attr("stroke","#ef4444")
.attr("fill","none")
.attr("stroke-width",2)
.append("animate")
.attr("attributeName","r")
.attr("from","7")
.attr("to","24")
.attr("dur","1.5s")
.attr("repeatCount","indefinite")

svg.selectAll(".incident")
.attr("transform",(d:any)=>{

const coords = projection([d.location.lng,d.location.lat])
return coords ? `translate(${coords[0]},${coords[1]})` : ""

})

setTimeout(()=>{

svg.selectAll(".incident").remove()

},20000)

},[incidents])

return(

<div className="relative w-full h-full bg-[#020617] rounded-xl overflow-hidden border border-white/5">

<svg ref={svgRef} className="w-full h-full"/>

</div>

)

}
