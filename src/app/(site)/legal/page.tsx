import Link from "next/link";
import type { Metadata } from "next";
import { Banner } from "@/components/ui/feedback";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Legal",
  description: "Terms, privacy, IP policy, creator agreement and the operator. Drafts pending legal review.",
};

const SECTIONS = [
  { id: "operator", title: "Operator" },
  { id: "terms", title: "Terms of service" },
  { id: "privacy", title: "Privacy policy" },
  { id: "ip-policy", title: "IP policy" },
  { id: "creator-agreement", title: "Creator agreement" },
  { id: "commerce", title: "Who sells, who charges, who licenses" },
];

function DraftTag() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border-2 border-line bg-sun px-2 py-0.5 align-middle font-mono text-[11px] font-bold uppercase text-on-sun">
      Draft · pending legal review
    </span>
  );
}

function Section({ id, title, draft = true, children }: { id: string; title: string; draft?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t-2 border-line-soft pt-8">
      <h2 id={`${id}-h`} className="font-display text-[28px] font-extrabold tracking-[-0.02em]">
        {title}
        {draft ? <DraftTag /> : null}
      </h2>
      <div className="prose-sg mt-4">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav aria-label="Legal sections" className="lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow">{"// legal"}</p>
        <ul className="mt-2 space-y-1 text-[14px]">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block rounded-md px-2 py-1 text-ink-2 hover:bg-surface-2 hover:text-ink">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 space-y-10">
        <div>
          <Eyebrow>legal</Eyebrow>
          <DisplayTitle as="h1" className="mt-2 text-[52px] sm:text-[64px]">
            Legal.
          </DisplayTitle>
          <Banner tone="warning" title="These documents are drafts pending legal review." className="mt-6">
            They describe how SCRIPT//GO intends to operate. They are not yet binding terms, and they will change before the
            platform opens to the public. SCRIPT//GO is a working name until trademark and domain clearance.
          </Banner>
        </div>

        <Section id="operator" title="Operator" draft={false}>
          <p>
            The legal entity that operates SCRIPT//GO, its registered address and its contact details
            will be published here before public launch. Until then, reports and requests go through the{" "}
            <Link href="/report">public report form</Link>.
          </p>
        </Section>

        <Section id="terms" title="Terms of service">
          <p>Placeholder. The terms will cover:</p>
          <ul>
            <li>Accounts, access tokens and acceptable use of the registry, the API and the licensing service.</li>
            <li>What SCRIPT//GO hosts, validates and displays, and what it does not guarantee.</li>
            <li>Suspension and restriction of listings, with notices, reasons and an appeal path.</li>
            <li>Limits of liability and the governing law, to be set by counsel.</li>
          </ul>
        </Section>

        <Section id="privacy" title="Privacy policy">
          <p>Placeholder. The policy will describe:</p>
          <ul>
            <li>
              Account data (email, display name), session cookies used for sign-in, and personal access tokens (stored hashed).
            </li>
            <li>
              Licensing data: deployment names, environments, adapter versions and verification times recorded when your server
              calls the licensing API.
            </li>
            <li>Report data: reporter contact details and evidence, shared with moderators and, where required, with the creator.</li>
            <li>Payment data: handled by the payment provider. SCRIPT//GO receives signed payment events, not card details.</li>
            <li>
              E-mail we send (report receipts and decisions, appeal outcomes, purchase confirmations, password resets): recipient,
              subject and text are kept with their delivery status, and handed to the e-mail delivery provider to send. Password reset
              and confirmation links are removed from our copy once delivered. Purchase e-mails never contain a license key.
            </li>
            <li>Retention periods, your rights, and how to exercise them.</li>
          </ul>
        </Section>

        <Section id="ip-policy" title="IP policy">
          <p>Placeholder for the notice-and-action policy. The process it will formalize already exists:</p>
          <ol>
            <li>
              Anyone, with or without an account, can <Link href="/report">report a package or release</Link>. You receive a case
              number immediately.
            </li>
            <li>
              A moderator reviews the claim next to a snapshot of the listing as it was when reported, including the creator&rsquo;s
              rights declaration.
            </li>
            <li>
              Possible decisions: no action, restrict one release, restrict sales only, or suspend the listing. Every decision comes
              with a statement of reasons and can be escalated to legal review.
            </li>
            <li>Both parties are notified. The creator can appeal from their dashboard.</li>
          </ol>
          <p>
            Creators declare that they own their code or are authorized to distribute it, list third-party assets with their
            licenses, and state whether the package targets a proprietary third-party game.
          </p>
        </Section>

        <Section id="creator-agreement" title="Creator agreement">
          <p>Placeholder. The agreement will cover:</p>
          <ul>
            <li>The rights declaration you make for each release, and its accuracy.</li>
            <li>Immutability of published releases: a published version can&rsquo;t be changed, only deprecated or yanked.</li>
            <li>Commercial classification of offers, and review of offers that touch proprietary third-party game content.</li>
            <li>Your relationship with your payment provider, which is yours, and any platform fee, to be stated before checkout opens.</li>
          </ul>
        </Section>

        <Section id="commerce" title="Who sells, who charges, who licenses" draft={false}>
          <p>Every purchase surface on SCRIPT//GO names three parties:</p>
          <ul>
            <li>
              <strong>The creator sells.</strong> They set their offers and connect their own store.
            </li>
            <li>
              <strong>The payment provider charges</strong> (for example Tebex, once it approves the creator&rsquo;s store). SCRIPT//GO
              has no partnership with, or endorsement from, any provider or engine.
            </li>
            <li>
              <strong>SCRIPT//GO issues the license</strong>, only after a verified, signed payment event or an audited administrative
              grant. Never on a browser redirect alone.
            </li>
          </ul>
          <p>Checkout is off by default and stays off until the provider approves the creator&rsquo;s store.</p>
        </Section>
      </div>
    </div>
  );
}
