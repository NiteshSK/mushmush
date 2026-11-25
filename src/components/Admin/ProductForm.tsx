"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronDown, Plus, X } from "lucide-react";
import { availablePacks } from "@/lib/inventory";
import { productCover } from "../Pantry/catalogue";
import ImageUploadField, { isProductPhotoUrl } from "./ImageUploadField";
import { useUnsavedDraft } from "./useUnsavedDraft";
import styles from "./product-form.module.css";

type Category = { id: number; title: string };
type Fact = { label: string; value: string };
type Photo = { key: number; url: string };
type Draft = {
  title: string;
  description: string;
  price: string;
  size: string;
  unit: string;
  delivery: string;
  featured: boolean;
  categoryIds: number[];
  instructions: string[];
  facts: Fact[];
  specifications: string[];
  benefits: unknown;
};
type SavedProduct = { id: number; title: string; slug: string };
type StoredProduct = SavedProduct & {
  description: string;
  updatedAt: string;
  quantity: number;
  price: number;
  measurementValue: number;
  measurementType: string;
  fulfillmentClass: string | null;
  featured: boolean;
  categories: { categoryId: number }[];
  imgs?: { cover?: string; previews?: string[]; thumbnails?: string[] };
  additionalInfo: Fact[];
  specifications: string[];
  howToConsume: string[];
  benefits: unknown;
};

const emptyDraft: Draft = {
  title: "", description: "", price: "", size: "", unit: "gm", delivery: "",
  featured: false, categoryIds: [], instructions: [], facts: [], specifications: [], benefits: "",
};
const packUnits = [
  ["gm", "g"], ["kg", "kg"], ["ml", "ml"], ["l", "L"], ["pieces", "Pieces"],
];
const inventoryHref = (title: string) => "/admin/inventory?q=" + encodeURIComponent(title);
const storefrontHref = (slug: string) => "/shop-details/" + encodeURIComponent(slug);

function TextEntries({ name, entries, onChange }: {
  name: string; entries: string[]; onChange: (items: string[]) => void;
}) {
  return <div className={styles.contentGroup}>
    <div className={styles.rowHead}><h3>{name}</h3>
      <button type="button" className={styles.textButton} onClick={() => onChange([...entries, ""])}><Plus size={16} /> Add {name === "How to use" ? "instruction" : "specification"}</button>
    </div>
    {entries.map((entry, index) => <div className={styles.entry} key={index}>
      <textarea aria-label={`${name} ${index + 1}`} rows={entry.includes("\n") ? 4 : 2} value={entry}
        onChange={event => onChange(entries.map((item, i) => i === index ? event.target.value : item))} />
      <button type="button" className={styles.iconButton} aria-label={`Remove ${name.toLowerCase()} entry ${index + 1}`}
        onClick={() => onChange(entries.filter((_, i) => i !== index))}><X size={17} /></button>
    </div>)}
  </div>;
}

function BenefitFields({ value, onChange }: { value: unknown; onChange: (value: unknown) => void }) {
  let data = value;
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try { data = JSON.parse(value); } catch { /* Some products store plain text. */ }
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const fields = data as Record<string, unknown>;
    const textFields = Object.entries(fields).filter(([, text]) => typeof text === "string") as [string, string][];
    if (!textFields.length) return null;
    return <div className={styles.contentGroup}>
      <h3>Benefits</h3>
      {textFields.map(([key, text]) => <label key={key} className={styles.field}>
        <span>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
        <textarea rows={2} value={text} onChange={event => {
          const next = { ...fields, [key]: event.target.value };
          onChange(typeof value === "string" ? JSON.stringify(next) : next);
        }} />
      </label>)}
    </div>;
  }
  return <label className={`${styles.field} ${styles.contentGroup}`}><span>Benefits</span>
    <textarea rows={2} value={typeof value === "string" ? value : ""} onChange={event => onChange(event.target.value)} />
  </label>;
}

export default function ProductForm({ id }: { id?: string }) {
  const router = useRouter();
  const unsaved = useUnsavedDraft();
  const [draft, setDraft] = useState(emptyDraft);
  const [photos, setPhotos] = useState<Photo[]>([{ key: 0, url: "" }]);
  const nextPhoto = useRef(1);
  const [photosChanged, setPhotosChanged] = useState(false);
  const [uploads, setUploads] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<StoredProduct | null>(null);
  const [created, setCreated] = useState<SavedProduct | null>(null);
  const [revision, retry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const loadJSON = async <T,>(url: string, message: string): Promise<T> => {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw Error(message);
        return response.json();
      };
      setLoading(true);
      setLoadError("");
      try {
        const [options, existing] = await Promise.all([
          loadJSON<Category[]>("/api/categories?options=1", "Product categories couldn’t load."),
          id ? loadJSON<StoredProduct>("/api/products/" + id, "This product couldn’t load.") : null,
        ]);
        if (controller.signal.aborted) return;
        setCategories(options);
        if (existing) {
          setProduct(existing);
          setDraft({
            title: existing.title, price: String(existing.price), description: existing.description,
            size: String(existing.measurementValue), unit: existing.measurementType,
            delivery: existing.fulfillmentClass ?? "", featured: existing.featured,
            categoryIds: existing.categories.map(category => category.categoryId),
            facts: existing.additionalInfo ?? [], instructions: existing.howToConsume ?? [],
            specifications: existing.specifications ?? [], benefits: existing.benefits,
          });
          const urls = Array.from(new Set([productCover(existing), ...(existing.imgs?.previews ?? []), ...(existing.imgs?.thumbnails ?? [])])).filter((url): url is string => Boolean(url));
          setPhotos(urls.length ? urls.map(url => ({ key: nextPhoto.current++, url })) : [{ key: 0, url: "" }]);
        }
      } catch (failure) {
        if (!controller.signal.aborted) setLoadError(failure instanceof Error ? failure.message : "Product setup couldn’t load.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [id, revision]);

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => { if (created) successRef.current?.focus(); }, [created]);

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    unsaved.markDirty();
    setDraft(current => ({ ...current, [field]: value }));
  }

  function changePhotos(change: (items: Photo[]) => Photo[]) {
    unsaved.markDirty();
    setPhotosChanged(true);
    setPhotos(change);
  }

  function trackUpload(key: number, uploading: boolean) {
    setUploads(current => uploading ? [...current, key] : current.filter(item => item !== key));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || uploads.length) return;
    setError("");
    const price = Number(draft.price);
    const size = Number(draft.size);
    if (!draft.title.trim() || !draft.description.trim()) {
      setError("Enter a product name and description.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(size) || size <= 0 || size > 2147483647 || !draft.unit) {
      setError("Enter a positive price and a whole-number pack size with a unit.");
      return;
    }
    if (!["fresh", "national"].includes(draft.delivery)) {
      setError("Choose a delivery option.");
      return;
    }
    if (draft.facts.some(fact => Boolean(fact.label.trim()) !== Boolean(fact.value.trim()))) {
      if (detailsRef.current) detailsRef.current.open = true;
      setError("Enter a name and value for each product fact, or remove the unfinished row.");
      return;
    }
    const urls = Array.from(new Set(photos.map(photo => photo.url.trim()).filter(Boolean)));
    if ((!id || photosChanged) && urls.some(url => !isProductPhotoUrl(url))) {
      setError("Enter a complete image URL or upload a photo.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(id ? "/api/products/" + id : "/api/products", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedUpdatedAt: product?.updatedAt,
          title: draft.title.trim(), description: draft.description.trim(), price,
          measurementValue: size, measurementType: draft.unit,
          fulfillmentClass: draft.delivery, featured: draft.featured, categories: draft.categoryIds,
          ...(!id || photosChanged ? { imgs: { cover: urls[0], previews: urls, thumbnails: urls } } : {}),
          howToConsume: draft.instructions.filter(item => item.trim()),
          additionalInfo: draft.facts
            .filter(fact => fact.label.trim() && fact.value.trim())
            .map(fact => ({ label: fact.label.trim(), value: fact.value.trim() })),
          specifications: draft.specifications.filter(item => item.trim()),
          benefits: draft.benefits,
        }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        setError(failure.error || "The product couldn’t be saved. Try again.");
        return;
      }
      unsaved.markSaved();
      if (id) router.push("/admin/products");
      else setCreated(await response.json());
    } catch {
      setError("The product couldn’t be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (created) return <section className={`${styles.editor} ${styles.card} ${styles.complete}`}>
    <CheckCircle2 aria-hidden="true" size={30} />
    <h1 ref={successRef} tabIndex={-1}>Product added</h1>
    <p><strong>{created.title}</strong> starts out of stock. Record the first receipt in Inventory to make it available to buy.</p>
    <div className={styles.completeActions}>
      <Link className={styles.primary} href={inventoryHref(created.title) + "&receive=" + created.id}>Record opening stock</Link>
      <Link href="/admin/products" className={styles.textButton}>Back to products</Link>
    </div>
  </section>;

  return <div className={styles.editor}>
    <header className={styles.head}>
      <Link href="/admin/products" className={styles.textButton}><ArrowLeft size={16} aria-hidden="true" /> Products</Link>
      <div className={styles.rowHead}>
        <h1>{id ? "Edit product" : "New product"}</h1>
        {product && <a className={styles.textButton} href={storefrontHref(product.slug)} target="_blank" rel="noreferrer">View listing <ArrowUpRight size={16} aria-hidden="true" /></a>}
      </div>
    </header>
    {loading ? <p className={styles.card} role="status">Loading product form…</p>
      : loadError ? <div className={styles.card} role="alert">{loadError} <button type="button" className={styles.textButton} onClick={() => retry(n => n + 1)}>Retry</button></div>
      : <form onSubmit={save} className={styles.form}>
        <section className={styles.card} aria-labelledby="listing-title">
          <h2 id="listing-title">Listing essentials</h2>
          <div className={styles.essentialGrid}>
            <label className={styles.field}><span>Product name</span>
              <input required autoComplete="off" value={draft.title} onChange={e => update("title", e.target.value)} />
            </label>
            <label className={styles.field}><span>Price per pack (₹)</span>
              <input required type="number" min=".01" step=".01" value={draft.price} onChange={e => update("price", e.target.value)} />
            </label>
            <fieldset className={styles.pack}>
              <legend>Pack size</legend>
              <div>
                <input required type="number" min="1" max="2147483647" step="1" aria-label="Pack amount" value={draft.size} onChange={e => update("size", e.target.value)} />
                <select required aria-label="Pack unit" value={draft.unit} onChange={e => update("unit", e.target.value)}>
                  {packUnits.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  {draft.unit && !packUnits.some(([value]) => value === draft.unit) && <option value={draft.unit}>{draft.unit}</option>}
                </select>
              </div>
            </fieldset>
            <div className={styles.field}><label htmlFor="product-delivery">Delivery</label>
              <select id="product-delivery" required value={draft.delivery} onChange={e => update("delivery", e.target.value)}>
                <option value="">Choose delivery</option>
                <option value="national">Across India · Shelf-stable</option>
                <option value="fresh">Dehradun only · Fresh mushrooms</option>
              </select>
            </div>
            <fieldset className={styles.full}>
              <legend>Shop categories</legend>
              <div className={styles.categories}>
                {categories.map(category => <label key={category.id}>
                  <input type="checkbox" checked={draft.categoryIds.includes(category.id)} onChange={e => update("categoryIds",
                    e.target.checked ? [...draft.categoryIds, category.id] : draft.categoryIds.filter(key => key !== category.id))} />
                  {category.title}
                </label>)}
                {!categories.length && <p className={styles.muted}>No shop categories are available.</p>}
              </div>
            </fieldset>
            <label className={`${styles.field} ${styles.full}`}><span>Description</span>
              <textarea required rows={3} value={draft.description} onChange={e => update("description", e.target.value)}
                placeholder="Tell shoppers what the product is and what to expect." />
            </label>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="photos-title">
          <div className={styles.rowHead}><h2 id="photos-title">Photos</h2>
            <button type="button" className={styles.textButton} onClick={() => {
              const key = nextPhoto.current++;
              setPhotos(current => [...current, { key, url: "" }]);
            }}><Plus size={17} aria-hidden="true" /> Add photo</button>
          </div>
          <p className={styles.muted}>The cover appears first in the shop. JPG, PNG or WebP up to 5 MB.</p>
          <div className={styles.photos}>
            {photos.map((photo, index) => {
              const cover = photos.find(item => item.url.trim())?.key ?? photos[0]?.key;
              return <ImageUploadField key={photo.key} label={cover === photo.key ? "Cover photo" : `Photo ${index + 1}`} url={photo.url}
                onChange={url => changePhotos(items => items.map(item => item.key === photo.key ? { ...item, url } : item))}
                onUploading={busy => trackUpload(photo.key, busy)}
                onMakeCover={cover !== photo.key && photo.url.trim() ? () => changePhotos(items => [photo, ...items.filter(item => item.key !== photo.key)]) : undefined}
                onRemove={photo.url || photos.length > 1 ? () => changePhotos(items => items.length > 1
                  ? items.filter(item => item.key !== photo.key)
                  : [{ ...photo, url: "" }]) : undefined} />;
            })}
          </div>
        </section>

        <details className={`${styles.card} ${styles.optional}`} ref={detailsRef}>
          <summary><span>More product information <small>Optional</small></span><ChevronDown size={19} aria-hidden="true" /></summary>
          <div className={styles.optionalBody}>
            <TextEntries name="How to use" entries={draft.instructions} onChange={items => update("instructions", items)} />
            <div className={styles.contentGroup}>
              <div className={styles.rowHead}><h3>Product facts</h3>
                <button className={styles.textButton} type="button" onClick={() => update("facts", [...draft.facts, { label: "", value: "" }])}><Plus size={16} aria-hidden="true" /> Add fact</button>
              </div>
              <p className={styles.muted}>Use one row for each fact, such as origin, storage or shelf life.</p>
              {draft.facts.map((fact, index) => <div className={styles.fact} key={index}>
                <input aria-label={`Fact ${index + 1} name`} placeholder="e.g. Storage" value={fact.label} onChange={e =>
                  update("facts", draft.facts.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} />
                <textarea aria-label={`Fact ${index + 1} value`} rows={2} placeholder="e.g. Keep in a cool, dry place" value={fact.value} onChange={e =>
                  update("facts", draft.facts.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} />
                <button className={styles.iconButton} type="button" aria-label={`Remove fact ${index + 1}`}
                  onClick={() => update("facts", draft.facts.filter((_, i) => i !== index))}><X size={17} /></button>
              </div>)}
            </div>
            {Boolean(product?.specifications?.length) && <TextEntries name="Existing specifications" entries={draft.specifications} onChange={items => update("specifications", items)} />}
            <BenefitFields value={draft.benefits} onChange={value => update("benefits", value)} />
            <label className={styles.check}><input type="checkbox" checked={draft.featured} onChange={e => update("featured", e.target.checked)} /> Featured product</label>
          </div>
        </details>

        <footer className={styles.actions}>
          {error && <p role="alert" tabIndex={-1} ref={errorRef} className={styles.error}>{error}</p>}
          <div className={styles.rowHead}>
            <div className={styles.muted}>
              {product ? <Link href={inventoryHref(product.title)} className={styles.textButton}>
                {availablePacks(product.quantity, product.measurementValue, product.measurementType)} packs in recorded stock · Manage in Inventory
              </Link> : "New products start out of stock."}
              {uploads.length > 0 && <p role="status">Uploading photos…</p>}
            </div>
            <button type="submit" className={styles.primary} disabled={saving || uploads.length > 0}>
              {saving ? "Saving…" : id ? "Save changes" : "Create product"}
            </button>
          </div>
        </footer>
      </form>}
  </div>;
}
