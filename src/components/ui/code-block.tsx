import { highlight } from "@/lib/highlight";
import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";

/** Highlighted code block on the ink surface, with filename and copy. Server component. */
export async function CodeBlock({
  code,
  lang = "lua",
  filename,
  copy = true,
  className,
  bare,
}: {
  code: string;
  lang?: string;
  filename?: string;
  copy?: boolean;
  className?: string;
  /** No outline/shadow (when nested in another framed surface). */
  bare?: boolean;
}) {
  const html = await highlight(code, lang);
  return (
    <div className={cn("codeblock", bare && "!rounded-none !border-0 !shadow-none", className)}>
      {filename || copy ? (
        <div className="codeblock-head">
          <span className="truncate">{filename ?? lang}</span>
          {copy ? <CopyButton text={code.replace(/\n+$/, "")} /> : null}
        </div>
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/** One-line CLI command with a `$` prompt and a copy button. */
export function CommandLine({ command, className }: { command: string; className?: string }) {
  return (
    <div className={cn("codeblock flex items-center gap-2 py-1.5 pl-3 pr-1.5", className)}>
      <code className="min-w-0 flex-1 whitespace-pre-wrap [overflow-wrap:anywhere] py-1 font-mono text-[13px]">
        <span aria-hidden="true" className="select-none text-[#a39b8b]">
          ${" "}
        </span>
        {command}
      </code>
      <CopyButton text={command} />
    </div>
  );
}

/** Plain terminal output (no highlighting), e.g. compatibility run logs. */
export function TerminalOutput({
  text,
  title,
  className,
  maxHeight = 320,
}: {
  text: string;
  title?: string;
  className?: string;
  maxHeight?: number;
}) {
  return (
    <div className={cn("codeblock", className)}>
      {title ? <div className="codeblock-head">{title}</div> : null}
      <pre className="whitespace-pre-wrap break-words" style={{ maxHeight, overflowY: "auto" }}>
        <code>{text}</code>
      </pre>
    </div>
  );
}
