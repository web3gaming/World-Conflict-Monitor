export default async function handler(req, res) {

  const sources = [
    "https://rsshub.app/twitter/user/MonitorX99800",
    "https://rsshub.app/twitter/user/ALERTX360"
  ];

  try {

    const results = await Promise.all(
      sources.map(async (url) => {
        const r = await fetch(url);
        const text = await r.text();

        const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,3);

        return items.map(i => {
          const block = i[1];

          const title = block.match(/<title>(.*?)<\/title>/)?.[1] || "";
          const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "";
          const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

          return {
            title,
            link,
            date: pubDate
          };
        });

      })
    );

    const tweets = results.flat().sort((a,b)=> new Date(b.date) - new Date(a.date));

    res.status(200).json({
      status:"ok",
      tweets: tweets.slice(0,10)
    });

  } catch (err) {

    res.status(500).json({
      status:"error",
      message: err.message
    });

  }

}
