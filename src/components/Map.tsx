import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"

interface Incident {
  id:string
  lat:number
  lng:number
  title:string
}

interface Props {
  incidents:Incident[]
}

const monitoredCountries = [
{ name:"Iran",lat:32,lng:53 },
{ name:"Israel",lat:31.5,lng:35 },
{ name:"Jordan",lat:31,lng:36 },
{ name:"Iraq",lat:33,lng:44 },
{ name:"Kuwait",lat:29.3,lng:47.5 },
{ name:"Saudi Arabia",lat:24,lng:45 },
{ name:"Qatar",lat:25.3,lng:51.2 },
{ name:"Bahrain",lat:26,lng:50.5 },
{ name:"UAE",lat:24,lng:54 },
{ name:"Oman",lat:21,lng:55 }
]

const Map:React.FC<Props> = ({incidents})=>{

const svgRef=useRef<SVGSVGElement|null>(null)

useEffect(()=>{

if(!svgRef.current)return

const width=svgRef.current.clientWidth
const height=svgRef.current.clientHeight

const svg=d3.select(svgRef.current)

svg.selectAll("*").remove()

const projection=d3.geoMercator()
.center([45,27])
.scale(width*1.4)
.translate([width/2,height/2])

const path=d3.geoPath().projection(projection)

const g=svg.append("g")

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
.then((world:any)=>{

const countries=topojson.feature(
world,
world.objects.countries
)

g.selectAll("path")
.data(countries.features)
.enter()
.append("path")
.attr("d",path as any)
.attr("fill",(d:any)=>{

const name=d.properties.name

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
return "#1e3a5f"
}

return "#0f0f0f"

})
.attr("stroke","#666")
.attr("stroke-width",0.6)

})

},[])

useEffect(()=>{

if(!svgRef.current)return

const svg=d3.select(svgRef.current)

const projection=d3.geoMercator()
.center([45,27])
.scale(svgRef.current.clientWidth*1.4)
.translate([
svgRef.current.clientWidth/2,
svgRef.current.clientHeight/2
])

const nodes=svg.selectAll(".countryNode")
.data(monitoredCountries)

const enter=nodes.enter()
.append("g")
.attr("class","countryNode")

enter.append("circle")
.attr("r",4)
.attr("fill","#00ffaa")

enter.append("text")
.text((d:any)=>d.name)
.attr("font-size","10px")
.attr("fill","#ccc")
.attr("dx",6)
.attr("dy",-6)

svg.selectAll(".countryNode")
.attr("transform",(d:any)=>{

const p=projection([d.lng,d.lat])

return`translate(${p[0]},${p[1]})`

})

},[])

useEffect(()=>{

if(!svgRef.current)return

const svg=d3.select(svgRef.current)

const projection=d3.geoMercator()
.center([45,27])
.scale(svgRef.current.clientWidth*1.4)
.translate([
svgRef.current.clientWidth/2,
svgRef.current.clientHeight/2
])

const alerts=svg.selectAll(".incident")
.data(incidents,(d:any)=>d.id)

alerts.exit().remove()

const enter=alerts.enter()
.append("g")
.attr("class","incident")

enter.append("circle")
.attr("r",7)
.attr("fill","#ff4444")

enter.append("circle")
.attr("r",7)
.attr("stroke","#ff4444")
.attr("fill","none")
.attr("stroke-width",2)
.append("animate")
.attr("attributeName","r")
.attr("from","7")
.attr("to","18")
.attr("dur","1.5s")
.attr("repeatCount","indefinite")

svg.selectAll(".incident")
.attr("transform",(d:any)=>{

const p=projection([d.lng,d.lat])

return`translate(${p[0]},${p[1]})`

})

},[incidents])

return(

<div className="w-full h-full bg-black">

<svg
ref={svgRef}
className="w-full h-full"
/>

</div>

)

}

export default Map
