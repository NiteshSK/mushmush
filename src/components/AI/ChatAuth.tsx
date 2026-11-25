"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import s from "../Pantry/chat.module.css";

interface ChatAuthProps {
  onBack: () => void;
  onAuthSuccess: () => void;
}

type AuthMode = "signin" | "signup" | "signup-otp";

const ChatAuth: React.FC<ChatAuthProps> = ({ onBack, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const clearErrors = () => setErrors({});

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } catch {
      toast.error("Google sign in failed");
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    clearErrors();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Signed in successfully!");
        onAuthSuccess();
      } else {
        setErrors({ form: "Invalid email or password" });
      }
    } catch {
      setErrors({ form: "Sign in failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Valid email required";
    if (!password || password.length < 8) newErrors.password = "Min 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    clearErrors();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone: phone || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setMode("signup-otp");
        setResendTimer(60);
      } else {
        setErrors({ form: data.error || "Failed to send OTP" });
      }
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }

    clearErrors();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, password, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        // Auto sign in after registration
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (signInResult?.ok) {
          toast.success("Account created & signed in!");
          onAuthSuccess();
        } else {
          toast.success("Account created! Please sign in.");
          setMode("signin");
        }
      } else {
        setErrors({ otp: data.error || "Verification failed" });
      }
    } catch {
      setErrors({ otp: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone: phone || undefined }),
      });
      if (res.ok) {
        setResendTimer(60);
        setOtp("");
        setErrors({});
        toast.success("OTP resent!");
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const field = (key: string) => ({
    className: s.textInput,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `chat-auth-${key}-error` : undefined,
  });
  const fieldError = (key: string) =>
    errors[key] ? <p id={`chat-auth-${key}-error`} className={s.fieldError}>{errors[key]}</p> : null;

  const googleButton = (
    <button type="button" onClick={handleGoogleSignIn} disabled={loading} className={s.secondary}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z" fill="#4285F4" />
                <path d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z" fill="#34A853" />
                <path d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z" fill="#FBBC05" />
                <path d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z" fill="#EB4335" />
              </svg>
      Continue with Google
    </button>
  );

  const passwordToggle = (
    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
      {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
    </button>
  );

  return (
    <div className={s.step}>
      {/* Header */}
      <div className={s.stepHead}>
        <button type="button" onClick={onBack} className={s.iconButton} aria-label="Back">
          <ArrowLeft aria-hidden="true" />
        </button>
        <h3>{mode === "signin" ? "Sign In to Continue" : mode === "signup" ? "Create Account" : "Verify Email"}</h3>
      </div>

      <div className={s.stepBody}>
        {/* Info banner */}
        <p className={s.notice}>
          {mode === "signup-otp"
            ? "We sent a verification code to your email."
            : "Sign in or create an account to complete your purchase."}
        </p>

        {errors.form && <p className={s.error} role="alert">{errors.form}</p>}

        {/* ─── Sign In ─── */}
        {mode === "signin" && (
          <>
            {googleButton}
            <p className={s.divider}>or</p>

            {/* Email form */}
            <form onSubmit={handleSignIn} className={s.form}>
              <div>
                <label htmlFor="chat-auth-email" className={s.label}>Email</label>
                <input id="chat-auth-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({}); }} placeholder="you@example.com" autoComplete="email" {...field("email")} />
                {fieldError("email")}
              </div>
              <div>
                <label htmlFor="chat-auth-password" className={s.label}>Password</label>
                <div className={s.passwordField}>
                  <input id="chat-auth-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors({}); }} placeholder="Enter your password" autoComplete="current-password" {...field("password")} />
                  {passwordToggle}
                </div>
                {fieldError("password")}
              </div>
              <button type="submit" disabled={loading} className={s.primary}>
                {loading ? <><Loader2 aria-hidden="true" className={s.spin} /> Signing in…</> : "Sign In"}
              </button>
            </form>

            <p className={s.center}>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => { setMode("signup"); clearErrors(); }} className={s.textAction}>
                Sign Up
              </button>
            </p>
          </>
        )}

        {/* ─── Sign Up ─── */}
        {mode === "signup" && (
          <>
            {googleButton}
            <p className={s.divider}>or</p>

            <form onSubmit={handleSignUp} className={s.form}>
              <div>
                <label htmlFor="chat-auth-name" className={s.label}>Full name</label>
                <input id="chat-auth-name" type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors({}); }} placeholder="John Doe" autoComplete="name" {...field("name")} />
                {fieldError("name")}
              </div>
              <div>
                <label htmlFor="chat-auth-email" className={s.label}>Email</label>
                <input id="chat-auth-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({}); }} placeholder="you@example.com" autoComplete="email" {...field("email")} />
                {fieldError("email")}
              </div>
              <div>
                <label htmlFor="chat-auth-phone" className={s.label}>
                  Phone <span className={s.optional}>(optional)</span>
                </label>
                <input
                  id="chat-auth-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={s.textInput}
                  placeholder="9876543210"
                  maxLength={10}
                  inputMode="tel"
                  autoComplete="tel-national"
                />
              </div>
              <div>
                <label htmlFor="chat-auth-new-password" className={s.label}>Password</label>
                <div className={s.passwordField}>
                  <input id="chat-auth-new-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors({}); }} placeholder="Min 8 characters" autoComplete="new-password" {...field("password")} />
                  {passwordToggle}
                </div>
                {fieldError("password")}
              </div>
              <div>
                <label htmlFor="chat-auth-confirm" className={s.label}>Confirm password</label>
                <input id="chat-auth-confirm" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }} placeholder="Confirm your password" autoComplete="new-password" {...field("confirmPassword")} />
                {fieldError("confirmPassword")}
              </div>
              <button type="submit" disabled={loading} className={s.primary}>
                {loading ? <><Loader2 aria-hidden="true" className={s.spin} /> Creating account…</> : "Create Account"}
              </button>
            </form>

            <p className={s.center}>
              Already have an account?{" "}
              <button type="button" onClick={() => { setMode("signin"); clearErrors(); }} className={s.textAction}>
                Sign In
              </button>
            </p>
          </>
        )}

        {/* ─── OTP Verification ─── */}
        {mode === "signup-otp" && (
          <form onSubmit={handleVerifyOTP} className={s.form}>
            <p className={s.notice}>
              OTP sent to <strong>{email}</strong>
            </p>

            <div>
              <label htmlFor="chat-auth-otp" className={s.label}>Verification code</label>
              <input
                id="chat-auth-otp"
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setErrors({}); }}
                {...field("otp")}
                className={`${s.textInput} ${s.otp}`}
                placeholder="• • • • • •"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
              />
              {fieldError("otp")}
            </div>

            <div className={s.split}>
              <button type="button" onClick={() => { setMode("signup"); setOtp(""); clearErrors(); }} className={s.textAction}>
                Back
              </button>
              <button type="button" onClick={handleResendOTP} disabled={resendTimer > 0 || loading} className={s.textAction}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className={s.primary}>
              {loading ? <><Loader2 aria-hidden="true" className={s.spin} /> Verifying…</> : "Verify & Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatAuth;
