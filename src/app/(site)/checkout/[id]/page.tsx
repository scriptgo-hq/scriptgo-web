import { notFound, redirect } from "next/navigation";
import { CheckoutStatus } from "@/components/package/checkout-status";
import { ApiError } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { CheckoutState } from "@/lib/contract";

export const metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cancelled?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const res = await api<CheckoutState>(`/v1/checkout/${encodeURIComponent(id)}`, { auth: true });
  if (!res.ok) {
    if (res.status === 401) redirect(`/sign-in?next=${encodeURIComponent(`/checkout/${id}`)}`);
    if (res.status === 404) notFound();
    return (
      <div className="container-page py-16">
        <ApiError failure={res} title="This checkout couldn't be loaded." />
      </div>
    );
  }
  return (
    <div className="container-page py-12 sm:py-16">
      <CheckoutStatus initial={res.data} cancelled={sp.cancelled === "1"} />
    </div>
  );
}
