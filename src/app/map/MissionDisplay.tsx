"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { Location } from "@/types/api";
import { useEffect, useRef } from "react";
import { CircleMarker as LeafletCircleMarker } from "leaflet";

export default function MissionDisplay({
  locations,
  completedLocationIds,
  show = true,
  selectedLocationId,
  onLocationClick,
}: {
  locations?: Location[];
  completedLocationIds?: string[];
  show?: boolean;
  selectedLocationId?: string | null;
  onLocationClick?: (locationId: string) => void;
}) {
  if (!show || !locations?.length) return null;

  return (
    <>
      {locations.map((location, index) => {
        const isSelected = selectedLocationId === location.id;
        return (
          <LocationMarker
            key={`mission-${index}`}
            location={location}
            isCompleted={completedLocationIds?.includes(location.id)}
            isSelected={isSelected}
            onClick={() => onLocationClick?.(location.id)}
          />
        );
      })}
    </>
  );
}

function LocationMarker({
  location,
  isCompleted,
  isSelected,
  onClick,
}: {
  location: Location;
  isCompleted?: boolean;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const markerRef = useRef<LeafletCircleMarker>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  return (
    <CircleMarker
      ref={markerRef}
      center={[location.lat, location.lnt]}
      radius={isSelected ? 12 : 8}
      pathOptions={{
        color: isCompleted ? "#16a34a" : "#dc2626",
        weight: isSelected ? 3 : 2,
        fillColor: isCompleted ? "#16a34a" : "#dc2626",
        fillOpacity: isSelected ? 0.4 : 0.2,
      }}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    >
      <Popup>
        <div className="p-1 min-w-[180px]">
          <div className="text-sm font-bold mb-1">{location.name}</div>
          {location.description && (
            <div className="text-xs text-neutral-600 mb-2">
              {location.description}
            </div>
          )}
          <div className="text-xs text-neutral-500 mb-2">
            {isCompleted ? "✓ 已完成" : "尚未完成"}
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lnt}`}
            className="block w-full text-center px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: "var(--brand, #5AB4C5)" }}
          >
            開啟導航
          </a>
        </div>
      </Popup>
    </CircleMarker>
  );
}
