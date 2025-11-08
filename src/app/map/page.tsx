"use client";

import dynamic from "next/dynamic";
import { Mission } from "../types";
import MissionList from "./MissionList";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

async function createQuest({
  missionId,
  userId,
}: {
  missionId: string;
  userId: string;
}) {
  const res = await fetch("/api/quest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ missionId, userId }),
  }).then((res) => res.json());

  return res;
}

export default function MapPage() {
  const selectedMissionId = "1";
  const missions: Mission[] = [
    {
      id: "1",
      name: "Sample Mission",
      description: "This is a sample mission.",
      locations: [
        { latitude: 25.033, longitude: 121.5654 },
        { latitude: 25.035, longitude: 121.56 },
        { latitude: 25.03, longitude: 121.5 },
      ],
    },
    {
      id: "2",
      name: "Sample Mission 2",
      description: "This is a sample mission 2.",
      locations: [
        { latitude: 25.033, longitude: 121.5654 },
        { latitude: 25.035, longitude: 121.56 },
        { latitude: 25.03, longitude: 121.5 },
      ],
    },
  ];

  const selectedMission = missions.find((m) => m.id === selectedMissionId);
  return (
    <div className="relative overflow-hidden">
      <Map locations={selectedMission?.locations} />
      <MissionList missions={missions} />
    </div>
  );
}
