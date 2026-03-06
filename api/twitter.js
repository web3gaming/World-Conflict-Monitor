export default async function handler(req, res) {
  try {
    const sources = [
      "https://nitter.net/ALERTX360/rss",
      "https://nitter.net/MonitorX99800/rss"
    ];

    let tweets = [];

    for (const url of sources) {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const text = await response.text();

      const items = text.split("<item>").slice(1);

      items.forEach(item => {
        const title = item.split("<title>")[1]?.split("</title>")[0];
        const link = item.split("<link>")[1]?.split("</link>")[0];

        if (title && link) {
          tweets.push({
            text: title,
            url: link
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      tweets: tweets.slice(0, 5)
    });

  } catch (error) {
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
}
