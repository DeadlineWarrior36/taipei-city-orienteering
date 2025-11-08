"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { Coordinate } from "@/types/api";

export default function MissionDisplay({
  locations,
  show = true,
}: {
  locations?: Coordinate[];
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
          <Popup>Mission Point {index + 1}</Popup>
        </CircleMarker>
      ))}
    </>
  );
}
