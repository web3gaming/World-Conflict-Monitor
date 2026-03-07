export default async function handler(req, res) {
  try {

    const instances = [
      "https://nitter.net",
      "https://nitter.privacydev.net",
      "https://nitter.poast.org",
      "https://nitter.unixfox.eu",
      "https://nitter.moomoo.me"
    ]

    const accounts = [
      "ALERTX360",
      "MonitorX99800"
    ]

    let tweets = []

    for (const instance of instances) {

      for (const account of accounts) {

        try {

          const url = `${instance}/${account}/rss`

          const response = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
              "Accept": "application/rss+xml"
            }
          })

          if (!response.ok) continue

          const xml = await response.text()

          const items = xml.split("<item>").slice(1)

          for (const item of items) {

            const titleMatch = item.match(/<title>(.*?)<\/title>/)
            const linkMatch = item.match(/<link>(.*?)<\/link>/)
            const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)

            if (!titleMatch || !linkMatch) continue

            const text = titleMatch[1]
              .replace(/<!\[CDATA\[|\]\]>/g, "")
              .replace(/<[^>]*>/g, "")
              .trim()

            const tweetUrl = linkMatch[1]
            const time = dateMatch ? dateMatch[1] : ""

            tweets.push({
              text,
              url: tweetUrl,
              time
            })

          }

        } catch (err) {
          continue
        }

      }

      if (tweets.length > 0) break

    }

    const seen = new Set()
    const uniqueTweets = []

    for (const t of tweets) {
      if (!seen.has(t.url)) {
        seen.add(t.url)
        uniqueTweets.push(t)
      }
    }

    uniqueTweets.sort((a, b) => {
      return new Date(b.time) - new Date(a.time)
    })

    const latestTweets = uniqueTweets.slice(0, 20)

    res.status(200).json({
      success: true,
      tweets: latestTweets
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    })

  }
}
