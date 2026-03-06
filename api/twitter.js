export default async function handler(req, res) {

const sources = [
"https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=ALERTX360",
"https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=MonitorX99800"
];

try {

const responses = await Promise.all(
sources.map(url => fetch(url))
);

const data = await Promise.all(
responses.map(r => r.json())
);

const accounts = data.flat();

res.status(200).json({
success: true,
accounts
});

} catch (error) {

res.status(500).json({
success: false,
error: "Failed to fetch twitter accounts"
});

}

}
