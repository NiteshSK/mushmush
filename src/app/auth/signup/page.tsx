"use client";

import { Suspense } from "react";
import PantryShell from "@/components/Pantry/PantryShell";
import Signup from "@/components/Auth/Signup";
import PantryLoader from "@/components/Pantry/PantryLoader";

// Metadata lives in ./layout.tsx because this page is a client component.
export default function SignUpPage() {
  return (
    <PantryShell browseHref="/shop">
      {/* The form reads the query string (callbackUrl, token, error). */}
      <Suspense fallback={<main id="main" aria-busy="true"><PantryLoader /></main>}>
        <Signup />
      </Suspense>
    </PantryShell>
  );
}
