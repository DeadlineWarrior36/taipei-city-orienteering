import { Mission } from "../types";

export default function MissionList({ missions }: { missions: Mission[] }) {
  return (
    <div className="absolute bottom-2 z-3000 w-screen flex flex-row overflow-scroll">
      {missions.map((mission) => (
        <div
          key={mission.id}
          className="border p-4 m-2 flex-none rounded shadow-md bg-amber-200 text-black w-64 "
        >
          <h2 className="text-xl font-bold mb-2">{mission.name}</h2>
          <p className="text-sm mb-4">{mission.description}</p>
        </div>
      ))}
    </div>
  );
}
