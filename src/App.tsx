import React, { useEffect, useState } from "react"
import Map from "./components/Map"

interface Tweet {
  id: string
  text: string
}

interface Incident {
  id: string
  lat: number
  lng: number
  title: string
}

function detectIncidents(tweets: Tweet[]): Incident[] {

  const keywords = [
    "missile",
    "drone",
    "strike",
    "attack",
    "explosion",
    "launch",
    "airstrike"
  ]

  return tweets
    .filter(t =>
      keywords.some(k =>
        t.text.toLowerCase().includes(k)
      )
    )
    .map(t => {

      let lat = 32
      let lng = 53

      if (t.text.includes("Iran")) {
        lat = 32
        lng = 53
      }

      if (t.text.includes("Israel")) {
        lat = 31.5
        lng = 35
      }

      if (t.text.includes("Saudi")) {
        lat = 24
        lng = 45
      }

      if (t.text.includes("Bahrain")) {
        lat = 26
        lng = 50
      }

      if (t.text.includes("Qatar")) {
        lat = 25
        lng = 51
      }

      if (t.text.includes("UAE")) {
        lat = 24
        lng = 54
      }

      return {
        id: t.id,
        lat,
        lng,
        title: t.text
      }

    })
}

export default function App() {

  const [tweets, setTweets] = useState<Tweet[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])

  async function loadTweets() {

    try {

      const res = await fetch("/api/twitter")
      const data = await res.json()

      if (!data.tweets) return

      setTweets(data.tweets)

      const detected = detectIncidents(data.tweets)

      setIncidents(detected)

    } catch (err) {
      console.log("tweet load error")
    }

  }

  useEffect(() => {

    loadTweets()

    const interval = setInterval(() => {
      loadTweets()
    }, 60000)

    return () => clearInterval(interval)

  }, [])

  return (

    <div className="w-screen h-screen bg-black text-white flex">

      {/* LEFT PANEL */}
      <div className="w-1/4 border-r border-gray-800 flex flex-col">

        <div className="p-4 text-lg font-bold border-b border-gray-800">
          INTELLIGENCE STREAM
        </div>

        <div className="flex-1 overflow-y-scroll">

          {tweets.map(t => (

            <div
              key={t.id}
              className="p-4 border-b border-gray-800 text-sm"
            >
              {t.text}
            </div>

          ))}

        </div>

      </div>


      {/* MAP CENTER */}
      <div className="flex-1 flex flex-col">

        <div className="p-4 border-b border-gray-800 text-lg font-bold">
          GLOBAL CONFLICT MONITOR
        </div>

        <div className="flex-1">
          <Map incidents={incidents} />
        </div>

      </div>


      {/* RIGHT PANEL */}
      <div className="w-1/4 border-l border-gray-800 flex flex-col">

        <div className="p-4 text-lg font-bold border-b border-gray-800">
          LIVE SIGNAL FEED
        </div>

        <div className="flex-1 overflow-y-scroll">

          {tweets.map(t => (

            <div
              key={"live-" + t.id}
              className="p-4 border-b border-gray-800 text-sm"
            >
              {t.text}
            </div>

          ))}

        </div>

      </div>

    </div>

  )

}
