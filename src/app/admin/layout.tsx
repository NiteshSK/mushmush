import { canWork, pageDuties } from "@/lib/staff-permissions";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin";
import AdminLayout from "@/components/Admin/AdminLayout";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kosvana · Staff", robots: { index: false, follow: false } };

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const path = (await headers()).get("x-kosvana-admin-path") || "/admin";
  if (!user) {
    redirect("/auth/signin?callbackUrl=" + encodeURIComponent(path));
  }
  if (!canWork(user, ...pageDuties(path))) redirect(user.role === "STAFF" && user.staffDuties?.length ? "/admin" : "/");
  return <AdminLayout initialActor={{ role: user.role, staffDuties: user.staffDuties, name: user.name, email: user.email }}>{children}</AdminLayout>;
}
