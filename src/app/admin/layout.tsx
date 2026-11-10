import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { DashboardShell, type NavGroup } from "@/components/dashboard/shell";
import { buttonClass } from "@/components/ui/button";
import { ApiError } from "@/components/ui/feedback";
import { getMe, isStaff } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · SCRIPT//GO" }, robots: { index: false } };

const GROUPS: NavGroup[] = [
  { label: null, items: [{ href: "/admin", label: "Overview", icon: "admin" }] },
  {
    label: "Holds",
    items: [
      { href: "/admin/offers", label: "Offers on hold", icon: "offers" },
      { href: "/admin/releases", label: "Releases", icon: "releases" },
    ],
  },
  {
    label: "Trust & safety",
    items: [
      { href: "/admin/reports", label: "Reports", icon: "reports" },
      { href: "/admin/escrow", label: "Escrow", icon: "licenses" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/audit", label: "Audit log", icon: "audit" },
      { href: "/admin/payments", label: "Payment events", icon: "payments" },
      { href: "/admin/commerce", label: "Tebex readiness", icon: "stores" },
    ],
  },
  { label: null, items: [{ href: "/dashboard", label: "Back to dashboard", icon: "overview" }] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me.ok && me.status === 401) redirect("/sign-in?next=/admin");
  if (!me.ok) {
    return (
      <main id="main" className="container-page py-16">
        <ApiError failure={me} title="The admin area can't load because the API is not available." />
      </main>
    );
  }
  if (!isStaff(me.data)) {
    return (
      <main id="main" className="container-page py-16">
        <div className="sticker mx-auto max-w-[560px] p-8 text-center">
          <ShieldAlert aria-hidden="true" size={36} strokeWidth={2} className="mx-auto text-bad" />
          <p className="eyebrow mt-3">{"// "}403</p>
          <h1 className="display mt-1 text-[36px]">Staff only.</h1>
          <p className="mt-3 text-[15px] text-ink-2">
            This area is for SCRIPT//GO administrators and moderators. Your account ({me.data.user.email}) does not have either role.
          </p>
          <Link href="/dashboard" className={buttonClass("primary", "md", "mt-6")}>
            Back to your dashboard
          </Link>
        </div>
      </main>
    );
  }
  return (
    <DashboardShell groups={GROUPS} root="/admin" title="admin" account={{ name: me.data.user.name, email: me.data.user.email }}>
      {children}
    </DashboardShell>
  );
}
