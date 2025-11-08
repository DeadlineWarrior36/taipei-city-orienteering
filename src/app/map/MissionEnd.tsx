"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";

/** 已完成地點的資料結構 */
interface CompletedLocation {
  id: string;
  name: string;
  description: string;
  points: number;
}

interface MissionEndProps {
  /** 點擊主要按鈕 (我的點數) 的回呼函式 */
  onPrimaryAction: () => void;
  /** 任務名稱 (例如: "019") */
  missionName: string;
  /** 總共獲得點數 */
  //   totalPoints: number;
  /** 耗費時間 (例如: "1hr36min") */
  time: string;
  /** 走過的距離 (單位: m) */
  distance: number;
  /** 已完成的地點列表 */
  completedLocations: CompletedLocation[];
}

/** 輔助函式：將數字限制在 min 和 max 之間 */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * 任務結束時顯示的底部面板，包含任務總結資訊。
 */
export default function MissionEnd({
  onPrimaryAction,
  missionName,
  //   totalPoints,
  time,
  distance,
  completedLocations,
}: MissionEndProps) {
  // --- 拖曳狀態管理 ---
  const snaps = useMemo(() => [0.5, 1.0], []); // 50% (半) 和 100% (全) 視窗高度
  const [sheetPct, setSheetPct] = useState(snaps[0]); // 初始為半展開 (50%)
  const dragStartY = useRef<number | null>(null);
  const dragStartPct = useRef<number>(sheetPct);

  // 計算 CSS 使用的 vh 高度
  const sheetVH = `${sheetPct * 100}vh`;
  const isFullScreen = sheetPct === 1.0;

  // --- 拖曳事件處理 ---
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragStartY.current = e.clientY;
      dragStartPct.current = sheetPct;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [sheetPct]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current; // 往下拖 dy > 0
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const delta = -(dy / vh); // 往上為正值
    const next = clamp(dragStartPct.current + delta, 0.25, 1.0); // 限制在 25% ~ 100% 之間
    setSheetPct(next);
  }, []);

  const onPointerUp = useCallback(() => {
    if (dragStartY.current === null) return;
    // 放手時吸附到最近的 snap 點
    const nearest = snaps.reduce((p, c) =>
      Math.abs(c - sheetPct) < Math.abs(p - sheetPct) ? c : p
    );
    setSheetPct(nearest);
    dragStartY.current = null;
  }, [sheetPct, snaps]);

  // 從 completedLocations 計算總點數
  const totalPoints = completedLocations
    .map((loc) => loc.points)
    .reduce((a, b) => a + b, 0);

  return (
    // 1. 底部面板根元素
    //    - 使用 sheetVH 動態高度
    //    - 增加 transition 實現平滑動畫
    <div
      className="fixed inset-x-0 bottom-0 z-[5000] w-full"
      style={{
        height: sheetVH,
        transition: "height 0.3s cubic-bezier(0.2, 0, 0, 1)", // 平滑過渡
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-end-title"
      // 修正：停止 wheel 事件冒泡，防止地圖縮放
      onWheel={(e) => e.stopPropagation()}
    >
      {/* 2. 面板容器
        - 限制最大寬度並置中
        - `h-full` 使其填滿父層的動態高度
        - 根據 isFullScreen 決定是否套用 p-3
      */}
      <div
        className={`mx-auto max-w-screen-sm h-full ${
          isFullScreen ? "" : "p-3"
        }`}
      >
        {/*
          3. 內容卡片
          - `h-full` 填滿
          - `flex flex-col` 啟用 flex 佈局，使內部分為上中下
          - `overflow-hidden` 裁切圓角
          - 根據 isFullScreen 決定是否套用 rounded-t-2xl
        */}
        <div
          className={`relative bg-white shadow-xl overflow-hidden h-full flex flex-col ${
            isFullScreen ? "" : "rounded-t-2xl"
          }`}
        >
          {/* 3a. 拖曳 Handle (固定) */}
          <div
            className="flex-shrink-0 py-4 cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: "none" }} // 保持：防止捲動手勢衝突
          >
            <div className="relative h-1.5 w-12 mx-auto rounded-full bg-neutral-300/90"></div>
          </div>

          {/* 3b. 頂部 (固定) - 藍色區塊 */}
          <div className="bg-[#DBF1F5] p-6 flex-shrink-0">
            <h2
              id="mission-end-title"
              className="text-2xl font-bold text-[#000000] mb-1"
            >
              恭喜！
            </h2>
            <p className="text-lg font-semibold text-[#000000]">
              任務 {missionName} 已全部達成！
            </p>
          </div>

          {/* 3c. 中間 (可捲動) - 地點列表 */}
          <div
            className="p-6 flex-1 overflow-y-auto"
            style={{ touchAction: "pan-y" }} // 保持：啟用垂直捲動手勢
          >
            {/* 5a. 地點列表 */}
            <ul className="space-y-5">
              {completedLocations.map((location) => (
                <li key={location.id} className="flex items-start gap-4">
                  {/* 星星圖示 */}
                  {/* <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-[#D45251]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  </div>
                   */}
                  {/* 地點資訊 */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-[#171B1D]">
                      {location.name}
                    </p>
                    <p className="text-sm text-[#738995]">
                      {/* {location.description} */}
                    </p>
                  </div>

                  {/* 狀態與點數 */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-[#76A732]">已達成！</p>
                    <p className="text-sm text-[#475259]">
                      +{location.points}點
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 3d. 底部 (固定) - 總結與按鈕 */}
          <div className="p-6 pt-0 border-t border-[#E3E7E9] flex-shrink-0">
            {/* 5c. 總結數據 */}
            <div className="space-y-3 my-6">
              <p className="flex justify-between text-base text-[#475259]">
                本次任務獲得點數：
                <span className="font-semibold text-[#171B1D] ml-2">
                  {totalPoints}
                </span>
              </p>
              <p className="flex justify-between text-base text-[#475259]">
                耗費時間：
                <span className="font-semibold text-[#171B1D] ml-2">
                  {time}
                </span>
              </p>
              <p className="flex justify-between text-base text-[#475259]">
                走過的距離：
                <span className="font-semibold text-[#171B1D] ml-2">
                  {distance}m
                </span>
              </p>
            </div>

            {/* 5d. 主要按鈕 */}
            <button
              onClick={onPrimaryAction}
              className="w-full bg-[#5AB4C5] text-white py-3 rounded-full 
                         text-base font-semibold
                         hover:bg-[#468D9B] active:scale-95 transition-all"
            >
              我的點數
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
