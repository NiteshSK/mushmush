"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { passwordRequirementsText, validatePasswordPolicy } from "@/lib/validation";
import { withCallbackUrl } from "@/lib/safe-callback";
import AuthPage from "../AuthPage";
import { FormAlert, FormStatus, PasswordField } from "../fields";
import { useCallbackUrl } from "../useCallbackUrl";
import styles from "../../Pantry/auth.module.css";

type FieldErrors = { password?: string; confirmPassword?: string };
type Outcome = "missing" | "expired" | "done" | null;

export default function ResetPassword() {
  const token = useSearchParams()?.get("token") ?? "";
  const { callbackUrl } = useCallbackUrl();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(token ? null : "missing");
  const [pending, setPending] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const forgotHref = withCallbackUrl("/auth/forgot-password", callbackUrl);
  const signinHref = withCallbackUrl("/auth/signin", callbackUrl);

  // When the form is replaced by a result, move focus to the message that replaced it.
  useEffect(() => {
    if (outcome === "expired" || outcome === "done") messageRef.current?.focus();
  }, [outcome]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    const policy = validatePasswordPolicy(password);
    if (!policy.valid) next.password = policy.error;
    else if (password !== confirmPassword) next.confirmPassword = "The passwords don’t match";
    setErrors(next);
    setFormError(null);
    if (next.password || next.confirmPassword) {
      (next.password ? passwordRef : confirmRef).current?.focus();
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      let message = "";
      try { message = (await response.json()).error || ""; } catch { /* keep the generic message */ }
      if (response.ok) setOutcome("done");
      else if (/invalid or expired/i.test(message)) setOutcome("expired");
      else {
        setFormError(message || "We couldn’t change your password. Please try again.");
        passwordRef.current?.focus();
      }
    } catch {
      setFormError("We couldn’t reach Kosvana. Check your connection and try again.");
      passwordRef.current?.focus();
    } finally {
      setPending(false);
    }
  }

  let body;
  if (outcome === "done") {
    body = (
      <>
        <FormStatus ref={messageRef}>
          <p><strong>Your password is changed.</strong></p>
          <p>Sign in with your email and the new password.</p>
        </FormStatus>
        <div className={styles.actions}><Link href={signinHref} className={styles.submit}>Sign in</Link></div>
      </>
    );
  } else if (outcome === "missing" || outcome === "expired") {
    body = (
      <>
        <FormAlert ref={messageRef}>
          {outcome === "missing" ? (
            <><p><strong>This reset link is incomplete.</strong></p><p>Open the link from the email again, or request a new one.</p></>
          ) : (
            <><p><strong>This reset link has expired or was already used.</strong></p><p>Reset links work once and expire after 1 hour. Request a new link to choose a password.</p></>
          )}
        </FormAlert>
        <div className={styles.actions}>
          <Link href={forgotHref} className={styles.submit}>Request a new link</Link>
          <Link href={signinHref} className={styles.secondary}>Back to sign in</Link>
        </div>
      </>
    );
  } else {
    body = (
      <>
        {formError && <FormAlert id="reset-alert">{formError}</FormAlert>}
        <form className={styles.form} noValidate onSubmit={handleSubmit} aria-label="Choose a new password">
          <PasswordField ref={passwordRef} id="reset-password" name="password" label="New password" autoComplete="new-password"
            hint={passwordRequirementsText} value={password} error={errors.password} describedBy={formError ? "reset-alert" : undefined}
            onChange={event => { setPassword(event.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }} />
          <PasswordField ref={confirmRef} id="reset-confirm-password" name="confirmPassword" label="Confirm new password" autoComplete="new-password"
            value={confirmPassword} error={errors.confirmPassword}
            onChange={event => { setConfirmPassword(event.target.value); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined })); }} />
          <button type="submit" className={styles.submit} disabled={pending}>{pending ? "Saving…" : "Save new password"}</button>
        </form>
        <p className={styles.switch}>
          <Link href={signinHref} className={styles.textLink}>Back to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <AuthPage
      kicker="Password help"
      title={<>Choose a new <em>password</em></>}
      lede="Pick a password you don’t use on other sites. You’ll sign in with it from now on."
    >
      {body}
    </AuthPage>
  );
}
