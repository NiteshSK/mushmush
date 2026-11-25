"use client";

import type { ReactNode } from "react";
import { useOpenPanel } from "../Pantry/PantryShell";

/** Opens the shell's delivery dialog. Focus returns to this button when the dialog closes. */
export default function DeliveryButton({ className, children = "Check delivery to your PIN" }: { className?: string; children?: ReactNode }) {
  const openPanel = useOpenPanel();
  return <button type="button" className={className} onClick={() => openPanel("delivery")}>{children}</button>;
}
