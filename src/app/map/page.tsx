"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { Coins, Navigation, GripVertical } from "lucide-react";
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
  const { isRecording, startQuest, logPath, endQuest, quest } = useQuest({
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

    window.open(url, '_blank');
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
                onClick={endQuest}
                className="flex-1 bg-white text-red-600 px-4 py-3 rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-lg font-bold"
              >
                結束任務
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
