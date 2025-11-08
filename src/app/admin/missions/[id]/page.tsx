"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Modal from "@/components/admin/Modal";
import { Plus, Trash2, ArrowLeft, BarChart3 } from "lucide-react";

interface Location {
  id: string;
  name: string;
  lnt: number;
  lat: number;
  point: number;
  description?: string;
}

interface MissionLocation {
  id: string;
  location_id: string;
  sequence_order: number;
  locations: Location;
}

export default function MissionLocationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const missionId = resolvedParams.id;

  const [missionLocations, setMissionLocations] = useState<MissionLocation[]>(
    []
  );
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [locationsRes, allLocationsRes] = await Promise.all([
        fetch(`/api/admin/missions/${missionId}/locations`),
        fetch("/api/admin/locations"),
      ]);

      if (!locationsRes.ok || !allLocationsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const locationsData = await locationsRes.json();
      const allLocationsData = await allLocationsRes.json();

      setMissionLocations(locationsData.locations);
      setAllLocations(allLocationsData.locations);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    document.title = "任務景點管理 - 定向台北";
    fetchData();
  }, [fetchData]);

  const handleAddLocation = async () => {
    if (!selectedLocationId) return;

    try {
      const response = await fetch(
        `/api/admin/missions/${missionId}/locations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location_id: selectedLocationId }),
        }
      );

      if (!response.ok) throw new Error("Failed to add location");

      await fetchData();
      setShowModal(false);
      setSelectedLocationId("");
    } catch (error) {
      console.error("Failed to add location:", error);
      alert("新增景點失敗");
    }
  };

  const handleRemoveLocation = async (locationId: string) => {
    if (!confirm("確定要移除此景點嗎？")) return;

    try {
      const response = await fetch(
        `/api/admin/missions/${missionId}/locations?location_id=${locationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to remove location");

      await fetchData();
    } catch (error) {
      console.error("Failed to remove location:", error);
      alert("移除景點失敗");
    }
  };

  const availableLocations = allLocations.filter(
    (loc) => !missionLocations.some((ml) => ml.locations.id === loc.id)
  );

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/missions")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              任務景點管理
            </h1>
            <p className="text-gray-600">管理此任務包含的景點及順序</p>
          </div>
          <button
            onClick={() => router.push(`/admin/missions/${missionId}/results`)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            查看結果報表
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5AB4C5] text-white rounded-lg hover:bg-[#4A9DAD] transition-colors"
          >
            <Plus className="w-5 h-5" />
            新增景點
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              景點列表（共 {missionLocations.length} 個）
            </h2>

            {missionLocations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>尚未新增任何景點</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 text-[#5AB4C5] hover:underline"
                >
                  立即新增景點
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {missionLocations
                  .sort((a, b) => a.sequence_order - b.sequence_order)
                  .map((ml, index) => (
                    <div
                      key={ml.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-[#5AB4C5] text-white rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {ml.locations.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          座標: {ml.locations.lat.toFixed(6)},{" "}
                          {ml.locations.lnt.toFixed(6)} | 點數:{" "}
                          {ml.locations.point}
                        </p>
                        {ml.locations.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {ml.locations.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveLocation(ml.locations.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedLocationId("");
        }}
        title="新增景點到任務"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddLocation();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇景點
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none"
              required
            >
              <option value="">請選擇景點</option>
              {availableLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.lat.toFixed(4)}, {loc.lnt.toFixed(4)})
                </option>
              ))}
            </select>
            {availableLocations.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                所有景點都已新增到此任務
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedLocationId("");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!selectedLocationId}
              className="flex-1 px-4 py-2 bg-[#5AB4C5] text-white rounded-lg hover:bg-[#4A9DAD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              新增
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
