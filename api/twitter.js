export default async function handler(req, res) {

  try {

    const accounts = [
      "https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=ALERTX360",
      "https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=MonitorX99800"
    ];

    const responses = await Promise.all(accounts.map(url => fetch(url)));
    const data = await Promise.all(responses.map(r => r.json()));

    const users = data.flat();

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: "Twitter monitor failed"
    });

  }

}
