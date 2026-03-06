import React, { useEffect } from "react"

interface AlertPopupProps {
incident:any
onClose:()=>void
}

export default function AlertPopup({incident,onClose}:AlertPopupProps){

useEffect(()=>{
const timer=setTimeout(()=>{
onClose()
},6000)

return()=>clearTimeout(timer)

},[])

return(

<div style={{
position:"fixed",
top:"90px",
right:"20px",
background:"#0b0b0b",
border:"1px solid rgba(255,80,80,0.4)",
borderRadius:"10px",
padding:"14px 16px",
width:"280px",
zIndex:99999,
boxShadow:"0 0 20px rgba(255,80,80,0.2)",
animation:"slideIn 0.4s ease"
}}>

<div style={{
fontSize:"13px",
color:"#ff4d4d",
fontWeight:"bold",
marginBottom:"6px"
}}>
🚨 CRITICAL INCIDENT
</div>

<div style={{
fontSize:"14px",
color:"white",
marginBottom:"4px"
}}>
{incident.title}
</div>

<div style={{
fontSize:"12px",
color:"#aaa"
}}>
Location: {incident.location?.name || "Unknown"}
</div>

</div>

)
}
