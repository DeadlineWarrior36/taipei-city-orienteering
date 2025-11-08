'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Mission, PathData } from '@/types/api';

interface MissionPathsMapProps {
  mission: Mission;
  paths: PathData[];
  pathColors: string[];
}

function FitBounds({ paths, mission }: { paths: PathData[], mission: Mission }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (paths.length === 0 && mission.locations.length === 0) return;

      const bounds = new LatLngBounds([]);
      let hasValidBounds = false;

      paths.forEach(path => {
        path.path.forEach(coord => {
          bounds.extend([coord.lat, coord.lnt]);
          hasValidBounds = true;
        });
      });

      mission.locations.forEach(location => {
        bounds.extend([location.lat, location.lnt]);
        hasValidBounds = true;
      });

      if (hasValidBounds && bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          animate: true,
          duration: 0.5
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [paths, mission, map]);

  return null;
}

export default function MissionPathsMap({ mission, paths, pathColors }: MissionPathsMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">載入地圖中...</p>
      </div>
    );
  }

  const center: LatLngExpression = mission.locations.length > 0
    ? [mission.locations[0].lat, mission.locations[0].lnt]
    : [25.0330, 121.5654];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <FitBounds paths={paths} mission={mission} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {paths.map((path, index) => (
        <Polyline
          key={path.id}
          pathOptions={{
            color: pathColors[index % pathColors.length],
            weight: 4,
            opacity: 0.7,
          }}
          positions={path.path.map(p => [p.lat, p.lnt])}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">路徑 #{index + 1}</p>
              <p>距離: {(path.distance / 1000).toFixed(2)} 公里</p>
              <p>點數: {path.path.length} 個座標點</p>
            </div>
          </Popup>
        </Polyline>
      ))}

      {mission.locations.map((location) => (
        <CircleMarker
          key={location.id}
          center={[location.lat, location.lnt]}
          radius={10}
          pathOptions={{
            color: '#16a34a',
            fillColor: '#16a34a',
            fillOpacity: 0.6,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{location.name}</p>
              {location.description && <p className="text-gray-600">{location.description}</p>}
              <p className="text-[#2CB6C7] font-medium mt-1">+{location.point} 分</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {paths.map((path, index) => {
        if (path.path.length === 0) return null;
        const startPoint = path.path[0];
        return (
          <CircleMarker
            key={`start-${path.id}`}
            center={[startPoint.lat, startPoint.lnt]}
            radius={6}
            pathOptions={{
              color: pathColors[index % pathColors.length],
              fillColor: 'white',
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">路徑 #{index + 1} 起點</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {paths.map((path, index) => {
        if (path.path.length === 0) return null;
        const endPoint = path.path[path.path.length - 1];
        return (
          <CircleMarker
            key={`end-${path.id}`}
            center={[endPoint.lat, endPoint.lnt]}
            radius={6}
            pathOptions={{
              color: pathColors[index % pathColors.length],
              fillColor: pathColors[index % pathColors.length],
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">路徑 #{index + 1} 終點</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
