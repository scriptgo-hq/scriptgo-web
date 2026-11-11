import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell, type NavGroup } from "@/components/dashboard/shell";
import { ApiError } from "@/components/ui/feedback";
import { api, asList } from "@/lib/api";
import type { Notice } from "@/lib/contract";
import { getMe, isStaff } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Dashboard · SCRIPT//GO" }, robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me.ok && me.status === 401) redirect("/sign-in?next=/dashboard");
  if (!me.ok) {
    return (
      <main id="main" className="container-page py-16">
        <ApiError failure={me} title="Your dashboard can't load because the API is not available." />
      </main>
    );
  }
  const notices = await api<Notice[] | { items: Notice[] }>("/v1/me/notices", { auth: true, timeoutMs: 4000 });
  const unread = notices.ok ? asList(notices.data).filter((n) => !n.readAt).length : 0;
  const creator = me.data.creatorProfile;
  const groups: NavGroup[] = [
    { label: null, items: [{ href: "/dashboard", label: "Overview", icon: "overview" }] },
    {
      label: "Using",
      items: [
        { href: "/dashboard/library", label: "Library", icon: "library" },
        { href: "/dashboard/licenses", label: "Licenses", icon: "licenses" },
      ],
    },
    {
      label: "Publishing",
      items: creator
        ? [
            { href: "/dashboard/packages", label: "Packages", icon: "packages" },
            { href: "/dashboard/customers", label: "Customers", icon: "customers" },
            { href: "/dashboard/stores", label: "Stores", icon: "stores" },
            { href: "/dashboard/perks", label: "Perks", icon: "perks" },
            { href: "/dashboard/analytics", label: "Analytics", icon: "analytics" },
            { href: "/dashboard/assets", label: "Leaked copies", icon: "assets" },
          ]
        : [{ href: "/dashboard/settings#creator", label: "Become a creator", icon: "packages" }],
    },
    {
      label: "Account",
      items: [
        { href: "/dashboard/notices", label: "Notices", icon: "notices", badge: unread || undefined },
        { href: "/dashboard/settings", label: "Settings", icon: "settings" },
        ...(isStaff(me.data) ? [{ href: "/admin", label: "Admin", icon: "admin" as const }] : []),
      ],
    },
  ];
  return (
    <DashboardShell groups={groups} root="/dashboard" title="dashboard" account={{ name: me.data.user.name, email: me.data.user.email }}>
      {children}
    </DashboardShell>
  );
}
