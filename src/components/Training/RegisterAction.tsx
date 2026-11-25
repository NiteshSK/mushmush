"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import UPIPaymentModal from "@/components/Payment/UPIPaymentModal";
import RegistrationModal from "./RegistrationModal";
import { formatFee, programmeFee, type TrainingProgram } from "./programme";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/training.module.css";

export const PAYMENT_PENDING_MESSAGE = "Payment details received. Your registration stays pending until we verify the payment.";

type RegistrationStatus = "PENDING" | "PAYMENT_RECEIVED" | "CONFIRMED" | "IN_PROGRESS" | string;

type Registration = {
  id: string;
  number: string;
  status: RegistrationStatus;
  /** "none": no payment yet (or the last one failed), so the shopper can pay now. */
  payment: "none" | "submitted" | "unknown";
  amount?: number;
  participantName?: string;
};

type Props = {
  program: TrainingProgram;
  /** Where sign-in sends the shopper back to. */
  returnTo: string;
  /** Shown under the action. */
  note?: string;
  /**
   * False when the programme has no schedule date today or later. The owner takes no registrations
   * or payments then: the shopper asks about the next batch instead.
   */
  open?: boolean;
};

function describe(registration: Registration) {
  switch (registration.status) {
    case "CONFIRMED": return "Your registration is confirmed.";
    case "IN_PROGRESS": return "Your training is in progress.";
    case "PAYMENT_RECEIVED": return PAYMENT_PENDING_MESSAGE;
    case "PENDING":
      if (registration.payment === "submitted") return PAYMENT_PENDING_MESSAGE;
      if (registration.payment === "none") return "Your registration is pending. Pay the fee to continue.";
      return "Your registration is pending.";
    default: return "You have a registration for this programme.";
  }
}

/**
 * The registration action for one programme. Signed-out shoppers go to sign-in and come back
 * here. Signed-in shoppers see an existing registration instead of a second Register button.
 * A registration stays pending until an admin verifies the UPI payment.
 */
export default function RegisterAction({ program, returnTo, note, open = true }: Props) {
  const { data: session, status } = useSession();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [registering, setRegistering] = useState(false);
  const [paying, setPaying] = useState(false);
  const [focusStatus, setFocusStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const payRef = useRef<HTMLButtonElement>(null);
  const fee = programmeFee(program);
  const signedIn = status === "authenticated" && !!session;

  const check = async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/training-registrations/check?programId=${program.id}`, { signal });
      if (!response.ok) return;
      const data = await response.json();
      if (!data?.isRegistered || !data.registration) { setRegistration(null); return; }
      const found = data.registration;
      const next: Registration = { id: found.id, number: found.registrationNumber, status: found.status, payment: "unknown", participantName: session?.user?.name ?? undefined };
      if (found.status === "PENDING" && found.id) {
        const paymentResponse = await fetch(`/api/training-payments?registrationId=${encodeURIComponent(found.id)}`, { signal });
        if (paymentResponse.ok) {
          const details = await paymentResponse.json();
          const latest = details?.upi_payments?.[0];
          next.amount = typeof details?.totalAmount === "number" ? details.totalAmount : undefined;
          next.payment = !latest || latest.status === "FAILED" ? "none" : "submitted";
        }
      }
      if (!signal?.aborted) setRegistration(next);
    } catch {
      // The server still refuses a duplicate registration, so Register stays usable.
    }
  };

  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    check(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, program.id]);

  useEffect(() => {
    if (!focusStatus) return;
    (payRef.current ?? statusRef.current)?.focus();
    setFocusStatus(false);
  }, [focusStatus]);

  const noteId = `register-note-${program.id}`;
  const noteText = [signedIn ? "" : "Sign in to register.", "You pay by UPI after you register.", note].filter(Boolean).join(" ");
  const askHref = `/contact?subject=${encodeURIComponent(`Next batch: ${program.name}`)}`;
  const canPay = open && registration?.status === "PENDING" && registration.payment === "none" && typeof registration.amount === "number";

  return (
    <div className={styles.register}>
      {registration ? (
        <div ref={statusRef} tabIndex={-1} role="status" className={styles.registered}>
          <p className={styles.registeredTitle}>{describe(registration)}</p>
          <p className={styles.registeredMeta}>Registration {registration.number}</p>
          {canPay && (
            <button ref={payRef} type="button" className={pantry.primaryAction} onClick={() => setPaying(true)}>
              Pay {formatFee(registration.amount!)} by UPI
            </button>
          )}
        </div>
      ) : !open ? (
        <a className={pantry.primaryAction} href={askHref}>Ask about the next batch</a>
      ) : signedIn ? (
        <button type="button" className={pantry.primaryAction} onClick={() => setRegistering(true)} aria-describedby={noteId}>
          Register
        </button>
      ) : status === "loading" ? (
        <button type="button" className={pantry.primaryAction} disabled aria-describedby={noteId}>Register</button>
      ) : (
        <a className={pantry.primaryAction} href={`/auth/signin?callbackUrl=${encodeURIComponent(returnTo)}`} aria-describedby={noteId}>
          Register
        </a>
      )}
      {!registration && open && <p id={noteId} className={styles.registerNote}>{noteText}</p>}

      {registering && (
        <RegistrationModal
          program={program}
          user={session?.user}
          onClose={() => { setRegistering(false); setFocusStatus(true); }}
          onAlreadyRegistered={() => check()}
          onRegistrationComplete={(created) => {
            setRegistration({
              id: created.id,
              number: created.registrationNumber,
              status: created.status ?? "PENDING",
              payment: "none",
              amount: typeof created.totalAmount === "number" ? created.totalAmount : fee.amount,
              participantName: created.participantName,
            });
            setRegistering(false);
            setPaying(true);
          }}
        />
      )}

      {paying && canPay && (
        <UPIPaymentModal
          payment={{
            type: "training",
            registrationId: registration.id,
            registrationNumber: registration.number,
            participantName: registration.participantName ?? session?.user?.name ?? "",
            programName: program.name,
            amount: registration.amount!,
          }}
          // Back to "Pay" if the shopper closes without paying, else to the pending status.
          returnFocus={() => payRef.current ?? statusRef.current}
          onClose={() => setPaying(false)}
          // The shared modal already toasts the server's "pending until verified" message. The status
          // block above shows PAYMENT_PENDING_MESSAGE and takes focus, so a second toast would only stack.
          onPaymentComplete={() => setRegistration(current => current && { ...current, payment: "submitted" })}
        />
      )}
    </div>
  );
}
