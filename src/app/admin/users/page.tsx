"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PersonDialog, { type Person } from "@/components/Admin/PersonDialog";
import { dutyLabels } from "@/lib/staff-permissions";

type Directory = { rows: Person[]; total: number; pages: number; managedGoogle: boolean };
export default function PeoplePage() {
  const router = useRouter();
  const search = useSearchParams();
  const group = search.get("group") || "staff";
  const query = search.get("q") || "";
  const page = Math.max(1, Number(search.get("page")) || 1);
  const [directory, setDirectory] = useState<Directory | null>(null);
  const [term, setTerm] = useState(query);
  const [error, setError] = useState(false);
  const [revision, refresh] = useState(0);
  const [editing, setEditing] = useState<Person | "new" | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => setTerm(query), [query]);
  useEffect(() => {
    const controller = new AbortController();
    setDirectory(null); setError(false);
    const params = new URLSearchParams({ group, q: query, page: String(page) });
    fetch("/api/admin/users?" + params, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) setDirectory(data);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [group, query, page, revision]);

  function navigate(nextGroup: string, nextQuery: string, nextPage = 1) {
    const params = new URLSearchParams({ group: nextGroup, page: String(nextPage) });
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    router.push("/admin/users?" + params);
  }
  return <section className="max-w-4xl space-y-5">
    <header className="flex flex-wrap justify-between items-center gap-3">
      <h1 className="text-3xl font-semibold">People & access</h1>
      <button className="bg-forest text-white px-4 py-2 rounded disabled:opacity-50" disabled={!directory} onClick={() => setEditing("new")}>Create account</button>
    </header>
    {directory?.managedGoogle && <p>To give someone staff access, ask them to sign in with their Google Workspace account first.
      {" "}<button className="underline" onClick={() => navigate("all", "")}>Find their account</button> and edit their access level.</p>}
    <div className="flex flex-wrap items-center gap-3">
      <label>Directory <select className="border rounded p-2" value={group} onChange={e => navigate(e.target.value, query)}>
        <option value="staff">Staff and owners</option><option value="customer">Customers</option><option value="all">Everyone</option>
      </select></label>
      <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); navigate(group, term); }}>
        <input className="border rounded p-2" aria-label="Search people by name or email" placeholder="Name or email" value={term} onChange={e => setTerm(e.target.value)}/>
        <button className="border rounded px-3 py-2">Search</button>
      </form>
    </div>
    {notice && <p role="status">{notice}</p>}
    {error ? <p role="alert">People could not be loaded. <button onClick={() => refresh(value => value + 1)}>Retry</button></p>
      : !directory ? <p role="status">Loading people…</p> : <>
        <p>{directory.total} {directory.total === 1 ? "account" : "accounts"}</p>
        <ul className="divide-y border rounded-lg bg-white">{directory.rows.map(person =>
          <li key={person.id} className="flex flex-wrap justify-between items-center gap-3 p-4">
            <div className="min-w-0 break-words"><strong>{person.name || person.email}</strong><p>{person.email}</p>
              <p className="text-sm text-gray-6">{person.role === "ADMIN" ? "Owner" : person.role === "STAFF" ?
                person.staffDuties.map(duty => dutyLabels[duty]).join(" · ") : "Customer"} · {person.emailVerified ? "Email verified" : "Email unverified"}</p></div>
            <button className="rounded border px-3 py-2" onClick={() => setEditing(person)} aria-label={"Edit " + person.email}>Edit</button>
          </li>)}</ul>
        {!directory.rows.length && <p>No matching accounts.</p>}
        {directory.pages > 1 && <nav aria-label="People pages" className="flex gap-3">
          <button disabled={page === 1} onClick={() => navigate(group, query, page - 1)}>Previous</button>
          <span>Page {page} of {directory.pages}</span>
          <button disabled={page >= directory.pages} onClick={() => navigate(group, query, page + 1)}>Next</button></nav>}
      </>}
    {editing && directory && <PersonDialog person={editing === "new" ? undefined : editing} managedGoogle={directory.managedGoogle} onClose={() => setEditing(null)}
      onSaved={() => { setNotice(editing === "new" ? "Account created." : "Account updated."); setEditing(null); refresh(value => value + 1); }}/>}
  </section>;
}
