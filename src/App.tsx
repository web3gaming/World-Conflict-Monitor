import React,{useEffect,useState,useRef} from "react"
import Map from "./components/Map"

export default function App(){

const [animationEvent,setAnimationEvent] = useState<any>(null)

const lastTweet = useRef<string | null>(null)

/* LOCATION DATABASE */

const locations:any = {

iran:{name:"Iran",lat:32.427,lng:53.688},
israel:{name:"Israel",lat:31.046,lng:34.851},
baghdad:{name:"Baghdad",lat:33.315,lng:44.366},
kuwait:{name:"Kuwait",lat:29.311,lng:47.481},
qatar:{name:"Qatar",lat:25.354,lng:51.183},
bahrain:{name:"Bahrain",lat:26.066,lng:50.557},
oman:{name:"Oman",lat:20.473,lng:57.999},
uae:{name:"UAE",lat:24.453,lng:54.377}

}

/* TWITTER MONITOR */

useEffect(()=>{

const checkTweets = async()=>{

try{

const res = await fetch("/api/twitter")
const data = await res.json()

if(!data.success) return

const tweet = data.tweets?.[0]

if(!tweet) return

if(lastTweet.current === tweet.url) return

lastTweet.current = tweet.url

const text = tweet.text.toLowerCase()

let target:any=null
let origin:any=null

for(const key in locations){

if(text.includes(key)){

if(!target) target=locations[key]
else origin=locations[key]

}

}

if(!target) return

setAnimationEvent({
id:tweet.url,
origin:origin,
target:target
})

}catch(err){

console.log(err)

}

}

checkTweets()

const interval = setInterval(checkTweets,60000)

return ()=>clearInterval(interval)

},[])

return(

<div style={{height:"100vh",width:"100%"}}>

<Map animationEvent={animationEvent}/>

</div>

)

}
