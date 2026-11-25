"use client";
import { useEffect, useState } from "react";
import styles from "@/components/Admin/inventory.module.css";

type Product = { id: number; title: string };
type Line = Product & { quantity: number };

export default function BasketPreview() {
  const [query, setQuery] = useState(""),
    [choices, setChoices] = useState<Product[]>([]),
    [lines, setLines] = useState<Line[]>([]),
    [pin, setPin] = useState("");
  const [searchStatus, setSearchStatus] = useState(""),
    [quote, setQuote] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setChoices([]);
    if (!query.trim()) {
      setSearchStatus("");
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchStatus("Searching…");
      try {
        const r = await fetch(
          "/api/products/search?limit=15&q=" + encodeURIComponent(query),
          { signal: controller.signal },
        );
        if (!r.ok) throw Error();
        const products = (await r.json()).products as Product[];
        if (!controller.signal.aborted) {
          setChoices(products);
          setSearchStatus(products.length ? "" : "No matching products.");
        }
      } catch {
        if (!controller.signal.aborted)
          setSearchStatus("Product search is unavailable.");
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  function add(product: Product) {
    setLines((current) =>
      current.some((l) => l.id === product.id)
        ? current.map((l) =>
            l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
          )
        : [...current, { ...product, quantity: 1 }],
    );
    setQuote("");
    setQuery("");
  }
  async function check(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setQuote("");
    try {
      if (!lines.length) {
        const r = await fetch("/api/shipping/check?pincode=" + pin);
        const result = await r.json();
        if (!r.ok) throw Error(result.error);
        setQuote(
          !result.deliverable
            ? "No active shipping zone serves this PIN."
            : result.freshEligible
              ? "Eligible for fresh mushrooms and pantry goods."
              : "Eligible for dried mushrooms and pantry goods. Fresh mushrooms require a Dehradun delivery PIN.",
        );
      } else {
        const r = await fetch("/api/admin/shipping-zones/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pincode: pin,
            items: lines.map(({ id, quantity }) => ({
              productId: id,
              quantity,
            })),
          }),
        });
        const result = await r.json();
        if (!r.ok) throw Error(result.stockErrors?.join(" · ") || result.error);
        setQuote(
          "Eligible · items ₹" +
            result.subtotal +
            " + shipping ₹" +
            result.shippingFee +
            " + fee ₹" +
            result.convenienceFee +
            " = ₹" +
            result.total,
        );
      }
    } catch (e) {
      setQuote(e instanceof Error ? e.message : "Preview failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.inventory}>
      <h2 className="text-xl font-semibold">Test a PIN or basket</h2>
      <form className={styles.adjust} onSubmit={check}>
        <fieldset disabled={busy} className="grid w-full gap-2">
          <label>
            Delivery PIN
            <input
              required
              pattern="[0-9]{6}"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setQuote("");
              }}
            />
          </label>
          <label>
            Add a product to preview checkout
            <input
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <p role="status">{searchStatus}</p>
          {choices.map((p) => (
            <button type="button" key={p.id} onClick={() => add(p)}>
              Add {p.title}
            </button>
          ))}
          {lines.map((line) => (
            <div key={line.id} className="flex flex-wrap items-center gap-3">
              <label>
                {line.title} · packs
                <input
                  aria-label={"Packs of " + line.title}
                  type="number"
                  min="1"
                  max="9999"
                  value={line.quantity}
                  onChange={(e) => {
                    setLines((current) =>
                      current.map((l) =>
                        l.id === line.id
                          ? { ...l, quantity: Number(e.target.value) }
                          : l,
                      ),
                    );
                    setQuote("");
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setLines(lines.filter((l) => l.id !== line.id));
                  setQuote("");
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button className="justify-self-start">
            {busy ? "Checking…" : "Check delivery"}
          </button>
        </fieldset>
        <p role="status">{quote}</p>
      </form>
    </section>
  );
}
