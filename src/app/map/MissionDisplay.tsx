"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { Location } from "@/types/api";

export default function MissionDisplay({
  locations,
  completedLocationIds,
  show = true,
}: {
  locations?: Location[];
  completedLocationIds?: string[];
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
            color: completedLocationIds?.includes(location.id)
              ? "#16a34a" // red-600 if completed else green-600
              : "#dc2626",
            weight: 2,
            fillColor: completedLocationIds?.includes(location.id)
              ? "#16a34a"
              : "#dc2626", // green-600 if completed else red-600
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
