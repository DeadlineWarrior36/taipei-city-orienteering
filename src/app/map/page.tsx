"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { Coins } from "lucide-react";

import useMissionsList from "./useMissionsList";
import MissionPager from "./MissionPager";
import useQuest from "./useQuest";
import { useAuth } from "@/contexts/AuthContext";
import useUserPoints from "./useUserPoints";
import MissionEnd from "./MissionEnd";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapPage() {
  // Get user ID from local storage
  const { userId } = useAuth();
  const [showEnd, setShowEnd] = useState(true);

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
      {!showEnd ? <></> : (
        <MissionEnd          
          onPrimaryAction={() => {
            setShowEnd(false);
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
      {!showEnd ? <></> : (
        <MissionEnd          
          onPrimaryAction={() => {
            setShowEnd(false);
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

      <div className="absolute top-20 right-4 z-5000">
        <div className="px-5 py-1.5 shadow-lg" style={{ backgroundColor: '#DBF1F5', borderRadius: '999px' }}>
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
        </div>
      </div>

      <div className="absolute top-20 right-4 z-5000">
        <div className="px-5 py-1.5 shadow-lg" style={{ backgroundColor: '#DBF1F5', borderRadius: '999px' }}>
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
        </div>
      </div>

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
