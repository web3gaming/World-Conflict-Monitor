import React from "react"
import { Incident } from "../types"

type Props = {
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
}

export default function Map({ incidents, onSelectIncident }: Props) {

  const project = (lat:number, lng:number) => {

    const x = (lng + 180) * (800 / 360)
    const y = (90 - lat) * (450 / 180)

    return { x, y }

  }

  return (

    <div className="relative w-full h-full bg-[#0b1220] rounded-xl overflow-hidden">

      {/* MAP BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] to-[#0f1a30]" />

      {/* INCIDENT MARKERS */}
      {incidents.map((incident) => {

        if (!incident.location) return null

        const { lat, lng } = incident.location
        const pos = project(lat, lng)

        return (

          <div
            key={incident.id}
            onClick={() => onSelectIncident(incident)}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y
            }}
            className="cursor-pointer"
          >

            {/* glow ring */}
            <div className="absolute w-6 h-6 -left-3 -top-3 bg-red-500 rounded-full opacity-40 animate-ping"></div>

            {/* core marker */}
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>

          </div>

        )

      })}

    </div>

  )

}
