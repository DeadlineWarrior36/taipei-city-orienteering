"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { Coins, Navigation, GripVertical, CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

import useMissionsList from "./useMissionsList";
import MissionPager from "./MissionPager";
import useQuest from "./useQuest";
import { useAuth } from "@/contexts/AuthContext";
import useUserPoints from "./useUserPoints";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapPage() {
  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = "定向台北";
  }, []);

  // Get user ID from local storage
  const { userId } = useAuth();

  // Selected mission state
  const [selectedMissionId, setSelectedMissionId] = useState("1");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [reorderedLocations, setReorderedLocations] = useState<Array<{
    id: string;
    name: string;
    lat: number;
    lnt: number;
    point: number;
    description?: string;
  }>>([]);

  // Fetch missions data
  const { missions } = useMissionsList();
  const selectedMission = missions?.missions.find(
    (m) => m.id === selectedMissionId
  );

  // Quest handling
  const { isRecording, startQuest, logPath, endQuest, quest, questId } = useQuest({
    userId: userId ?? "",
    missionId: selectedMissionId,
  });

  const { points, loading, error } = useUserPoints(userId);

  // Start quest handler
  const handleStartQuest = useCallback(async () => {
    if (!userId || !selectedMissionId) {
      console.error("Missing userId or missionId");
      return;
    }
    try {
      // Reset state from previous quest
      setLastCompletedCount(0);
      setShowCompletionNotification(false);
      setCompletedLocationName("");
      setCompletionTime("");
      setCompletionDistance(0);
      setIsAllCompleted(false);
      setShowMissionSummary(false);
      setFinalQuestData(null);
      setSelectedLocationId(null);

      await startQuest();
    } catch (err) {
      console.error("Failed to start quest:", err);
    }
  }, [userId, selectedMissionId, startQuest]);

  // Initialize reordered locations when mission changes
  useEffect(() => {
    if (selectedMission?.locations) {
      setReorderedLocations(selectedMission.locations);
    }
  }, [selectedMission]);

  // Get display locations (reordered or original)
  const displayLocations = reorderedLocations.length > 0 ? reorderedLocations : selectedMission?.locations || [];

  // Track completed locations to show notification
  const [lastCompletedCount, setLastCompletedCount] = useState(0);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);
  const [completedLocationName, setCompletedLocationName] = useState("");
  const [completionTime, setCompletionTime] = useState("");
  const [completionDistance, setCompletionDistance] = useState(0);
  const [isAllCompleted, setIsAllCompleted] = useState(false);
  const [showMissionSummary, setShowMissionSummary] = useState(false);
  const [finalQuestData, setFinalQuestData] = useState<{ time: string; distance: number } | null>(null);

  // Format ISO 8601 duration (PT1H2M3S) to readable format
  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const currentCount = quest?.completedLocationIds?.length || 0;
    if (currentCount > lastCompletedCount) {
      // New location completed (including first one)
      const lastCompletedId = quest?.completedLocationIds?.[currentCount - 1];
      const completedLocation = displayLocations.find(loc => loc.id === lastCompletedId);
      if (completedLocation) {
        setCompletedLocationName(completedLocation.name);
        setCompletionTime(formatDuration(quest?.timeSpent || "PT0S"));
        setCompletionDistance(quest?.distance || 0);
        setShowCompletionNotification(true);

        // Check if all locations are completed
        const allCompleted = currentCount === displayLocations.length;
        setIsAllCompleted(allCompleted);

        if (!allCompleted) {
          setTimeout(() => setShowCompletionNotification(false), 5000);
        }
      }
    }
    setLastCompletedCount(currentCount);
  }, [quest?.completedLocationIds, lastCompletedCount, displayLocations, quest?.timeSpent, quest?.distance]);

  // Handle closing completion notification
  const handleCloseCompletionNotification = async () => {
    setShowCompletionNotification(false);
    if (isAllCompleted) {
      // Save final quest data before clearing
      setFinalQuestData({
        time: completionTime,
        distance: completionDistance,
      });
      // End quest (this will clear quest state)
      await endQuest();
      // Show summary with saved data
      setShowMissionSummary(true);
    }
  };

  // Handle drag and drop reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLocations = [...displayLocations];
    const draggedItem = newLocations[draggedIndex];
    newLocations.splice(draggedIndex, 1);
    newLocations.splice(index, 0, draggedItem);

    setReorderedLocations(newLocations);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Open all locations in Google Maps
  const handleOpenAllNavigation = () => {
    const waypoints = displayLocations
      .slice(1, -1)
      .map(loc => `${loc.lat},${loc.lnt}`)
      .join('|');

    const firstLoc = displayLocations[0];
    const lastLoc = displayLocations[displayLocations.length - 1];

    let url = `https://www.google.com/maps/dir/?api=1`;
    url += `&destination=${lastLoc.lat},${lastLoc.lnt}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    if (firstLoc) {
      url += `&origin=${firstLoc.lat},${firstLoc.lnt}`;
    }

    window.location.href = url;
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className={isRecording ? "h-full relative" : "h-[calc(100vh-8rem)] relative"}>
        <Map
          locations={selectedMission?.locations}
          // showMission={!isRecording} /* Hide mission points when recording */
          logPath={logPath}
          quest={quest}
          isRecording={isRecording}
          completedLocationIds={quest?.completedLocationIds}
          selectedLocationId={selectedLocationId}
          onLocationClick={setSelectedLocationId}
        />
      </div>
      {!isRecording && (
        <MissionPager
          missions={missions?.missions || []}
          index={
            missions?.missions.findIndex((m) => m.id === selectedMissionId) || 0
          }
          onIndexChange={(index) =>
            setSelectedMissionId(missions?.missions[index]?.id || "1")
          }
          onStart={handleStartQuest}
        />
      )}

      <button
        onClick={() => router.push("/points")}
        className="absolute top-4 right-4 z-5000 px-5 py-1.5 shadow-lg hover:shadow-xl transition-shadow active:scale-95"
        style={{ backgroundColor: "#DBF1F5", borderRadius: "999px" }}
      >
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-black" />
          {loading ? (
            <span className="font-bold text-base text-black">...</span>
          ) : error ? (
            <span className="font-bold text-base text-red-500">!</span>
          ) : (
            <span className="font-bold text-base text-black">{points}</span>
          )}
        </div>
      </button>

      {/* Quest controls */}
      {isRecording && (
        <div className="fixed bottom-0 left-0 right-0 z-5000 h-80 backdrop-blur-lg shadow-[0_-8px_24px_rgba(0,0,0,0.2)]" style={{ background: "rgba(219, 68, 54, 0.95)" }}>
          <div className="h-full flex flex-col px-6 py-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-white mb-1">
                  正在前往...
                </div>
                <div className="text-sm text-white/80">
                  {quest?.completedLocationIds?.length || 0} / {selectedMission?.locations.length || 0} 已完成
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/80 mb-1">任務</div>
                <div className="text-base font-bold text-white">
                  {selectedMission?.name}
                </div>
              </div>
            </div>

            {/* 目的地列表 */}
            <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="h-full overflow-y-auto px-4 py-3">
                <ul className="space-y-2">
                  {displayLocations.map((loc, j) => {
                    const isCompleted = quest?.completedLocationIds?.includes(loc.id);
                    const isSelected = selectedLocationId === loc.id;
                    return (
                      <li
                        key={loc.id}
                        draggable={!isCompleted}
                        onDragStart={() => handleDragStart(j)}
                        onDragOver={(e) => handleDragOver(e, j)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedLocationId(loc.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                          isSelected
                            ? "bg-[color:var(--brand,#5AB4C5)]/20 ring-2 ring-[color:var(--brand,#5AB4C5)]"
                            : isCompleted
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-neutral-50 hover:bg-neutral-100 cursor-move"
                        }`}
                      >
                        {!isCompleted && (
                          <GripVertical className="h-4 w-4 text-neutral-400 shrink-0" />
                        )}
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold shrink-0 ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-neutral-300 text-neutral-600"
                          }`}
                        >
                          {isCompleted ? "✓" : j + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-semibold truncate ${
                              isCompleted
                                ? "text-green-700 line-through"
                                : "text-neutral-800"
                            }`}
                          >
                            {loc.name}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* 按鈕區 */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleOpenAllNavigation}
                className="flex-1 bg-white text-[color:var(--brand,#5AB4C5)] px-4 py-3 rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-lg font-bold flex items-center justify-center gap-2"
              >
                <Navigation className="h-5 w-5" />
                <span>一鍵導航</span>
              </button>
              <button
                onClick={async () => {
                  // Save current quest data before ending
                  if (quest) {
                    const allCompleted = (quest.completedLocationIds?.length || 0) === displayLocations.length;
                    setIsAllCompleted(allCompleted);
                    setFinalQuestData({
                      time: formatDuration(quest.timeSpent || "PT0S"),
                      distance: quest.distance || 0,
                    });
                  }
                  await endQuest();
                  setShowMissionSummary(true);
                }}
                className="flex-1 bg-white text-red-600 px-4 py-3 rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-lg font-bold"
              >
                結束任務
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Notification */}
      {showCompletionNotification && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[6000] flex items-center justify-center animate-in fade-in duration-300"
          onClick={handleCloseCompletionNotification}
        >
          <div
            className="relative rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[320px] animate-in zoom-in duration-300"
            style={{ background: "var(--brand, #5AB4C5)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseCompletionNotification}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" strokeWidth={2} />
            </button>

            <div className="relative">
              <CheckCircle
                className="h-24 w-24 text-white drop-shadow-lg"
                strokeWidth={2.5}
              />
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                成功抵達！
              </div>
              <div className="text-xl text-white/95 font-semibold mb-6">
                {completedLocationName}
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex gap-4 justify-center">
                <div className="flex flex-col items-center">
                  <div className="text-xs text-white/80 mb-1">花費時間</div>
                  <div className="text-lg font-bold text-white">{completionTime}</div>
                </div>
                <div className="w-px bg-white/30"></div>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-white/80 mb-1">走過距離</div>
                  <div className="text-lg font-bold text-white">{completionDistance.toFixed(0)}m</div>
                </div>
                <div className="w-px bg-white/30"></div>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-white/80 mb-1">已完成</div>
                  <div className="text-lg font-bold text-white">{quest?.completedLocationIds?.length || 0} / {displayLocations.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Summary - All Completed */}
      {showMissionSummary && !isRecording && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[6000] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-[90vw] animate-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2" style={{ color: isAllCompleted ? "var(--brand, #5AB4C5)" : "#EF4444" }}>
                {isAllCompleted ? "恭喜完成！" : "任務已結束"}
              </div>
              <div className="text-2xl font-bold text-neutral-800 mb-4">
                {selectedMission?.name}
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">總時間</div>
                  <div className="text-xl font-bold text-neutral-800">{finalQuestData?.time || "0:00"}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">總距離</div>
                  <div className="text-xl font-bold text-neutral-800">{(finalQuestData?.distance || 0).toFixed(0)}m</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">完成點</div>
                  <div className="text-xl font-bold text-neutral-800">{lastCompletedCount} / {displayLocations.length}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {isAllCompleted && (
                <button
                  onClick={() => router.push(`/missions/${selectedMissionId}/paths?questId=${questId}`)}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "var(--brand, #5AB4C5)" }}
                >
                  查看任務詳細資料
                </button>
              )}
              <button
                onClick={() => setShowMissionSummary(false)}
                className="w-full py-3 rounded-xl font-bold text-neutral-700 bg-neutral-100 transition-all hover:bg-neutral-200 active:scale-95"
              >
                返回地圖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
