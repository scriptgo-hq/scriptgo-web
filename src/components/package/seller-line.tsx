const PROVIDER: Record<string, string> = { tebex: "Tebex", mock: "the mock provider (development only)" };

/** Shown on every purchase surface: who sells, who takes the payment, who issues the license. */
export function SellerLine({ creator, provider, className }: { creator: string; provider: string | null; className?: string }) {
  return (
    <p className={className ?? "text-[13px] text-ink-2"}>
      Sold by <strong className="text-ink">{creator}</strong>.{" "}
      {provider ? (
        <>
          Payment by <strong className="text-ink">{PROVIDER[provider] ?? provider}</strong>.{" "}
        </>
      ) : (
        <>No payment provider connected. </>
      )}
      License issued by <strong className="text-ink">SCRIPT//GO</strong>.
    </p>
  );
}
