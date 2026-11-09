import { Marked, type Token, type Tokens } from "marked";
import { envName } from "./env";
import { escapeHtml, highlight } from "./highlight";

export interface Heading {
  id: string;
  text: string;
  depth: number;
}

export interface RenderedMarkdown {
  html: string;
  headings: Heading[];
}

/** Our own generated HTML (highlighted code, env groups) is marked trusted; everything else is escaped. */
type TrustedHtml = Tokens.HTML & { sgTrusted?: boolean };

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z#0-9]+;/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "section"
  );
}

function parseInfo(info: string | undefined): { lang: string; env: string | null; title: string | null } {
  const parts = (info ?? "").trim().split(/\s+/).filter(Boolean);
  const lang = parts[0] && !parts[0].includes("=") ? parts.shift()! : "";
  let env: string | null = null;
  let title: string | null = null;
  for (const p of parts) {
    const [k, ...v] = p.split("=");
    const value = v.join("=").replace(/^["']|["']$/g, "");
    if (k === "env") env = value;
    if (k === "title" || k === "file") title = value;
  }
  return { lang, env, title };
}

const COPY_ICON =
  '<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

async function codeHtml(code: string, lang: string, title: string | null, bare = false): Promise<string> {
  const inner = await highlight(code, lang);
  const head =
    `<div class="codeblock-head"><span class="truncate">${escapeHtml(title ?? (lang || "text"))}</span>` +
    `<button type="button" class="sg-copy" data-copy>${COPY_ICON}<span data-copy-label>Copy</span></button></div>`;
  return `<div class="codeblock${bare ? " codeblock-bare" : ""}" data-code>${head}${inner}</div>`;
}

function trusted(html: string): TrustedHtml {
  return { type: "html", raw: html, text: html, block: true, pre: false, sgTrusted: true };
}

/** Highlight code blocks and group consecutive `env=` blocks into synced tabs. */
async function transform(tokens: Token[]): Promise<Token[]> {
  const out: Token[] = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i]!;
    if (t.type === "code") {
      const info = parseInfo((t as Tokens.Code).lang);
      if (info.env) {
        const group: { env: string; lang: string; title: string | null; code: string }[] = [];
        let j = i;
        while (j < tokens.length) {
          const cur = tokens[j]!;
          if (cur.type === "space") {
            j++;
            continue;
          }
          if (cur.type !== "code") break;
          const ci = parseInfo((cur as Tokens.Code).lang);
          if (!ci.env) break;
          group.push({ env: ci.env, lang: ci.lang, title: ci.title, code: (cur as Tokens.Code).text });
          j++;
        }
        const tabs = group
          .map(
            (g, k) =>
              `<button type="button" role="tab" data-env-tab="${escapeHtml(g.env)}" aria-selected="${k === 0}" tabindex="${k === 0 ? 0 : -1}">${escapeHtml(envName(g.env))}</button>`,
          )
          .join("");
        const panels = (
          await Promise.all(
            group.map(
              async (g, k) =>
                `<div role="tabpanel" data-env-panel="${escapeHtml(g.env)}"${k === 0 ? "" : " hidden"}>${await codeHtml(g.code, g.lang, g.title, true)}</div>`,
            ),
          )
        ).join("");
        out.push(
          trusted(
            `<div class="env-group" data-env-group><div class="env-group-tabs" role="tablist" aria-label="Environment">${tabs}</div>${panels}</div>`,
          ),
        );
        i = j;
        continue;
      }
      out.push(trusted(await codeHtml((t as Tokens.Code).text, info.lang, info.title)));
      i++;
      continue;
    }
    if (t.type === "blockquote" || t.type === "list") {
      const nested = t as Tokens.Blockquote | Tokens.List;
      if (nested.type === "blockquote") {
        nested.tokens = await transform(nested.tokens);
      } else {
        for (const item of nested.items) item.tokens = await transform(item.tokens);
      }
    }
    out.push(t);
    i++;
  }
  return out;
}

function safeHref(href: string, allowRelative: boolean): string | null {
  const h = href.trim();
  if (/^(https?:|mailto:)/i.test(h)) return h;
  if (allowRelative && /^(\/|#|\.\/|\.\.\/)/.test(h)) return h;
  if (/^#/.test(h)) return h;
  return null;
}

/**
 * Render Markdown to HTML.
 * - `trusted: false` (READMEs from creators): raw HTML is escaped, links limited to http(s)/mailto/#,
 *   images limited to https and loaded without a referrer.
 * - `trusted: true` (our docs and specs): raw HTML allowed, relative links allowed.
 */
export async function renderMarkdown(source: string, opts: { trusted?: boolean; stripTitle?: boolean } = {}): Promise<RenderedMarkdown> {
  const isTrusted = opts.trusted ?? false;
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  const md = new Marked({ gfm: true, breaks: false });

  md.use({
    renderer: {
      html(token) {
        const t = token as TrustedHtml;
        if (t.sgTrusted || isTrusted) return t.text;
        return escapeHtml(t.text);
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const plain = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        let id = slugify(plain);
        const n = used.get(id) ?? 0;
        used.set(id, n + 1);
        if (n > 0) id = `${id}-${n}`;
        if (depth === 2 || depth === 3) headings.push({ id, text: plain, depth });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const safe = safeHref(href, isTrusted || true);
        if (!safe) return text;
        const external = /^https?:/i.test(safe);
        const rel = external ? ` rel="${isTrusted ? "noopener" : "nofollow noopener ugc"}"` : "";
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(safe)}"${t}${rel}>${text}</a>`;
      },
      image({ href, title, text }) {
        const safe = /^https:/i.test(href) || (isTrusted && /^\//.test(href)) ? href : null;
        if (!safe) return escapeHtml(text);
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        return `<img src="${escapeHtml(safe)}" alt="${escapeHtml(text)}"${t} loading="lazy" referrerpolicy="no-referrer" />`;
      },
      blockquote({ tokens }) {
        const body = this.parser.parse(tokens);
        const m = /^<p>\[!(NOTE|WARNING|CAPABILITY)\][ \t]*([^\n<]*)(\n|<\/p>\n?)/.exec(body);
        if (!m) return `<blockquote>${body}</blockquote>\n`;
        const kind = m[1]!.toLowerCase();
        const arg = m[2]!.trim();
        let rest = body.slice(m[0].length);
        if (m[3] === "\n") rest = `<p>${rest}`;
        const title =
          kind === "capability"
            ? `Requires capability <code>${escapeHtml(arg || "?")}</code>`
            : kind === "warning"
              ? "Warning"
              : "Note";
        const role = kind === "warning" ? ' role="note"' : ' role="note"';
        return `<div class="callout callout-${kind}"${role}><p class="callout-title">${title}</p>${rest}</div>\n`;
      },
    },
  });

  let src = source.replace(/\r\n/g, "\n");
  if (opts.stripTitle) src = src.replace(/^\s*#\s+[^\n]+\n/, "");
  const tokens = md.lexer(src);
  const transformed = await transform(tokens);
  const list = Object.assign(transformed, { links: tokens.links });
  let html = md.parser(list);
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
  return { html, headings };
}

/** Front matter: `---\nkey: value\n---`. Values are plain strings. */
export function parseFrontMatter(source: string): { data: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!m) return { data: {}, body: source };
  const data: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]!] = kv[2]!.replace(/^["']|["']$/g, "");
  }
  return { data, body: source.slice(m[0].length) };
}

/** First fenced Lua block of a README (used by the home proof block). */
export function firstLuaBlock(markdown: string): string | null {
  const m = /```lua[^\n]*\n([\s\S]*?)```/.exec(markdown);
  return m ? m[1]!.replace(/\n+$/, "") : null;
}

/**
 * The README's example for the proof block: the first block marked `lua runnable` (the one
 * `scriptgo verify` runs next to the package in every environment), else the first Lua block.
 */
export function readmeExample(markdown: string): { code: string; runnable: boolean } | null {
  const text = markdown.replace(/\r\n/g, "\n");
  const re = /^(`{3,}|~{3,})[ \t]*lua\b([^\n]*)\n([\s\S]*?)^\1[ \t]*$/gm;
  for (const m of text.matchAll(re)) {
    if (/(^|\s)runnable(\s|$)/.test(m[2]!)) return { code: m[3]!.replace(/\n+$/, ""), runnable: true };
  }
  const first = firstLuaBlock(text);
  return first ? { code: first, runnable: false } : null;
}
