"use client";

export default function Fab({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group absolute right-5 bottom-28 z-[1150]
                 rounded-full px-5 py-3
                 bg-blue-600 text-white shadow-xl
                 hover:bg-blue-500 active:scale-95 transition-all"
      aria-label="開始任務"
    >
      <span className="font-semibold">開始任務</span>
    </button>
  );
}

