export default async function handler(req, res) {
  try {

    const accounts = ["ALERTX360", "MonitorX99800"];

    const results = [];

    for (const account of accounts) {

      const response = await fetch(
        `https://cdn.syndication.twimg.com/widgets/timelines/profile?screen_name=${account}`
      );

      const data = await response.json();

      results.push({
        account,
        tweets: data?.globalObjects?.tweets || {}
      });

    }

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: "Twitter monitor failed"
    });

  }
}
