"use client";
import { useEffect, useState } from "react";
import ShippingZones from "./zones";
import BasketPreview from "./basket-preview";
import { FRESH_DELIVERY_PINS } from "@/components/Pantry/delivery";

export default function Shipping() {
  const [pins, setPins] = useState(""),
    [saved, setSaved] = useState<string | null>(null),
    [loaded, setLoaded] = useState(false);
  const [feedback, setFeedback] = useState(""),
    [busy, setBusy] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  async function load() {
    setLoaded(false);
    try {
      const r = await fetch("/api/admin/settings", { cache: "no-store" });
      if (!r.ok) throw Error();
      const list = await r.json();
      const stored = list.find(
        (row: { key: string }) => row.key === "fresh_delivery_pins",
      );
      const previous = stored?.value ?? null;
      setVersion(stored?.updatedAt ?? null);
      setSaved(previous);
      setPins(previous ?? FRESH_DELIVERY_PINS.join(", "));
      setLoaded(true);
    } catch {
      setFeedback("Delivery settings could not be loaded.");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save() {
    const value = Array.from(
      new Set(pins.split(/[\s,]+/).filter(Boolean)),
    ).join(",");
    setBusy(true);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: [
            {
              key: "fresh_delivery_pins",
              value,
              expected: saved,
              expectedUpdatedAt: version,
            },
          ],
        }),
      });
      if (!r.ok) throw Error((await r.json()).error);
      await load();
      setFeedback("Delivery PINs saved.");
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Delivery coverage</h1>
      <div className="rounded-lg bg-white p-5 space-y-3">
        <label className="block">
          Fresh mushroom PINs in Dehradun
          <textarea
            disabled={!loaded}
            className="block w-full border p-2"
            value={pins}
            onChange={(e) => setPins(e.target.value)}
          />
        </label>
        <p>
          Dried mushrooms and other pantry goods ship across India wherever a
          shipping zone is available.
        </p>
        <button
          disabled={!loaded || busy}
          className="bg-forest text-white rounded px-4 py-2"
          onClick={save}
        >
          Save PINs
        </button>{" "}
        <button onClick={load}>Reload</button>
        <p role="status">{feedback}</p>
      </div>
      <BasketPreview />
      <ShippingZones />
    </section>
  );
}
