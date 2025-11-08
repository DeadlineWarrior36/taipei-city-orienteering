"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

import useMissionsList from "./useMissionsList";
import MissionPager from "./MissionPager";
import useQuest from "./useQuest";
import { useLocalStorage } from "../hooks/useLocalStorage";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapPage() {
  // Get user ID from local storage
  const [userId] = useLocalStorage("userId", "");

  // Selected mission state
  const [selectedMissionId, setSelectedMissionId] = useState("1");

  // Fetch missions data
  const { missions } = useMissionsList();
  const selectedMission = missions?.missions.find(
    (m) => m.id === selectedMissionId
  );

  // Quest handling
  const { isRecording, startQuest, endQuest } = useQuest({
    userId,
    missionId: selectedMissionId,
  });

  console.log("Selected Mission ID:", selectedMission);

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
      <Map locations={selectedMission?.locations} />
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

      {/* Quest controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 p-4 rounded-lg shadow">
        {isRecording && (
          <button
            onClick={endQuest}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            End Quest
          </button>
        )}
      </div>
    </div>
  );
}
