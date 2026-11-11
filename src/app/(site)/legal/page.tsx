import Link from "next/link";
import type { Metadata } from "next";
import { PictureCard } from "@/components/site/diagrams";
import { SCENES } from "@/components/site/ink";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Legal",
  description: "Terms, privacy, IP policy, code protection, creator agreement and the operator.",
};

const SECTIONS = [
  { id: "operator", title: "Operator" },
  { id: "terms", title: "Terms of service" },
  { id: "privacy", title: "Privacy policy" },
  { id: "ip-policy", title: "IP policy" },
  { id: "protection", title: "Code protection and escrow" },
  { id: "creator-agreement", title: "Creator agreement" },
  { id: "commerce", title: "Who sells, who charges, who licenses" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28 border-t-2 border-dashed border-line-soft pt-9">
      <h2 id={`${id}-h`} className="font-display text-[30px] font-black tracking-[-0.025em]" style={{ fontStretch: "114%" }}>
        {title}
      </h2>
      <div className="prose-sg mt-4">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div className="container-page grid gap-10 pb-16 pt-10 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav aria-label="Legal sections" className="lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow">Legal</p>
        <ul className="mt-2 space-y-1 text-[14px]">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block border-l-[5px] border-transparent px-2.5 py-1 text-ink-2 hover:border-line hover:text-ink">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 space-y-10">
        <div>
          <Eyebrow className="mb-4">Trust</Eyebrow>
          <DisplayTitle as="h1" className="text-[52px] sm:text-[64px]">
            Legal<em>.</em>
          </DisplayTitle>
          <p className="one-line mt-4 text-ink-2">How SCRIPT//GO operates, in four pictures. The full text is below.</p>
          <div className="pcards pcards-4 mt-8 !gap-5">
            <PictureCard art={SCENES.stall} title="The creator sells." more={{ href: "#commerce", label: "Who sells, who charges" }}>
              Tebex takes the payment. SCRIPT//GO issues the licence.
            </PictureCard>
            <PictureCard art={SCENES.scales} title="Sellers declare, and answer." more={{ href: "#creator-agreement", label: "Creator agreement" }}>
              A declaration of rights puts an offer on sale. No pre-approval.
            </PictureCard>
            <PictureCard art={SCENES.watchtower} title="We act on reports." more={{ href: "#ip-policy", label: "IP policy" }}>
              Restrict, suspend or take down, with notice and appeal.
            </PictureCard>
            <PictureCard art={SCENES.strongbox} title="Protection has limits." more={{ href: "#protection", label: "Code protection" }}>
              Deterrence and traceability, not DRM. Server scripts only.
            </PictureCard>
          </div>
        </div>

        <Section id="operator" title="Operator">
          <p>
            Reports and requests go through the <Link href="/report">public report form</Link>.
          </p>
        </Section>

        <Section id="terms" title="Terms of service">
          <p>In short, the terms cover:</p>
          <ul>
            <li>Accounts, access tokens and acceptable use of the registry, the API and the licensing service.</li>
            <li>What SCRIPT//GO hosts, validates and displays, and what it does not guarantee.</li>
            <li>
              What SCRIPT//GO is for: creator-owned work. A creator owns the scripts they wrote and the content they made for
              them, and may license, protect and sell them. SCRIPT//GO does not sell, ship, decrypt or redistribute any game&rsquo;s
              own code or assets.
            </li>
            <li>
              Code protection as <a href="#protection">described below</a>: deterrence and traceability, not DRM, with no promise
              to stop all copying.
            </li>
            <li>
              What a buyer may do with a licensed package: run it on the servers the licence covers. Not copy it to other
              servers, not remove its delivery marker, not redistribute it.
            </li>
            <li>Suspension and restriction of listings, with notices, reasons and an appeal path.</li>
          </ul>
        </Section>

        <Section id="privacy" title="Privacy policy">
          <p>What we keep, and why:</p>
          <ul>
            <li>
              Account data (email, display name), session cookies used for sign-in, and personal access tokens (stored hashed).
            </li>
            <li>
              Licensing data: deployment names, environments, adapter versions and verification times recorded when your server
              calls the licensing API.
            </li>
            <li>
              Protection data: the public key your server registers for a deployment, a record of each content-key release or
              refusal with its reason, and the delivery marker tied to that licence and deployment. Staff can resolve a marker
              found in a leaked copy to a licence and a deployment; each lookup is recorded with its reason.
            </li>
            <li>Report data: reporter contact details and evidence, shared with moderators and, where required, with the creator.</li>
            <li>Payment data: handled by the payment provider. SCRIPT//GO receives signed payment events, not card details.</li>
            <li>
              E-mail we send (report receipts and decisions, appeal outcomes, purchase confirmations, password resets): recipient,
              subject and text are kept with their delivery status, and handed to the e-mail delivery provider to send. Password reset
              and confirmation links are removed from our copy once delivered. Purchase e-mails never contain a license key.
            </li>
          </ul>
        </Section>

        <Section id="ip-policy" title="IP policy">
          <p>How a report is handled:</p>
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
          <p>
            <strong>A game&rsquo;s intellectual property is not ours to sell, and not a creator&rsquo;s.</strong> A package holds
            what its creator wrote and made. It does not hold a game&rsquo;s code, models, textures, audio, maps or other files,
            whether plain or encrypted. A script written for a platform built on a commercial game stays its author&rsquo;s work;
            the game stays its publisher&rsquo;s.
          </p>
          <p>
            <strong>Sellers declare their rights and answer for what they sell.</strong> An offer with a declaration is on sale.
            SCRIPT//GO does not pre-approve offers or stores: it acts on reports, and can restrict, suspend or take down a
            listing, with a notice to its creator and a right of appeal. A script is sold as a SCRIPT//GO script that runs on
            the environments it declares. Where a platform&rsquo;s own rights holder has a rule about paid mods, that rule is
            noted on the platform&rsquo;s page, and whoever runs a script there answers for following it.
          </p>
          <p>
            Encryption never shields a package from this process. A report against an encrypted release is handled like any
            other, and a decision applies to it in the same way.
          </p>
        </Section>

        <Section id="protection" title="Code protection and escrow">
          <p>
            SCRIPT//GO offers three protections for creator-owned work: every published release is signed, a paid package checks
            a licence per server, and a creator may publish a release encrypted (escrow).
          </p>
          <p>
            <strong>What we provide.</strong>
          </p>
          <ul>
            <li>An encrypted release is encrypted at rest and in transit.</li>
            <li>Its key is never shipped with the file. SCRIPT//GO holds it sealed and does not show it to anyone.</li>
            <li>
              The key is released only to a licensed server, wrapped to a key that server holds. A copy of the files on another
              server does not open.
            </li>
            <li>
              A refund, a lost payment dispute, an ended subscription or a revocation stops the next key release. A server that is
              already running stops when its offline grace ends.
            </li>
            <li>Releases are signed, so a modified file is detected.</li>
            <li>Each delivery is marked, so a leaked copy can be traced to the licence and the deployment it was delivered to.</li>
          </ul>
          <p>
            <strong>What we do not promise.</strong>
          </p>
          <ul>
            <li>
              This is deterrence and traceability. It is not digital rights management, and SCRIPT//GO does not promise to stop
              all copying or theft.
            </li>
            <li>
              Whoever operates a machine that decrypts and runs code can inspect that machine. Defeating the protection takes real
              effort and leaves traces; it is not impossible.
            </li>
            <li>
              On a host that runs plain script, the operator can read what the host loads. There the protection is the licence
              check and the signature, and no code secrecy is claimed.
            </li>
            <li>SCRIPT//GO does not obfuscate code. Obfuscation is at most a speed bump.</li>
            <li>A delivery marker shows where a copy was delivered. It does not by itself establish who disclosed it.</li>
            <li>
              Availability of the key service is not guaranteed without interruption. The offline grace exists so that a short
              outage does not stop a licensed server.
            </li>
          </ul>
          <p>
            <strong>What protection is for.</strong> It protects the creator&rsquo;s own scripts and the content derived from
            them. It must not be used to hide content the creator has no right to distribute, and it never applies to a
            game&rsquo;s own files, which do not belong in a package.
          </p>
          <p>
            <strong>Who can read a protected release.</strong> SCRIPT//GO checks a protected release when it is uploaded, as it
            checks any release, and its staff can read it when a report is being reviewed: a moderation decision must rest on
            what the package contains. Each such access is recorded. The creator can download their own plain archive. A
            buyer never can.
          </p>
          <p>
            <Link href="/protect">How protection works, in plain words</Link>.
          </p>
        </Section>

        <Section id="creator-agreement" title="Creator agreement">
          <p>In short, the agreement covers:</p>
          <ul>
            <li>The rights declaration you make for each release, and its accuracy.</li>
            <li>
              What you warrant for each release: that you wrote the code or hold the rights to distribute and sell it; that it
              contains no code or assets of a game or of a third party beyond what you declared and are licensed to include; that
              an encrypted release holds the same kind of content you could publish in the clear; and that you may grant your
              buyers the licence you sell.
            </li>
            <li>
              Ownership stays with you. Publishing, protecting or selling a package through SCRIPT//GO transfers no ownership of
              your work to SCRIPT//GO, and gives you no right in the game or platform it runs on.
            </li>
            <li>
              For an encrypted release, SCRIPT//GO holds the content key sealed and, when it builds the bundle for you, a signing
              key in your name. Both are used only to deliver and verify your releases.
            </li>
            <li>Immutability of published releases: a published version can&rsquo;t be changed, only deprecated or yanked.</li>
            <li>
              Your declaration of rights on each release, which is what puts an offer on sale. SCRIPT//GO does not pre-approve
              offers or stores; it acts on reports, with notice and appeal.
            </li>
            <li>Your relationship with your payment provider, which is yours.</li>
          </ul>
        </Section>

        <Section id="commerce" title="Who sells, who charges, who licenses">
          <p>Every purchase surface on SCRIPT//GO names three parties:</p>
          <ul>
            <li>
              <strong>The creator sells.</strong> They set their offers and connect their own store.
            </li>
            <li>
              <strong>The payment provider charges</strong> (for example Tebex). SCRIPT//GO
              has no partnership with, or endorsement from, any provider or engine.
            </li>
            <li>
              <strong>SCRIPT//GO issues the license</strong>, only after a verified, signed payment event or an audited administrative
              grant. Never on a browser redirect alone.
            </li>
          </ul>
          <p>
            Anyone can open a shop, on their own Tebex store, and it works as soon as its Tebex configuration is complete. Real
            checkout opens for every shop once Tebex approves it in writing.
          </p>
          <p>
            What is sold is always the creator&rsquo;s own work: a script, or a feature of the seller&rsquo;s own server script, such
            as a monthly pass that unlocks it. Never a game, its content, or access to it.
          </p>
        </Section>
      </div>
    </div>
  );
}
