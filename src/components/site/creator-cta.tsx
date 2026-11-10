import { Ridge } from "@/components/site/ink";
import { Eyebrow } from "@/components/ui/typography";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** Sun band inviting creators to publish, opened by a ridge. */
export function CreatorCta({ className }: { className?: string }) {
  return (
    <section aria-labelledby="creator-cta-title" className={cn("g-sun relative", className)}>
      <Ridge from="paper" to="sun" ink="orange" n={2} small />
      <div className="container-page flex flex-col items-start gap-6 pb-14 pt-8 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <Eyebrow className="mb-4">For creators</Eyebrow>
          <h2 id="creator-cta-title" className="display text-[34px] sm:text-[44px]">
            Are you <em>a creator?</em>
          </h2>
          <p className="mt-3 max-w-xl text-[16px] font-medium">
            Publish your scripts, prove where they run, protect them with license keys, and sell them from your own Tebex store.
          </p>
        </div>
        <ButtonLink href="/developers" variant="ink" size="lg" arrow>
          Publish a script
        </ButtonLink>
      </div>
    </section>
  );
}
