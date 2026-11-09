import { DisplayTitle, Eyebrow } from "@/components/ui/typography";

export function AuthShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -right-[10%] top-[20%] -z-10 hidden h-[70%] w-[50%] bg-cobalt md:block"
        style={{ clipPath: "polygon(30% 0, 100% 10%, 100% 100%, 0 90%)" }}
      />
      <div className="container-page grid gap-10 py-12 md:grid-cols-[minmax(0,440px)_1fr]">
        <div className="sticker p-6 sm:p-8">
          <Eyebrow>{eyebrow}</Eyebrow>
          <DisplayTitle as="h1" className="mt-2 text-[40px]">
            {title}
          </DisplayTitle>
          <p className="mt-2 text-[15px] text-ink-2">{intro}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
