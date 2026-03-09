import React,{useEffect,useRef} from "react"
import * as d3 from "d3"

export default function Map({animationEvent}:any){

const svgRef = useRef<SVGSVGElement>(null)

useEffect(()=>{

const svg = d3.select(svgRef.current)

const width = svgRef.current!.clientWidth
const height = svgRef.current!.clientHeight

svg.selectAll("*").remove()

const projection = d3.geoMercator()
.center([46,25])
.scale(width*1.45)
.translate([width/2,height/2])

/* ANIMATION */

if(animationEvent){

const g = svg.append("g")

const target = projection([animationEvent.target.lng,animationEvent.target.lat])

if(animationEvent.origin){

const origin = projection([animationEvent.origin.lng,animationEvent.origin.lat])

const midX = (origin![0]+target![0])/2
const midY = Math.min(origin![1],target![1]) - 120

const path = g.append("path")
.attr("d",`M ${origin![0]} ${origin![1]} Q ${midX} ${midY} ${target![0]} ${target![1]}`)
.attr("stroke","#ff6b00")
.attr("stroke-width",2)
.attr("fill","none")

const length = path.node()!.getTotalLength()

path
.attr("stroke-dasharray",length)
.attr("stroke-dashoffset",length)
.transition()
.duration(3000)
.attr("stroke-dashoffset",0)

}

/* IMPACT */

const impact = g.append("circle")
.attr("cx",target![0])
.attr("cy",target![1])
.attr("r",6)
.attr("fill","#ff3b3b")

impact
.transition()
.duration(800)
.attr("r",40)
.attr("opacity",0)
.remove()

}

},[animationEvent])

return(

<div style={{width:"100%",height:"100%",background:"#020617"}}>

<svg ref={svgRef} style={{width:"100%",height:"100%"}} />

</div>

)

}
