export default async function handler(req, res) {

try {

const feeds = [

"https://nitter.net/ALERTX360/rss",
"https://nitter.net/MonitorX99800/rss",

"https://nitter.poast.org/ALERTX360/rss",
"https://nitter.poast.org/MonitorX99800/rss",

"https://nitter.privacydev.net/ALERTX360/rss",
"https://nitter.privacydev.net/MonitorX99800/rss"

]

let tweets = []

for (const feed of feeds) {

try {

const response = await fetch(feed, {
headers: {
"User-Agent": "Mozilla/5.0"
}
})

if (!response.ok) continue

const xml = await response.text()

const items = xml.split("<item>").slice(1)

for (const item of items) {

const titleMatch = item.match(/<title>(.*?)<\/title>/)
const linkMatch = item.match(/<link>(.*?)<\/link>/)
const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)

let text = titleMatch ? titleMatch[1] : ""
let url = linkMatch ? linkMatch[1] : ""
let time = dateMatch ? dateMatch[1] : ""

text = text
.replace(/<!\[CDATA\[|\]\]>/g,"")
.replace(/<[^>]*>/g,"")
.trim()

tweets.push({
text,
url,
time
})

}

} catch (err) {

continue

}

}



/* REMOVE DUPLICATE TWEETS */

const uniqueTweets = []
const seen = new Set()

for (const tweet of tweets) {

if (!seen.has(tweet.url)) {

seen.add(tweet.url)
uniqueTweets.push(tweet)

}

}



/* SORT NEWEST FIRST */

uniqueTweets.sort((a,b)=>{

return new Date(b.time) - new Date(a.time)

})



/* LIMIT RESPONSE */

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
