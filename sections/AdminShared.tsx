"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { buttonClass } from "@/components/buttonStyles";
import { supabaseBrowser, useUser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type StaffRole = "sales" | "admin" | "super_admin";
const STAFF: string[] = ["sales", "admin", "super_admin"];

const TABS: { id: string; label: string; href: string; roles: StaffRole[] }[] = [
  { id: "overview", label: "Overview", href: "/admin/overview", roles: ["sales", "admin", "super_admin"] },
  { id: "leads", label: "Leads", href: "/admin", roles: ["sales", "admin", "super_admin"] },
  { id: "users", label: "Users", href: "/admin/users", roles: ["admin", "super_admin"] },
  { id: "settings", label: "Settings", href: "/admin/settings", roles: ["admin", "super_admin"] },
];

/** The signed-in person's staff role. `null` while checking, `false` when they are not staff. */
export function useStaff() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [role, setRole] = useState<StaffRole | false | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return router.replace("/login");
    const sb = supabaseBrowser();
    if (!sb) return setRole(false);
    sb.from("profiles").select("role").eq("id", user.id).maybeSingle().then(({ data }) => setRole(STAFF.includes(data?.role ?? "") ? (data!.role as StaffRole) : false));
  }, [loading, user, router]);

  return { role, userId: user?.id ?? null };
}

export function AdminNav({ current, role }: { current: string; role: StaffRole }) {
  return (
    <nav aria-label="Admin" className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
      {TABS.filter((t) => t.roles.includes(role)).map((t) => (
        <Link key={t.id} href={t.href} aria-current={current === t.id ? "page" : undefined} className={cn("glass-btn shrink-0 rounded-full px-4 py-2 text-sm font-medium", current === t.id ? "[--gb:color-mix(in_srgb,var(--ink)_82%,transparent)] text-bg" : "text-muted hover:text-ink")}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** Page frame for admin screens: checks access (the database enforces it too), then shows the tabs. */
export function AdminFrame({ current, allow = ["sales", "admin", "super_admin"], children }: { current: string; allow?: StaffRole[]; children: (ctx: { role: StaffRole; userId: string }) => ReactNode }) {
  const { role, userId } = useStaff();

  if (role === null) {
    return (
      <section className="bg-bg pb-20 pt-32 lg:pt-40">
        <div className="container-x text-muted">Loading…</div>
      </section>
    );
  }
  if (!role || !userId || !allow.includes(role)) {
    return (
      <section className="bg-bg pb-20 pt-32 lg:pt-40">
        <div className="container-x max-w-xl">
          <h1 className="display text-4xl">Staff only</h1>
          <p className="mt-3 text-muted">This page is for the Heritage Shapes team. Your account doesn&rsquo;t have access.</p>
          <Link href="/account" className={buttonClass("outline", "mt-6")}>
            Back to my account
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="bg-bg pb-20 pt-32 lg:pt-40">
      <div className="container-x">
        <AdminNav current={current} role={role} />
        {children({ role, userId })}
      </div>
    </section>
  );
}
