"use client";

import { Mission } from "@/types/api";
import { useEffect, useRef, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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

  // ---- Bottom Sheet 互動狀態 ----
  const snaps = [0.3, 0.6, 0.9]; // 30% / 60% / 90% 高
  const [sheetPct, setSheetPct] = useState(0.45); // 初始 45% 高
  const dragStartY = useRef<number | null>(null);
  const dragStartPct = useRef<number>(sheetPct);

  // 提供 CSS 變數給樣式使用
  const sheetVH = `${sheetPct * 100}vh`;

  // 捲到目標卡片置中
  useEffect(() => {
    const row = rowRef.current;
    const el = row?.children[index] as HTMLElement | undefined;
    if (!row || !el) return;
    const offset = el.offsetLeft - (row.clientWidth - el.clientWidth) / 2;
    row.scrollTo({ left: offset, behavior: "smooth" });
  }, [index]);

  // 使用者滑動時，依中心最近卡片更新 index
  const onScroll = () => {
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

  // ---- 手勢：拖曳 handle 上下改變高度 ----
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    dragStartPct.current = sheetPct;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    // console.log("onPointerDown:", dragStartY.current, dragStartPct.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current; // 往下拖 dy > 0
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const delta = -(dy / vh); // 往上為正值
    const next = clamp(dragStartPct.current + delta, 0.25, 0.95);
    setSheetPct(next);
    // console.log("onPointerMove:", next);
  };

  const onPointerUp = () => {
    if (dragStartY.current === null) return;
    // 放手時吸附到最近的 snap point
    setTimeout(() => {
      const nearest = snaps.reduce((p, c) =>
        Math.abs(c - sheetPct) < Math.abs(p - sheetPct) ? c : p
      );
      setSheetPct(nearest);
      dragStartY.current = null;
      // console.log("onPointerUp:", nearest);
    }, 100);
  };

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 z-5000 flex justify-center"
        style={{ bottom: `calc(${sheetVH} + 16px)` }}
      >
        <button
          onClick={onStart}
          className="pointer-events-auto rounded-full px-6 py-3 text-white font-semibold shadow-xl active:scale-95 transition-all cursor-pointer"
          style={{ background: "var(--brand, #5AB4C5)" }}
          aria-label="選定這個任務"
        >
          選定這個任務
        </button>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-[1100]"
        style={{ height: sheetVH }}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerMove={onPointerMove}
      >
        <div className="mx-auto h-full w-full max-w-screen-lg px-3">
          <div
            className="relative h-full rounded-t-[24px] border border-white/50
                       bg-white/85 backdrop-blur-md shadow-[0_-12px_32px_rgba(0,0,0,0.16)]"
          >
            {/* handle（可拖拉） */}
            <div
              className="absolute left-1/2 top-3 -translate-x-1/2"
              onPointerDown={onPointerDown}
            >
              <div className="relative">
                {/* 透明的放大感應區 */}
                <div className="absolute -inset-y-4 -inset-x-20"></div>

                {/* 看得到的灰色條 */}
                <div className="relative z-[1] h-1.5 w-12 rounded-full bg-neutral-300/90 cursor-grab active:cursor-grabbing"></div>
              </div>
            </div>
            <div className="absolute right-4 top-3.5 z-[1] flex gap-1.5">
              {missions.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === index
                      ? "bg-[color:var(--brand,#5AB4C5)]"
                      : "bg-neutral-300"
                  }`}
                />
              ))}
            </div>
            {/* 卡片列（左右滑） */}
            <div
              ref={rowRef}
              onScroll={onScroll}
              className="absolute inset-0 mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-5"
            >
              {missions.map((m, i) => (
                <section
                  key={m.id}
                  onClick={() => onIndexChange(i)}
                  className={`snap-center shrink-0 h-[calc(100%-8px)]
                              w-[92vw] max-w-[720px] rounded-3xl overflow-hidden
                              ${
                                i === index
                                  ? "ring-2 ring-[color:var(--brand,#5AB4C5)]/60"
                                  : "ring-1 ring-neutral-200/60"
                              }
                              bg-white shadow-lg flex flex-col cursor-pointer`}
                >
                  {/* Header */}
                  <div
                    className="px-6 py-4 text-white flex-shrink-0"
                    style={{ background: "var(--brand, #5AB4C5)" }}
                  >
                    <div className="text-xs/5 opacity-95 tracking-wide">
                      選擇任務
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold tracking-wide">
                      {m.name}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4 flex-grow overflow-y-auto">
                    {/* <p className="text-[15px] leading-relaxed text-neutral-700 mb-4">
                      {m.description}
                    </p> */}
                    <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-3 text-sm font-medium text-neutral-800 bg-neutral-50/60">
                        控制點（{m.locations.length}）
                      </div>
                      <ul className="divide-y divide-neutral-200">
                        {m.locations.map((loc, j) => (
                          <li
                            key={j}
                            className="px-4 py-3 flex items-start gap-3"
                          >
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
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
