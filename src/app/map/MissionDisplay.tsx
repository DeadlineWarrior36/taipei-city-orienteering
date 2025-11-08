"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { Location } from "@/types/api";

export default function MissionDisplay({
  locations,
  show = true,
}: {
  locations?: Location[];
  show?: boolean;
}) {
  if (!show || !locations?.length) return null;

  return (
    <>
      {locations.map((location, index) => (
        <CircleMarker
          key={`mission-${index}`}
          center={[location.lat, location.lnt]}
          radius={8}
          pathOptions={{
            color: "#dc2626", // red-600
            weight: 2,
            fillOpacity: 0.2,
          }}
        >
          <Popup>
            <span className="text-sm">{location.name}</span>
            <br />
            <span className="text-xs">{location.description}</span>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
