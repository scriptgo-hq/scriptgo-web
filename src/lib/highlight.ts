import { createHighlighterCore, type HighlighterCore, type ThemeRegistration } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/**
 * Restrained brand palette on the ink code surface (used in both themes):
 * keywords cobalt-light, strings sun, numbers green, comments warm grey.
 */
const theme: ThemeRegistration = {
  name: "scriptgo",
  type: "dark",
  colors: { "editor.background": "#15130f", "editor.foreground": "#f4eee2" },
  settings: [],
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#a39b8b", fontStyle: "italic" } },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "keyword.control",
        "keyword.operator.logical",
        "keyword.operator.new",
        "constant.language.nil",
      ],
      settings: { foreground: "#a8b0ff" },
    },
    {
      scope: ["string", "string.quoted", "punctuation.definition.string", "string.unquoted"],
      settings: { foreground: "#ffd36b" },
    },
    { scope: ["constant.numeric", "constant.language", "constant.language.boolean"], settings: { foreground: "#86e0a6" } },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call.generic", "support.function.builtin"],
      settings: { foreground: "#ffffff" },
    },
    { scope: ["variable.parameter", "variable.other.constant"], settings: { foreground: "#f5c9a6" } },
    {
      scope: ["support.type.property-name", "meta.object-literal.key", "entity.name.tag", "entity.other.attribute-name"],
      settings: { foreground: "#b9dcff" },
    },
    { scope: ["punctuation", "keyword.operator", "meta.brace"], settings: { foreground: "#cfc7b7" } },
    { scope: ["entity.name.type", "support.type", "support.class"], settings: { foreground: "#ffb38a" } },
    { scope: ["markup.heading", "entity.name.section"], settings: { foreground: "#ffd36b", fontStyle: "bold" } },
  ],
};

const LANG_ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  console: "bash",
  zsh: "bash",
  ts: "typescript",
  tsx: "typescript",
  js: "typescript",
  javascript: "typescript",
  jsonc: "json",
  toml: "ini",
  conf: "ini",
  cs: "csharp",
  "c#": "csharp",
};

let instance: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  instance ??= createHighlighterCore({
    themes: [theme],
    langs: [
      import("shiki/langs/lua.mjs"),
      import("shiki/langs/bash.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/langs/typescript.mjs"),
      import("shiki/langs/http.mjs"),
      import("shiki/langs/ini.mjs"),
      import("shiki/langs/csharp.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return instance;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Highlight to an HTML `<pre>` string. Unknown languages render as escaped plain text. */
export async function highlight(code: string, lang?: string | null): Promise<string> {
  const raw = (lang ?? "").toLowerCase();
  const l = LANG_ALIASES[raw] ?? raw;
  const text = code.replace(/\n+$/, "");
  try {
    const h = await getHighlighter();
    if (l && h.getLoadedLanguages().includes(l)) {
      return h.codeToHtml(text, { lang: l, theme: "scriptgo" });
    }
  } catch {
    // Fall through to plain text; highlighting is cosmetic.
  }
  return `<pre class="shiki"><code>${escapeHtml(text)}</code></pre>`;
}
