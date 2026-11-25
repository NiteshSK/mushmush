"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_ADDRESSES_PER_USER } from "@/lib/constants";
import AccountFrame, { useAccountSession } from "./AccountFrame";
import AddressDialog, { type Address } from "./AddressDialog";
import styles from "../Pantry/pantry.module.css";
import a from "../Pantry/account.module.css";

type Load = "loading" | "ready" | "error";

export const addressType = (type: string) =>
  type === "SHIPPING" ? "Delivery address" : type === "BILLING" ? "Billing address" : "Delivery and billing";

export default function Addresses() {
  const { status } = useAccountSession("/addresses");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [load, setLoad] = useState<Load>("loading");
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const full = addresses.length >= MAX_ADDRESSES_PER_USER;

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/addresses", { cache: "no-store" });
      if (!response.ok) throw new Error(`Addresses request failed: ${response.status}`);
      const data = await response.json();
      setAddresses(data.addresses ?? []);
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, []);

  useEffect(() => { if (status === "authenticated") refresh(); }, [status, refresh]);

  async function change(address: Address, request: RequestInit, done: string, failed: string) {
    setBusy(address.id);
    try {
      const response = await fetch(`/api/addresses/${address.id}`, request);
      if (!response.ok) throw new Error();
      await refresh();
      setMessage(done);
      return true;
    } catch {
      setMessage(failed);
      return false;
    } finally {
      setBusy(null);
    }
  }

  const makeDefault = (address: Address) => change(address,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }) },
    `${address.street} is now your default address.`, "We couldn’t change the default address. Please try again.");

  async function remove(address: Address) {
    const removed = await change(address, { method: "DELETE" }, "Address deleted.", "We couldn’t delete this address. Please try again.");
    setConfirming(null);
    // The row and its buttons are gone; keep keyboard focus in the list.
    if (removed) heading.current?.focus();
  }

  const add = <button className={styles.primaryAction} onClick={() => setEditing("new")} disabled={full || load !== "ready"}>Add an address</button>;

  return <AccountFrame path="/addresses" title={<>Your <em>addresses.</em></>}>
    {load === "loading" ? <div aria-busy="true" aria-label="Loading addresses">
      {Array.from({ length: 2 }, (_, i) => <div key={i} className={a.skeletonRow} />)}
    </div> : load === "error" ? <div className={styles.recovery} role="alert">
      <h2>Your addresses couldn’t load.</h2>
      <p>Check your connection and try again.</p>
      <button className={styles.primaryAction} onClick={() => { setLoad("loading"); refresh(); }}>Try again</button>
    </div> : !addresses.length ? <div className={styles.recovery}>
      <h2>No saved addresses.</h2>
      <p>Save a delivery address to fill it in at checkout. Pantry goods ship across India. Fresh mushrooms deliver only in Dehradun.</p>
      {add}
    </div> : <section className={a.section} aria-labelledby="saved-addresses">
      <div className={a.sectionHead}>
        <h2 id="saved-addresses" ref={heading} tabIndex={-1}>Saved addresses</h2>
        <p>{addresses.length} of {MAX_ADDRESSES_PER_USER} saved</p>
      </div>
      <p className={message ? a.notice : undefined} role="status">{message}</p>
      <ul className={a.list}>
        {addresses.map(address => <li key={address.id}>
          <div className={a.row}>
            <div className={a.rowMain}>
              <p className={a.statusLine}>
                <span>{addressType(address.type)}</span>
                {address.isDefault && <span className={a.status} data-tone="confirmed">Default</span>}
              </p>
              <address className={a.address}>
                {address.street}<br />{address.city}, {address.state} {address.zip}<br />{address.country}
              </address>
            </div>
            <div className={a.actions}>
              {confirming === address.id ? <span className={a.confirm} role="group" aria-label={`Delete ${address.street}?`}>
                <span>Delete this address?</span>
                <button className={a.danger} onClick={() => remove(address)} disabled={busy === address.id}>Delete</button>
                <button onClick={() => setConfirming(null)} autoFocus>Keep</button>
              </span> : <>
                <button onClick={() => setEditing(address)}>Edit<span className={styles.srOnly}> {address.street}</span></button>
                {!address.isDefault && <button onClick={() => makeDefault(address)} disabled={busy === address.id}
                  aria-label={`Make ${address.street} your default address`}>Make default</button>}
                <button className={a.danger} onClick={() => setConfirming(address.id)}>Delete<span className={styles.srOnly}> {address.street}</span></button>
              </>}
            </div>
          </div>
        </li>)}
      </ul>
      <div className={a.formActions}>
        {add}
        {full && <p className={a.quiet}>You can save up to {MAX_ADDRESSES_PER_USER} addresses. Delete one to add another.</p>}
      </div>
    </section>}
    {editing && <AddressDialog address={editing === "new" ? null : editing} first={!addresses.length}
      onClose={() => setEditing(null)} onSaved={done => { setEditing(null); setMessage(done); refresh(); }} />}
  </AccountFrame>;
}
