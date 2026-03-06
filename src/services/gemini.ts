import { Incident, MonitoredSource } from "../types";

export async function fetchLatestIncidents(_: MonitoredSource[]): Promise<Incident[]> {
try {
const res = await fetch("/api/live");
const data = await res.json();

if (!data.events) return [];

const incidents: Incident[] = data.events.map((event: any) => ({
  id: event.link,                         // stable unique id
  title: event.title,
  description: event.title,
  timestamp: event.date || new Date().toISOString(),

  severity: "high",
  category: "conflict",

  isTweet: event.link?.includes("twitter") || event.link?.includes("x.com"),
  sourceUrl: event.link,

  location: {
    name: "Global",
    lat: 25 + Math.random() * 20,         // small variation so markers separate
    lng: 45 + Math.random() * 40
  }
}));

// newest first
incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

return incidents;

} catch (err) {
console.error("Feed error:", err);
return [];
}
}
