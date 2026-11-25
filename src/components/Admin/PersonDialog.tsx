"use client";
import { useState, type FormEvent } from "react";
import { useModalDialog } from "@/components/Cart/useModalDialog";
import { DUTIES, dutyLabels, type AccountRole, type StaffDuty } from "@/lib/staff-permissions";
import { passwordRequirementsText, validatePasswordPolicy } from "@/lib/validation";

export type Person = {
  id: string; name: string | null; email: string; role: AccountRole;
  staffDuties: StaffDuty[]; emailVerified: string | null; updatedAt: string;
};
type Props = { person?: Person; managedGoogle: boolean; onClose: () => void; onSaved: () => void };
const control = "block w-full rounded border border-gray-3 px-3 py-2 mt-1";

export default function PersonDialog({ person, managedGoogle, onClose, onSaved }: Props) {
  const dialog = useModalDialog();
  const [role, setRole] = useState<AccountRole>(person?.role || "CUSTOMER");
  const [duties, setDuties] = useState<StaffDuty[]>(person?.staffDuties ?? []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const managedCreation = managedGoogle && !person;
  const usesPassword = !managedGoogle || role === "CUSTOMER";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password || !person) {
      const policy = validatePasswordPolicy(password);
      if (!policy.valid) { setError(policy.error || "Enter a stronger password."); return; }
      if (password !== form.get("confirm")) { setError("The password confirmation does not match."); return; }
    }
    if (role === "STAFF" && duties.length === 0) { setError("Select at least one staff duty."); return; }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: person ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: person?.id, updatedAt: person?.updatedAt, name: form.get("name"),
          email: form.get("email"), role, staffDuties: role === "STAFF" ? duties : [], password: password || undefined })
      });
      if (!response.ok) throw new Error((await response.json()).error || "Could not save this account.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this account.");
    } finally {
      setBusy(false);
    }
  }
  return <dialog ref={dialog} aria-labelledby="person-title" onCancel={event => { if (busy) event.preventDefault(); else onClose(); }}
    className="m-auto rounded-lg w-full max-w-md p-6 max-h-[90dvh] overflow-y-auto backdrop:bg-black/50">
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between"><h2 id="person-title" className="text-xl font-semibold">{person ? "Edit account" : "Create account"}</h2>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close account dialog">Close</button></div>
      <label className="block">Full name<input className={control} name="name" required maxLength={150} defaultValue={person?.name || ""} data-autofocus/></label>
      <label className="block">Email address<input className={control} type="email" name="email" required defaultValue={person?.email} readOnly={!!person}/></label>
      {managedCreation ? <p>New accounts created here have customer access. Staff start by signing in with Google Workspace.</p> :
      <label className="block">Access level<select className={control} value={role} onChange={e => setRole(e.target.value as AccountRole)}>
        <option value="CUSTOMER">Customer</option><option value="STAFF">Staff with selected duties</option><option value="ADMIN">Owner · full access</option>
      </select></label>}
      {role === "STAFF" && <fieldset className="space-y-2"><legend className="font-medium">Duties</legend>
        {DUTIES.map(duty => <label key={duty} className="flex items-center gap-2"><input type="checkbox" checked={duties.includes(duty)}
          onChange={e => setDuties(e.target.checked ? [...duties, duty] : duties.filter(value => value !== duty))}/>{dutyLabels[duty]}</label>)}
      </fieldset>}
      {usesPassword ? <><label className="block">{person ? "New password (optional)" : "Password"}<input className={control} name="password" type="password" autoComplete="new-password" required={!person} aria-describedby="account-password-hint"/></label>
      <p id="account-password-hint" className="text-sm text-gray-6">{passwordRequirementsText}</p>
      <label className="block">Confirm password<input className={control} name="confirm" type="password" autoComplete="new-password" required={!person}/></label></> : <p>Staff access requires a linked Google Workspace account.</p>}
      {error && <p role="alert" className="text-red">{error}</p>}
      <button className="bg-forest text-white px-5 py-2 rounded" disabled={busy}>{busy ? "Saving…" : person ? "Save changes" : "Create account"}</button>
    </form>
  </dialog>;
}
