import { notFound } from "next/navigation";
import { PerkCheckoutStatus } from "@/components/package/perk-purchase";
import { ApiError } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { PerkCheckoutState } from "@/lib/contract";

export const metadata = { title: "Perk checkout", robots: { index: false } };

/** Where the store sends a player back after a perk checkout. No account: the checkout id is the way in. */
export default async function PerkDonePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cancelled?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const res = await api<PerkCheckoutState>(`/v1/perks/checkouts/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return (
      <div className="container-page py-16">
        <ApiError failure={res} title="This checkout couldn't be loaded." />
      </div>
    );
  }
  return (
    <div className="container-page py-12 sm:py-16">
      <PerkCheckoutStatus initial={res.data} cancelled={sp.cancelled === "1"} />
    </div>
  );
}
