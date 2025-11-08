import { apiClient } from "@/lib/api-client";
import { useState, useCallback } from "react";
import { Coordinate } from "@/types/api";

export type QuestData = {
  userId: string;
  missionId: string;
  startTime: number;
  endTime?: number;
  path: Coordinate[];
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
      setQuest({ userId, missionId, startTime, path: [] });
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
          apiClient.submitQuest(userId, questId, { paths: newPath });
        }
        return { ...prev, path: newPath };
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
