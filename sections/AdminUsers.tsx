"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AdminFrame, type StaffRole } from "./AdminShared";

type Profile = { id: string; email: string | null; full_name: string | null; company: string | null; role: string; status: string; created_at: string };

const ROLES = [
  { id: "customer", label: "Customer" },
  { id: "sales", label: "Sales" },
  { id: "admin", label: "Admin" },
  { id: "super_admin", label: "Super admin" },
];
const field = "rounded-full border border-line bg-transparent px-3.5 py-2 text-sm outline-none focus:border-ink disabled:opacity-60";

/** Accounts and their roles. Admins can view; only a super admin can change a role or suspend an account. */
export function AdminUsers() {
  return <AdminFrame current="users" allow={["admin", "super_admin"]}>{({ role, userId }) => <Users role={role} me={userId} />}</AdminFrame>;
}

function Users({ role, me }: { role: StaffRole; me: string }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const canEdit = role === "super_admin";

  const load = useCallback(async () => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const { data, error } = await sb.from("profiles").select("id, email, full_name, company, role, status, created_at").is("deleted_at", null).order("created_at", { ascending: false }).limit(1000);
    if (error) return setNotice("We couldn't load the accounts. Please refresh the page.");
    setUsers((data as Profile[]) ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const change = async (u: Profile, patch: Partial<Pick<Profile, "role" | "status">>) => {
    const sb = supabaseBrowser();
    if (!sb || busy) return;
    setBusy(u.id);
    setNotice("");
    const { error } = await sb.from("profiles").update(patch).eq("id", u.id);
    if (error) setNotice("That change wasn't saved. Only a super admin can change roles.");
    else {
      await sb.from("audit_log").insert({ actor_id: me, action: "profile.update", entity: "profiles", entity_id: u.id, before: { role: u.role, status: u.status }, after: patch }).then(() => {});
      await load();
    }
    setBusy("");
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? users.filter((u) => [u.email, u.full_name, u.company].some((v) => v?.toLowerCase().includes(q))) : users;
  }, [users, query]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">Users</h1>
          <p className="mt-2 text-sm text-muted">
            {users.length} {users.length === 1 ? "account" : "accounts"} · {users.filter((u) => u.role !== "customer").length} staff
          </p>
        </div>
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search accounts</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Email, name or company" className={cn(field, "w-full py-3 pl-10")} />
        </label>
      </div>

      {!canEdit && <p className="mt-4 text-sm text-muted">You can view accounts. Changing a role needs a super admin.</p>}
      {notice && (
        <p role="alert" className="mt-4 rounded-2xl bg-gold/10 p-4 text-sm">
          {notice}
        </p>
      )}

      <div className="no-scrollbar mt-6 overflow-x-auto rounded-[2rem] border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-bg2 text-left">
              <th scope="col" className="px-6 py-4 font-medium">Account</th>
              <th scope="col" className="px-4 py-4 font-medium">Joined</th>
              <th scope="col" className="px-4 py-4 font-medium">Role</th>
              <th scope="col" className="px-4 py-4 font-medium">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((u) => {
              const self = u.id === me;
              return (
                <tr key={u.id}>
                  <th scope="row" className="px-6 py-4 text-left font-normal">
                    <span className="block font-medium">
                      {u.full_name || u.email || "Unnamed"} {self && <span className="font-normal text-muted">(you)</span>}
                    </span>
                    <span className="block text-muted">{[u.email, u.company].filter(Boolean).join(" · ")}</span>
                  </th>
                  <td className="px-4 py-4 text-muted">{new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-4">
                    <select aria-label={`Role for ${u.email ?? "account"}`} value={u.role} disabled={!canEdit || self || busy === u.id} onChange={(e) => change(u, { role: e.target.value })} className={field}>
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <button type="button" disabled={!canEdit || self || busy === u.id} onClick={() => change(u, { status: u.status === "active" ? "suspended" : "active" })} className={cn(field, u.status === "suspended" && "border-gold text-gold")}>
                      {u.status === "active" ? "Active" : "Suspended"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-muted">
                  No accounts match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Your own role and access can&rsquo;t be changed here, so you can&rsquo;t lock yourself out.</p>
    </>
  );
}
