export default async function handler(req, res) {

try {

const instances = [
"https://nitter.net",
"https://nitter.privacydev.net",
"https://nitter.poast.org",
"https://nitter.unixfox.eu"
]

const accounts = [
"ALERTX360",
"MonitorX99800"
]

let tweets = []

for (const instance of instances) {

try {

for (const account of accounts) {

const url = `${instance}/${account}/rss`

const response = await fetch(url,{
headers:{
"user-agent":"Mozilla/5.0"
}
})

if(!response.ok) continue

const xml = await response.text()

const items = xml.split("<item>").slice(1)

for (const item of items) {

const titleMatch = item.match(/<title>(.*?)<\/title>/)
const linkMatch = item.match(/<link>(.*?)<\/link>/)
const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)

const text = titleMatch ? titleMatch[1] : ""
const url = linkMatch ? linkMatch[1] : ""
const time = dateMatch ? dateMatch[1] : ""

tweets.push({
text:text.replace(/<[^>]*>/g,"").trim(),
url,
time
})

}

}

if(tweets.length > 0) break

} catch(err) {
continue
}

}



/* REMOVE DUPLICATES */

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



/* LIMIT RESULTS */

const latestTweets = uniqueTweets.slice(0,20)



res.status(200).json({
success:true,
tweets:latestTweets
})



} catch(error) {

res.status(500).json({
success:false,
error:error.message
})

}

}
