"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

import useMissionsList from "./useMissionsList";
import MissionPager from "./MissionPager";
import useQuest from "./useQuest";
import { useAuth } from "@/contexts/AuthContext";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapPage() {
  // Get user ID from local storage
  const { userId } = useAuth();

  // Selected mission state
  const [selectedMissionId, setSelectedMissionId] = useState("1");

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

  return (
    <div className="relative overflow-hidden">
      <Map
        locations={selectedMission?.locations}
        // showMission={!isRecording} /* Hide mission points when recording */
        logPath={logPath}
        quest={quest}
        isRecording={isRecording}
      />
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

      {/* Quest controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-5000 p-4">
        {isRecording && (
          <button
            onClick={endQuest}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            結束任務
          </button>
        )}
      </div>
    </div>
  );
}
