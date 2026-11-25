"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "../Pantry/auth.module.css";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
  id: string;
  label: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  /** A control beside the label, such as "Forgot password?". */
  labelAside?: ReactNode;
  /** Extra ids for aria-describedby, such as a form alert. */
  describedBy?: string;
  optional?: boolean;
  inputClassName?: string;
};

const join = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ") || undefined;

function Label({ id, label, optional, labelAside }: Pick<FieldProps, "id" | "label" | "optional" | "labelAside">) {
  const text = (
    <label htmlFor={id} className={styles.label}>
      {label}
      {optional && <span className={styles.optional}> (optional)</span>}
    </label>
  );
  return labelAside ? <div className={styles.labelRow}>{text}{labelAside}</div> : text;
}

function Messages({ id, error, hint }: Pick<FieldProps, "id" | "error" | "hint">) {
  return (
    <>
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
    </>
  );
}

/** A labelled input with its error and hint linked through aria-describedby. */
export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { id, label, error, hint, labelAside, describedBy, optional, inputClassName, ...input },
  ref,
) {
  return (
    <div className={styles.field}>
      <Label id={id} label={label} optional={optional} labelAside={labelAside} />
      <input
        ref={ref}
        id={id}
        className={join(styles.input, inputClassName)}
        aria-invalid={error ? true : undefined}
        aria-describedby={join(error && `${id}-error`, hint && `${id}-hint`, describedBy)}
        {...input}
      />
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
});

/** A password input with a real Show/Hide button. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, "type">>(function PasswordField(
  { id, label, error, hint, labelAside, describedBy, optional, inputClassName, ...input },
  ref,
) {
  const [shown, setShown] = useState(false);
  return (
    <div className={styles.field}>
      <Label id={id} label={label} optional={optional} labelAside={labelAside} />
      <div className={styles.secret}>
        <input
          ref={ref}
          id={id}
          type={shown ? "text" : "password"}
          className={join(styles.input, inputClassName)}
          aria-invalid={error ? true : undefined}
          aria-describedby={join(error && `${id}-error`, hint && `${id}-hint`, describedBy)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...input}
        />
        <button type="button" className={styles.reveal} aria-controls={id} onClick={() => setShown(value => !value)}>
          {shown ? "Hide" : "Show"}<span className={styles.srOnly}> password</span>
        </button>
      </div>
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
});

/** A form-level message that screen readers announce as soon as it appears. */
export const FormAlert = forwardRef<HTMLDivElement, { id?: string; children: ReactNode }>(function FormAlert({ id, children }, ref) {
  return <div ref={ref} id={id} role="alert" tabIndex={-1} className={styles.alert}>{children}</div>;
});

/** A form-level confirmation that screen readers announce politely. */
export const FormStatus = forwardRef<HTMLDivElement, { id?: string; children: ReactNode }>(function FormStatus({ id, children }, ref) {
  return <div ref={ref} id={id} role="status" tabIndex={-1} className={styles.status}>{children}</div>;
});

export function GoogleButton({ onClick, disabled, pending }: { onClick: () => void; disabled?: boolean; pending?: boolean }) {
  return (
    <button type="button" className={styles.google} onClick={onClick} disabled={disabled}>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z" fill="#4285F4" />
        <path d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z" fill="#34A853" />
        <path d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z" fill="#FBBC05" />
        <path d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z" fill="#EB4335" />
      </svg>
      {pending ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}
