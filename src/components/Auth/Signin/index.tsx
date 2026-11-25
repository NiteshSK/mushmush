"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { validateEmail } from "@/lib/validation";
import { withCallbackUrl } from "@/lib/safe-callback";
import AuthPage from "../AuthPage";
import { FormAlert, GoogleButton, PasswordField, TextField } from "../fields";
import { authErrorMessage, WRONG_PASSWORD } from "../messages";
import { hardNavigate, useCallbackUrl } from "../useCallbackUrl";
import styles from "../../Pantry/auth.module.css";

type FieldErrors = { email?: string; password?: string };
const ALERT_ID = "signin-alert";

export default function Signin() {
  const router = useRouter();
  const params = useSearchParams();
  const status = useSession()?.status;
  const { callbackUrl, resolve } = useCallbackUrl();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(() => authErrorMessage(params?.get("error")));
  const [pending, setPending] = useState<"credentials" | "google" | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const leaving = useRef(false);

  // Someone who is already signed in goes straight to where they were heading.
  useEffect(() => {
    if (status === "authenticated" && !leaving.current) router.replace(resolve());
  }, [status, router, resolve]);

  // After a wrong password, keep the email and return focus to the password, ready to retype.
  useEffect(() => {
    if (failedAttempts === 0) return;
    passwordRef.current?.focus();
    passwordRef.current?.select();
  }, [failedAttempts]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim();
    const next: FieldErrors = {};
    const emailError = validateEmail(address);
    if (emailError) next.email = emailError;
    if (!password) next.password = "Enter your password";
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) {
      (next.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    const target = resolve();
    setPending("credentials");
    leaving.current = true;
    try {
      const result = await signIn("credentials", { email: address, password, redirect: false, callbackUrl: target });
      if (result && result.ok && !result.error) {
        // Do not clear the bag here; bag continuity across sign-in is handled with the session.
        hardNavigate(target);
        return;
      }
      setFormError(WRONG_PASSWORD);
    } catch {
      setFormError("We couldn’t reach Kosvana to sign you in. Check your connection and try again.");
    }
    leaving.current = false;
    setPending(null);
    setFailedAttempts(count => count + 1);
  }

  async function handleGoogle() {
    setFormError(null);
    setPending("google");
    try {
      await signIn("google", { callbackUrl: resolve() });
    } catch {
      setPending(null);
      setFormError("We couldn’t open Google sign-in. Please try again.");
    }
  }

  const toCheckout = callbackUrl.indexOf("/checkout") === 0;
  const notes = [
    "See your orders, invoices and delivery updates",
    "Keep saved items and delivery addresses",
    toCheckout
      ? <>No account needed: <Link href={callbackUrl} className={styles.textLink}>Check out as a guest</Link></>
      : "Check out faster with a saved address",
  ];

  return (
    <AuthPage
      kicker="Your account"
      title={<>Welcome <em>back</em></>}
      lede={toCheckout ? "Sign in to continue to checkout." : callbackUrl !== "/" ? "Sign in and we’ll take you back to the page you were on." : "Sign in to see your orders, saved items and addresses."}
      notes={notes}
      notesLabel="About signing in"
    >
      {formError && (
        <FormAlert id={ALERT_ID}>
          <p>{formError}</p>
          {formError === WRONG_PASSWORD && <p>If you joined with Google, use Continue with Google below.</p>}
        </FormAlert>
      )}
      <form className={styles.form} noValidate onSubmit={handleSubmit} aria-label="Sign in with email">
        <TextField
          ref={emailRef}
          id="signin-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={event => { setEmail(event.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
          error={errors.email}
        />
        <PasswordField
          ref={passwordRef}
          id="signin-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={event => { setPassword(event.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
          error={errors.password}
          describedBy={formError ? ALERT_ID : undefined}
          labelAside={<Link href={withCallbackUrl("/auth/forgot-password", callbackUrl)} className={styles.textLink}>Forgot password?</Link>}
        />
        <button type="submit" className={styles.submit} disabled={pending !== null}>
          {pending === "credentials" ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className={styles.divider}>or</p>
      <GoogleButton onClick={handleGoogle} disabled={pending !== null} pending={pending === "google"} />
      <p className={styles.switch}>
        New to Kosvana?
        <Link href={withCallbackUrl("/auth/signup", callbackUrl)} className={styles.textLink}>Create an account</Link>
      </p>
    </AuthPage>
  );
}
