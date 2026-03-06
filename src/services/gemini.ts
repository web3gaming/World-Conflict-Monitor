import { Incident, MonitoredSource } from "../types";

export async function fetchLatestIncidents(_: MonitoredSource[]): Promise<Incident[]> {

try {

const res = await fetch("/api/live");
const data = await res.json();

if (!data.events) return [];

return data.events.map((event: any) => ({

  /* UNIQUE ID so map markers stay clickable */
  id: btoa(event.link),

  title: event.title,
  description: event.title,

  timestamp: event.date || new Date().toISOString(),

  severity: "high",
  category: "conflict",

  isTweet: false,
  sourceUrl: event.link,

  location: {
    name: "Global Conflict Zone",
    lat: 25,
    lng: 45
  }

}));

} catch (err) {

console.error("Feed error:", err);
return [];

}

}
