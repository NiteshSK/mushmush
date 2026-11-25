"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { withCallbackUrl } from "@/lib/safe-callback";
import AuthPage from "../AuthPage";
import { FormAlert } from "../fields";
import { authErrorMessage } from "../messages";
import { useCallbackUrl } from "../useCallbackUrl";
import styles from "../../Pantry/auth.module.css";

/** NextAuth sends sign-in failures here (pages.error in src/lib/auth.ts). */
export default function AuthError() {
  const code = useSearchParams()?.get("error");
  const { callbackUrl } = useCallbackUrl();
  return (
    <AuthPage kicker="Your account" title={<>We couldn’t sign you <em>in</em></>} lede="Try again, or keep shopping without an account.">
      <FormAlert>{authErrorMessage(code ?? "Default")}</FormAlert>
      <div className={styles.actions}>
        <Link href={withCallbackUrl("/auth/signin", callbackUrl)} className={styles.submit}>Try signing in again</Link>
        <Link href="/shop" className={styles.secondary}>Continue shopping</Link>
      </div>
    </AuthPage>
  );
}
