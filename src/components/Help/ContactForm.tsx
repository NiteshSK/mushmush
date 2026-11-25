"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { validateEmail, validateMaxLength, validateName, validatePhone, validateRequired } from "@/lib/validation";
import { MessageSent } from "../MailSuccess";
import { CONTACT, type ContactDetails } from "./ContactOptions";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

type Field = "name" | "email" | "phone" | "subject" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { name: "", email: "", phone: "", subject: "", message: "" };
const ORDER: Field[] = ["name", "email", "phone", "subject", "message"];
export const MESSAGE_LIMIT = 1000;

/** /api/contact needs name, email, subject and message. Phone is optional, but must be valid when given. */
export function validateContact(values: Values): Errors {
  const errors: Errors = {};
  const check = (field: Field, error: string | null) => { if (error) errors[field] = error; };
  check("name", validateName(values.name));
  check("email", validateEmail(values.email));
  if (values.phone.trim()) check("phone", validatePhone(values.phone));
  check("subject", validateRequired(values.subject, "Subject"));
  check("message", validateRequired(values.message, "Message") ?? validateMaxLength(values.message, MESSAGE_LIMIT, "Message"));
  return errors;
}

export default function ContactForm({contact=CONTACT}:{contact?:ContactDetails}) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const startAgain = useRef(false);

  // Links such as /contact?subject=Next%20batch%3A%20… pre-fill the subject. Read the URL after mount:
  // useSearchParams would need a Suspense boundary in the page, and the server render has no query.
  useEffect(() => {
    let subject = "";
    try { subject = new URLSearchParams(window.location.search).get("subject")?.trim().slice(0, 200) ?? ""; } catch { /* keep empty */ }
    if (subject) setValues(current => current.subject ? current : { ...current, subject });
  }, []);

  // After "Send another message", put the shopper back in the first field.
  useEffect(() => {
    if (!sent && startAgain.current) {
      startAgain.current = false;
      form.current?.querySelector<HTMLElement>('[name="name"]')?.focus();
    }
  }, [sent]);

  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as Field;
    setValues(current => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors(current => ({ ...current, [field]: undefined }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    setFailure(null);
    const first = ORDER.find(field => found[field]);
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSending(true);
    let problem = "We couldn’t send your message.";
    try {
      const body = { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), subject: values.subject.trim(), message: values.message.trim() };
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (typeof data?.error === "string") problem = data.error;
        throw new Error(problem);
      }
      setSent({ name: body.name, email: body.email });
      setValues(EMPTY);
    } catch {
      setFailure(problem);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className={h.sentPanel} role="status">
        <MessageSent level={2} name={sent.name} email={sent.email} onSendAnother={() => { startAgain.current = true; setSent(null); }} />
      </div>
    );
  }

  const field = (name: Field, label: string, input: JSX.Element, hint?: string) => (
    <div className={h.formField}>
      <label htmlFor={`contact-${name}`}>{label}</label>
      {input}
      {hint && !errors[name] && <p id={`contact-${name}-hint`} className={h.hint}>{hint}</p>}
      {errors[name] && <p id={`contact-${name}-error`} className={h.fieldError}>{errors[name]}</p>}
    </div>
  );
  const props = (name: Field, hint?: boolean) => ({
    id: `contact-${name}`, name, value: values[name], onChange: change, required: name !== "phone",
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : hint ? `contact-${name}-hint` : undefined,
  });

  return (
    <form ref={form} className={h.form} onSubmit={submit} noValidate aria-labelledby="contact-form-title">
      <p className={h.formIntro}>All fields are required except phone.</p>
      <div className={h.formRow}>
        {field("name", "Name", <input {...props("name")} type="text" autoComplete="name" maxLength={100} />)}
        {field("email", "Email", <input {...props("email")} type="email" autoComplete="email" inputMode="email" maxLength={254} />)}
      </div>
      <div className={h.formRow}>
        {field("phone", "Phone (optional)", <input {...props("phone", true)} type="tel" autoComplete="tel" inputMode="tel" maxLength={15} />, "Indian mobile number")}
        {field("subject", "Subject", <input {...props("subject", true)} type="text" maxLength={200} />, "Order, product, delivery or training")}
      </div>
      {field("message", "Message", <textarea {...props("message", true)} rows={6} maxLength={MESSAGE_LIMIT} />, `Up to ${MESSAGE_LIMIT.toLocaleString("en-IN")} characters. Include your order number if you have one.`)}
      {failure && (
        <div className={h.alert} role="alert">
          <strong>{failure.replace(/\.?$/, ".")}</strong> Your message is still here, so you can try again. You can also email{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a> or <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">message us on WhatsApp<span className={p.srOnly}> (opens in a new tab)</span></a>.
        </div>
      )}
      <div className={h.formEnd}>
        <button type="submit" className={`${p.primaryAction} ${h.submit}`} disabled={sending} aria-busy={sending || undefined}>
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
