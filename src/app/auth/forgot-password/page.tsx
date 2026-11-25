"use client";

import { Suspense } from "react";
import PantryShell from "@/components/Pantry/PantryShell";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import PantryLoader from "@/components/Pantry/PantryLoader";

// Metadata lives in ./layout.tsx because this page is a client component.
export default function ForgotPasswordPage() {
  return (
    <PantryShell browseHref="/shop">
      {/* The form reads the query string (callbackUrl, token, error). */}
      <Suspense fallback={<main id="main" aria-busy="true"><PantryLoader /></main>}>
        <ForgotPassword />
      </Suspense>
    </PantryShell>
  );
}
