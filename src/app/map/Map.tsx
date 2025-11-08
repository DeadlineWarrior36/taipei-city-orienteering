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
import { useEffect, useRef } from "react";
import MissionDisplay from "./MissionDisplay";
import LocationsList from "./LocationsList";

export default function Map({
  locations,
  showMission = true,
  title,
  // optional quest logging and display
  logPath,
  quest,
  isRecording,
}: {
  path?: Coordinate[];
  locations?: Location[];
  showMission?: boolean;
  title?: string;
  logPath?: (c: Coordinate) => Promise<void> | void;
  quest?: { path: Coordinate[] } | null;
  isRecording?: boolean;
}) {
  const { coords } = useGeolocated({
    positionOptions: { enableHighAccuracy: false },
    watchLocationPermissionChange: true,
    watchPosition: true,
  });

  const centerCoords = coords
    ? { latitude: coords.latitude, longitude: coords.longitude }
    : { latitude: 25.033, longitude: 121.5654 };
  // keep track of last logged coords to avoid flooding API
  const lastLoggedRef = useRef<{ lat: number; lnt: number } | null>(null);

  // When coordinates update and we're recording, log them to the quest
  useEffect(() => {
    if (!coords || !logPath || !isRecording) return;
    const current = { lat: coords.latitude, lnt: coords.longitude };
    const last = lastLoggedRef.current;
    const changed =
      !last || last.lat !== current.lat || last.lnt !== current.lnt;
    if (changed) {
      // call logPath (may be async)
      Promise.resolve(logPath(current)).catch((err) =>
        console.error("Failed to log path point", err)
      );
      lastLoggedRef.current = current;
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
    <div className="relative">
      <MapContainer
        center={[centerCoords.latitude, centerCoords.longitude]}
        zoom={13}
        scrollWheelZoom
        preferCanvas
        zoomControl={false}
        style={{ height: "100dvh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* My location */}
        <CircleMarker
          center={[centerCoords.latitude, centerCoords.longitude]}
          radius={7}
          pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.95 }}
        >
          <Popup>我的位置</Popup>
        </CircleMarker>

        {/* Recenter map when coordinates change */}
        {coords && (
          <Recenter lat={centerCoords.latitude} lnt={centerCoords.longitude} />
        )}

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
        <MissionDisplay locations={locations} show={showMission} />
      </MapContainer>

      {/* Locations list */}
      <LocationsList
        locations={locations}
        show={true}
        title={title || "任務點列表"}
      />
    </div>
  );
}
