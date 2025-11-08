'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Mission, MissionPathsResponse } from '@/types/api';
import MissionPathsMap from './MissionPathsMap';
import useUserPoints from '@/app/map/useUserPoints';

export default function MissionPathsPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;

  // Set page title
  useEffect(() => {
    document.title = "定向台北";
  }, []);

  const [mission, setMission] = useState<Mission | null>(null);
  const [pathsData, setPathsData] = useState<MissionPathsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [currentUserQuestId, setCurrentUserQuestId] = useState<string | null>(null);

  // Get user ID from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
  useUserPoints(userId);

  // Get current user's quest ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const questId = urlParams.get('questId');
    if (questId) {
      setCurrentUserQuestId(questId);
      setSelectedPathId(questId); // Auto-select user's own path
    }
  }, [missionId]);

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

  const parseDuration = (isoDuration: string): number => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatDuration = (isoDuration: string): string => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Sort paths by time (fastest first)
  const sortedPaths = pathsData?.paths ? [...pathsData.paths].sort((a, b) => {
    return parseDuration(a.time_spent) - parseDuration(b.time_spent);
  }) : [];

  return (
    <div className="h-dvh flex flex-col min-h-0 bg-[#EDF8FA]">
      {/* Map */}
      <div className="flex-1 min-h-0">
        <MissionPathsMap
          mission={mission}
          paths={pathsData.paths}
          selectedPathId={selectedPathId}
        />
      </div>

      {/* Bottom horizontal path list */}
      <div
        className="flex-none h-40 backdrop-blur-lg border-t border-white/30 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] overflow-hidden"
        style={{ background: "rgba(219, 241, 245, 0.85)" }}
      >
        <div className="h-full overflow-x-auto overflow-y-hidden px-4 py-4">
          <div className="flex gap-3 h-full">
            {sortedPaths.length === 0 ? (
              <div className="flex items-center justify-center w-full text-gray-500">
                目前還沒有完成記錄
              </div>
            ) : (
              sortedPaths.map((path, index) => {
                const isCurrentUser = path.id === currentUserQuestId;
                const rank = index + 1;

                return (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPathId(selectedPathId === path.id ? null : path.id)}
                    className={`flex-none w-80 h-full rounded-xl p-4 transition-all ${
                      selectedPathId === path.id
                        ? 'bg-white shadow-lg scale-105 border-2 border-[var(--brand)]'
                        : isCurrentUser
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-md'
                        : 'bg-white/80 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-base font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                          {isCurrentUser && rank === 1 ? '🎉 新紀錄！' : isCurrentUser ? `👤 第 ${rank} 名` : rank === 1 ? '🏆 最快紀錄' : `第 ${rank} 名`}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-3xl font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                            {formatDuration(path.time_spent)}
                          </span>
                        </div>
                        <div className="text-base font-semibold text-gray-800">
                          {(path.distance / 1000).toFixed(2)} km
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
