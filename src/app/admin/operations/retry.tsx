"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function RetryJob({ jobKey }: { jobKey: string }) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <>
      <button
        disabled={message === "Retrying…"}
        onClick={async () => {
          setMessage("Retrying…");
          try {
            const r = await fetch("/api/admin/jobs/run", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: jobKey }),
            });
            setMessage(r.ok ? "Attempt finished" : "Retry failed");
            router.refresh();
          } catch {
            setMessage("Retry failed");
          }
        }}
      >
        Retry
      </button>{" "}
      <span role="status">{message}</span>
    </>
  );
}
