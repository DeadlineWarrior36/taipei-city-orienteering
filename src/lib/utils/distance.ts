import type { Coordinate } from '@/types/api';

/**
 * 計算兩個座標之間的距離（公尺）
 * 使用 Haversine 公式
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // 地球半徑（公尺）
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lnt - coord1.lnt) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 判斷座標是否在目標座標的指定距離內
 */
export function isWithinDistance(
  coord: Coordinate,
  target: Coordinate,
  maxDistance: number
): boolean {
  return calculateDistance(coord, target) <= maxDistance;
}

/**
 * 計算路徑的總距離（公尺）
 */
export function calculatePathDistance(paths: Coordinate[]): number {
  if (paths.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < paths.length - 1; i++) {
    totalDistance += calculateDistance(paths[i], paths[i + 1]);
  }

  return totalDistance;
}
