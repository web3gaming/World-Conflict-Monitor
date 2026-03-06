export default async function handler(req, res) {

  const users = [
    "MonitorX99800",
    "ALERTX360"
  ];

  try {

    const tweets = [];

    for (const user of users) {

      const url = `https://cdn.syndication.twimg.com/widgets/timelines/profile?screen_name=${user}`;

      const r = await fetch(url);

      if (!r.ok) continue;

      const data = await r.json();

      if (!data.body) continue;

      const matches = [...data.body.matchAll(/data-tweet-id="(\d+)"/g)].slice(0,3);

      for (const m of matches) {

        tweets.push({
          id: m[1],
          link: `https://x.com/${user}/status/${m[1]}`,
          title: `New tweet from ${user}`,
          date: new Date().toISOString()
        });

      }

    }

    res.status(200).json({
      status: "ok",
      tweets
    });

  } catch (err) {

    res.status(500).json({
      status: "error",
      message: err.message
    });

  }

}
