"use client";
import React, { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  session: any;
  hasSecret: boolean;
  hasGoogle: boolean;
  env: string;
  error?: string;
};

export default function AuthHealthCheckPage() {
  const [data, setData] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/auth/health", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setErr(e?.message || "Unknown client error");
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-[50vh] max-w-[900px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">NextAuth Health Check</h1>
      {err && (
        <div className="text-red-600 mb-4">Client error: {err}</div>
      )}
      {!data ? (
        <div>Loading…</div>
      ) : (
        <pre className="bg-gray-1 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      <p className="mt-6 text-sm text-gray-6">
        This fetches <code>/api/auth/health</code> and shows raw JSON. If you see HTML
        somewhere else ("Unexpected token &lt;"), it means that endpoint returned an HTML page
        (likely due to a redirect or crash).
      </p>
    </div>
  );
}
