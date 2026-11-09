import { CreatorBoxArt } from "@/components/illustrations";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** Sun-yellow slanted band inviting creators to publish. */
export function CreatorCta({ className }: { className?: string }) {
  return (
    <section aria-labelledby="creator-cta-title" className={cn("relative isolate py-12", className)}>
      <div aria-hidden="true" className="band-sun absolute inset-x-0 inset-y-2 -z-10 border-y-0" />
      <div className="container-page flex flex-col items-start gap-5 md:flex-row md:items-center">
        <CreatorBoxArt className="h-20 w-20 shrink-0" />
        <div className="min-w-0 flex-1 text-on-sun">
          <h2 id="creator-cta-title" className="display text-[34px] sm:text-[40px]">
            Are you a creator?
          </h2>
          <p className="mt-2 max-w-xl text-[15.5px] font-medium">
            Publish your resources, prove where they run, manage releases, and sell licenses through your own store.
          </p>
        </div>
        <ButtonLink href="/developers" variant="ink" size="lg" arrow>
          Publish a script
        </ButtonLink>
      </div>
    </section>
  );
}
