export function detectIncidents(tweets:any[]){

const keywords=[
"missile",
"drone",
"strike",
"attack",
"explosion",
"launch",
"airstrike"
]

return tweets
.filter(t=>
keywords.some(k=>
t.text.toLowerCase().includes(k)
)
)
.map(t=>{

let lat=32
let lng=53

if(t.text.includes("Iran")){lat=32;lng=53}
if(t.text.includes("Israel")){lat=31;lng=35}
if(t.text.includes("Saudi")){lat=24;lng=45}
if(t.text.includes("Bahrain")){lat=26;lng=50}

return{
id:t.id,
lat,
lng,
title:t.text
}

})

}
