"use client";

import { cn } from "@/lib/cn";

/** A native select that submits its form on change (the form still has an explicit submit button). */
export function AutoSubmitSelect({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...rest}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className={cn(
        "h-10 appearance-none border-[2.5px] border-line bg-surface bg-[length:14px] bg-[right_12px_center] bg-no-repeat pl-4 pr-9 text-[14px] font-semibold",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23635d52' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    >
      {children}
    </select>
  );
}

export function AutoSubmitCheckbox({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...rest}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className={cn("h-4 w-4 accent-[var(--cobalt)]", className)}
    />
  );
}
