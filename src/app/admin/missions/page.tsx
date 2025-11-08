"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin } from "lucide-react";

interface Mission {
  id: string;
  name: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export default function MissionsAdminPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [formData, setFormData] = useState({ name: "", is_hidden: false });

  useEffect(() => {
    document.title = "任務管理 - 定向台北";
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch("/api/admin/missions?include_hidden=true");
      if (!response.ok) throw new Error("Failed to fetch missions");
      const data = await response.json();
      setMissions(data.missions);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create mission");

      await fetchMissions();
      setShowModal(false);
      setFormData({ name: "", is_hidden: false });
    } catch (error) {
      console.error("Failed to create mission:", error);
      alert("建立任務失敗");
    }
  };

  const handleUpdate = async () => {
    if (!editingMission) return;

    try {
      const response = await fetch(`/api/admin/missions/${editingMission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update mission");

      await fetchMissions();
      setShowModal(false);
      setEditingMission(null);
      setFormData({ name: "", is_hidden: false });
    } catch (error) {
      console.error("Failed to update mission:", error);
      alert("更新任務失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此任務嗎？")) return;

    try {
      const response = await fetch(`/api/admin/missions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete mission");

      await fetchMissions();
    } catch (error) {
      console.error("Failed to delete mission:", error);
      alert("刪除任務失敗");
    }
  };

  const toggleHidden = async (mission: Mission) => {
    try {
      const response = await fetch(`/api/admin/missions/${mission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hidden: !mission.is_hidden }),
      });

      if (!response.ok) throw new Error("Failed to toggle mission visibility");

      await fetchMissions();
    } catch (error) {
      console.error("Failed to toggle mission visibility:", error);
      alert("切換任務顯示狀態失敗");
    }
  };

  const openEditModal = (mission: Mission) => {
    setEditingMission(mission);
    setFormData({ name: mission.name, is_hidden: mission.is_hidden });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingMission(null);
    setFormData({ name: "", is_hidden: false });
    setShowModal(true);
  };

  const columns = [
    {
      key: "name",
      label: "任務名稱",
    },
    {
      key: "is_hidden",
      label: "狀態",
      render: (mission: Mission) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            mission.is_hidden
              ? "bg-gray-100 text-gray-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {mission.is_hidden ? "隱藏" : "顯示"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "建立時間",
      render: (mission: Mission) =>
        new Date(mission.created_at).toLocaleString("zh-TW"),
    },
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">任務管理</h1>
            <p className="text-gray-600">管理定向任務及其景點</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#5AB4C5] text-white rounded-lg hover:bg-[#4A9DAD] transition-colors"
          >
            <Plus className="w-5 h-5" />
            新增任務
          </button>
        </div>

        <DataTable
          data={missions}
          columns={columns}
          searchPlaceholder="搜尋任務..."
          actions={(mission: Mission) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/admin/missions/${mission.id}`)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="管理景點"
              >
                <MapPin className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleHidden(mission)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title={mission.is_hidden ? "顯示任務" : "隱藏任務"}
              >
                {mission.is_hidden ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => openEditModal(mission)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="編輯"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(mission.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="刪除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingMission(null);
          setFormData({ name: "", is_hidden: false });
        }}
        title={editingMission ? "編輯任務" : "新增任務"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingMission) {
              handleUpdate();
            } else {
              handleCreate();
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任務名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_hidden"
              checked={formData.is_hidden}
              onChange={(e) =>
                setFormData({ ...formData, is_hidden: e.target.checked })
              }
              className="w-4 h-4 text-[#5AB4C5] rounded focus:ring-[#5AB4C5]"
            />
            <label htmlFor="is_hidden" className="text-sm text-gray-700">
              隱藏任務（不在前台顯示）
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingMission(null);
                setFormData({ name: "", is_hidden: false });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#5AB4C5] text-white rounded-lg hover:bg-[#4A9DAD] transition-colors"
            >
              {editingMission ? "更新" : "建立"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
