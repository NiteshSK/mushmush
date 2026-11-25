"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

type Props = {
  /** 1 on /mail-success. 2 inside the contact page, where the heading takes focus. */
  level?: 1 | 2;
  name?: string;
  email?: string;
  /** Shows "Send another message" as a button that resets the contact form. */
  onSendAnother?: () => void;
};

/** Confirms that a contact message was sent and offers the next useful step. */
export function MessageSent({ level = 1, name, email, onSendAnother }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (level === 2) heading.current?.focus(); }, [level]);
  const Heading = level === 1 ? "h1" : "h2";
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <div className={h.notice}>
      <p className={p.kicker}>Message sent</p>
      <Heading ref={heading} tabIndex={level === 2 ? -1 : undefined}>Your message is <em>on its way.</em></Heading>
      <p>
        {firstName ? `Thank you, ${firstName}. ` : "Thank you for writing to Kosvana. "}
        {email ? <>We will reply to <strong>{email}</strong>.</> : "We will reply to the email address in your message."}
      </p>
      <div className={h.headActions}>
        <Link href="/shop" className={p.primaryAction}>Shop the pantry</Link>
        <Link href="/faqs#delivery" className={p.textAction}>Delivery questions</Link>
        {onSendAnother
          ? <button type="button" className={p.textAction} onClick={onSendAnother}>Send another message</button>
          : <Link href="/contact" className={p.textAction}>Send another message</Link>}
      </div>
    </div>
  );
}

export default function MailSuccess() {
  return (
    <main id="main" className={`${p.page} ${h.help} ${h.fill}`}>
      <MessageSent />
    </main>
  );
}
