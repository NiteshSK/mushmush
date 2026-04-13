"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadFieldProps {
  url: string;
  type: "thumbnail" | "preview";
  onChange: (url: string) => void;
  onRemove: () => void;
}

export default function ImageUploadField({ url, type, onChange, onRemove }: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);

      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Upload failed");
        return;
      }

      const data = await res.json();
      onChange(data.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const hasImage = url && url.trim().length > 0;

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      {/* Preview */}
      {hasImage && (
        <div className="relative w-full h-32 bg-gray-50 rounded-md overflow-hidden">
          <Image
            src={url}
            alt={`${type} image`}
            fill
            className="object-contain"
            unoptimized={url.startsWith("http")}
          />
        </div>
      )}

      {/* URL input */}
      <input
        value={url}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
        placeholder={hasImage ? url : "Paste URL or upload below"}
      />

      {/* Actions row */}
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-forest text-white rounded-md hover:bg-dark transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1.5 text-xs font-medium text-red border border-gray-200 rounded-md hover:bg-red/5 hover:border-red/30 transition-colors"
        >
          Remove
        </button>
        <span className="text-[10px] text-gray-400 ml-auto">
          {type === "thumbnail" ? "Max 2MB" : "Max 5MB"} &middot; JPG, PNG, WebP
        </span>
      </div>

      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}
