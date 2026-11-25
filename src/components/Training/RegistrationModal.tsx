"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { validateName, validateEmail, validatePhone, validateRequired, validatePincode, validateCity, validateStreet } from "@/lib/validation";
import { formatFee, indiaToday, programmeFee, type TrainingProgram } from "./programme";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/training.module.css";

interface RegistrationModalProps {
  program: TrainingProgram;
  onClose: () => void;
  user: any;
  onRegistrationComplete: (registration: any) => void;
  /** Called when the server says this account already holds a registration for the programme. */
  onAlreadyRegistered?: () => void;
}

type Field = "participantName" | "participantEmail" | "participantPhone" | "address.street" | "address.city" | "address.state" | "address.pincode";

/**
 * Collects participant details for a training programme. It opens as a modal dialog: Escape
 * closes it and focus goes back to the control that opened it. Messages stay inside the
 * dialog, because toasts render below the modal layer.
 */
const RegistrationModal: React.FC<RegistrationModalProps> = ({ program, onClose, user, onRegistrationComplete, onAlreadyRegistered }) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState({
    participantName: user?.name || "",
    participantEmail: user?.email || "",
    participantPhone: "",
    participantAddress: { street: "", city: "", state: "", pincode: "" },
    preferredStartDate: "",
    specialRequirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const loadingRef = useRef(false);
  loadingRef.current = loading;

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (element && typeof element.showModal === "function") element.showModal();
    else element?.setAttribute("open", "");
    element?.querySelector<HTMLInputElement>("input")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (element?.open && typeof element.close === "function") element.close();
      document.body.style.overflow = previous;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  const close = () => { if (!loadingRef.current) onClose(); };

  const handleChange = (field: Field | "preferredStartDate" | "specialRequirements", value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData(data => ({ ...data, participantAddress: { ...data.participantAddress, [addressField]: value } }));
    } else {
      setFormData(data => ({ ...data, [field]: value }));
    }
    if (errors[field as Field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const newErrors: Partial<Record<Field, string>> = {};
    const nameErr = validateName(formData.participantName, "Full name");
    if (nameErr) newErrors.participantName = nameErr;
    const emailErr = validateEmail(formData.participantEmail);
    if (emailErr) newErrors.participantEmail = emailErr;
    const phoneErr = validatePhone(formData.participantPhone);
    if (!formData.participantPhone.trim()) newErrors.participantPhone = "Phone number is required";
    else if (phoneErr) newErrors.participantPhone = phoneErr;
    const streetErr = validateStreet(formData.participantAddress.street);
    if (streetErr) newErrors["address.street"] = streetErr;
    const cityErr = validateCity(formData.participantAddress.city);
    if (cityErr) newErrors["address.city"] = cityErr;
    const stateErr = validateRequired(formData.participantAddress.state, "State");
    if (stateErr) newErrors["address.state"] = stateErr;
    const pincodeErr = validatePincode(formData.participantAddress.pincode);
    if (pincodeErr) newErrors["address.pincode"] = pincodeErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const first = (Object.keys(newErrors) as Field[])[0];
      dialog.current?.querySelector<HTMLElement>(`#${fieldId(first)}`)?.focus();
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await fetch("/api/training-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingProgramId: program.id, ...formData, userId: user?.id || null }),
      });
      if (response.ok) {
        // The payment dialog opens next and names the pending registration, so no toast here.
        onRegistrationComplete(await response.json());
        return;
      }
      const error = await response.json().catch(() => ({}));
      if (response.status === 409 && error.existingRegistration) {
        setFormError(`You already have registration ${error.existingRegistration.registrationNumber} for this programme.`);
        onAlreadyRegistered?.();
      } else if (response.status === 401) {
        setFormError("Your session has ended. Sign in again to register.");
      } else {
        setFormError(error.error || "We couldn’t save your registration. Please try again.");
      }
    } catch {
      setFormError("We couldn’t reach Kosvana. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fee = programmeFee(program);
  const today = indiaToday();

  const input = (field: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, value: string, filter?: (raw: string) => string) => (
    <div className={styles.formField}>
      <label htmlFor={fieldId(field)}>{label}</label>
      <input
        id={fieldId(field)}
        value={value}
        onChange={(event) => handleChange(field, filter ? filter(event.target.value) : event.target.value)}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined}
        aria-required="true"
        {...props}
      />
      {errors[field] && <p id={`${fieldId(field)}-error`} className={styles.fieldError}>{errors[field]}</p>}
    </div>
  );

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="registration-title"
      onCancel={(event) => { event.preventDefault(); close(); }}
      // Chrome can close a dialog without a cancelable cancel event (repeated Escape). Keep state in step,
      // but ignore the queued close from Strict Mode's effect re-run, which has already reopened the dialog.
      onClose={() => { if (!dialog.current?.open) onClose(); }}
    >
      <form onSubmit={handleSubmit} noValidate className={styles.dialogBody}>
        <p className={pantry.kicker}>Register</p>
        <h2 id="registration-title">Register for {program.name}</h2>
        <button type="button" className={pantry.close} onClick={close} aria-label="Close registration"><X aria-hidden="true" /></button>
        <p className={styles.dialogSummary}>
          <span>{formatFee(fee.amount)} per participant</span>
          <span>{program.duration} {program.duration === 1 ? "day" : "days"}</span>
        </p>

        <fieldset>
          <legend>Participant</legend>
          <div className={styles.formGrid}>
            {input("participantName", "Full name", { type: "text", autoComplete: "name" }, formData.participantName)}
            {input("participantEmail", "Email address", { type: "email", autoComplete: "email" }, formData.participantEmail)}
            {input("participantPhone", "Mobile number", { type: "tel", inputMode: "numeric", autoComplete: "tel-national", maxLength: 10, placeholder: "10-digit mobile number" },
              formData.participantPhone, raw => raw.replace(/\D/g, "").slice(0, 10))}
            <div className={styles.formField}>
              <label htmlFor="registration-start">Preferred start date <span>(optional)</span></label>
              <input id="registration-start" type="date" min={today} value={formData.preferredStartDate}
                onChange={(event) => handleChange("preferredStartDate", event.target.value)} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Address</legend>
          <div className={styles.formGrid}>
            <div className={styles.wide}>
              {input("address.street", "Street address", { type: "text", autoComplete: "address-line1", placeholder: "Street Address" }, formData.participantAddress.street)}
            </div>
            {input("address.city", "City", { type: "text", autoComplete: "address-level2", placeholder: "City" }, formData.participantAddress.city)}
            {input("address.state", "State", { type: "text", autoComplete: "address-level1", placeholder: "State" }, formData.participantAddress.state)}
            {input("address.pincode", "PIN code", { type: "text", inputMode: "numeric", autoComplete: "postal-code", maxLength: 6, placeholder: "PIN Code" },
              formData.participantAddress.pincode, raw => raw.replace(/\D/g, "").slice(0, 6))}
          </div>
        </fieldset>

        <div className={styles.formField}>
          <label htmlFor="registration-notes">Questions or needs <span>(optional)</span></label>
          <textarea id="registration-notes" rows={3} value={formData.specialRequirements}
            onChange={(event) => handleChange("specialRequirements", event.target.value)}
            placeholder="Any dietary restrictions, accessibility needs, or questions..." />
        </div>

        <p className={styles.dialogNote}>Next, you pay {formatFee(fee.amount)} by UPI. Your registration stays pending until we verify the payment.</p>
        <p role="alert" className={styles.formError}>{formError}</p>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondaryAction} onClick={close}>Cancel</button>
          <button type="submit" className={styles.submitAction} disabled={loading}>
            {loading ? "Registering…" : "Continue to Payment"}
          </button>
        </div>
      </form>
    </dialog>
  );
};

function fieldId(field: Field) {
  return `registration-${field.replace(".", "-")}`;
}

export default RegistrationModal;
