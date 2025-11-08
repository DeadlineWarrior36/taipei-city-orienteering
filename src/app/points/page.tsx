"use client";

import { useState, useEffect } from "react";
import { Coins, ChevronLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import useUserPoints from "../map/useUserPoints";

export default function PointsPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { points, loading } = useUserPoints(userId);
  const [activeTab, setActiveTab] = useState<"earned" | "used">("earned");
  const [qrCodeExpiry, setQrCodeExpiry] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setQrCodeExpiry((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRefreshQR = () => {
    setQrCodeExpiry(300);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#EDF8FA" }}>
      <div className="bg-white px-4 py-3 shadow-sm flex items-center">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-lg font-semibold text-black ml-2">我的點數</h1>
      </div>

      <div className="flex-1 px-4 pt-6 pb-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Coins className="w-10 h-10 text-[#2CB6C7]" />
          <span className="text-4xl font-bold text-black">
            {loading ? "0" : points}
          </span>
        </div>

        <div
          className="rounded-2xl p-3 mb-6"
          style={{ backgroundColor: "#2CB6C7" }}
        >
          <p className="text-white text-center font-bold mb-3">
            請於指定通路出示
          </p>

          <div className="flex items-center justify-center mb-3">
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-2">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <rect x="0" y="0" width="30" height="30" fill="black"/>
                <rect x="70" y="0" width="30" height="30" fill="black"/>
                <rect x="0" y="70" width="30" height="30" fill="black"/>
                <rect x="10" y="10" width="10" height="10" fill="white"/>
                <rect x="80" y="10" width="10" height="10" fill="white"/>
                <rect x="10" y="80" width="10" height="10" fill="white"/>
                <rect x="40" y="20" width="5" height="5" fill="black"/>
                <rect x="50" y="25" width="5" height="5" fill="black"/>
                <rect x="45" y="35" width="5" height="5" fill="black"/>
                <rect x="60" y="40" width="5" height="5" fill="black"/>
                <rect x="35" y="50" width="5" height="5" fill="black"/>
                <rect x="55" y="55" width="5" height="5" fill="black"/>
                <rect x="40" y="65" width="5" height="5" fill="black"/>
                <rect x="65" y="70" width="5" height="5" fill="black"/>
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <span className="text-white text-sm font-bold">
              {formatTime(qrCodeExpiry)}
            </span>
            <button
              onClick={handleRefreshQR}
              className="text-white hover:text-gray-100 transition-colors p-1"
            >
              <RefreshCw className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("earned")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "earned"
                  ? "text-[#2CB6C7] border-b-2 border-[#2CB6C7]"
                  : "text-gray-500"
              }`}
            >
              獲得紀錄
            </button>
            <button
              onClick={() => setActiveTab("used")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "used"
                  ? "text-[#2CB6C7] border-b-2 border-[#2CB6C7]"
                  : "text-gray-500"
              }`}
            >
              使用紀錄
            </button>
          </div>

          <div className="p-4 min-h-[300px]">
            {activeTab === "earned" ? (
              <div className="text-center text-gray-500 py-8">
                <p>尚無獲得紀錄</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>尚無使用紀錄</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
