"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";
import { validateCity, validatePincode, validateStreet } from "@/lib/validation";
import styles from "../Pantry/pantry.module.css";
import a from "../Pantry/account.module.css";

export type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: string;
  isDefault: boolean;
};

type Fields = Pick<Address, "street" | "city" | "state" | "zip" | "isDefault">;
type Errors = Partial<Record<"street" | "city" | "state" | "zip", string>>;

type Props = {
  /** The address to edit, or null to add a new one. */
  address: Address | null;
  /** The first saved address becomes the default. */
  first: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export default function AddressDialog({ address, first, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [fields, setFields] = useState<Fields>({
    street: address?.street ?? "", city: address?.city ?? "", state: address?.state ?? "", zip: address?.zip ?? "",
    isDefault: address?.isDefault ?? first,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal?.();
    element?.querySelector<HTMLInputElement>("input")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close?.();
      document.body.style.overflow = previous;
      // Return focus to the Edit or Add button that opened the dialog.
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  const set = (name: keyof Fields) => (value: string | boolean) => {
    setFields(previous => ({ ...previous, [name]: value }));
    if (name in errors) setErrors(previous => ({ ...previous, [name]: undefined }));
  };

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors = {};
    const street = validateStreet(fields.street); if (street) found.street = street;
    const city = validateCity(fields.city); if (city) found.city = city;
    if (!fields.state) found.state = "Choose a state";
    const zip = validatePincode(fields.zip); if (zip) found.zip = zip;
    if (Object.keys(found).length) {
      setErrors(found);
      dialog.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    setSaving(true);
    setFailure("");
    try {
      const response = await fetch(address ? `/api/addresses/${address.id}` : "/api/addresses", {
        method: address ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, street: fields.street.trim(), city: fields.city.trim(), country: "India", type: address?.type ?? "BOTH" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setFailure(data.error || "We couldn’t save this address. Please try again."); return; }
      onSaved(address ? "Address updated." : "Address added.");
    } catch {
      setFailure("We couldn’t save this address. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const field = (name: keyof Errors, label: string, input: ReactNode, hint?: string) => <div className={a.field}>
    <label htmlFor={`address-${name}`}>{label}</label>
    {input}
    {hint && !errors[name] && <p className={a.hint} id={`address-${name}-hint`}>{hint}</p>}
    {errors[name] && <p className={a.error} id={`address-${name}-error`}>{errors[name]}</p>}
  </div>;
  const describe = (name: keyof Errors, hint?: boolean) => errors[name] ? `address-${name}-error` : hint ? `address-${name}-hint` : undefined;

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="address-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className={a.sheet}>
      <h2 id="address-dialog-title">{address ? "Edit address" : "Add an address"}</h2>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close"><X /></button>
      <form className={a.form} onSubmit={save} noValidate>
        {field("street", "House, building and street", <input id="address-street" name="street" className={a.input} autoComplete="street-address"
          value={fields.street} onChange={e => set("street")(e.target.value)} aria-invalid={!!errors.street} aria-describedby={describe("street")} />)}
        <div className={a.pair}>
          {field("city", "City", <input id="address-city" name="city" className={a.input} autoComplete="address-level2"
            value={fields.city} onChange={e => set("city")(e.target.value)} aria-invalid={!!errors.city} aria-describedby={describe("city")} />)}
          {field("state", "State", <select id="address-state" name="state" className={a.input} autoComplete="address-level1"
            value={fields.state} onChange={e => set("state")(e.target.value)} aria-invalid={!!errors.state} aria-describedby={describe("state")}>
            <option value="">Choose a state</option>
            {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
          </select>)}
        </div>
        <div className={a.pair}>
          {field("zip", "PIN code", <input id="address-zip" name="zip" className={a.input} inputMode="numeric" autoComplete="postal-code" maxLength={6}
            value={fields.zip} onChange={e => set("zip")(e.target.value.replace(/\D/g, ""))} aria-invalid={!!errors.zip} aria-describedby={describe("zip", true)} />,
            "Fresh mushrooms deliver only in Dehradun.")}
          <div className={a.field}>
            <label htmlFor="address-country">Country</label>
            <input id="address-country" className={a.input} value="India" readOnly />
          </div>
        </div>
        <label className={a.check}>
          <input type="checkbox" checked={fields.isDefault} onChange={e => set("isDefault")(e.target.checked)} />
          Use as my default address
        </label>
        {failure && <p className={a.error} role="alert">{failure}</p>}
        <div className={a.formActions}>
          <button type="submit" className={styles.primaryAction} disabled={saving}>{saving ? "Saving…" : "Save address"}</button>
          <button type="button" className={styles.textAction} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  </dialog>;
}
