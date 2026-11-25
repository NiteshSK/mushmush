"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import styles from "./product-form.module.css";

export const isProductPhotoUrl = (url: string) => /^\/(?![\/\\])|^https?:\/\/[^\s/]+/i.test(url);

type Props = {
  label: string;
  url: string;
  onChange: (url: string) => void;
  onUploading: (busy: boolean) => void;
  onMakeCover?: () => void;
  onRemove?: () => void;
};

export default function ImageUploadField({ label, url, onChange, onUploading, onMakeCover, onRemove }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [failedPreview, setFailedPreview] = useState("");
  const imageUrl = url.trim();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    onUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "preview");
      const response = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.url !== "string") throw Error(result.error || "The photo couldn’t upload.");
      onChange(result.url);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The photo couldn’t upload. Try again.");
    } finally {
      setUploading(false);
      onUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return <div className={styles.photo}>
    <strong>{label}</strong>
    {imageUrl && isProductPhotoUrl(imageUrl) && failedPreview !== imageUrl && (
      // An admin can enter a remote image URL before saving the product.
      // eslint-disable-next-line @next/next/no-img-element
      <img className={styles.photoPreview} src={imageUrl} alt={label} onError={() => setFailedPreview(imageUrl)} />
    )}
    {imageUrl && failedPreview === imageUrl && <span className={styles.muted}>Preview unavailable.</span>}
    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} hidden aria-label={`Choose file for ${label.toLowerCase()}`} />
    <div className={styles.photoActions}>
      <button type="button" className={styles.textButton} onClick={() => fileRef.current?.click()} disabled={uploading}>
        <Upload size={16} aria-hidden="true" /> {uploading ? "Uploading…" : imageUrl ? "Replace photo" : "Upload photo"}
      </button>
      {onMakeCover && <button type="button" className={styles.textButton} onClick={onMakeCover} disabled={uploading}>Make cover</button>}
      {onRemove && <button type="button" className={styles.textButton} onClick={onRemove} disabled={uploading}
        aria-label={`Remove ${label.toLowerCase()}`}>Remove</button>}
    </div>
    <details>
      <summary>Use an image URL</summary>
      <input aria-label={`${label} URL`} inputMode="url" value={url} disabled={uploading} placeholder="https://…" onChange={e => {
        setFailedPreview("");
        onChange(e.target.value);
      }} />
    </details>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </div>;
}
