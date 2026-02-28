"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import { Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    api
      .get<Product[]>("/api/products")
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function openAdd() {
    setEditProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(String(p.price));
    setImageUrl(p.image_url);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      const body = {
        name,
        description: description || null,
        price: parseFloat(price),
        image_url: imageUrl,
      };
      if (editProduct) {
        const updated = await api.put<Product>(
          `/api/products/${editProduct.id}`,
          body
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const created = await api.post<Product>("/api/products", body);
        setProducts((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch {}
    setFormLoading(false);
  }

  async function toggleAvailability(product: Product) {
    try {
      const updated = await api.patch<Product>(
        `/api/products/${product.id}/availability`,
        { is_available: !product.is_available }
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch {}
  }

  async function deleteProduct(id: string) {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={openAdd}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
        >
          Add Product
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products yet. Add your first product.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatNaira(product.price)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.is_available ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="text-primary-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editProduct ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
