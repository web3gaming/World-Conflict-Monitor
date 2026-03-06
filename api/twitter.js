export default async function handler(req, res) {

try {

const feeds = [
"https://rss.app/feeds/zdpVmPDFhAAogYgk.xml",
"https://rss.app/feeds/HKRJm8J5kNH4MqrF.xml"
];

let allTweets = [];

for (const feed of feeds) {

const response = await fetch(feed + "?nocache=" + Date.now());
const xml = await response.text();

const items = xml.split("<item>").slice(1);

items.forEach(item => {

const title = item.split("<title>")[1]?.split("</title>")[0] || "";
const link = item.split("<link>")[1]?.split("</link>")[0] || "";
const pubDate = item.split("<pubDate>")[1]?.split("</pubDate>")[0] || "";

if (title && link) {

allTweets.push({
text: title,
url: link,
time: pubDate
});

}

});

}

allTweets.sort((a,b)=> new Date(b.time) - new Date(a.time));

res.status(200).json({
success: true,
tweets: allTweets.slice(0,10)
});

} catch (error) {

res.status(500).json({
success:false,
error:"Twitter monitor failed"
});

}

}
