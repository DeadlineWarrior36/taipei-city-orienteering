"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Location } from "@/types/api";

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    lat: 0,
    lnt: 0,
    point: 0,
    description: "",
  });

  useEffect(() => {
    document.title = "景點管理 - 定向台北";
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/admin/locations");
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data.locations);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create location");

      await fetchLocations();
      setShowModal(false);
      setFormData({ name: "", lat: 0, lnt: 0, point: 0, description: "" });
    } catch (error) {
      console.error("Failed to create location:", error);
      alert("建立景點失敗");
    }
  };

  const handleUpdate = async () => {
    if (!editingLocation) return;

    try {
      const response = await fetch(
        `/api/admin/locations/${editingLocation.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to update location");

      await fetchLocations();
      setShowModal(false);
      setEditingLocation(null);
      setFormData({ name: "", lat: 0, lnt: 0, point: 0, description: "" });
    } catch (error) {
      console.error("Failed to update location:", error);
      alert("更新景點失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此景點嗎？")) return;

    try {
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete location");

      await fetchLocations();
    } catch (error) {
      console.error("Failed to delete location:", error);
      alert("刪除景點失敗");
    }
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      lat: location.lat,
      lnt: location.lnt,
      point: location.point,
      description: location.description || "",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({ name: "", lat: 0, lnt: 0, point: 0, description: "" });
    setShowModal(true);
  };

  const columns = [
    {
      key: "name",
      label: "景點名稱",
    },
    {
      key: "lat",
      label: "緯度",
      render: (location: Location) => location.lat.toFixed(6),
    },
    {
      key: "lnt",
      label: "經度",
      render: (location: Location) => location.lnt.toFixed(6),
    },
    {
      key: "point",
      label: "點數",
    },
    {
      key: "description",
      label: "描述",
      render: (location: Location) => (
        <span className="text-gray-500 truncate max-w-xs inline-block">
          {location.description || "-"}
        </span>
      ),
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">景點管理</h1>
            <p className="text-gray-600">管理定向活動的所有景點</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#5AB4C5] text-white rounded-lg hover:bg-[#4A9DAD] transition-colors"
          >
            <Plus className="w-5 h-5" />
            新增景點
          </button>
        </div>

        <DataTable
          data={locations}
          columns={columns}
          searchPlaceholder="搜尋景點..."
          actions={(location: Location) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(location)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="編輯"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(location.id)}
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
          setEditingLocation(null);
          setFormData({ name: "", lat: 0, lnt: 0, point: 0, description: "" });
        }}
        title={editingLocation ? "編輯景點" : "新增景點"}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingLocation) {
              handleUpdate();
            } else {
              handleCreate();
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              景點名稱 *
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                緯度 (Latitude) *
              </label>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) =>
                  setFormData({ ...formData, lat: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                經度 (Longitude) *
              </label>
              <input
                type="number"
                step="any"
                value={formData.lnt}
                onChange={(e) =>
                  setFormData({ ...formData, lnt: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              點數
            </label>
            <input
              type="number"
              value={formData.point}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  point: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingLocation(null);
                setFormData({
                  name: "",
                  lat: 0,
                  lnt: 0,
                  point: 0,
                  description: "",
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#5AB4C5] text-white rounded-lg hover:bg-[#4A9DAD] transition-colors"
            >
              {editingLocation ? "更新" : "建立"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
