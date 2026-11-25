"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { toBaseUnits } from "@/lib/inventory";
import type { StockAction } from "@/lib/staff-inventory";
import styles from "./inventory.module.css";

type Product = {
  id: number;
  title: string;
  updatedAt: string;
  bulkQuantity: number;
  stockQuantity: number;
  bulkDisplay: string;
  measurementValue: number;
  measurementType: string;
  price: number;
  inStock: boolean;
};
type Editor = {
  product: Product;
  kind: "price" | "quantity";
  action: StockAction;
  unit: string;
  value: string;
  reason: string;
  movementId: string;
};
type EventRow = {
  id: string;
  actor: string;
  action: string;
  note: string | null;
  createdAt: string;
};

function units(type: string) {
  const unit = type.toLowerCase();
  if (["l", "litre", "litres", "ml"].includes(unit)) return ["L", "ml"];
  if (["gm", "g", "kg"].includes(unit)) return ["kg", "gm"];
  return [type];
}
function eventDescription(event: EventRow) {
  if (event.note?.startsWith("{")) {
    try {
      const detail = JSON.parse(event.note);
      return (
        detail.before + " → " + detail.after + " base units · " + detail.reason
      );
    } catch {
      return event.note;
    }
  }
  return event.note;
}
function History({ id }: { id: number }) {
  const [page, setPage] = useState(1),
    [rows, setRows] = useState<EventRow[]>([]),
    [more, setMore] = useState(false),
    [status, setStatus] = useState("Loading history…"),
    [revision, reload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStatus("Loading history…");
    fetch("/api/admin/products/" + id + "?page=" + page, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw Error();
        const data = await response.json();
        setRows(data.rows);
        setMore(data.more);
        setStatus("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setStatus("History could not be loaded.");
      });
    return () => controller.abort();
  }, [id, page, revision]);
  return (
    <section aria-label="Stock history" className={styles.history}>
      <h3>Stock history</h3>
      {status ? (
        <p role="status">
          {status}{" "}
          {status.includes("could") && (
            <button onClick={() => reload((v) => v + 1)}>Retry</button>
          )}
        </p>
      ) : (
        <>
          {!rows.length && <p>No recorded movements.</p>}
          {rows.map((e) => (
            <div key={e.id}>
              <b>{e.action}</b> · {eventDescription(e)}
              <small>
                {e.actor} ·{" "}
                {new Date(e.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST
              </small>
            </div>
          ))}
          {page > 1 && (
            <button onClick={() => setPage(page - 1)}>Earlier page</button>
          )}
          {more && (
            <button onClick={() => setPage(page + 1)}>Older events</button>
          )}
        </>
      )}
    </section>
  );
}
export default function ProductInventoryTable() {
  const [products, setProducts] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<string | null>(null),
    [totalPages, setTotalPages] = useState(1),
    [revision, reload] = useState(0);
  const [editor, setEditor] = useState<Editor | null>(null),
    [busy, setBusy] = useState(false),
    [feedback, setFeedback] = useState(""),
    [history, setHistory] = useState<number | null>(null);
  const openedReceipt = useRef<number | null>(null);
  useEffect(() => {
    const sync = () => setFilter(window.location.search);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const params = new URLSearchParams(filter || "");
  const page = Math.max(1, Number(params.get("page")) || 1);
  const receiptId = Number(params.get("receive"));
  function changeFilter(changes: Record<string, string>) {
    for (const [key, value] of Object.entries(changes))
      value ? params.set(key, value) : params.delete(key);
    const next = "?" + params.toString();
    window.history.pushState(null, "", next);
    setFilter(next);
    setEditor(null);
    setFeedback("");
    setHistory(null);
  }
  useEffect(() => {
    if (filter === null) return;
    const controller = new AbortController();
    const query = new URLSearchParams(filter);
    query.delete("receive");
    if (!query.has("page")) query.set("page", "1");
    query.set("limit", "25");
    setLoading(true);
    setLoadError("");
    fetch("/api/admin/products?" + query, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw Error();
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadError("Failed to fetch products");
          toast.error("Failed to fetch products");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filter, revision]);
  const start = useCallback((product: Product, kind: Editor["kind"], action: StockAction = "stocktake") => {
    const unitOptions = units(product.measurementType);
    const matchingPackUnit = unitOptions.find(option => toBaseUnits(1, option) === toBaseUnits(1, product.measurementType));
    const unit = action === "receive" ? matchingPackUnit ?? unitOptions[0] : unitOptions[0];
    setFeedback("");
    setHistory(null);
    setEditor({
      product,
      kind,
      action,
      unit,
      value: action === "receive" ? "" : String(
        kind === "price"
          ? product.price
          : product.bulkQuantity / toBaseUnits(1, unit),
      ),
      reason: action === "receive" ? "Opening stock" : "",
      movementId: crypto.randomUUID(),
    });
  }, []);
  useEffect(() => {
    if (loading || !Number.isSafeInteger(receiptId) || receiptId < 1 || openedReceipt.current === receiptId) return;
    const product = products.find(item => item.id === receiptId && item.bulkQuantity === 0);
    if (product) {
      openedReceipt.current = receiptId;
      start(product, "quantity", "receive");
    }
  }, [loading, products, receiptId, start]);
  async function save(product: Product, body: Record<string, unknown>) {
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/products/" + product.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(
          data.error || "Update failed. Reload and review the product.",
        );
      setProducts((current) =>
        current.map((p) => (p.id === product.id ? { ...p, ...data } : p)),
      );
      setEditor(null);
      toast.success("Inventory updated");
      if (params.get("attention") === "1") reload((v) => v + 1);
    } catch (e) {
      setFeedback(
        e instanceof Error ? e.message : "The change could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor) return;
    const { product, kind, action, unit, reason, movementId } = editor;
    const parsed = Number(editor.value);
    if (
      !editor.value.trim() ||
      !Number.isFinite(parsed) ||
      parsed < 0 ||
      (kind === "price" && parsed <= 0)
    ) {
      setFeedback("Enter a valid amount.");
      return;
    }
    const common = { field: kind, expectedUpdatedAt: product.updatedAt };
    void save(
      product,
      kind === "price"
        ? { ...common, value: parsed }
        : {
            ...common,
            action,
            value: toBaseUnits(parsed, unit),
            reason: reason.trim(),
            movementId,
            expectedQuantity: product.bulkQuantity,
            expectedUnit: product.measurementType,
          },
    );
  }
  if (loading) return <p role="status">Loading products...</p>;
  if (loadError)
    return (
      <p role="alert">
        {loadError}. <button onClick={() => reload((v) => v + 1)}>Retry</button>
      </p>
    );
  return (
    <section className={styles.inventory}>
      <form
        key={filter}
        className={styles.filters}
        onSubmit={(e) => {
          e.preventDefault();
          changeFilter({
            q: String(new FormData(e.currentTarget).get("q") || ""),
            page: "1",
          });
        }}
      >
        <label>
          Find a product
          <input
            name="q"
            defaultValue={params.get("q") || ""}
            placeholder="Product name or category"
          />
        </label>
        <button>Search</button>
        <label>
          <input
            type="checkbox"
            checked={params.get("attention") === "1"}
            onChange={(e) =>
              changeFilter({
                attention: e.target.checked ? "1" : "",
                page: "1",
              })
            }
          />{" "}
          Needs attention
        </label>
      </form>
      {feedback && (
        <p role="alert">
          {feedback}{" "}
          <button
            onClick={() => {
              setEditor(null);
              setFeedback("");
              reload((v) => v + 1);
            }}
          >
            Reload products
          </button>
        </p>
      )}
      <div className={styles.header} aria-hidden>
        <span>Product</span>
        <span>Quantity</span>
        <span>Price</span>
        <span>Availability</span>
      </div>
      {!products.length && <p>No products found</p>}
      {products.map((product) => (
        <article className={styles.item} key={product.id}>
          <div className={styles.row}>
            <div>
              <h2>{product.title}</h2>
              <button
                onClick={() =>
                  setHistory(history === product.id ? null : product.id)
                }
                aria-expanded={history === product.id}
              >
                Stock history
              </button>
            </div>
            <div>
              <strong>{product.bulkDisplay}</strong>
              <small>
                {product.stockQuantity} packs of {product.measurementValue}
                {product.measurementType}
              </small>
              <button
                title="Edit quantity"
                onClick={() => start(product, "quantity")}
              >
                Adjust stock
              </button>
            </div>
            <div>
              <strong>₹{product.price.toLocaleString("en-IN")}</strong>
              <button
                title="Edit price"
                onClick={() => start(product, "price")}
              >
                Edit price
              </button>
            </div>
            <div>
              <strong>{product.inStock ? "In Stock" : "Out of Stock"}</strong>
              <button
                disabled={busy}
                onClick={() => {
                  if (!product.inStock && product.stockQuantity < 1) {
                    start(product, "quantity");
                    return;
                  }
                  if (
                    product.inStock &&
                    !window.confirm(
                      "Pause sales for " +
                        product.title +
                        "? Its physical quantity will be kept.",
                    )
                  )
                    return;
                  void save(product, {
                    field: "inStock",
                    value: !product.inStock,
                    expectedUpdatedAt: product.updatedAt,
                  });
                }}
              >
                {product.inStock ? "Pause sales" : "Make available"}
              </button>
            </div>
          </div>
          {editor?.product.id === product.id && (
            <form className={styles.adjust} onSubmit={submitEdit}>
              <h3>
                {editor.kind === "price" ? "Edit pack price" : "Adjust stock"} ·{" "}
                {product.title}
              </h3>
              {editor.kind === "quantity" && (
                <label>
                  Movement
                  <select
                    value={editor.action}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        action: e.target.value as StockAction,
                        value: "",
                      })
                    }
                  >
                    <option value="stocktake">Stocktake · actual total</option>
                    <option value="receive">Receive stock · add</option>
                    <option value="damage">Damage or loss · subtract</option>
                  </select>
                </label>
              )}
              <label>
                {editor.kind === "price" ? "Price per pack (₹)" : "Quantity"}
                <input
                  required
                  type="number"
                  min={editor.kind === "price" ? "0.01" : "0"}
                  step="any"
                  value={editor.value}
                  onChange={(e) =>
                    setEditor({ ...editor, value: e.target.value })
                  }
                />
              </label>
              {editor.kind === "quantity" && (
                <>
                  <label>
                    Unit
                    <select
                      value={editor.unit}
                      onChange={(e) =>
                        setEditor({ ...editor, unit: e.target.value })
                      }
                    >
                      {units(product.measurementType).map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Reason
                    <input
                      required
                      maxLength={300}
                      value={editor.reason}
                      placeholder="e.g. Delivery from the farm"
                      onChange={(e) =>
                        setEditor({ ...editor, reason: e.target.value })
                      }
                    />
                  </label>
                </>
              )}
              <button aria-label="Save adjustment" disabled={busy}>
                Save
              </button>
              <button
                type="button"
                aria-label="Cancel adjustment"
                disabled={busy}
                onClick={() => setEditor(null)}
              >
                Cancel
              </button>
            </form>
          )}
          {history === product.id && <History id={product.id} />}
        </article>
      ))}
      {(page > 1 || totalPages > 1) && (
        <div className={styles.filters}>
          <button
            disabled={page <= 1}
            onClick={() => changeFilter({ page: String(page - 1) })}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => changeFilter({ page: String(page + 1) })}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
