"use client";
import { useEffect, useState } from "react";

type LegacyOrder = {
  id: string;
  orderNumber: string;
  status: string;
  updatedAt: string;
  orderItems: {
    id: string;
    quantity: number;
    product: { title: string; measurementType: string };
  }[];
};
export default function LegacyReservationReview() {
  const [orders, setOrders] = useState<LegacyOrder[]>([]),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [q, setQuery] = useState("");
  const [revision, refresh] = useState(0),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(
      "/api/admin/reservation-review?" +
        new URLSearchParams({ q, page: String(page) }),
      { signal: controller.signal },
    )
      .then(async (r) => {
        if (!r.ok) throw Error();
        const result = await r.json();
        setOrders(result.orders);
        setMore(result.more);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOrders([]);
          setMessage("Could not load original reservation reviews.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [q, page, revision]);
  async function save(
    event: React.FormEvent<HTMLFormElement>,
    order: LegacyOrder,
  ) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const lines = order.orderItems.map((line) => ({
        id: line.id,
        units: Number(values.get(line.id)),
      }));
      const r = await fetch("/api/admin/reservation-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          expectedUpdatedAt: order.updatedAt,
          reason: values.get("reason"),
          lines,
        }),
      });
      if (!r.ok) throw Error((await r.json()).error);
      setMessage("Original quantities recorded for " + order.orderNumber + ".");
      refresh((n) => n + 1);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save quantities.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Original stock reservations</h2>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(String(new FormData(e.currentTarget).get("q") || ""));
        }}
      >
        <input
          className="border p-2"
          aria-label="Find an order to reconcile"
          name="q"
          placeholder="Order number"
        />
        <button>Search</button>
      </form>
      <p role="status">{message}</p>
      {loading ? (
        <p>Loading reservations…</p>
      ) : !orders.length ? (
        <p>
          No matching reservations.{" "}
          <button onClick={() => refresh((n) => n + 1)}>Reload</button>
        </p>
      ) : (
        orders.map((order) => (
          <details key={order.id} className="rounded border p-3">
            <summary>
              {order.orderNumber} · {order.status}
            </summary>
            <form className="grid gap-3 pt-3" onSubmit={(e) => save(e, order)}>
              <p>
                Use the picking or weighing record to enter what was originally
                reserved. Saving records that evidence. Stock moves when the
                order is cancelled.
              </p>
              {order.orderItems.map((line) => (
                <label key={line.id}>
                  {line.product.title} · {line.quantity} packs · original base
                  units (g, ml or pieces)
                  <input
                    aria-label={"Original base units for " + line.product.title}
                    required
                    type="number"
                    min="0"
                    step="any"
                    className="block border p-2"
                    name={line.id}
                  />
                </label>
              ))}
              <label>
                Picking record or reconciliation evidence
                <input
                  name="reason"
                  required
                  maxLength={300}
                  className="block w-full border p-2"
                />
              </label>
              <button
                className="justify-self-start rounded bg-forest px-3 py-2 text-white"
                disabled={busy}
              >
                Record original reservations
              </button>
            </form>
          </details>
        ))
      )}
      <div className="flex gap-4">
        {page > 1 && (
          <button onClick={() => setPage(page - 1)}>Previous</button>
        )}
        {more && <button onClick={() => setPage(page + 1)}>Next</button>}
      </div>
    </section>
  );
}
