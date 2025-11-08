"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { Coins } from "lucide-react";
import { useRouter } from "next/navigation";

import useMissionsList from "./useMissionsList";
import MissionPager from "./MissionPager";
import useQuest from "./useQuest";
import { useAuth } from "@/contexts/AuthContext";
import useUserPoints from "./useUserPoints";
import MissionEnd from "./MissionEnd";
import moment from "moment";

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

  const showEnd = quest?.isFinished;

  const duration = moment.duration(quest?.timeSpent || "");

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
      {!showEnd ? (
        <></>
      ) : (
        <MissionEnd
          onPrimaryAction={() => {
            console.log("View My Points clicked");
          }}
          missionName={selectedMission?.name || ""}
          // totalPoints={150} /* Placeholder */
          time={`${duration.minutes()}:${duration.seconds()}`} /* Placeholder */
          distance={3200} /* Placeholder */
          completedLocations={
            selectedMission?.locations
              // .concat(Array.from(selectedMission?.locations))
              // .concat(Array.from(selectedMission?.locations))
              .map((loc) => ({
                id: loc.id,
                name: loc.name,
                description: loc.description ?? "",
                points: 50, // Placeholder
              })) || []
          }
        />
      )}

      {!showEnd ? (
        <></>
      ) : (
        <MissionEnd
          onPrimaryAction={() => {
            console.log("View My Points clicked");
          }}
          missionName={selectedMission?.name || ""}
          // totalPoints={150} /* Placeholder */
          time={"1hr36min"} /* Placeholder */
          distance={3200} /* Placeholder */
          completedLocations={
            selectedMission?.locations
              // .concat(Array.from(selectedMission?.locations))
              // .concat(Array.from(selectedMission?.locations))
              .map((loc) => ({
                id: loc.id,
                name: loc.name,
                description: loc.description ?? "",
                points: 50, // Placeholder
              })) || []
          }
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
                  {selectedMission?.locations.map((loc, j) => {
                    const isCompleted = quest?.completedLocationIds?.includes(loc.id);
                    const isSelected = selectedLocationId === loc.id;
                    return (
                      <li
                        key={loc.id}
                        onClick={() => setSelectedLocationId(loc.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[color:var(--brand,#5AB4C5)]/20 ring-2 ring-[color:var(--brand,#5AB4C5)]"
                            : isCompleted
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-neutral-50 hover:bg-neutral-100"
                        }`}
                      >
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

            {/* 結束按鈕 */}
            <button
              onClick={endQuest}
              className="mt-4 w-full bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-lg font-bold"
            >
              結束任務
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
