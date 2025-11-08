"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Eye, TrendingUp, TrendingDown, Coins } from "lucide-react";
import type { PointsTransaction } from "@/types/api";

interface User {
  id: string;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    document.title = "使用者管理 - 定向台北";
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    setTransactionsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/transactions`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const openUserDetail = async (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
    await fetchUserTransactions(user.id);
  };

  const columns = [
    {
      key: "id",
      label: "使用者 ID",
      render: (user: User) => (
        <span className="font-mono text-xs text-gray-600">
          {user.id.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: "total_points",
      label: "總點數",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#5AB4C5]" />
          <span className="font-bold text-[#5AB4C5]">
            {user.total_points.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "註冊時間",
      render: (user: User) =>
        new Date(user.created_at).toLocaleString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "updated_at",
      label: "最後活動",
      render: (user: User) =>
        new Date(user.updated_at).toLocaleString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  const earnedTransactions = transactions.filter(
    (t) => t.transaction_type === "earned"
  );
  const usedTransactions = transactions.filter(
    (t) => t.transaction_type === "used"
  );

  const totalEarned = earnedTransactions.reduce((sum, t) => sum + t.points, 0);
  const totalUsed = usedTransactions.reduce((sum, t) => sum + t.points, 0);

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">使用者管理</h1>
          <p className="text-gray-600">查看使用者資料及點數使用情況</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">總使用者數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">平均點數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length > 0
                    ? Math.round(
                        users.reduce((sum, u) => sum + u.total_points, 0) /
                          users.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Coins className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">總點數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users
                    .reduce((sum, u) => sum + u.total_points, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          data={users}
          columns={columns}
          searchPlaceholder="搜尋使用者..."
          actions={(user: User) => (
            <button
              onClick={() => openUserDetail(user)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              查看詳情
            </button>
          )}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
          setTransactions([]);
        }}
        title="使用者詳細資訊"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                基本資訊
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">使用者 ID:</span>
                  <span className="font-mono text-gray-900">
                    {selectedUser.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">目前點數:</span>
                  <span className="font-bold text-[#5AB4C5]">
                    {selectedUser.total_points.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">註冊時間:</span>
                  <span className="text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleString("zh-TW")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-medium text-green-900">
                    累積獲得
                  </h3>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {totalEarned.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {earnedTransactions.length} 筆交易
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-medium text-red-900">累積使用</h3>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {totalUsed.toLocaleString()}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {usedTransactions.length} 筆交易
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                交易記錄
              </h3>
              {transactionsLoading ? (
                <div className="text-center py-8 text-gray-500">載入中...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  無交易記錄
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description || "無描述"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleString(
                            "zh-TW"
                          )}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          transaction.transaction_type === "earned"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.transaction_type === "earned" ? "+" : "-"}
                        {transaction.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
