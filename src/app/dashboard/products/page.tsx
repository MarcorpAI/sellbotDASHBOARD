"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/utils";
import { Product, ProductTypeValue } from "@/types";
import { useToast } from "@/components/ui/Toast";

const TYPE_LABELS: Record<ProductTypeValue, string> = {
  physical: "Physical",
  digital: "Digital",
  course: "Course",
};

const TYPE_COLORS: Record<ProductTypeValue, string> = {
  physical: "bg-blue-100 text-blue-700",
  digital: "bg-purple-100 text-purple-700",
  course: "bg-amber-100 text-amber-700",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [syncing, setSyncing] = useState(false);

  const { defaultProductType } = getAuth();
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weightKg, setWeightKg] = useState("0.5");
  const [imageUrl, setImageUrl] = useState("");
  const [productType, setProductType] = useState<ProductTypeValue>(defaultProductType);
  const [ctaUrl, setCtaUrl] = useState("");
  const [pricingFormat, setPricingFormat] = useState<"paid" | "free">("paid");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [formLoading, setFormLoading] = useState(false);



  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    api
      .get<Product[]>("/api/products")
      .then(setProducts)
      .catch(() => toast("Failed to load products"))
      .finally(() => setLoading(false));
  }

  function openAdd() {
    setEditProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setWeightKg("0.5");
    setImageUrl("");
    setProductType(defaultProductType);
    setCtaUrl("");
    setPricingFormat("paid");
    setStartTime("");
    setLocation("");
    setShowForm(true);
  }



  function openEdit(p: Product) {
    setEditProduct(p);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(String(p.price));
    setWeightKg(String(p.weight_kg));
    setImageUrl(p.image_url);
    setProductType(p.product_type || defaultProductType);
    setCtaUrl(p.cta_url || "");
    setPricingFormat(p.price == 0 && p.product_type !== "physical" ? "free" : "paid");
    setStartTime(p.attributes?.start_time_utc || "");
    setLocation(p.attributes?.location || "");
    setShowForm(true);
  }




  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      const finalPrice = productType !== "physical" && pricingFormat === "free" ? 0 : parseFloat(price);

      const body: Record<string, any> = {
        name,
        description: description || null,
        price: finalPrice,
        image_url: imageUrl,
        product_type: productType,
        attributes: productType === "course" ? {
          start_time_utc: startTime || null,
          location: location || null,
        } : null,
      };



      if (productType === "physical") {
        body.weight_kg = parseFloat(weightKg);
      } else {
        body.weight_kg = 0;
        body.cta_url = ctaUrl || null;
      }

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
    } catch { }
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
    } catch { }
  }

  async function deleteProduct(id: string) {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await api.post("/api/products/sync", {});
      loadProducts();
      alert("Catalog synced successfully!");
    } catch (err) {
      alert("Failed to sync catalog. Check your external URL configuration.");
    }
    setSyncing(false);
  }

  const showWeightColumn = defaultProductType === "physical" || products.some((p) => p.product_type === "physical");
  const showTypeColumn = products.some((p) => p.product_type !== defaultProductType);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {defaultProductType === "course"
            ? "Courses"
            : defaultProductType === "digital"
              ? "Digital Products"
              : "Products"}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync Catalog"}
          </button>
          <button
            onClick={openAdd}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
          >
            {defaultProductType === "course"
              ? "Add Course"
              : defaultProductType === "digital"
                ? "Add Product"
                : "Add Product"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">
            {defaultProductType === "course" ? "🎓" : defaultProductType === "digital" ? "💻" : "📦"}
          </div>
          <p className="text-gray-500 mb-1">
            No {defaultProductType === "course" ? "courses" : "products"} yet.
          </p>
          <p className="text-sm text-gray-400">
            {defaultProductType === "course"
              ? "Add your first course with a registration link."
              : defaultProductType === "digital"
                ? "Add your first digital product with a download or access link."
                : "Add your first product to get started."}
          </p>
          <button
            onClick={openAdd}
            className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
          >
            {defaultProductType === "course" ? "Add Course" : "Add Product"}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  {defaultProductType === "course" ? "Course" : "Product"}
                </th>
                <th className="px-4 py-3">Price</th>
                {showTypeColumn && <th className="px-4 py-3">Type</th>}
                {showWeightColumn && <th className="px-4 py-3">Weight (kg)</th>}
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
                        {product.cta_url && (
                          <a
                            href={product.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary-600 hover:underline"
                          >
                            {product.product_type === "course" ? "Registration link" : "Access link"}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.price == 0 && product.product_type !== "physical" ? "Free" : formatNaira(product.price)}
                  </td>

                  {showTypeColumn && (
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[product.product_type] || TYPE_COLORS.physical}`}>
                        {TYPE_LABELS[product.product_type] || "Physical"}
                      </span>
                    </td>
                  )}
                  {showWeightColumn && (
                    <td className="px-4 py-3 text-gray-500">
                      {product.product_type === "physical" ? `${product.weight_kg}kg` : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${product.is_available
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
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editProduct
                ? `Edit ${productType === "course" ? "Course" : "Product"}`
                : `Add ${productType === "course" ? "Course" : "Product"}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product type selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <div className="flex rounded-md bg-gray-100 p-1">
                  {(["physical", "digital", "course"] as ProductTypeValue[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setProductType(t)}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize ${productType === t ? "bg-white shadow-sm" : "text-gray-500"
                        }`}
                    >
                      {t === "course" ? "Course" : t === "digital" ? "Digital" : "Physical"}
                    </button>
                  ))}
                </div>
              </div>

              <input
                placeholder={productType === "course" ? "Course name" : "Product name"}
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

              {/* Course-only: Location and Start Time */}
              {productType === "course" && (
                <div className="space-y-3 rounded-md bg-amber-50 p-3 border border-amber-100">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">Start Time / Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={startTime ? new Date(startTime).toISOString().slice(0, 16) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStartTime(val ? new Date(val).toISOString() : "");
                      }}
                      className="block w-full rounded-md border border-amber-200 px-3 py-2 text-sm bg-white"
                    />

                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-amber-800">Location / Platform (Optional)</label>
                    <input
                      placeholder="e.g. Zoom, Google Meet, or a physical address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full rounded-md border border-amber-200 px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Pricing Format (Free vs Paid) for Digital/Courses */}

              {productType !== "physical" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Pricing</label>
                  <div className="flex rounded-md bg-gray-100 p-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setPricingFormat("paid")}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium ${pricingFormat === "paid" ? "bg-white shadow-sm" : "text-gray-500"
                        }`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingFormat("free")}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium ${pricingFormat === "free" ? "bg-white shadow-sm" : "text-gray-500"
                        }`}
                    >
                      Free
                    </button>
                  </div>
                </div>
              )}

              {/* Price input (hidden if free) */}
              {(productType === "physical" || pricingFormat === "paid") && (
                <input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              )}

              {/* Physical-only: weight */}
              {productType === "physical" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Weight (kg)</label>
                  <input
                    placeholder="Weight in kg (e.g. 0.5)"
                    type="number"
                    step="0.001"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              {/* Digital/Course: CTA URL */}
              {productType !== "physical" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    {productType === "course" ? "Registration / Enrollment Link" : "Download / Access Link"}
                  </label>
                  <input
                    placeholder={
                      productType === "course"
                        ? "https://your-course-platform.com/enroll"
                        : "https://your-site.com/download"
                    }
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <p className="text-[10px] text-gray-400">
                    {productType === "course"
                      ? "The AI will share this link when a customer wants to enroll."
                      : "The AI will share this link after purchase is confirmed."}
                  </p>
                </div>
              )}

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
