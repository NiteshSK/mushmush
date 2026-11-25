"use client";

import ReadError from "@/components/Read/ReadError";

export default function NewsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ReadError kind="news" reset={reset} />;
}
