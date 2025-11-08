"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Coordinate } from "@/types/api";
import { useGeolocated } from "react-geolocated";
import MissionDisplay from "./MissionDisplay";

export default function Map({
  locations,
  showMission = true,
}: {
  path?: Coordinate[];
  locations?: Coordinate[];
  showMission?: boolean;
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
      {/* 右上角狀態 pill（便於偵錯） */}

      <MapContainer
        center={[centerCoords?.latitude, centerCoords?.longitude]}
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

        {/* 我的藍點 + 精度圈（拿到 fix 才顯示） */}

        {/* <Circle
          center={[centerCoords.latitude, centerCoords.longitude]}
          // radius={80}
          pathOptions={{
            color: "#2563eb",
            weight: 1,
            opacity: 0.25,
            fillOpacity: 0.1,
          }}
        /> */}
        <CircleMarker
          center={[centerCoords.latitude, centerCoords.longitude]}
          radius={7}
          pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.95 }}
        >
          <Popup>我的位置</Popup>
        </CircleMarker>

        {/* 任務點（不把使用者點塞進自動縮放） */}
        {locations?.map((loc, i) => (
          <CircleMarker
            key={`${loc.lat}-${loc.lnt}-${i}`}
            center={[loc.lat, loc.lnt]}
            radius={8}
            pathOptions={{ color: "#5AB4C5", weight: 3 }}
          >
            <Popup>任務點 #{i + 1}</Popup>
          </CircleMarker>
        ))}
        <MissionDisplay locations={locations} show={showMission} />
      </MapContainer>
    </div>
  );
}
