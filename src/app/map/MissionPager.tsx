"use client";

import { Mission } from "@/types/api";
import { useEffect, useRef, useState } from "react";

export default function MissionPager({
  missions,
  index,
  onIndexChange,
  onStart,
}: {
  missions: Mission[];
  index: number;
  onIndexChange: (i: number) => void;
  onStart?: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const isScrollingProgrammatically = useRef(false);

  // 捲到目標卡片置中
  useEffect(() => {
    const row = rowRef.current;
    const el = row?.children[index] as HTMLElement | undefined;
    if (!row || !el) return;
    const offset = el.offsetLeft - (row.clientWidth - el.clientWidth) / 2;
    isScrollingProgrammatically.current = true;
    row.scrollTo({ left: offset, behavior: "smooth" });
    // 滾動動畫結束後重置標記
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 500);
  }, [index]);

  // 使用者滑動時，依中心最近卡片更新 index
  const onScroll = () => {
    // 如果是程式觸發的滾動，忽略
    if (isScrollingProgrammatically.current) return;

    const row = rowRef.current;
    if (!row) return;
    const cards = Array.from(row.children) as HTMLElement[];
    const center = row.scrollLeft + row.clientWidth / 2;
    let best = 0;
    let min = Number.POSITIVE_INFINITY;
    cards.forEach((c, i) => {
      const mid = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(center - mid);
      if (d < min) {
        min = d;
        best = i;
      }
    });
    if (best !== index) onIndexChange(best);
  };

  const selectedMission = missions[index];

  return (
    <>
      {/* 底部橫向任務列表 */}
      <div className="h-32 backdrop-blur-lg border-t border-white/30 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]" style={{ background: "rgba(219, 241, 245, 0.85)" }}>
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="h-full flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 py-4"
        >
          {missions.map((m, i) => (
            <div
              key={m.id}
              onClick={() => {
                if (i === index) {
                  setShowDetails(true);
                } else {
                  onIndexChange(i);
                }
              }}
              className={`snap-center shrink-0 w-64 h-full rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-center
                          ${
                            i === index
                              ? "bg-[color:var(--brand,#5AB4C5)] text-white shadow-lg scale-105"
                              : "bg-white text-neutral-800 shadow hover:shadow-md"
                          }`}
            >
              <div className="text-sm font-bold mb-1 truncate">{m.name}</div>
              <div
                className={`text-xs ${
                  i === index ? "text-white/90" : "text-neutral-600"
                }`}
              >
                {m.locations.length} 個目的地
              </div>
              {i === index && (
                <div className="text-xs text-white/80 mt-1">
                  點擊查看詳情 →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 控制點詳情彈窗 */}
      {showDetails && selectedMission && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-end"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-6 py-5 text-white flex-shrink-0 rounded-t-3xl"
              style={{ background: "var(--brand, #5AB4C5)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">選擇任務</div>
                  <div className="text-2xl font-bold">
                    {selectedMission.name}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white/90 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 控制點列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 text-sm font-medium text-neutral-800 bg-neutral-50/60">
                  目的地（{selectedMission.locations.length}）
                </div>
                <ul className="divide-y divide-neutral-200">
                  {selectedMission.locations.map((loc, j) => (
                    <li key={j} className="px-4 py-3 flex items-start gap-3">
                      <span
                        className="mt-0.5 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold text-white"
                        style={{ background: "var(--brand, #5AB4C5)" }}
                      >
                        {j + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-[15px] text-neutral-600 font-semibold">
                          {loc.name}
                        </div>
                        <div className="text-xs text-neutral-600">
                          目標：15 點・進入範圍即完成
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 按鈕 */}
            <div className="px-6 py-4 border-t border-neutral-200/50">
              <button
                onClick={async () => {
                  setShowDetails(false);
                  await onStart?.();
                }}
                className="w-full rounded-full px-6 py-3 text-white font-semibold shadow-lg active:scale-95 transition-all"
                style={{ background: "var(--brand, #5AB4C5)" }}
              >
                選定這個任務
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
