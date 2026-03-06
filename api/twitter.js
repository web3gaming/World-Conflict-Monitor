export default async function handler(req, res) {

try {

const feeds = [
"https://rss.app/feeds/zdpVmPDFhAAogYgk.xml",
"https://rss.app/feeds/HKRJm8J5kNH4MqrF.xml"
]

let tweets = []

for (const url of feeds) {

const response = await fetch(url)
const xml = await response.text()

const items = xml.split("<item>").slice(1)

for (const item of items) {

const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ""
const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ""
const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""

let text = title
.replace(/<!\[CDATA\[|\]\]>/g,"")
.replace(/<[^>]*>/g,"")
.replace(/^([A-Z]{2,4}\s*)+/,"")
.trim()

tweets.push({
text,
url: link,
time: pubDate
})

}

}

/* SORT NEWEST FIRST */

tweets = tweets.sort((a,b)=>{
return new Date(b.time) - new Date(a.time)
})

res.status(200).json({
success:true,
tweets
})

} catch(err){

res.status(500).json({
success:false,
error:err.message
})

}

}
