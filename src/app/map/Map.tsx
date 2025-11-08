"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { Coordinate, Location } from "@/types/api";
import { useGeolocated } from "react-geolocated";
import { useEffect, useMemo, useRef, useState } from "react";
import MissionDisplay from "./MissionDisplay";
import LocationsList from "./LocationsList";

export default function Map({
  locations,
  completedLocationIds,
  showMission = true,
  title,
  // optional quest logging and display
  logPath,
  quest,
  isRecording,
}: {
  path?: Coordinate[];
  locations?: Location[];
  completedLocationIds?: string[];
  showMission?: boolean;
  title?: string;
  logPath?: (c: Coordinate) => Promise<void> | void;
  quest?: { path: Coordinate[] } | null;
  isRecording?: boolean;
}) {
  // Development mode: coordinate offset control
  const [latOffset, setLatOffset] = useState(0);
  const [lngOffset, setLngOffset] = useState(0);
  const stepSize = 0.0005; // Adjust this for larger/smaller steps

  const { coords: originalOri } = useGeolocated({
    positionOptions: { enableHighAccuracy: false },
    watchLocationPermissionChange: true,
    watchPosition: true,
  });

  const coords = useMemo(
    () => ({
      latitude: (originalOri?.latitude ?? 0) + latOffset,
      longitude: (originalOri?.longitude ?? 0) + lngOffset,
    }),
    [originalOri, latOffset, lngOffset]
  );

  const lastLoggedRef = useRef<{
    coords: { lat: number; lnt: number } | null;
    timestamp: number;
  }>({
    coords: null,
    timestamp: 0,
  });

  // When coordinates update and we're recording, log them to the quest (throttled to 5s)
  useEffect(() => {
    if (!coords || !logPath || !isRecording) return;

    const current = { lat: coords.latitude, lnt: coords.longitude };
    const now = Date.now();
    const timeSinceLastLog = now - lastLoggedRef.current.timestamp;
    const last = lastLoggedRef.current.coords;

    // Check if coords changed and enough time has passed (5000ms = 5s)
    const coordsChanged =
      !last || last.lat !== current.lat || last.lnt !== current.lnt;
    const shouldLog = coordsChanged && timeSinceLastLog >= 1000;

    if (shouldLog) {
      // call logPath (may be async)
      Promise.resolve(logPath(current)).catch((err) =>
        console.error("Failed to log path point", err)
      );
      lastLoggedRef.current = {
        coords: current,
        timestamp: now,
      };
    }
  }, [coords, logPath, isRecording]);

  // helper component to recenter the map when coords change
  function Recenter({ lat, lnt }: { lat: number; lnt: number }) {
    const map = useMap();
    useEffect(() => {
      if (map && lat && lnt) {
        map.setView([lat, lnt]);
      }
    }, [map, lat, lnt]);
    return null;
  }

  return (
    <div className="relative h-full">
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={13}
        scrollWheelZoom
        preferCanvas
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* My location */}
        <CircleMarker
          center={[coords.latitude, coords.longitude]}
          radius={7}
          pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.95 }}
        >
          <Popup>我的位置</Popup>
        </CircleMarker>

        {/* Recenter map when coordinates change */}
        {coords && <Recenter lat={coords.latitude} lnt={coords.longitude} />}

        {/* Draw recorded quest path */}
        {quest?.path && quest.path.length > 0 && (
          <Polyline
            pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.7 }}
            positions={quest.path.map(
              (p) => [p.lat, p.lnt] as [number, number]
            )}
          />
        )}

        {/* Mission display */}
        <MissionDisplay
          locations={locations}
          completedLocationIds={completedLocationIds}
          show={showMission}
        />
      </MapContainer>

      {/* Locations list */}
      {/* <LocationsList
        locations={locations}
        completedLocationIds={completedLocationIds}
        show={isRecording}
        title={title || "任務點列表"}
      /> */}

      {/* Developer Controls - only in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute right-4 top-16 z-5000 bg-white/90 backdrop-blur rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-3 gap-2 w-32">
            {/* Reset button */}
            <button
              onClick={() => {
                setLatOffset(0);
                setLngOffset(0);
              }}
              className="col-start-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset
            </button>

            {/* Up button */}
            <button
              onClick={() => {
                setLatOffset((prev) => prev + stepSize);
              }}
              className="col-start-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ↑
            </button>

            {/* Left button */}
            <button
              onClick={() => setLngOffset((prev) => prev - stepSize)}
              className="col-start-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ←
            </button>

            {/* Down button */}
            <button
              onClick={() => setLatOffset((prev) => prev - stepSize)}
              className="col-start-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ↓
            </button>

            {/* Right button */}
            <button
              onClick={() => setLngOffset((prev) => prev + stepSize)}
              className="col-start-3 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
