"use client";

import { type FormEvent, type RefObject, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { passwordRequirementsText, validateEmail, validateName, validatePasswordPolicy, validatePhone } from "@/lib/validation";
import { withCallbackUrl } from "@/lib/safe-callback";
import AuthPage from "../AuthPage";
import { FormAlert, GoogleButton, PasswordField, TextField } from "../fields";
import { hardNavigate, useCallbackUrl } from "../useCallbackUrl";
import CodeDialog from "./CodeDialog";
import styles from "../../Pantry/auth.module.css";

type Field = "name" | "email" | "phone" | "password" | "confirmPassword" | "terms";
type FieldErrors = Partial<Record<Field, string>>;
const ORDER: Field[] = ["name", "email", "phone", "password", "confirmPassword", "terms"];
const RESEND_SECONDS = 60;

async function readJson(response: Response): Promise<{ error?: string; message?: string }> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function Signup() {
  const router = useRouter();
  const status = useSession()?.status;
  const { callbackUrl, resolve } = useCallbackUrl();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<{ message: string; existing?: boolean } | null>(null);
  const [pending, setPending] = useState<"code" | "verify" | "google" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeNotice, setCodeNotice] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const leaving = useRef(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const refs: Record<Field, RefObject<HTMLInputElement>> = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    confirmPassword: useRef<HTMLInputElement>(null),
    terms: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (status === "authenticated" && !leaving.current) router.replace(resolve());
  }, [status, router, resolve]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(seconds => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (formError) alertRef.current?.focus();
  }, [formError]);

  const update = (field: Exclude<Field, "terms">, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const details = () => ({ name: form.name.trim(), email: form.email.trim(), phone: form.phone || undefined });

  async function sendCode(): Promise<boolean> {
    const response = await fetch("/api/auth/send-signup-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details()),
    });
    if (response.ok) return true;
    const data = await readJson(response);
    const message = data.error || "We couldn’t send the code. Please try again.";
    if (dialogOpen) setCodeError(message);
    else setFormError({ message, existing: response.status === 409 });
    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    const nameError = validateName(form.name, "Full name");
    if (nameError) next.name = nameError;
    const emailError = validateEmail(form.email);
    if (emailError) next.email = emailError;
    const phoneError = validatePhone(form.phone);
    if (phoneError) next.phone = phoneError;
    const policy = validatePasswordPolicy(form.password);
    if (!policy.valid) next.password = policy.error;
    if (!next.password && form.password !== form.confirmPassword) next.confirmPassword = "The passwords don’t match";
    if (!terms) next.terms = "Agree to the terms to create an account";
    setErrors(next);
    setFormError(null);
    const first = ORDER.find(field => next[field]);
    if (first) {
      refs[first].current?.focus();
      return;
    }

    setPending("code");
    try {
      if (await sendCode()) {
        setCodeError(null);
        setCodeNotice(null);
        setResendIn(RESEND_SECONDS);
        setDialogOpen(true);
      }
    } catch {
      setFormError({ message: "We couldn’t reach Kosvana. Check your connection and try again." });
    } finally {
      setPending(null);
    }
  }

  async function handleVerify(code: string) {
    setPending("verify");
    setCodeError(null);
    setCodeNotice(null);
    const target = resolve();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details(), password: form.password, otp: code }),
      });
      if (!response.ok) {
        const data = await readJson(response);
        setCodeError(data.error === "Invalid OTP"
          ? "That code doesn’t match. Check the latest email from Kosvana, or resend the code."
          : data.error || "We couldn’t verify that code. Please try again.");
        setPending(null);
        return;
      }
      setCodeNotice("Account created. Signing you in…");
      leaving.current = true;
      const result = await signIn("credentials", { email: details().email, password: form.password, redirect: false, callbackUrl: target });
      if (result && result.ok && !result.error) {
        hardNavigate(target);
        return;
      }
      // The account exists; let the shopper sign in by hand and still return to the same page.
      router.push(withCallbackUrl("/auth/signin", callbackUrl));
    } catch {
      leaving.current = false;
      setCodeError("We couldn’t reach Kosvana. Check your connection and try again.");
      setPending(null);
    }
  }

  async function handleResend() {
    setCodeError(null);
    setCodeNotice(null);
    try {
      if (await sendCode()) {
        setResendIn(RESEND_SECONDS);
        setCodeNotice(`We sent a new code to ${details().email}.`);
      }
    } catch {
      setCodeError("We couldn’t send a new code. Please try again.");
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setPending("google");
    try {
      await signIn("google", { callbackUrl: resolve() });
    } catch {
      setPending(null);
      setFormError({ message: "We couldn’t open Google sign-in. Please try again." });
    }
  }

  const signinHref = withCallbackUrl("/auth/signin", callbackUrl);

  return (
    <AuthPage
      kicker="Your account"
      title={<>Create an <em>account</em></>}
      lede="Save addresses, follow your orders and keep a list of pantry favourites. We email you a 6-digit code to confirm the address."
      notes={[
        "Delivery addresses saved for next time",
        "Order history, invoices and delivery updates",
        "A wishlist of products to come back to",
      ]}
      notesLabel="With a Kosvana account"
    >
      {formError && (
        <FormAlert id="signup-alert" ref={alertRef}>
          <p>{formError.message}</p>
          {formError.existing && <p><Link href={signinHref}>Sign in with this email</Link> or <Link href={withCallbackUrl("/auth/forgot-password", callbackUrl)}>reset your password</Link>.</p>}
        </FormAlert>
      )}
      <form className={styles.form} noValidate onSubmit={handleSubmit} aria-label="Create an account with email">
        <TextField ref={refs.name} id="signup-name" name="name" label="Full name" autoComplete="name" autoCapitalize="words"
          value={form.name} onChange={event => update("name", event.target.value)} error={errors.name} />
        <TextField ref={refs.email} id="signup-email" name="email" type="email" label="Email" autoComplete="email" inputMode="email"
          autoCapitalize="none" spellCheck={false} value={form.email} onChange={event => update("email", event.target.value)} error={errors.email} />
        <TextField ref={refs.phone} id="signup-phone" name="phone" type="tel" label="Mobile number" optional autoComplete="tel-national"
          inputMode="numeric" maxLength={10} hint="10 digits, for delivery updates" value={form.phone}
          onChange={event => update("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} error={errors.phone} />
        <PasswordField ref={refs.password} id="signup-password" name="password" label="Password" autoComplete="new-password"
          hint={passwordRequirementsText} value={form.password} onChange={event => update("password", event.target.value)} error={errors.password} />
        <PasswordField ref={refs.confirmPassword} id="signup-confirm-password" name="confirmPassword" label="Confirm password" autoComplete="new-password"
          value={form.confirmPassword} onChange={event => update("confirmPassword", event.target.value)} error={errors.confirmPassword} />
        <div className={styles.field}>
          <label className={styles.check} htmlFor="signup-terms">
            <input ref={refs.terms} id="signup-terms" name="terms" type="checkbox" checked={terms}
              aria-invalid={errors.terms ? true : undefined} aria-describedby={errors.terms ? "signup-terms-error" : undefined}
              onChange={event => { setTerms(event.target.checked); if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined })); }} />
            <span>I agree to the Kosvana <Link href="/terms" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>Terms<span className={styles.srOnly}> (opens in a new tab)</span></Link> and <Link href="/privacy" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>Privacy<span className={styles.srOnly}> (opens in a new tab)</span></Link></span>
          </label>
          {errors.terms && <p id="signup-terms-error" className={styles.error}>{errors.terms}</p>}
        </div>
        <button ref={submitRef} type="submit" className={styles.submit} disabled={pending !== null}>
          {pending === "code" ? "Sending your code…" : "Create account"}
        </button>
      </form>
      <p className={styles.divider}>or</p>
      <GoogleButton onClick={handleGoogle} disabled={pending !== null} pending={pending === "google"} />
      <p className={styles.switch}>
        Already have an account?
        <Link href={signinHref} className={styles.textLink}>Sign in</Link>
      </p>
      {dialogOpen && (
        <CodeDialog
          email={details().email}
          error={codeError}
          notice={codeNotice}
          pending={pending === "verify"}
          resendIn={resendIn}
          onVerify={handleVerify}
          onResend={handleResend}
          onClose={() => { setDialogOpen(false); setCodeError(null); setCodeNotice(null); }}
          returnFocusTo={submitRef}
        />
      )}
    </AuthPage>
  );
}
