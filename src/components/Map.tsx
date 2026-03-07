import React from "react"
import { Incident } from "../types"

type Props = {
incidents: Incident[]
onSelectIncident: (incident: Incident) => void
}

export default function Map({incidents,onSelectIncident}:Props){

const width = 900
const height = 500

const project = (lat:number,lng:number) =>{

const x = (lng + 180) * (width / 360)
const y = (90 - lat) * (height / 180)

return {x,y}

}

return(

<div className="w-full h-full relative bg-[#0b1220] rounded-xl overflow-hidden">

<img
src="/map.png"
className="absolute w-full h-full object-cover opacity-70"
/>

{incidents.map((incident)=>{

const {lat,lng} = incident.location

const pos = project(lat,lng)

return(

<div
key={incident.id}
onClick={()=>onSelectIncident(incident)}
style={{
position:"absolute",
left:pos.x,
top:pos.y
}}
className="cursor-pointer"
>

<div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute"></div>

<div className="w-4 h-4 bg-red-600 rounded-full"></div>

</div>

)

})}

</div>

)

}
