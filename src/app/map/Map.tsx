"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useGeolocated } from "react-geolocated";
import {
  MapContainer,
  TileLayer,
  useMap,
  CircleMarker,
  Popup,
} from "react-leaflet";
import { Coordinates } from "../types";

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    try {
      // animate pan to new position when it changes
      map.setView(position, map.getZoom(), { animate: true });
    } catch {
      // ignore map errors during SSR hydration or unmounted map
    }
  }, [map, position]);
  return null;
}

export default function Map({
  locations,
}: {
  path?: Coordinates[];
  locations?: Coordinates[];
}) {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: { enableHighAccuracy: false },
      watchLocationPermissionChange: true,
      watchPosition: true,
    });

  // default to Taipei City Hall coordinates if no coords yet
  const position: [number, number] = [
    coords?.latitude ?? 25.033,
    coords?.longitude ?? 121.5654,
  ];

  const hasCoords = isGeolocationEnabled && isGeolocationAvailable;

  return (
    <div className="relative">
      {/* top-left status overlay */}
      <div className="absolute left-16 top-2 z-1000 bg-white/90 text-black text-sm p-2 rounded shadow">
        {!isGeolocationAvailable && (
          <div>Geolocation not available in this browser.</div>
        )}
        {isGeolocationAvailable && !isGeolocationEnabled && (
          <div>Geolocation permission denied or disabled.</div>
        )}
        {isGeolocationAvailable && isGeolocationEnabled && !hasCoords && (
          <div>Waiting for location…</div>
        )}
        {hasCoords && <div>Tracking enabled — following you on the map</div>}
      </div>

      <MapContainer
        className="h-screen"
        center={position}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {/* Use a CircleMarker to avoid dealing with Leaflet image icons in Next.js build */}
        <CircleMarker
          center={position}
          radius={5}
          pathOptions={{ color: "#2563eb", weight: 2 }}
        >
          <Popup>{hasCoords ? "You are here" : "Default center"}</Popup>
        </CircleMarker>

        {locations?.map((loc, index) => (
          <CircleMarker
            key={index}
            center={[loc.latitude, loc.longitude]}
            radius={5}
            pathOptions={{ color: "#ef4444", weight: 2 }}
          >
            <Popup>Mission Location {index + 1}</Popup>
          </CircleMarker>
        ))}

        {/* keep the map centered when the position changes */}
        <Recenter position={position} />
      </MapContainer>
    </div>
  );
}
