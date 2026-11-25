"use client";
import { useEffect, useState } from "react";

type Attempt = {
  id: string;
  amount: number;
  transactionId: string | null;
  createdAt: string;
  decisionNotes: string | null;
  status: string;
  training_registrations: {
    registrationNumber: string;
    participantName: string;
    trainingProgram: { name: string };
  };
};

export default function PaymentVerification() {
  const [status, setStatus] = useState("PENDING"),
    [page, setPage] = useState(1);
  const [rows, setRows] = useState<Attempt[]>([]),
    [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, reload] = useState(0);
  const [review, setReview] = useState(""),
    [note, setNote] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setReview("");
    setRows([]);
    setMore(false);
    fetch(
      "/api/admin/payment-verification?status=" + status + "&page=" + page,
      { signal: controller.signal },
    )
      .then(async (r) => {
        if (!r.ok) throw Error();
        const data = await r.json();
        setRows(data.rows);
        setMore(data.more);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Payments could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [status, page, revision]);
  async function decide(action: string) {
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/admin/payment-verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: review, action, note }),
      });
      if (!r.ok) throw Error((await r.json()).error);
      setReview("");
      reload((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decision failed.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-semibold">Training payments</h1>
      <label>
        Payment status{" "}
        <select
          className="border rounded p-2"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="PENDING">Awaiting review</option>
          <option value="VERIFIED">Verified</option>
          <option value="FAILED">Rejected</option>
        </select>
      </label>
      {error && (
        <p role="alert">
          {error}{" "}
          <button onClick={() => reload((v) => v + 1)}>Reload payments</button>
        </p>
      )}
      {loading ? (
        <p role="status">Loading payments…</p>
      ) : (
        <>
          {!error && !rows.length && <p>No payments in this queue.</p>}
          {rows.map((row) => (
            <article
              key={row.id}
              className="bg-white border rounded-lg p-5 space-y-2 break-words"
            >
              <h2 className="font-semibold">
                {row.training_registrations.participantName} · ₹
                {row.amount.toLocaleString("en-IN")}
              </h2>
              <p>
                {row.training_registrations.trainingProgram.name} ·{" "}
                {row.training_registrations.registrationNumber}
              </p>
              <p>UPI reference {row.transactionId ?? "Unavailable"}</p>
              <p>
                {new Date(row.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST · {row.status}
              </p>
              {row.decisionNotes && <p>{row.decisionNotes}</p>}
              {row.status === "PENDING" &&
                status === "PENDING" &&
                (review === row.id ? (
                  <div className="space-y-2">
                    <label>
                      Bank verification notes{" "}
                      <textarea autoFocus
                        maxLength={1000}
                        className="block border w-full p-2"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <button
                        disabled={saving}
                        onClick={() => decide("approve")}
                      >
                        Confirm funds received
                      </button>
                      <button
                        disabled={saving}
                        onClick={() => decide("reject")}
                      >
                        Reject payment
                      </button>
                      <button disabled={saving} onClick={() => setReview("")}>
                        Close review
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="bg-forest text-white px-4 py-2 rounded"
                    onClick={() => {
                      setReview(row.id);
                      setNote("");
                    }}
                  >
                    Review
                  </button>
                ))}
            </article>
          ))}
          <div className="flex gap-4">
            {page > 1 && (
              <button onClick={() => setPage(page - 1)}>Previous</button>
            )}
            {more && <button onClick={() => setPage(page + 1)}>Next</button>}
          </div>
        </>
      )}
    </section>
  );
}
