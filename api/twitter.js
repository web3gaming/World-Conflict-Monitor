export default async function handler(req, res) {

try {

const feeds = [
"https://rss.app/feeds/zdpVmPDFhAAogYgk.xml",
"https://rss.app/feeds/HKRJm8J5kNH4MqrF.xml"
]

let tweets = []

for (const feed of feeds) {

const response = await fetch(feed)
const xml = await response.text()

const items = xml.split("<item>").slice(1)

for (const item of items) {

const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
const linkMatch = item.match(/<link>(.*?)<\/link>/)
const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)

let text = titleMatch ? titleMatch[1] : ""
let url = linkMatch ? linkMatch[1] : ""
let time = dateMatch ? dateMatch[1] : ""



/* CLEAN RSS FEED COUNTRY CODES */

text = text
.replace(/<!\[CDATA\[|\]\]>/g,"")
.replace(/<[^>]*>/g,"")
.replace(/^([A-Z]{2,4}\s*)+/,"")  // removes US IL LB IR etc
.trim()



tweets.push({
text,
url,
time
})

}

}



/* REMOVE DUPLICATE TWEETS */

const uniqueTweets = []
const seen = new Set()

for (const t of tweets) {
if (!seen.has(t.url)) {
seen.add(t.url)
uniqueTweets.push(t)
}
}



/* SORT NEWEST FIRST */

uniqueTweets.sort((a,b)=>{
return new Date(b.time) - new Date(a.time)
})



/* RETURN ONLY LATEST 20 */

const latestTweets = uniqueTweets.slice(0,20)



res.status(200).json({
success:true,
tweets:latestTweets
})

} catch (error) {

res.status(500).json({
success:false,
error:error.message
})

}

}
