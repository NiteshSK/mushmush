"use client";
import { useEffect, useState } from "react";
import styles from "@/components/Admin/inventory.module.css";

type Zone = {
  id: number;
  name: string;
  priority: number;
  pincodeFrom: string;
  pincodeTo: string;
  baseFee: number;
  estimatedDays: string | null;
  isActive: boolean;
  updatedAt: string;
};
export default function ShippingZones() {
  const [zones, setZones] = useState<Zone[]>([]),
    [draft, setDraft] = useState<Partial<Zone> | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/shipping-zones", {
        cache: "no-store",
      });
      if (!response.ok) throw Error("Shipping zones could not be loaded.");
      setZones((await response.json()).zones);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Zone lookup failed.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft) return;
    const f = new FormData(e.currentTarget);
    const data = {
      id: draft.id,
      expectedUpdatedAt: draft.updatedAt,
      name: f.get("name"),
      pincodeFrom: f.get("from"),
      pincodeTo: f.get("to"),
      baseFee: Number(f.get("fee")),
      priority: Number(f.get("priority")),
      estimatedDays: f.get("estimate"),
      isActive: f.has("active"),
    };
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/admin/shipping-zones", {
        method: draft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw Error((await r.json()).error);
      setDraft(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save zone.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className={styles.inventory}>
      <h2 className="text-xl font-semibold">Shipping zones</h2>
      <p>
        Each zone adds a distance surcharge to ₹50. All zones ship free for
        qualifying subtotals of ₹1,999 or more. The highest priority matching
        zone applies.
      </p>
      {error && (
        <p role="alert">
          {error} <button onClick={load}>Reload</button>
        </p>
      )}
      {loading ? (
        <p role="status">Loading zones…</p>
      ) : (
        <>
          <button onClick={() => setDraft({})}>Add zone</button>
          {!zones.length && <p>No shipping zones configured.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {zones.map((zone) => (
              <div className={styles.item} key={zone.id}>
                <strong>{zone.name}</strong> ·{" "}
                {zone.isActive ? "Active" : "Paused"}
                <p>
                  {zone.pincodeFrom}–{zone.pincodeTo} · ₹{zone.baseFee}{" "}
                  surcharge · Priority {zone.priority}
                </p>
                <button onClick={() => setDraft(zone)}>Edit {zone.name}</button>
              </div>
            ))}
          </div>
          {draft && (
            <form
              className={styles.adjust}
              onSubmit={save}
              key={draft.id || "new"}
            >
              <h3>{draft.id ? "Edit zone" : "New zone"}</h3>
              <label>
                Zone name
                <input
                  name="name"
                  maxLength={120}
                  defaultValue={draft.name}
                  required
                />
              </label>
              <label>
                First PIN
                <input
                  name="from"
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  defaultValue={draft.pincodeFrom}
                  required
                />
              </label>
              <label>
                Last PIN
                <input
                  name="to"
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  defaultValue={draft.pincodeTo}
                  required
                />
              </label>
              <label>
                Distance surcharge (₹)
                <input
                  type="number"
                  min="0"
                  step=".01"
                  name="fee"
                  defaultValue={draft.baseFee ?? 0}
                  required
                />
              </label>
              <label>
                Priority
                <input
                  type="number"
                  step="1"
                  name="priority"
                  defaultValue={draft.priority ?? 0}
                  required
                />
              </label>
              <label>
                Delivery estimate
                <input
                  name="estimate"
                  maxLength={60}
                  defaultValue={draft.estimatedDays ?? ""}
                  placeholder="e.g. 2–3 days"
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={draft.isActive ?? true}
                />{" "}
                Active
              </label>
              <button disabled={saving}>Save zone</button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
