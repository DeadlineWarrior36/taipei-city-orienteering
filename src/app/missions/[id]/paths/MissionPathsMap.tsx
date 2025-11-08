'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Mission } from '@/types/api';

interface MissionPathsMapProps {
  mission: Mission;
  paths: PathData[];
  selectedPathId?: string | null;
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

// Heatmap by drawing all paths overlapped with transparency
function HeatmapLayer({ paths }: { paths: PathData[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || paths.length === 0) return;

    const polylines: L.Polyline[] = [];

    // Draw each path multiple times with increasing thickness and decreasing opacity
    // to create a heat effect
    paths.forEach((path) => {
      if (path.path && Array.isArray(path.path) && path.path.length > 1) {
        const coords = path.path.map(p => [p.lat, p.lnt] as [number, number]);

        // Draw multiple layers for heat effect (冷 -> 熱)
        // Layer 1: Wide, very transparent (outermost glow) - 藍色基底
        const layer1 = L.polyline(coords, {
          color: '#3b82f6',
          weight: 20,
          opacity: 0.08,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
        polylines.push(layer1);

        // Layer 2: Medium, semi-transparent - 黃色過渡
        const layer2 = L.polyline(coords, {
          color: '#fbbf24',
          weight: 12,
          opacity: 0.12,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
        polylines.push(layer2);

        // Layer 3: Narrow, more visible - 橙色
        const layer3 = L.polyline(coords, {
          color: '#f97316',
          weight: 6,
          opacity: 0.18,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
        polylines.push(layer3);

        // Layer 4: Very narrow, most visible - 紅色核心（最熱）
        const layer4 = L.polyline(coords, {
          color: '#ef4444',
          weight: 3,
          opacity: 0.25,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
        polylines.push(layer4);
      }
    });

    return () => {
      polylines.forEach(line => {
        map.removeLayer(line);
      });
    };
  }, [map, paths]);

  return null;
}

// Selected path highlight component
function SelectedPathHighlight({ path }: { path: PathData | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !path || !path.path || path.path.length < 2) return;

    const coords = path.path.map(p => [p.lat, p.lnt] as [number, number]);

    // Draw highlighted path with animation
    const highlight = L.polyline(coords, {
      color: '#ef4444',
      weight: 6,
      opacity: 0.9,
      lineJoin: 'round',
      lineCap: 'round',
      className: 'selected-path-highlight'
    }).addTo(map);

    // Fit bounds to show the selected path
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, {
      padding: [50, 50],
      animate: true,
      duration: 0.5
    });

    return () => {
      map.removeLayer(highlight);
    };
  }, [map, path]);

  return null;
}

export default function MissionPathsMap({ mission, paths, selectedPathId }: MissionPathsMapProps) {
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

  const selectedPath = paths.find(p => p.id === selectedPathId);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      {!selectedPathId && <FitBounds paths={paths} mission={mission} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* Always show heatmap */}
      <HeatmapLayer paths={paths} />

      {/* Show selected path highlight if selected */}
      {selectedPath && <SelectedPathHighlight path={selectedPath} />}

    </MapContainer>
  );
}
