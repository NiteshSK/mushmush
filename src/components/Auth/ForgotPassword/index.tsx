"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { validateEmail } from "@/lib/validation";
import { withCallbackUrl } from "@/lib/safe-callback";
import AuthPage from "../AuthPage";
import { FormAlert, FormStatus, TextField } from "../fields";
import { useCallbackUrl } from "../useCallbackUrl";
import styles from "../../Pantry/auth.module.css";

export default function ForgotPassword() {
  const { callbackUrl } = useCallbackUrl();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const signinHref = withCallbackUrl("/auth/signin", callbackUrl);

  // The form disappears once the link is sent, so move focus to the confirmation.
  useEffect(() => {
    if (sentTo) statusRef.current?.focus();
  }, [sentTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim();
    const error = validateEmail(address);
    setFormError(null);
    setFieldError(error);
    if (error) {
      emailRef.current?.focus();
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address }),
      });
      if (response.ok) {
        setSentTo(address);
      } else {
        let message = "";
        try { message = (await response.json()).error || ""; } catch { /* keep the generic message */ }
        setFormError(message || "We couldn’t send the reset link. Please try again.");
        emailRef.current?.focus();
      }
    } catch {
      setFormError("We couldn’t reach Kosvana. Check your connection and try again.");
      emailRef.current?.focus();
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPage
      kicker="Password help"
      title={<>Reset your <em>password</em></>}
      lede="Enter the email you use for Kosvana. We’ll send a link to choose a new password."
      notes={["The link works once and expires after 1 hour", "Check your spam folder if it doesn’t arrive in a few minutes"]}
      notesLabel="About the reset link"
    >
      {sentTo ? (
        <>
          <FormStatus ref={statusRef}>
            <p><strong>Check your email.</strong></p>
            <p>If there is a Kosvana account for {sentTo}, we have sent it a link to reset the password.</p>
          </FormStatus>
          <div className={styles.actions}>
            <Link href={signinHref} className={styles.submit}>Back to sign in</Link>
            <button type="button" className={styles.secondary} onClick={() => setSentTo(null)}>Use a different email</button>
          </div>
        </>
      ) : (
        <>
          {formError && <FormAlert id="forgot-alert">{formError}</FormAlert>}
          <form className={styles.form} noValidate onSubmit={handleSubmit} aria-label="Request a password reset link">
            <TextField
              ref={emailRef}
              id="forgot-email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={event => { setEmail(event.target.value); setFieldError(null); }}
              error={fieldError}
              describedBy={formError ? "forgot-alert" : undefined}
            />
            <button type="submit" className={styles.submit} disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className={styles.switch}>
            Remembered it?
            <Link href={signinHref} className={styles.textLink}>Back to sign in</Link>
          </p>
        </>
      )}
    </AuthPage>
  );
}
