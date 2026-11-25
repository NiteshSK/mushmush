"use client";
import React, { useState, useEffect, type Ref } from "react";
import { INDIAN_STATES, MAX_ADDRESSES_PER_USER } from "@/lib/constants";
import { toast } from "react-hot-toast";
import p from "../Pantry/pantry.module.css";
import r from "../Pantry/review.module.css";

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: string;
  isDefault: boolean;
}

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressSectionProps {
  /** Pre-fetched saved addresses (empty for guests) */
  addresses: Address[];
  /** Currently selected saved address ID */
  selectedId: string | null;
  /** The selected address, including one entered for this order only (id "temp-…"). */
  selected?: Address | null;
  /** Called when user selects a saved address or null (new address mode) */
  onSelect: (address: Address | null) => void;
  /** Called when pincode changes (for delivery check) */
  onPincodeChange: (pincode: string) => void;
  /** Whether this is a guest checkout */
  isGuest: boolean;
  /** Label: "Delivery address" or "Billing address" */
  label?: string;
  /** Step number shown before the heading. */
  step?: number;
  /** Lets checkout move focus to this section, e.g. "Change the delivery address". */
  headingRef?: Ref<HTMLHeadingElement>;
  /** Render inside another section (billing) without its own rule and step. */
  nested?: boolean;
  /** Saved addresses are still loading. */
  loading?: boolean;
  /** Called when addresses list changes (after saving new) */
  onAddressesChange?: (addresses: Address[]) => void;
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z]+/g, "-");

const AddressForm = ({
  idPrefix,
  initial,
  onSubmit,
  onCancel,
  onPincodeChange,
  showCancel,
  submitLabel,
}: {
  idPrefix: string;
  initial?: AddressFormData;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  onPincodeChange: (pin: string) => void;
  showCancel: boolean;
  submitLabel: string;
}) => {
  const [form, setForm] = useState<AddressFormData>(initial ?? { street: "", city: "", state: "", zip: "" });
  const [error, setError] = useState("");

  const update = (field: keyof AddressFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    if (field === "zip") {
      const clean = value.replace(/\D/g, "").slice(0, 6);
      if (clean.length === 6) onPincodeChange(clean);
    }
  };

  const handleSubmit = () => {
    if (!form.street || !form.city || !form.state || !form.zip) {
      setError("Please fill all address fields");
      toast.error("Please fill all address fields");
      return;
    }
    if (!/^\d{6}$/.test(form.zip)) {
      setError("Please enter a valid 6-digit PIN code");
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }
    onSubmit(form);
  };

  const id = (field: string) => `${idPrefix}-${field}`;
  return (
    <div className={r.fields}>
      <div className={`${r.input} ${r.full}`}>
        <label htmlFor={id("street")}>House number and street</label>
        <input id={id("street")} type="text" autoComplete="address-line1" value={form.street} onChange={(e) => update("street", e.target.value)} />
      </div>
      <div className={r.input}>
        <label htmlFor={id("city")}>City or town</label>
        <input id={id("city")} type="text" autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} />
      </div>
      <div className={r.input}>
        <label htmlFor={id("state")}>State</label>
        <select id={id("state")} autoComplete="address-level1" value={form.state} onChange={(e) => update("state", e.target.value)}>
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className={r.input}>
        <label htmlFor={id("zip")}>PIN code</label>
        <input id={id("zip")} type="text" inputMode="numeric" autoComplete="postal-code" placeholder="6-digit PIN" maxLength={6}
          value={form.zip} onChange={(e) => update("zip", e.target.value.replace(/\D/g, "").slice(0, 6))} />
      </div>
      {error && <p role="alert" className={`${r.error} ${r.full}`}>{error}</p>}
      <div className={`${r.formActions} ${r.full}`}>
        <button type="button" onClick={handleSubmit} className={r.secondaryAction}>{submitLabel}</button>
        {showCancel && onCancel && (
          <button type="button" onClick={onCancel} className={p.textAction}>Cancel</button>
        )}
      </div>
    </div>
  );
};

const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  selectedId,
  selected,
  onSelect,
  onPincodeChange,
  isGuest,
  label = "Delivery address",
  step,
  headingRef,
  nested,
  loading,
  onAddressesChange,
}) => {
  const [showNewForm, setShowNewForm] = useState(isGuest || addresses.length === 0);
  const [savingAddress, setSavingAddress] = useState(false);
  const [editing, setEditing] = useState<AddressFormData | undefined>(undefined);
  const idPrefix = slug(label);

  // Auto-trigger pincode check when a saved address is selected
  useEffect(() => {
    if (selectedId) {
      const addr = addresses.find((a) => a.id === selectedId);
      if (addr?.zip) onPincodeChange(addr.zip);
    }
  }, [selectedId]);

  // Saved addresses load after the section mounts: show them once they arrive.
  const hasSaved = addresses.length > 0;
  useEffect(() => {
    if (!isGuest && hasSaved && selectedId && addresses.some((a) => a.id === selectedId)) setShowNewForm(false);
  }, [hasSaved]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectSaved = (address: Address) => {
    setShowNewForm(false);
    onSelect(address);
  };

  const handleNewAddressClick = () => {
    setEditing(undefined);
    setShowNewForm(true);
    onSelect(null);
  };

  const handleNewAddressSubmit = async (data: AddressFormData) => {
    // For guest: just use as-is (don't save to DB)
    if (isGuest) {
      const tempAddr: Address = {
        id: `temp-${Date.now()}`,
        ...data,
        country: "India",
        type: "SHIPPING",
        isDefault: false,
      };
      onSelect(tempAddr);
      setShowNewForm(false);
      return;
    }

    // For logged-in: save to DB
    if (addresses.length >= MAX_ADDRESSES_PER_USER) {
      toast.error(`You can save up to ${MAX_ADDRESSES_PER_USER} addresses. Please delete one first.`);
      // Still use it for this order without saving
      const tempAddr: Address = {
        id: `temp-${Date.now()}`,
        ...data,
        country: "India",
        type: "SHIPPING",
        isDefault: false,
      };
      onSelect(tempAddr);
      setShowNewForm(false);
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          country: "India",
          type: "SHIPPING",
          isDefault: addresses.length === 0,
        }),
      });

      if (res.ok) {
        const { address: savedAddr } = await res.json();
        toast.success("Address saved");
        const updated = [...addresses, savedAddr];
        onAddressesChange?.(updated);
        onSelect(savedAddr);
        setShowNewForm(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save address");
      }
    } catch {
      toast.error("Error saving address");
    } finally {
      setSavingAddress(false);
    }
  };

  // An address entered for this order only (guests, or a full address book).
  const oneOff = !showNewForm && selected && selected.id.startsWith("temp-") ? selected : null;
  const Heading = nested ? "h3" : "h2";

  const content = (
    <>
      <Heading id={`${idPrefix}-title`} ref={headingRef} tabIndex={-1}>
        {step !== undefined && <span>{step}</span>}{label}
      </Heading>
      {!nested && <p>{isGuest ? "Fresh mushrooms deliver only in Dehradun. Everything else ships across India." : "Choose a saved address or add a new one."}</p>}

      {loading && <p className={r.loading} role="status">Loading your saved addresses…</p>}

      {/* Saved addresses list */}
      {!loading && !isGuest && addresses.length > 0 && (
        <div className={r.choices} role="radiogroup" aria-labelledby={`${idPrefix}-title`}>
          {addresses.map((addr) => (
            <label key={addr.id} className={r.choice}>
              <input
                type="radio"
                name={`address-${label}`}
                checked={selectedId === addr.id && !showNewForm}
                onChange={() => handleSelectSaved(addr)}
              />
              <span>
                <strong>{addr.street}</strong>
                {addr.isDefault && <small>Default</small>}
                <br />
                {addr.city}, {addr.state} {addr.zip}
              </span>
            </label>
          ))}

          {/* Add new address option */}
          <label className={r.choice}>
            <input
              type="radio"
              name={`address-${label}`}
              checked={showNewForm}
              onChange={handleNewAddressClick}
            />
            <span><strong>Add a new address</strong></span>
          </label>

          <p className={r.hint}>{addresses.length} of {MAX_ADDRESSES_PER_USER} addresses saved</p>
        </div>
      )}

      {oneOff && (
        <div className={r.chosen}>
          <span>{oneOff.street}, {oneOff.city}, {oneOff.state} {oneOff.zip}</span>
          <button type="button" className={p.textAction} onClick={() => {
            setEditing({ street: oneOff.street, city: oneOff.city, state: oneOff.state, zip: oneOff.zip });
            setShowNewForm(true);
            onSelect(null);
          }} aria-label={`Change ${label.toLowerCase()}`}>Change</button>
        </div>
      )}

      {/* New address form — shown for guests, or when "Add New" is selected */}
      {!loading && showNewForm && (
        <AddressForm
          key={editing ? "edit" : "new"}
          idPrefix={idPrefix}
          initial={editing}
          onSubmit={handleNewAddressSubmit}
          onCancel={addresses.length > 0 ? () => {
            setShowNewForm(false);
            // Re-select first/default address
            const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
            if (defaultAddr) onSelect(defaultAddr);
          } : undefined}
          onPincodeChange={onPincodeChange}
          showCancel={addresses.length > 0}
          submitLabel={isGuest ? "Use this address" : "Save and use this address"}
        />
      )}

      {savingAddress && (
        <p className={r.hint} role="status">Saving address…</p>
      )}
    </>
  );

  return nested
    ? <div className={r.spaced}>{content}</div>
    : <section className={r.block} aria-labelledby={`${idPrefix}-title`}>{content}</section>;
};

export default AddressSection;
