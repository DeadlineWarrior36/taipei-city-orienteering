"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import {
  Users,
  Map,
  MapPin,
  Package,
  TrendingUp,
  CheckCircle,
  Coins,
} from "lucide-react";
import type { AdminStats } from "@/types/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "管理後台 - 定向台北";

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">載入中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理總覽</h1>
          <p className="text-gray-600">定向台北系統統計數據</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="總使用者數"
            value={stats?.totalUsers || 0}
            icon={Users}
            description="已註冊的使用者"
          />
          <StatCard
            title="總任務數"
            value={stats?.totalMissions || 0}
            icon={Map}
            description="已建立的任務"
          />
          <StatCard
            title="總景點數"
            value={stats?.totalLocations || 0}
            icon={MapPin}
            description="系統中的景點"
          />
          <StatCard
            title="總商品數"
            value={stats?.totalProducts || 0}
            icon={Package}
            description="可兌換的商品"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="總任務執行數"
            value={stats?.totalQuests || 0}
            icon={TrendingUp}
            description="所有任務執行次數"
          />
          <StatCard
            title="完成任務數"
            value={stats?.completedQuests || 0}
            icon={CheckCircle}
            description="已成功完成的任務"
          />
          <StatCard
            title="完成率"
            value={
              stats?.totalQuests
                ? `${Math.round(
                    ((stats.completedQuests || 0) / stats.totalQuests) * 100
                  )}%`
                : "0%"
            }
            icon={CheckCircle}
            description="任務完成率"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">總獲得點數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalPointsEarned?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              使用者完成任務累積的總點數
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Coins className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">總使用點數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalPointsUsed?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              使用者兌換商品消耗的總點數
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#5AB4C5] to-[#4A9DAD] rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">快速操作</h2>
          <p className="mb-6 text-white/90">選擇一個功能開始管理</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/missions"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-colors"
            >
              <Map className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">任務管理</p>
            </a>
            <a
              href="/admin/locations"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-colors"
            >
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">景點管理</p>
            </a>
            <a
              href="/admin/products"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-colors"
            >
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">商品管理</p>
            </a>
            <a
              href="/admin/users"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center transition-colors"
            >
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">使用者管理</p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
