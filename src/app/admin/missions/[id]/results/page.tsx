"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Users, Clock, TrendingUp } from "lucide-react";
import type { Mission } from "@/types/api";
import type { QuestWithPaths } from "@/lib/db/quests";

const MissionPathsMap = dynamic(
  () => import("@/app/missions/[id]/paths/MissionPathsMap"),
  { ssr: false }
);

export default function MissionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const missionId = resolvedParams.id;

  const [mission, setMission] = useState<Mission | null>(null);
  const [quests, setQuests] = useState<QuestWithPaths[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [missionRes, pathsRes] = await Promise.all([
        fetch(`/api/admin/missions/${missionId}`),
        fetch(`/api/admin/missions/${missionId}/paths`),
      ]);

      if (!missionRes.ok) {
        const errorData = await missionRes.json();
        console.error("Mission API error:", missionRes.status, errorData);
        throw new Error(`Failed to fetch mission: ${errorData.error || missionRes.statusText}`);
      }

      if (!pathsRes.ok) {
        const errorData = await pathsRes.json();
        console.error("Paths API error:", pathsRes.status, errorData);
        throw new Error(`Failed to fetch paths: ${errorData.error || pathsRes.statusText}`);
      }

      const missionData = await missionRes.json();
      const pathsData = await pathsRes.json();

      setMission(missionData.mission);
      setQuests(pathsData.paths);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    document.title = "任務結果報表 - 定向台北";
    fetchData();
  }, [fetchData]);

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const avgTime =
    quests.length > 0
      ? quests.reduce((sum, q) => {
          const match = q.time_spent.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          const hours = parseInt(match?.[1] || "0");
          const minutes = parseInt(match?.[2] || "0");
          const seconds = parseInt(match?.[3] || "0");
          return sum + hours * 3600 + minutes * 60 + seconds;
        }, 0) / quests.length
      : 0;

  const avgDistance =
    quests.length > 0
      ? quests.reduce((sum, q) => sum + q.distance, 0) / quests.length
      : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">載入中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/missions/${missionId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              任務結果報表
            </h1>
            <p className="text-gray-600">{mission?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">完成次數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quests.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">平均時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(`PT${Math.floor(avgTime)}S`)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">平均距離</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgDistance.toFixed(0)}m
                </p>
              </div>
            </div>
          </div>
        </div>

        {mission && quests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              任務路徑地圖
            </h2>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <MissionPathsMap
                mission={mission}
                paths={quests}
                selectedPathId={selectedQuestId}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              完成記錄（共 {quests.length} 筆）
            </h2>

            {quests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>尚無完成記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quest ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        完成時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        移動距離
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        路徑點數
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quests.map((quest, index) => (
                      <tr
                        key={quest.id}
                        className={`hover:bg-gray-50 ${
                          selectedQuestId === quest.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                          {quest.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDuration(quest.time_spent)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {quest.distance}m
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {quest.path.length}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() =>
                              setSelectedQuestId(
                                selectedQuestId === quest.id ? null : quest.id
                              )
                            }
                            className="text-[#5AB4C5] hover:underline"
                          >
                            {selectedQuestId === quest.id
                              ? "取消選擇"
                              : "在地圖顯示"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
