"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import MissionPager from "./MissionPager";
import { Mission } from "../types";

// 地圖用 CSR
const Map = dynamic(() => import("./Map"), { ssr: false });

export default function MapPage() {
  // 假資料（請換成你的）
  const missions: Mission[] = useMemo(
    () => [
      {
        id: "019",
        name: "任務包 019",
        description: "中正區步行環境巡檢：照明、無障礙、穿越動線。",
        locations: [
          { latitude: 25.03288, longitude: 121.5183 },
          { latitude: 25.0343, longitude: 121.5208 },
          { latitude: 25.0306, longitude: 121.5222 },
        ],
      },
      {
        id: "020",
        name: "任務包 020",
        description: "華山周邊：騎樓連續性、路面破損、路側停車影響。",
        locations: [
          { latitude: 25.0449, longitude: 121.5292 },
          { latitude: 25.0459, longitude: 121.5257 },
          { latitude: 25.0413, longitude: 121.5278 },
        ],
      },
      {
        id: "021",
        name: "任務包 021",
        description: "城中歷史巷弄：巷道照明、騎樓占用、行人號誌等。",
        locations: [
          { latitude: 25.0440, longitude: 121.5097 },
          { latitude: 25.0418, longitude: 121.5119 },
        ],
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const selected = missions[index];

  return (
    <div className="relative">
      {/* 地圖：根據選中的任務包自動 zoom 到能看到所有點 */}
      <Map locations={selected?.locations} />

      {/* 下方整張卡片 Pager，左右滑切換；上方有「選定這個任務」按鈕 */}
      <MissionPager
        missions={missions}
        index={index}
        onIndexChange={setIndex}
        onStart={() => alert(`開始 ${selected?.name}`)}
      />
    </div>
  );
}
