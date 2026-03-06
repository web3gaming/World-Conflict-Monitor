export default async function handler(req, res) {

  const feeds = [
    "https://liveuamap.com/en/rss",
    "https://www.aljazeera.com/xml/rss/all.xml"
  ];

  const events = [];

  for (const url of feeds) {

    try {

      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const text = await r.text();

      const items = text.split("<item>").slice(1,6);

      for (const item of items) {

        const title = item.split("<title>")[1]?.split("</title>")[0];
        const link = item.split("<link>")[1]?.split("</link>")[0];
        const date = item.split("<pubDate>")[1]?.split("</pubDate>")[0];

        if(title){
          events.push({ title, link, date });
        }

      }

    } catch (err) {

      console.log("Feed failed:", url);

    }

  }

  res.status(200).json({
    status: "live",
    timestamp: Date.now(),
    events
  });

}
