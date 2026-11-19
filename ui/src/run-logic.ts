// Pure helpers for the /run/<id> page (action lists made by the Canva "Go live" button). No DOM, no fetch.

export interface ActionListStep { action: string; params?: Record<string, unknown> }
export interface ActionListSummary {
  id: string;
  name: string;
  state: "ready" | "expired" | "used" | "running";
  singleUse: boolean;
  routesProjector: boolean;
  steps: ActionListStep[];
  expiresAt: string;
}

const RUN_PATH = /\/run\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;

/** The list id when the page was opened as .../run/<uuid> (also behind a path prefix such as /picontrol), else null. */
export function runIdFromPath(pathname: string): string | null {
  return RUN_PATH.exec(pathname)?.[1]?.toLowerCase() ?? null;
}

/**
 * Run at once only on the church network, for a fresh single-use list (decision 2026-11-18). Everything else waits
 * for a tap on Run. A list that is not ready never runs.
 */
export function shouldAutoRun(list: Pick<ActionListSummary, "state" | "singleUse">, outsideLan: boolean): boolean {
  return !outsideLan && list.singleUse && list.state === "ready";
}

/** The internet relay refuses a list that routes a projector (the gateway enforces it; this only explains it). */
export function blockedOnRelay(list: Pick<ActionListSummary, "routesProjector">, outsideLan: boolean): boolean {
  return outsideLan && list.routesProjector;
}

const asText = (v: unknown): string => String(v ?? "");

/** One line per step, in plain words. */
export function describeStep(step: ActionListStep): string {
  const p = step.params ?? {};
  switch (step.action) {
    case "pipgm:playlist-set": return `Set the playlist of ${asText(p.feed)}${p.name ? ` ("${asText(p.name)}")` : ""}`;
    case "pipgm:route": return `Send ${asText(p.feed)} to ${asText(p.output) === "pi2" ? "Pi 2" : "Pi 1"}`;
    case "matrix:route": return `Send Pi input ${asText(p.input)} to ${Number(p.output) === 1 ? "the left projector" : Number(p.output) === 2 ? "the right projector" : `output ${asText(p.output)}`}`;
    case "pipgm:control": return p.action === "gotoItem" ? `Show the first slide on ${asText(p.feed)}` : `${asText(p.action)} on ${asText(p.feed)}`;
    case "pipgm:ftb": return p.on ? `Fade ${asText(p.feed)} to black` : `Show the picture of ${asText(p.feed)}`;
    default: return step.action;
  }
}

/** A short explanation for a list that cannot be run, or null when it can. */
export function whyNotRunnable(list: Pick<ActionListSummary, "state">): string | null {
  if (list.state === "expired") return "This link has expired. Press Go live in Canva again.";
  if (list.state === "used") return "This link has already been used. Press Go live in Canva again.";
  if (list.state === "running") return "The list is running now.";
  return null;
}
