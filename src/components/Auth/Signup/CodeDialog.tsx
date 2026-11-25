"use client";

import { type FormEvent, type RefObject, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FormAlert, FormStatus, TextField } from "../fields";
import pantry from "../../Pantry/pantry.module.css";
import styles from "../../Pantry/auth.module.css";

type Props = {
  email: string;
  error: string | null;
  notice: string | null;
  pending: boolean;
  resendIn: number;
  onVerify: (code: string) => void;
  onResend: () => void;
  onClose: () => void;
  /** Gets focus back when the dialog closes (the trigger is disabled while the code is sent). */
  returnFocusTo: RefObject<HTMLElement>;
};

/** Asks for the 6-digit email code. The paper panel stays opaque; only the backdrop is glass. */
export default function CodeDialog({ email, error, notice, pending, resendIn, onVerify, onResend, onClose, returnFocusTo }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    const element = dialog.current;
    const trigger = returnFocusTo.current;
    if (element && typeof element.showModal === "function" && !element.open) element.showModal();
    input.current?.focus();
    return () => {
      if (element?.open && typeof element.close === "function") element.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [returnFocusTo]);

  // A rejected code is cleared and focused, ready for the next try.
  useEffect(() => {
    if (!error) return;
    setCode("");
    input.current?.focus();
  }, [error]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setFieldError("Enter the 6-digit code from the email");
      input.current?.focus();
      return;
    }
    setFieldError(null);
    onVerify(code);
  }

  return (
    <dialog ref={dialog} className={pantry.dialog} aria-labelledby="code-title" aria-describedby="code-lede"
      onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
      <div className={pantry.panel}>
        <h2 id="code-title">Check your email</h2>
        <button type="button" className={pantry.close} onClick={onClose} disabled={pending} aria-label="Close dialog"><X /></button>
        <p id="code-lede" className={styles.dialogLede}>We sent a 6-digit code to <strong>{email}</strong>. It expires in 5 minutes.</p>
        <div className={styles.form}>
          {error && <FormAlert id="code-alert">{error}</FormAlert>}
          {notice && !error && <FormStatus>{notice}</FormStatus>}
          <form className={styles.form} noValidate onSubmit={submit}>
            <TextField
              ref={input}
              id="signup-code"
              name="code"
              label="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              inputClassName={styles.code}
              value={code}
              onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setFieldError(null); }}
              error={fieldError}
              describedBy={error ? "code-alert" : undefined}
            />
            <button type="submit" className={styles.submit} disabled={pending}>
              {pending ? "Creating your account…" : "Verify and create account"}
            </button>
          </form>
        </div>
        <div className={styles.dialogRow}>
          <button type="button" onClick={onClose} disabled={pending}>Change details</button>
          <button type="button" onClick={onResend} disabled={pending || resendIn > 0}>
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
