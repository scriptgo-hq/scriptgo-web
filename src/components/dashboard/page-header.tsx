import { Eyebrow } from "@/components/ui/typography";

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  eyebrow?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  return (
    <div className="mb-9 border-b-[3px] border-line pb-6">
      {breadcrumb}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-5">
        <div className="min-w-0">
          {eyebrow ? <Eyebrow className="mb-3.5">{eyebrow}</Eyebrow> : null}
          <h1 className="display text-[34px] sm:text-[46px]">{title}</h1>
          {description ? <div className="mt-2 max-w-[70ch] text-[15px] text-ink-2">{description}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-4 pb-1 pr-1.5">{actions}</div> : null}
      </div>
    </div>
  );
}
