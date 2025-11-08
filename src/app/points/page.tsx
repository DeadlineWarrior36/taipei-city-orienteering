"use client";

import { useState, useEffect } from "react";
import { Coins, ChevronLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import useUserPoints from "../map/useUserPoints";
import { apiClient } from "@/lib/api-client";
import type { PointsTransaction } from "@/types/api";

export default function PointsPage() {
  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = "定向台北";
  }, []);

  const { userId } = useAuth();
  const { points, loading } = useUserPoints(userId);
  const [activeTab, setActiveTab] = useState<"earned" | "used">("earned");
  const [qrCodeExpiry, setQrCodeExpiry] = useState(300);
  const [qrSeed, setQrSeed] = useState(Date.now());
  const [earnedTransactions, setEarnedTransactions] = useState<PointsTransaction[]>([]);
  const [usedTransactions, setUsedTransactions] = useState<PointsTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setQrCodeExpiry((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      try {
        const [earned, used] = await Promise.all([
          apiClient.getPointsTransactions(userId, 'earned'),
          apiClient.getPointsTransactions(userId, 'used'),
        ]);
        setEarnedTransactions(earned.transactions);
        setUsedTransactions(used.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const mergeTransactionsByQuest = (transactions: PointsTransaction[]) => {
    const questMap = new Map<string | null, {
      points: number;
      description: string;
      created_at: string;
      quest_id: string | null;
    }>();

    transactions.forEach((transaction) => {
      const key = transaction.quest_id || transaction.id;

      if (transaction.quest_id && questMap.has(transaction.quest_id)) {
        const existing = questMap.get(transaction.quest_id)!;
        existing.points += transaction.points;
        if (new Date(transaction.created_at) < new Date(existing.created_at)) {
          existing.created_at = transaction.created_at;
        }
      } else {
        questMap.set(key, {
          points: transaction.points,
          description: transaction.description || (transaction.transaction_type === 'earned' ? '獲得點數' : '使用點數'),
          created_at: transaction.created_at,
          quest_id: transaction.quest_id,
        });
      }
    });

    return Array.from(questMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const mergedEarnedTransactions = mergeTransactionsByQuest(earnedTransactions);
  const mergedUsedTransactions = mergeTransactionsByQuest(usedTransactions);

  const handleRefreshQR = () => {
    setQrCodeExpiry(300);
    setQrSeed(Date.now());
  };

  const generateQRPattern = (seed: number) => {
    const random = (n: number) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };

    const patterns = [];
    const moduleSize = 4.5;
    const gridSize = 21;

    let index = 0;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = 2 + col * moduleSize;
        const y = 2 + row * moduleSize;

        const isTopLeft = row < 7 && col < 7;
        const isTopRight = row < 7 && col >= gridSize - 7;
        const isBottomLeft = row >= gridSize - 7 && col < 7;

        if (!isTopLeft && !isTopRight && !isBottomLeft) {
          if (random(index) > 0.45) {
            patterns.push({ x, y, size: moduleSize, key: index });
          }
          index++;
        }
      }
    }
    return patterns;
  };

  const qrPatterns = generateQRPattern(qrSeed);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#EDF8FA" }}>
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
            <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <rect x="2" y="2" width="31" height="31" fill="black"/>
                <rect x="67" y="2" width="31" height="31" fill="black"/>
                <rect x="2" y="67" width="31" height="31" fill="black"/>
                <rect x="7" y="7" width="21" height="21" fill="white"/>
                <rect x="72" y="7" width="21" height="21" fill="white"/>
                <rect x="7" y="72" width="21" height="21" fill="white"/>
                <rect x="12" y="12" width="11" height="11" fill="black"/>
                <rect x="77" y="12" width="11" height="11" fill="black"/>
                <rect x="12" y="77" width="11" height="11" fill="black"/>

                {qrPatterns.map((pattern) => (
                  <rect
                    key={pattern.key}
                    x={pattern.x}
                    y={pattern.y}
                    width={pattern.size}
                    height={pattern.size}
                    fill="black"
                  />
                ))}
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
            {transactionsLoading ? (
              <div className="text-center text-gray-500 py-8">
                <p>載入中...</p>
              </div>
            ) : activeTab === "earned" ? (
              mergedEarnedTransactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>尚無獲得紀錄</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mergedEarnedTransactions.map((transaction, index) => (
                    <div
                      key={transaction.quest_id || `no-quest-${index}`}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{transaction.points}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              mergedUsedTransactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>尚無使用紀錄</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mergedUsedTransactions.map((transaction, index) => (
                    <div
                      key={transaction.quest_id || `no-quest-${index}`}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">-{transaction.points}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
