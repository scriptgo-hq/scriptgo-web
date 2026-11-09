import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "sun" | "danger" | "ink";
export type ButtonSize = "sm" | "md" | "lg";

const LIFT =
  "shadow-[3px_3px_0_0_var(--shadow)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--shadow)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--shadow)]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: `bg-cobalt text-on-cobalt border-line ${LIFT}`,
  secondary: `bg-surface text-ink border-line ${LIFT}`,
  sun: `bg-sun text-on-sun border-line ${LIFT}`,
  ink: "bg-ink text-paper border-line shadow-[3px_3px_0_0_var(--cobalt)] hover:-translate-x-px hover:-translate-y-px",
  ghost: "bg-transparent text-ink border-transparent hover:bg-surface-2",
  danger: "bg-surface text-bad border-bad hover:bg-bad-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[14.5px] gap-2 rounded-[10px]",
  lg: "h-12 px-5 text-[16px] gap-2 rounded-[12px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap border-2 font-bold transition-[transform,box-shadow,background-color] duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({
  href,
  variant,
  size,
  arrow,
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow ? <ArrowRight aria-hidden="true" size={size === "sm" ? 14 : 17} strokeWidth={2.5} /> : null}
    </Link>
  );
}

export function Button({
  variant,
  size,
  arrow,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow ? <ArrowRight aria-hidden="true" size={size === "sm" ? 14 : 17} strokeWidth={2.5} /> : null}
    </button>
  );
}
