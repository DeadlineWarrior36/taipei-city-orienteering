"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import type { Product } from "@/types/api";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_required: 0,
    stock: 0,
    is_available: true,
  });

  useEffect(() => {
    document.title = "商品管理 - 定向台北";
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products?include_unavailable=true");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create product");

      await fetchProducts();
      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        points_required: 0,
        stock: 0,
        is_available: true,
      });
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("建立商品失敗");
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update product");

      await fetchProducts();
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        points_required: 0,
        stock: 0,
        is_available: true,
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("更新商品失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此商品嗎？")) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      await fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("刪除商品失敗");
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !product.is_available }),
      });

      if (!response.ok) throw new Error("Failed to toggle product availability");

      await fetchProducts();
    } catch (error) {
      console.error("Failed to toggle product availability:", error);
      alert("切換商品狀態失敗");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      points_required: product.points_required,
      stock: product.stock,
      is_available: product.is_available,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      points_required: 0,
      stock: 0,
      is_available: true,
    });
    setShowModal(true);
  };

  const columns = [
    {
      key: "name",
      label: "商品名稱",
    },
    {
      key: "points_required",
      label: "所需點數",
      render: (product: Product) => (
        <span className="font-medium text-[#5AB4C5]">
          {product.points_required}
        </span>
      ),
    },
    {
      key: "stock",
      label: "庫存",
      render: (product: Product) => (
        <span
          className={`font-medium ${
            product.stock > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.stock}
        </span>
      ),
    },
    {
      key: "is_available",
      label: "狀態",
      render: (product: Product) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.is_available
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {product.is_available ? "上架" : "下架"}
        </span>
      ),
    },
    {
      key: "description",
      label: "描述",
      render: (product: Product) => (
        <span className="text-gray-500 truncate max-w-xs inline-block">
          {product.description || "-"}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">商品管理</h1>
            <p className="text-gray-600">管理點數兌換商品及庫存</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#5AB4C5] text-white rounded-lg hover:bg-[#4A9DAD] transition-colors"
          >
            <Plus className="w-5 h-5" />
            新增商品
          </button>
        </div>

        <DataTable
          data={products}
          columns={columns}
          searchPlaceholder="搜尋商品..."
          actions={(product: Product) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAvailability(product)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title={product.is_available ? "下架商品" : "上架商品"}
              >
                {product.is_available ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => openEditModal(product)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="編輯"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
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
          setEditingProduct(null);
          setFormData({
            name: "",
            description: "",
            points_required: 0,
            stock: 0,
            is_available: true,
          });
        }}
        title={editingProduct ? "編輯商品" : "新增商品"}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editingProduct ? handleUpdate() : handleCreate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名稱 *
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
                所需點數 *
              </label>
              <input
                type="number"
                min="0"
                value={formData.points_required}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_required: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                庫存數量 *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5AB4C5] focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品描述
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) =>
                setFormData({ ...formData, is_available: e.target.checked })
              }
              className="w-4 h-4 text-[#5AB4C5] rounded focus:ring-[#5AB4C5]"
            />
            <label htmlFor="is_available" className="text-sm text-gray-700">
              上架販售
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingProduct(null);
                setFormData({
                  name: "",
                  description: "",
                  points_required: 0,
                  stock: 0,
                  is_available: true,
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
              {editingProduct ? "更新" : "建立"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
