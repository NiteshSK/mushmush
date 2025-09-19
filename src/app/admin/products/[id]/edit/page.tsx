"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = { id: number; title: string; slug: string };
type ImageJson = { thumbnails: string[]; previews: string[] };

const EditProductPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setTitle(p.title || "");
        setDescription(p.description || "");
        setPrice(p.price || 0);
        setMeasurementValue(p.measurementValue || 0);
        setMeasurementType(p.measurementType || "");
        setInStock(!!p.inStock);
        setFeatured(!!p.featured);
        setImgs(p.imgs || { thumbnails: [""], previews: [""] });
        setSpecifications(p.specifications || [""]);
        setHowToConsume(p.howToConsume || [""]);
        setAdditionalInfo(p.additionalInfo || [{ label: "", value: "" }]);
        setBenefits(p.benefits || "");
        setSelectedCategoryIds((p.categories || []).map((pc: any) => pc.categoryId || pc.category?.id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const canSave = useMemo(() => title.trim() && description.trim() && price > 0, [title, description, price]);

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
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
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
        alert(data.error || "Failed to update product");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
    } catch (err) {
      alert("Error updating product");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-1 p-6">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-1 p-6">
        <h1 className="text-2xl font-semibold text-dark mb-2">Edit Product</h1>
        <p className="text-gray-6">Update details and image URLs. All fields are dynamic.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-dark mb-2">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-dark mb-2">Price (₹)</label>
            <input type="number" min={0} value={price || ''} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-dark mb-2">Measurement Value</label>
            <input type="number" min={0} value={measurementValue || ''} onChange={(e) => setMeasurementValue(parseInt(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-dark mb-2">Measurement Type</label>
            <input value={measurementType} onChange={(e) => setMeasurementType(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-dark mb-2">Description (supports HTML)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={6} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-2"><input id="inStock" type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /><label htmlFor="inStock">In Stock</label></div>
          <div className="flex items-center gap-2"><input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /><label htmlFor="featured">Featured</label></div>
        </div>

        <div>
          <label className="block text-sm text-dark mb-2">Categories</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <label key={cat.id} className="inline-flex items-center gap-2 border px-3 py-1 rounded-md">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={(e) => {
                    setSelectedCategoryIds((prev) =>
                      e.target.checked ? [...prev, cat.id] : prev.filter((id) => id !== cat.id)
                    );
                  }}
                />
                <span>{cat.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm text-dark">Thumbnail Images (URLs)</label><button type="button" onClick={() => addImageField("thumbnails")} className="text-blue">+ Add</button></div>
            <div className="space-y-2">
              {imgs.thumbnails.map((url, i) => (
                <div key={`thumb-${i}`} className="flex items-center gap-2">
                  <input value={url} onChange={(e) => updateImageArray("thumbnails", i, e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="/images/products/your-image.png" />
                  <button type="button" onClick={() => removeImageField("thumbnails", i)} className="text-red">Remove</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm text-dark">Preview Images (URLs)</label><button type="button" onClick={() => addImageField("previews")} className="text-blue">+ Add</button></div>
            <div className="space-y-2">
              {imgs.previews.map((url, i) => (
                <div key={`prev-${i}`} className="flex items-center gap-2">
                  <input value={url} onChange={(e) => updateImageArray("previews", i, e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="/images/products/your-image.png" />
                  <button type="button" onClick={() => removeImageField("previews", i)} className="text-red">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2"><label className="text-sm text-dark">Specifications (HTML allowed)</label><button type="button" onClick={() => setSpecifications((p) => [...p, ""]) } className="text-blue">+ Add</button></div>
          <div className="space-y-2">
            {specifications.map((spec, i) => (
              <div key={`spec-${i}`} className="flex items-center gap-2">
                <input value={spec} onChange={(e) => setSpecifications((prev) => prev.map((s, idx) => (idx === i ? e.target.value : s)))} className="w-full border rounded-md px-3 py-2" placeholder="<strong>Key:</strong> Value" />
                <button type="button" onClick={() => setSpecifications((prev) => prev.filter((_, idx) => idx !== i))} className="text-red">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2"><label className="text-sm text-dark">How to Consume (HTML allowed)</label><button type="button" onClick={() => setHowToConsume((p) => [...p, ""]) } className="text-blue">+ Add</button></div>
          <div className="space-y-2">
            {howToConsume.map((step, i) => (
              <div key={`how-${i}`} className="flex items-center gap-2">
                <input value={step} onChange={(e) => setHowToConsume((prev) => prev.map((s, idx) => (idx === i ? e.target.value : s)))} className="w-full border rounded-md px-3 py-2" placeholder="<strong>Step</strong>: Description" />
                <button type="button" onClick={() => setHowToConsume((prev) => prev.filter((_, idx) => idx !== i))} className="text-red">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2"><label className="text-sm text-dark">Additional Info</label><button type="button" onClick={() => setAdditionalInfo((p) => [...p, { label: "", value: "" }]) } className="text-blue">+ Add</button></div>
          <div className="space-y-2">
            {additionalInfo.map((row, i) => (
              <div key={`info-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input value={row.label} onChange={(e) => setAdditionalInfo((prev) => prev.map((r, idx) => (idx === i ? { ...r, label: e.target.value } : r)))} className="w-full border rounded-md px-3 py-2" placeholder="Label" />
                <input value={row.value} onChange={(e) => setAdditionalInfo((prev) => prev.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)))} className="w-full border rounded-md px-3 py-2" placeholder="Value" />
                <div className="md:col-span-2">
                  <button type="button" onClick={() => setAdditionalInfo((prev) => prev.filter((_, idx) => idx !== i))} className="text-red">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-dark mb-2">Benefits (JSON)</label>
          <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={6} />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={!canSave || saving} className="px-5 py-2 rounded-md text-white bg-blue disabled:opacity-60">
            {saving ? "Saving..." : "Update Product"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="px-5 py-2 rounded-md bg-gray-200">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
