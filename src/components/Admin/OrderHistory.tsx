"use client";
import { useEffect, useState } from "react";
interface Event {
  id: string;
  action: string;
  note: string | null;
  createdAt: string;
  actor: string;
}
export default function OrderHistory({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [events, setEvents] = useState<Event[] | null>(null),
    [failed, setFailed] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setFailed(false);
    setEvents(null);
    fetch("/api/admin/orders/" + id + "/history", { signal: c.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        setEvents(await r.json());
      })
      .catch(() => {
        if (!c.signal.aborted) setFailed(true);
      });
    return () => c.abort();
  }, [id, status, revision]);
  return (
    <section className="my-4">
      <h3 className="font-semibold">Order history</h3>
      {failed ? (
        <p role="alert">
          History could not be loaded.{" "}
          <button onClick={() => setRevision((r) => r + 1)}>Retry</button>
        </p>
      ) : !events ? (
        <p>Loading history…</p>
      ) : !events.length ? (
        <p>No recorded staff changes yet.</p>
      ) : (
        <ol>
          {events.map((e) => (
            <li key={e.id}>
              {new Date(e.createdAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST · {e.action} · {e.actor}
              {e.note && <p>{e.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
