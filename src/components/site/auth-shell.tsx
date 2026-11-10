/* eslint-disable @next/next/no-img-element */
import { Ridge, SCENES } from "@/components/site/ink";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";

export function AuthShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="page-head has-art g-night">
      <img className="page-head-art !object-[78%_40%]" src={SCENES.pass.src} width={SCENES.pass.width} height={SCENES.pass.height} alt="" decoding="async" />
      <div className="container-page grid gap-10 pb-10 pt-12 md:grid-cols-[minmax(0,460px)_1fr]">
        <div className="sticker p-6 sm:p-8">
          <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
          <DisplayTitle as="h1" className="!text-[40px]">
            {title}
          </DisplayTitle>
          <p className="mt-2 text-[15px] text-ink-2">{intro}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
      <Ridge from="transparent" to="ink" ink="cobalt" n={2} small className="relative z-[1]" />
    </div>
  );
}
