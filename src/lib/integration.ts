import type { AdapterState, IntegrationType } from "./contract";
import type { StatusMeta } from "./status";

/**
 * Labels for how an environment runs packages (ADR-0022). The facts themselves (type, runtime,
 * summary, proof, blocker) come from /v1/environments, generated from the capability registry
 * and verification/reports; this module only names them.
 */
export const INTEGRATION_TYPES: Record<IntegrationType, { label: string; hint: string }> = {
  cli: { label: "Command-line host", hint: "The scriptgo CLI runs resources on a plain Lua interpreter." },
  library: { label: "Lua library", hint: "A Lua module the game loads and ticks from its own loop." },
  addon: { label: "Addon", hint: "An addon installed in the engine or game server." },
  mod: { label: "Mod", hint: "A regular mod enabled on the server." },
  plugin: { label: "Plugin", hint: "A plugin loaded by the host application or server." },
  program: { label: "Computer program", hint: "A program that runs on an in-game computer." },
  shim: { label: "Shim and pack target", hint: "The host already runs this resource shape; a shim maps ScriptGo.* onto its own API." },
  kit: { label: "Embedded host kit", hint: "A library an engine or server embeds and ticks." },
};

export function integrationTypeLabel(type: string): { label: string; hint: string } {
  return INTEGRATION_TYPES[type as IntegrationType] ?? { label: type, hint: "" };
}

/** Whether adapter code exists and whether a real run passed. Read from the repository, never declared. */
export const adapterMeta: Record<AdapterState, StatusMeta & { long: string }> = {
  verified: {
    label: "Real run passed",
    long: "Adapter written, and a real run passed",
    tone: "success",
    icon: "check",
    hint: "At least one package passed scriptgo verify in the real runtime.",
  },
  written: {
    label: "Adapter written",
    long: "Adapter written, awaiting a real run",
    tone: "info",
    icon: "hourglass",
    hint: "The adapter code exists and passes its own tests, but no run in the real runtime has passed yet.",
  },
  none: {
    label: "Not started",
    long: "Not started: no adapter code yet",
    tone: "muted",
    icon: "dashed",
    hint: "Planned. No adapter code has been written yet.",
  },
};

export function adapterMetaFor(state: string | null | undefined) {
  return adapterMeta[(state ?? "none") as AdapterState] ?? adapterMeta.none;
}

export function sidesLabel(sides: string[]): string {
  const server = sides.includes("server");
  const client = sides.includes("client");
  if (server && client) return "Server and client";
  if (server) return "Server only";
  if (client) return "Client only";
  return "Not declared";
}
