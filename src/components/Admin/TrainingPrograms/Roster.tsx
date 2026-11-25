"use client";
import { useState } from "react";
type Roster = {
  capacity: number | null;
  rows: { day: string | null; paid: number; pending: number }[];
};
export default function Roster({ id }: { id: number }) {
  const [data, setData] = useState<Roster | null>(null),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  async function open() {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch("/api/admin/training-programs/" + id + "/roster");
      if (!r.ok) throw Error();
      setData(await r.json());
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        className="underline"
        disabled={busy}
        onClick={data ? () => setData(null) : open}
      >
        {data ? "Close roster" : busy ? "Loading…" : "View roster"}
      </button>
      {error && <p role="alert">Roster could not be loaded.</p>}
      {data &&
        (data.rows.length ? (
          <ul>
            {data.rows.map((r) => (
              <li key={r.day || "unscheduled"}>
                {r.day || "Date to confirm"} · {r.paid} paid · {r.pending}{" "}
                awaiting verification
                {r.day &&
                  data.capacity != null &&
                  " · " +
                    Math.max(0, data.capacity - r.paid) +
                    " seats remaining" +
                    (r.paid > data.capacity ? " · over capacity" : "")}
              </li>
            ))}
          </ul>
        ) : (
          <p>No registrations yet.</p>
        ))}
    </div>
  );
}
