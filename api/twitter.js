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

      for (const account of accounts) {

        try {

          const url = `${instance}/${account}/rss`

          const response = await fetch(url,{
            headers:{
              "User-Agent":"Mozilla/5.0"
            }
          })

          if(!response.ok) continue

          const xml = await response.text()

          const items = xml.split("<item>").slice(1)

          for(const item of items){

            const title = item.match(/<title>(.*?)<\/title>/)
            const link = item.match(/<link>(.*?)<\/link>/)
            const date = item.match(/<pubDate>(.*?)<\/pubDate>/)

            if(!title || !link) continue

            tweets.push({
              text: title[1]
                .replace(/<!\[CDATA\[|\]\]>/g,"")
                .replace(/<[^>]*>/g,"")
                .trim(),
              url: link[1],
              time: new Date(date ? date[1] : Date.now()).getTime()
            })

          }

        } catch(e) {}

      }

    }

    tweets.sort((a,b)=>b.time-a.time)

    res.status(200).json({
      success:true,
      tweets:tweets.slice(0,10)
    })

  } catch(error){

    res.status(500).json({
      success:false,
      error:error.message
    })

  }
}
