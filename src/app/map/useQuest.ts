import { apiClient } from "@/lib/api-client";
import { useState, useCallback } from "react";
import { Coordinate } from "@/types/api";

export type QuestData = {
  userId: string;
  missionId: string;
  startTime: number;
  endTime?: number;
  path: Coordinate[];
  completedLocationIds: string[];
  points: number;
  distance: number;
  timeSpent: string;
  isFinished?: boolean;
};

export function useQuest({
  userId,
  missionId,
}: {
  userId: string;
  missionId: string;
}) {
  const [quest, setQuest] = useState<QuestData | null>(null);
  const [questId, setQuestId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Start quest: call API, save questId, and begin recording
  const startQuest = useCallback(async () => {
    const startTime = Date.now();
    try {
      const questRes = await apiClient.createQuest(userId, {
        mission_id: missionId,
      });
      // Assume questRes returns { id: string }
      setQuestId(questRes.id);
      setQuest({
        userId,
        missionId,
        startTime,
        path: [],
        completedLocationIds: [],
        points: 0,
        distance: 0,
        timeSpent: "0S",
        isFinished: false,
      });
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start quest", err);
    }
  }, [userId, missionId]);

  // Log a new location to the path and submit to API
  const logPath = useCallback(
    async (location: Coordinate) => {
      setQuest((prev) => {
        if (!prev) return prev;
        const newPath = [...prev.path, { ...location }];
        // Submit the entire path to API
        if (questId) {
          // Submit path and get updated quest status
          apiClient
            .submitQuest(userId, questId, {
              paths: newPath,
            })
            .then((res) => {
              // Update quest with the latest data from API
              setQuest((prev) =>
                prev
                  ? {
                      ...prev,
                      completedLocationIds: res.completed_location_ids,
                      points: res.points,
                      distance: res.distance,
                      timeSpent: res.time_spent,
                      isFinished: res.is_finished,
                    }
                  : null
              );
            })
            .catch((err) => {
              console.error("Failed to submit quest update", err);
            });

          return {
            ...prev,
            path: newPath,
          };
        }
        return {
          ...prev,
          path: newPath,
        };
      });
    },
    [questId, userId]
  );

  // End quest: set end time, stop recording, and finalize via API
  const endQuest = useCallback(async () => {
    if (!quest || !questId) return;
    const finishedQuest = { ...quest, endTime: Date.now() };
    setQuest(finishedQuest);
    setIsRecording(false);
  }, [quest, questId]);

  return {
    quest,
    questId,
    isRecording,
    startQuest,
    logPath,
    endQuest,
  };
}

export default useQuest;
