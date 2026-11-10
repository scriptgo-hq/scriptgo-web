import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "sun" | "danger" | "ink";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Slanted slab, printed in two plates (the face and its offset). The look lives in globals.css
 * (`.btn`): the slab is drawn behind the label, so the text itself stays upright.
 */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn("btn", `btn-${variant}`, size !== "md" && `btn-${size}`, className);
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
