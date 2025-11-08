"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Coordinate } from "@/types/api";
import { useGeolocated } from "react-geolocated";
import { useState } from "react";
import MissionDisplay from "./MissionDisplay";
import LocationsList from "./LocationsList";

// Convert locations to proper format for LocationsList
const convertLocationsForList = (locations?: Coordinate[]) => {
  if (!locations) return [];
  return locations.map((loc) => ({
    lat: loc.lat,
    lnt: loc.lnt, // Note: API uses lnt instead of lng
    timestamp: Date.now(),
  }));
};

export default function Map({
  locations,
  showMission = true,
  title,
}: {
  path?: Coordinate[];
  locations?: Coordinate[];
  showMission?: boolean;
  title?: string;
}) {
  const { coords } = useGeolocated({
    positionOptions: { enableHighAccuracy: false },
    watchLocationPermissionChange: true,
    watchPosition: true,
  });

  const centerCoords = coords
    ? { latitude: coords.latitude, longitude: coords.longitude }
    : { latitude: 25.033, longitude: 121.5654 };

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

        {/* Mission display */}
        <MissionDisplay locations={locations} show={showMission} />
      </MapContainer>

      {/* Toggle list button */}

      {/* Locations list */}
      <LocationsList
        locations={convertLocationsForList(locations)}
        show={true}
        title={title || "任務點列表"}
      />
    </div>
  );
}
