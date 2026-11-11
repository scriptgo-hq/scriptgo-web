/** What every guide shares: the CLI install line, the API host, and the shape of a guide. */

/**
 * How to install the CLI, in one place so it can be corrected without touching the guides. The SDK
 * release attaches the CLI tarball; the CLI's default API is production, so no `--api` flag.
 */
export const CLI_INSTALL = {
  node: "22",
  command: "npm install -g https://github.com/scriptgo-hq/scriptgo-sdk/releases/download/v0.1.6/scriptgo-cli-0.1.6.tgz",
  login: "scriptgo login --token <your token>",
} as const;

/** The production API host a game server talks to (and the operator allows). */
export const API_HOST = "api.scriptgo.dev";

export interface GuideImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** A real screen of the dashboard, or a drawing where the step has no screen. */
  kind: "screen" | "scene";
  caption?: string;
}

export interface GuideCode {
  lang: "lua" | "bash" | "json";
  filename: string;
  code: string;
}

export interface GuideLink {
  href: string;
  label: string;
}

export interface GuideStep {
  id: string;
  title: string;
  /** One or two sentences. `backticks` are shown as inline code. */
  text: string;
  /** Who acts at this step, when the track changes hands (the buyer of a script). */
  who?: string;
  commands?: string[];
  code?: GuideCode[];
  /** Short one-line facts under the text. */
  notes?: string[];
  images: GuideImage[];
  link?: GuideLink;
}

export interface GuideTrack {
  id: string;
  tag: string;
  title: string;
  titleEm: string;
  lede: string;
  /** Conditions that hold for the whole track, said once. */
  before?: string[];
  steps: GuideStep[];
}

export interface Guide {
  slug: string;
  /** The environment's name, used when the API cannot be reached. */
  name: string;
  title: string;
  titleEm: string;
  lede: string;
  /** Said once, near the top. */
  notLive: { title: string; text: string };
  tracks: GuideTrack[];
  more: GuideLink[];
}
