"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/Admin/ImageUploadField";

type Category = { id: number; title: string; slug: string };
type ImageJson = { thumbnails: string[]; previews: string[] };

const NewProductPage: React.FC = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [measurementValue, setMeasurementValue] = useState<number>(100);
  const [measurementType, setMeasurementType] = useState("gm");
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [imgs, setImgs] = useState<ImageJson>({ thumbnails: [""], previews: [""] });
  const [specifications, setSpecifications] = useState<string[]>([""]);
  const [howToConsume, setHowToConsume] = useState<string[]>([""]);
  const [additionalInfo, setAdditionalInfo] = useState<{ label: string; value: string }[]>([
    { label: "", value: "" },
  ]);
  const [benefits, setBenefits] = useState<string>("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories((data || []).map((c: any) => ({ id: c.id, title: c.title, slug: c.slug }))))
      .catch(() => {});
  }, []);

  const canSave = useMemo(() => title.trim().length > 0 && description.trim().length > 0 && price > 0, [title, description, price]);

  const updateImageArray = (key: keyof ImageJson, index: number, value: string) => {
    setImgs((prev) => {
      const arr = [...prev[key]];
      arr[index] = value;
      return { ...prev, [key]: arr } as ImageJson;
    });
  };
  const addImageField = (key: keyof ImageJson) => setImgs((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  const removeImageField = (key: keyof ImageJson, index: number) =>
    setImgs((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          measurementValue: Number(measurementValue),
          measurementType,
          inStock,
          featured,
          imgs,
          specifications: specifications.filter((s) => s.trim().length > 0),
          howToConsume: howToConsume.filter((s) => s.trim().length > 0),
          additionalInfo: additionalInfo.filter((a) => a.label.trim() && a.value.trim()),
          benefits,
          categories: selectedCategoryIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to create product");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
    } catch {
      alert("Error creating product");
      setSaving(false);
    }
  };

  const inputClass = "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-3 text-sm outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[10px] shadow-1 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-dark">New Product</h1>
            <p className="text-dark-5 text-sm mt-1">Add a new product with images, pricing, and specifications.</p>
          </div>
          <button type="button" onClick={() => router.push("/admin/products")} className="text-sm font-medium text-dark-5 py-2 px-4 rounded-md border border-gray-3 hover:bg-gray-1 transition-colors">
            Back to Products
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-4">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Price (₹)</label>
              <input type="number" min={0} value={price || ''} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Measurement Value</label>
              <input type="number" min={0} value={measurementValue || ''} onChange={(e) => setMeasurementValue(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Measurement Type</label>
              <input value={measurementType} onChange={(e) => setMeasurementType(e.target.value)} className={inputClass} placeholder="gm, kg, ml, pieces" />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-dark mb-1.5">Description (HTML)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={5} required />
          </div>

          <div className="flex items-center gap-6 mt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 rounded border-gray-3 text-forest accent-forest" />
              <span className="text-sm text-dark">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded border-gray-3 text-forest accent-forest" />
              <span className="text-sm text-dark">Featured</span>
            </label>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  selectedCategoryIds.includes(cat.id)
                    ? "bg-forest text-white"
                    : "bg-white shadow-1 text-dark-5 hover:text-dark"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={(e) => {
                    setSelectedCategoryIds((prev) =>
                      e.target.checked ? [...prev, cat.id] : prev.filter((cid) => cid !== cat.id)
                    );
                  }}
                  className="hidden"
                />
                {cat.title}
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-4">Product Images</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-dark">Thumbnails</label>
                <button type="button" onClick={() => addImageField("thumbnails")} className="text-xs font-medium text-forest hover:text-dark transition-colors">+ Add Image</button>
              </div>
              <div className="space-y-3">
                {imgs.thumbnails.map((url, i) => (
                  <ImageUploadField
                    key={`thumb-${i}`}
                    url={url}
                    type="thumbnail"
                    onChange={(val) => updateImageArray("thumbnails", i, val)}
                    onRemove={() => removeImageField("thumbnails", i)}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-dark">Previews</label>
                <button type="button" onClick={() => addImageField("previews")} className="text-xs font-medium text-forest hover:text-dark transition-colors">+ Add Image</button>
              </div>
              <div className="space-y-3">
                {imgs.previews.map((url, i) => (
                  <ImageUploadField
                    key={`prev-${i}`}
                    url={url}
                    type="preview"
                    onChange={(val) => updateImageArray("previews", i, val)}
                    onRemove={() => removeImageField("previews", i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & How to Consume */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5">Specifications</h2>
                <button type="button" onClick={() => setSpecifications((p) => [...p, ""])} className="text-xs font-medium text-forest hover:text-dark transition-colors">+ Add</button>
              </div>
              <div className="space-y-2">
                {specifications.map((spec, i) => (
                  <div key={`spec-${i}`} className="flex items-center gap-2">
                    <input value={spec} onChange={(e) => setSpecifications((prev) => prev.map((s, idx) => (idx === i ? e.target.value : s)))} className={inputClass} placeholder="e.g. Rich in protein, vitamins..." />
                    <button type="button" onClick={() => setSpecifications((prev) => prev.filter((_, idx) => idx !== i))} className="text-dark-5 hover:text-red transition-colors flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5">How to Consume</h2>
                <button type="button" onClick={() => setHowToConsume((p) => [...p, ""])} className="text-xs font-medium text-forest hover:text-dark transition-colors">+ Add</button>
              </div>
              <div className="space-y-2">
                {howToConsume.map((step, i) => (
                  <div key={`how-${i}`} className="flex items-center gap-2">
                    <input value={step} onChange={(e) => setHowToConsume((prev) => prev.map((s, idx) => (idx === i ? e.target.value : s)))} className={inputClass} placeholder="e.g. Add 1 tsp to warm water..." />
                    <button type="button" onClick={() => setHowToConsume((prev) => prev.filter((_, idx) => idx !== i))} className="text-dark-5 hover:text-red transition-colors flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5">Additional Info</h2>
            <button type="button" onClick={() => setAdditionalInfo((p) => [...p, { label: "", value: "" }])} className="text-xs font-medium text-forest hover:text-dark transition-colors">+ Add</button>
          </div>
          <div className="space-y-2">
            {additionalInfo.map((row, i) => (
              <div key={`info-${i}`} className="flex items-center gap-2">
                <input value={row.label} onChange={(e) => setAdditionalInfo((prev) => prev.map((r, idx) => (idx === i ? { ...r, label: e.target.value } : r)))} className={inputClass} placeholder="Label" />
                <input value={row.value} onChange={(e) => setAdditionalInfo((prev) => prev.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)))} className={inputClass} placeholder="Value" />
                <button type="button" onClick={() => setAdditionalInfo((prev) => prev.filter((_, idx) => idx !== i))} className="text-dark-5 hover:text-red transition-colors flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-5 mb-3">Benefits (JSON)</h2>
          <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} className={inputClass} rows={5} />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-[10px] shadow-1 p-6">
          <div className="flex items-center gap-3">
            <button type="submit" disabled={!canSave || saving} className="bg-forest text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-dark transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Create Product"}
            </button>
            <button type="button" onClick={() => router.push("/admin/products")} className="text-sm font-medium text-dark-5 py-2.5 px-6 rounded-md border border-gray-3 hover:bg-gray-1 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewProductPage;
