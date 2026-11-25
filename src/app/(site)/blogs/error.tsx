"use client";

import ReadError from "@/components/Read/ReadError";

export default function JournalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ReadError kind="journal" reset={reset} />;
}
