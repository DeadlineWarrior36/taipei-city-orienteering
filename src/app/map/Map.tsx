"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";

type Coordinates = { latitude: number; longitude: number };

function FitToLocations({ locations }: { locations?: Coordinates[] }) {
  const map = useMap();
  useEffect(() => {
    if (!locations || locations.length === 0) return;

    if (locations.length === 1) {
      const p = locations[0];
      map.setView([p.latitude, p.longitude], Math.max(map.getZoom(), 16), {
        animate: true,
      });
    } else {
      const L = (window as any).L;
      const bounds = L.latLngBounds(
        locations.map((p) => [p.latitude, p.longitude])
      );
      map.fitBounds(bounds, { padding: [56, 72], maxZoom: 16, animate: true });
    }
  }, [map, locations]);
  return null;
}

export default function Map({ locations }: { locations?: Coordinates[] }) {
  // --- 使用者位置 state（直接用 navigator.geolocation） ---
  const [user, setUser] = useState<{
    lat: number;
    lng: number;
    acc?: number;
    hasFix: boolean;
  }>({ lat: 25.0478, lng: 121.517, hasFix: false });
  const [geoError, setGeoError] = useState<string | null>(null);
  const firstFixPanned = useRef(false);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("此裝置不支援定位");
      return;
    }
    // 連續監看位置
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUser({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
          hasFix: true,
        });
        setGeoError(null);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "定位權限被拒絕（請在瀏覽器網站權限中允許「位置」）"
            : err.message
        );
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  // 首次拿到座標就把地圖平移到使用者位置（不影響任務點 fitBounds）
  function RecenterOnFirstFix() {
    const map = useMap();
    useEffect(() => {
      if (user.hasFix && !firstFixPanned.current) {
        firstFixPanned.current = true;
        map.setView([user.lat, user.lng], Math.max(map.getZoom(), 16), {
          animate: true,
        });
      }
    }, [map, user.hasFix]);
    return null;
  }

  return (
    <div className="relative">
      {/* 右上角狀態 pill（便於偵錯） */}
      <div className="absolute right-3 top-3 z-[1200] rounded-full bg-white/80 backdrop-blur px-3 py-1.5 text-xs shadow">
        {geoError ? geoError : user.hasFix ? "定位中" : "取得定位中…"}
      </div>

      <MapContainer
        center={[user.lat, user.lng]}
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
        {user.hasFix && (
          <>
            <Circle
              center={[user.lat, user.lng]}
              radius={Math.min(user.acc ?? 60, 80)}
              pathOptions={{
                color: "#2563eb",
                weight: 1,
                opacity: 0.25,
                fillOpacity: 0.1,
              }}
            />
            <CircleMarker
              center={[user.lat, user.lng]}
              radius={7}
              pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.95 }}
            >
              <Popup>我的位置</Popup>
            </CircleMarker>
          </>
        )}

        {/* 任務點（不把使用者點塞進自動縮放） */}
        {locations?.map((loc, i) => (
          <CircleMarker
            key={`${loc.latitude}-${loc.longitude}-${i}`}
            center={[loc.latitude, loc.longitude]}
            radius={8}
            pathOptions={{ color: "#5AB4C5", weight: 3 }}
          >
            <Popup>任務點 #{i + 1}</Popup>
          </CircleMarker>
        ))}

        <FitToLocations locations={locations} />
        <RecenterOnFirstFix />
      </MapContainer>
    </div>
  );
}
