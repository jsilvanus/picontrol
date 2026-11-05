/**
 * Access for the picontrol UI through the pigateway UI listener (PIGATEWAY_UI_PORT / _RELAY_PORT):
 * - PIN login: session cookie from the listener; auth-modal-overlay shows until the session exists.
 * - Module toggles: which modules are shown. Build-time VITE_PICONTROL_MODULES, overridable per browser
 *   with localStorage key "picontrol.modules" (a comma list). Disabled modules are hidden, not removed.
 * - Credentials: requests to the UI listener base are sent with the session cookie.
 *
 * Module names match piecosystem repo names (e.g. pimatrix, pivoice, piencoder, pitube, pisound, pitally).
 * Every access step is wrapped: a browser without storage or with blocked cookies still gets the page.
 */

/** Maps UI tabs to the module toggle keys that can enable them. */
export const TAB_MODULE_MAP: Record<string, string[]> = {
  outputs:  ["pimatrix", "outputs"],
  inputs:   ["pimatrix", "matrix"],
  sound:    ["pisound"],
  cameras:  ["picam", "cameras", "pispace"],
  youtube:  ["pitube"],
  tally:    ["pitally"],
  voice:    ["pivoice"],
  radio:    ["radio", "radioRelay"],
  renderer: ["piprogram"],
  status:   [],
};

/** Maps a piecosystem repo name to the UI tabs it controls (kept for backward compatibility). */
export const MODULE_TABS: Record<string, string[]> = {
  pimatrix:    ["inputs", "outputs"],
  matrix:      ["inputs"],
  outputs:     ["outputs"],
  pivoice:     ["voice"],
  piencoder:   [],
  pitube:      ["youtube"],
  pisound:     ["sound"],
  pitally:     ["tally"],
  piprogram:   ["renderer"],
  picam:       ["cameras"],
  cameras:     ["cameras"],
  pispace:     ["cameras"],
  radio:       ["radio"],
  radioRelay:  ["radio"],
};

const DEFAULT_MODULES = "pimatrix,pivoice,piencoder,pitube";
const STORAGE_KEY = "picontrol.modules";

export function enabledModules(): Set<string> {
  let raw: string | undefined;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    raw = undefined;
  }
  if (!raw) {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    raw = env?.VITE_PICONTROL_MODULES ?? DEFAULT_MODULES;
  }
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
}

/** Fetches the server-side module toggle list from the gateway. Returns null when not restricted. */
export async function fetchServerModules(base: string): Promise<string[] | null> {
  try {
    const res = await fetch(`${base}/api/v1/ui/modules`);
    if (!res.ok) return null;
    const data = (await res.json()) as { modules: string[] | null; restricted: boolean };
    return data.restricted ? data.modules : null;
  } catch {
    return null;
  }
}

/** Hides the tabs, bottom nav buttons, and more tiles of modules that are not enabled. */
export function applyModuleVisibility(serverModules?: string[] | null, isOutsideLan = false): void {
  const local = enabledModules();
  const effective = serverModules != null ? new Set(serverModules) : local;

  for (const [tab, moduleKeys] of Object.entries(TAB_MODULE_MAP)) {
    const show = tab === "status" || moduleKeys.some((m) => effective.has(m));

    // 1. Hide/show section panel
    const panel = document.getElementById(`tab-${tab}`);
    if (panel) panel.style.display = show ? "" : "none";

    // 2. Hide/show bottom navigation item
    const nav = document.getElementById(`nav-${tab}`);
    if (nav) nav.style.display = show ? "flex" : "none";

    // 3. Hide/show items in More modal or other data-tab containers
    document.querySelectorAll<HTMLElement>(`[data-tab="${tab}"]`).forEach((el) => {
      if (el !== nav) {
        el.style.display = show ? "" : "none";
      }
    });
  }

  // Multiview is strictly hidden when accessing over internet (outside LAN) or when pimatrix is disabled
  const showMultiview = !isOutsideLan && (effective.has("pimatrix") || effective.has("outputs"));
  const topMv = document.getElementById("top-multiview-btn");
  if (topMv) topMv.style.display = showMultiview ? "inline-flex" : "none";
  const moreMv = document.getElementById("more-tile-multiview");
  if (moreMv) moreMv.style.display = showMultiview ? "" : "none";

  // Fast Sound button in header
  const topSound = document.getElementById("top-sound-btn");
  if (topSound) topSound.style.display = effective.has("pisound") ? "inline-flex" : "none";
}

/**
 * Picks the backend for this page. The LAN API (same origin through the Pi's nginx, or the given base) is tried
 * first: an answer of 200 or 401 means it is reachable (401 = the PIN is needed). A 403, a network error or a
 * timeout means outside the LAN, so the relay base (VITE_RELAY_URL) is used. With no relay base, the LAN is used.
 */
export async function chooseUiBackend(lanBase: string, relayBase: string): Promise<string> {
  if (!relayBase) return lanBase;
  try {
    const res = await fetch(`${lanBase}/api/v1/matrix`, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(1500) });
    return res.status === 200 || res.status === 401 ? lanBase : relayBase;
  } catch {
    return relayBase;
  }
}

/** Sends the session cookie with every request to the UI listener base URL. */
export function installCredentialedFetch(base: string): void {
  if (!base || typeof window === "undefined") return;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const absolute = url.startsWith("/") ? new URL(url, window.location.href).href : url;
    if (absolute.startsWith(base)) return original(input, { credentials: "include", ...init });
    return original(input, init);
  };
}

export type PinPromptFn = (base: string, mandatory: boolean) => Promise<{ role: string } | null>;

let pinPromptHandler: PinPromptFn | null = null;

export function registerPinPromptHandler(handler: PinPromptFn): void {
  pinPromptHandler = handler;
}

let activeSessionPromise: Promise<{ role: string } | null> | null = null;

/** Resolves once a session exists; invokes the pin prompt modal until then. */
export async function ensureUiSession(base: string): Promise<{ role: string } | null> {
  if (!base) return { role: "local" };
  const check = async (): Promise<{ role: string } | null> => {
    try {
      const res = await fetch(`${base}/ui/api/session`, { credentials: "include" });
      return res.ok ? ((await res.json()) as { role: string }) : null;
    } catch {
      return null;
    }
  };
  const existing = await check();
  if (existing) return existing;
  if (activeSessionPromise) return activeSessionPromise;

  if (pinPromptHandler) {
    activeSessionPromise = pinPromptHandler(base, true).finally(() => {
      activeSessionPromise = null;
    });
    return activeSessionPromise;
  }

  return null;
}
