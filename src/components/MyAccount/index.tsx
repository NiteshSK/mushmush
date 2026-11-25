"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { validateName, validatePhone } from "@/lib/validation";
import AccountFrame, { useAccountSession } from "./AccountFrame";
import type { Address } from "./AddressDialog";
import { type AccountOrder, itemSummary, orderDate, orderStage, statusLabel } from "./orderStatus";
import { rupees } from "../Pantry/catalogue";
import styles from "../Pantry/pantry.module.css";
import a from "../Pantry/account.module.css";

type Profile = { name: string | null; email: string; phone: string | null; role?: string; createdAt?: string };
type Slot<T> = { state: "loading" | "ready" | "error"; data: T };

async function getJson<T>(url: string, pick: (data: any) => T): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url} failed: ${response.status}`);
  return pick(await response.json());
}

/** Account overview, shown at /account and at /my-account (the footer link). */
export default function MyAccount({ path = "/account" }: { path?: "/account" | "/my-account" }) {
  const { session, status } = useAccountSession(path);
  const [profile, setProfile] = useState<Slot<Profile | null>>({ state: "loading", data: null });
  const [orders, setOrders] = useState<Slot<AccountOrder[]>>({ state: "loading", data: [] });
  const [address, setAddress] = useState<Slot<Address | null>>({ state: "loading", data: null });

  useEffect(() => {
    if (status !== "authenticated") return;
    getJson("/api/user/profile", data => data as Profile)
      .then(data => setProfile({ state: "ready", data }), () => setProfile({ state: "error", data: null }));
    getJson("/api/orders?limit=3", data => (data.orders ?? []) as AccountOrder[])
      .then(data => setOrders({ state: "ready", data }), () => setOrders({ state: "error", data: [] }));
    getJson("/api/addresses", data => ((data.addresses ?? []) as Address[]))
      .then(list => setAddress({ state: "ready", data: list.find(item => item.isDefault) ?? list[0] ?? null }), () => setAddress({ state: "error", data: null }));
  }, [status]);

  const fallback: Profile = { name: session?.user?.name ?? null, email: session?.user?.email ?? "", phone: null, role: session?.user?.role };
  const person = profile.data ?? fallback;

  return <AccountFrame path={path} title={<>Your <em>account.</em></>} aside={person.email && <span>Signed in as {person.email}</span>}>
    <div className={a.overview}>
      <section className={a.section} aria-labelledby="recent-orders">
        <div className={a.sectionHead}>
          <h2 id="recent-orders">Recent orders</h2>
          <Link href="/orders" className={styles.textAction}>All orders</Link>
        </div>
        {orders.state === "loading" ? <div aria-busy="true" aria-label="Loading orders">
          {Array.from({ length: 2 }, (_, i) => <div key={i} className={a.skeletonRow} />)}
        </div> : orders.state === "error" ? <p className={a.sectionNote} role="alert">
          Your recent orders couldn’t load. <Link href="/orders" className={a.textButton}>Open your orders</Link>
        </p> : !orders.data.length ? <div className={a.panelBody}>
          <p>No orders yet.</p>
          <Link href="/shop" className={styles.primaryAction}>Shop the pantry</Link>
        </div> : <ul className={a.list}>
          {orders.data.map(order => <li key={order.id}>
            <div className={a.row}>
              <div className={a.rowMain}>
                <p className={a.meta}><span>Order {order.orderNumber}</span><span>Placed {orderDate(order.createdAt)}</span></p>
                <p className={a.rowTitle}>{itemSummary(order)}</p>
                <p className={a.statusLine}><span className={a.status} data-tone={orderStage(order)}>{statusLabel(order)}</span>
                  {orderStage(order) === "pending" && <span>Not confirmed until we verify the payment</span>}</p>
              </div>
              <div className={a.side}>
                <p className={a.amount}><span className={styles.srOnly}>Total </span>{rupees.format(order.total)}</p>
                <div className={a.actions}>
                  <Link href={`/orders#${order.orderNumber}`}>View order<span className={styles.srOnly}> {order.orderNumber}</span></Link>
                </div>
              </div>
            </div>
          </li>)}
        </ul>}
      </section>

      <div>
        <Details profile={person} ready={profile.state === "ready"} onSaved={data => setProfile({ state: "ready", data: { ...person, ...data } })} />

        <section className={a.section} aria-labelledby="default-address">
          <div className={a.sectionHead}>
            <h2 id="default-address">Default address</h2>
            <Link href="/addresses" className={styles.textAction}>{address.data ? "Manage addresses" : "Add an address"}</Link>
          </div>
          <div className={a.panelBody}>
            {address.state === "loading" ? <p className={a.quiet}>Loading…</p>
              : address.state === "error" ? <p className={a.quiet}>Your addresses couldn’t load.</p>
              : address.data ? <address className={a.address}>
                {address.data.street}<br />{address.data.city}, {address.data.state} {address.data.zip}<br />{address.data.country}
              </address>
              : <p className={a.quiet}>No saved address yet. Save one to fill it in at checkout.</p>}
          </div>
        </section>

        <section className={a.section} aria-labelledby="password">
          <div className={a.sectionHead}><h2 id="password">Password</h2></div>
          <div className={a.panelBody}>
            <p className={a.quiet}>To change your password, we send a reset link to {person.email || "your email"}.</p>
            <Link href="/auth/forgot-password" className={a.textButton}>Reset password</Link>
          </div>
        </section>

        {person.role === "ADMIN" && <section className={a.section} aria-labelledby="admin">
          <div className={a.sectionHead}><h2 id="admin">Shop admin</h2></div>
          <div className={a.panelBody}><Link href="/admin" className={a.textButton}>Open the admin dashboard</Link></div>
        </section>}
      </div>
    </div>
  </AccountFrame>;
}

function Details({ profile, ready, onSaved }: { profile: Profile; ready: boolean; onSaved: (data: Partial<Profile>) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const editButton = useRef<HTMLButtonElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (editing) nameInput.current?.focus();
    else if (returnFocus.current) { editButton.current?.focus(); returnFocus.current = false; }
  }, [editing]);

  function open() {
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setErrors({});
    setSaved("");
    setEditing(true);
  }
  function close() { returnFocus.current = true; setEditing(false); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = { name: validateName(name) ?? undefined, phone: validatePhone(phone) ?? undefined };
    if (found.name || found.phone) { setErrors(found); return; }
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ...(phone.trim() && { phone: phone.trim() }) }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      onSaved({ name: data.name, phone: data.phone });
      setSaved("Details saved.");
      close();
    } catch {
      setErrors({ form: "We couldn’t save your details. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return <section className={a.section} aria-labelledby="details">
    <div className={a.sectionHead}>
      <h2 id="details">Details</h2>
      {!editing && <button ref={editButton} className={styles.textAction} onClick={open} disabled={!ready}>Edit<span className={styles.srOnly}> details</span></button>}
    </div>
    {editing ? <form className={`${a.form} ${a.panelBody}`} onSubmit={save} noValidate>
      <div className={a.field}>
        <label htmlFor="details-name">Name</label>
        <input id="details-name" ref={nameInput} className={a.input} autoComplete="name" value={name} onChange={e => setName(e.target.value)}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "details-name-error" : undefined} />
        {errors.name && <p className={a.error} id="details-name-error">{errors.name}</p>}
      </div>
      <div className={a.field}>
        <label htmlFor="details-phone">Mobile number (optional)</label>
        <input id="details-phone" type="tel" className={a.input} autoComplete="tel-national" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)}
          aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "details-phone-error" : undefined} />
        {errors.phone && <p className={a.error} id="details-phone-error">{errors.phone}</p>}
      </div>
      {errors.form && <p className={a.error} role="alert">{errors.form}</p>}
      <div className={a.formActions}>
        <button type="submit" className={styles.primaryAction} disabled={saving}>{saving ? "Saving…" : "Save details"}</button>
        <button type="button" className={styles.textAction} onClick={close}>Cancel</button>
      </div>
    </form> : <dl className={a.facts}>
      <dt>Name</dt><dd>{profile.name || "—"}</dd>
      <dt>Email</dt><dd>{profile.email}</dd>
      <dt>Mobile</dt><dd>{profile.phone || "Not added"}</dd>
      {profile.createdAt && <><dt>Member since</dt><dd>{new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</dd></>}
    </dl>}
    <p className={saved ? a.notice : undefined} role="status">{saved}</p>
  </section>;
}
