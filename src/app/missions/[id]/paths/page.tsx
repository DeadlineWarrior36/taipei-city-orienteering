'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Mission, MissionPathsResponse } from '@/types/api';
import MissionPathsMap from './MissionPathsMap';

export default function MissionPathsPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;

  const [mission, setMission] = useState<Mission | null>(null);
  const [pathsData, setPathsData] = useState<MissionPathsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [missionResponse, pathsResponse] = await Promise.all([
          apiClient.getMissionDetail({ id: missionId }),
          apiClient.getMissionPaths(missionId),
        ]);
        setMission(missionResponse.mission);
        setPathsData(pathsResponse);
      } catch (err) {
        console.error('Error fetching mission paths:', err);
        setError('無法載入任務路徑資料');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [missionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDF8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2CB6C7] mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !mission || !pathsData) {
    return (
      <div className="min-h-screen bg-[#EDF8FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '找不到任務資料'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#2CB6C7] text-white rounded-lg hover:bg-[#239ca8]"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const parseDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(\d+)S/);
    if (!match) return '未知';
    const seconds = parseInt(match[1]);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}小時 ${minutes}分鐘`;
    } else if (minutes > 0) {
      return `${minutes}分鐘 ${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} 公里`;
    }
    return `${meters.toFixed(0)} 公尺`;
  };

  const pathColors = [
    '#2563eb', // blue
    '#dc2626', // red
    '#16a34a', // green
    '#ea580c', // orange
    '#9333ea', // purple
    '#0891b2', // cyan
    '#ca8a04', // yellow
    '#db2777', // pink
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#EDF8FA]">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-lg font-semibold text-black ml-2">{mission.name}</h1>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="mb-4">
          <p className="text-gray-600">
            已完成路徑：{pathsData.paths.length} 條
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-[600px]">
                <MissionPathsMap
                  mission={mission}
                  paths={pathsData.paths}
                  pathColors={pathColors}
                />
              </div>
            </div>
          </div>

          {/* Paths List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">完成記錄</h2>

              {pathsData.paths.length === 0 ? (
                <p className="text-gray-500 text-center py-8">目前還沒有完成記錄</p>
              ) : (
                <div className="space-y-4 max-h-[530px] overflow-y-auto">
                  {pathsData.paths.map((path, index) => (
                    <div
                      key={path.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: pathColors[index % pathColors.length] }}
                        />
                        <h3 className="font-semibold text-gray-800">
                          路徑 #{index + 1}
                        </h3>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">距離：</span>
                          {formatDistance(path.distance)}
                        </p>
                        <p>
                          <span className="font-medium">時間：</span>
                          {parseDuration(path.time_spent)}
                        </p>
                        <p>
                          <span className="font-medium">點數：</span>
                          {path.path.length} 個座標點
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          ID: {path.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
