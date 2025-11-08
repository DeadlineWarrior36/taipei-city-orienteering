"use client";

import dynamic from "next/dynamic";
import MissionList from "./MissionList";
import useMissionsList from "./useMissionsList";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapPage() {
  const selectedMissionId = "1";

  const { missions } = useMissionsList();
  const selectedMission = missions?.missions.find(
    (m) => m.id === selectedMissionId
  );
  return (
    <div className="relative overflow-hidden">
      <Map locations={selectedMission?.locations} />
      <MissionList missions={missions?.missions || []} />
    </div>
  );
}
