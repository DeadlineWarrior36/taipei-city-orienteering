"use client";

import { Coordinate } from "@/types/api";
import { useRef, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function LocationsList({ 
  locations,
  title = "控制點", 
  show = false,
  onClose,
}: { 
  locations?: Coordinate[];
  title?: string;
  show?: boolean;
  onClose?: () => void;
}) {
  const snaps = [0.3, 0.6, 0.9];
  const [sheetPct, setSheetPct] = useState(0.45);
  const dragStartY = useRef<number | null>(null);
  const dragStartPct = useRef<number>(sheetPct);
  const sheetVH = `${sheetPct * 100}vh`;
  
  // ---- Drag handlers ----
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    dragStartPct.current = sheetPct;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current; // 往下拖 dy > 0
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const delta = -(dy / vh); // 往上為正值
    const next = clamp(dragStartPct.current + delta, 0.25, 0.95);
    setSheetPct(next);
  };

  const onPointerUp = () => {
    if (dragStartY.current === null) return;
    // 放手時吸附到最近的 snap point
    const nearest = snaps.reduce((p, c) =>
      Math.abs(c - sheetPct) < Math.abs(p - sheetPct) ? c : p
    );
    setSheetPct(nearest);
    dragStartY.current = null;
  };

  if (!show || !locations?.length) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[1100]"
      style={{ height: sheetVH }}
    >
      <div className="mx-auto h-full w-full max-w-5xl px-3">
        <div className="relative h-full rounded-t-3xl border border-white/50
                     bg-white/85 backdrop-blur-md shadow-[0_-12px_32px_rgba(0,0,0,0.16)]">
          {/* Handle (draggable) */}
          <div
            className="absolute left-1/2 top-3 -translate-x-1/2 h-1.5 w-12 rounded-full bg-neutral-300/90 cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-700"
            >
              ✕
            </button>
          )}

          {/* Content */}
          <div className="absolute inset-0 mt-8 px-4 pb-5 overflow-y-auto">
            <section className="h-[calc(100%-8px)] w-full rounded-3xl overflow-hidden
                            bg-white shadow-lg flex flex-col">
              {/* Header */}
              <div
                className="px-6 py-4 text-white shrink-0"
                style={{ background: "var(--brand, #5AB4C5)" }}
              >
                <div className="text-xs/5 opacity-95 tracking-wide">
                  任務進度
                </div>
                <div className="text-xl sm:text-2xl font-extrabold tracking-wide">
                  {title}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 grow overflow-y-auto">
                <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm overflow-hidden">
                  <div className="px-4 py-3 text-sm font-medium text-neutral-800 bg-neutral-50/60">
                    控制點（{locations.length}）
                  </div>
                  <ul className="divide-y divide-neutral-200">
                    {locations.map((_, j) => (
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
                          <div className="text-[15px] font-semibold">
                            控制點 {j + 1}
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
          </div>
        </div>
      </div>
    </div>
  );
}