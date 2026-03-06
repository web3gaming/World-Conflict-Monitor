export default async function handler(req, res) {

  const accounts = ["MonitorX99800", "ALERTX360"];

  const instances = [
    "https://nitter.poast.org",
    "https://nitter.net",
    "https://nitter.privacydev.net"
  ];

  try {

    for (const instance of instances) {

      try {

        const tweets = [];

        for (const user of accounts) {

          const url = `${instance}/${user}/rss`;

          const r = await fetch(url, { timeout: 5000 });

          if (!r.ok) continue;

          const text = await r.text();

          const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,3);

          for (const i of items) {

            const block = i[1];

            const title = block.match(/<title>(.*?)<\/title>/)?.[1] || "";
            const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "";
            const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

            tweets.push({
              title,
              link,
              date: pubDate
            });

          }

        }

        if (tweets.length > 0) {

          tweets.sort((a,b)=> new Date(b.date) - new Date(a.date));

          return res.status(200).json({
            status: "ok",
            tweets: tweets.slice(0,10)
          });

        }

      } catch {}

    }

    return res.status(200).json({
      status: "ok",
      tweets: []
    });

  } catch (err) {

    res.status(500).json({
      status: "error",
      message: err.message
    });

  }

}
