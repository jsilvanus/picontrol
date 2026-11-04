/**
 * Access for the picontrol UI through the pigateway UI listener (PIGATEWAY_UI_PORT / _RELAY_PORT):
 * - PIN login: a session cookie from the listener; a login screen shows until the session exists.
 * - Module toggles: which modules are shown. Build-time VITE_PICONTROL_MODULES, overridable per browser
 *   with localStorage key "picontrol.modules" (a comma list). Disabled modules are hidden, not removed.
 * - Credentials: requests to the UI listener base are sent with the session cookie.
 *
 * Every access step is wrapped: a browser without storage or with blocked cookies still gets the page.
 */

export const MODULE_TABS: Record<string, string[]> = {
  matrix: ["inputs"],
  outputs: ["outputs"],
  pivoice: ["voice"],
  piencoder: [],
  pitube: ["youtube"]
};

const DEFAULT_MODULES = "matrix,outputs,pivoice,piencoder,pitube";
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

/** Hides the tabs (and their "more" tiles) of modules that are not enabled. */
export function applyModuleVisibility(serverModules?: string[] | null): void {
  const local = enabledModules();
  const effective = serverModules != null ? new Set(serverModules) : local;
  for (const [module, tabs] of Object.entries(MODULE_TABS)) {
    const show = effective.has(module);
    for (const tab of tabs) {
      const panel = document.getElementById(`tab-${tab}`);
      if (panel) panel.style.display = show ? "" : "none";
      document.querySelectorAll<HTMLElement>(`[data-tab="${tab}"]`).forEach((el) => {
        el.style.display = show ? "" : "none";
      });
    }
  }
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

/** Resolves once a session exists; shows the PIN screen until then. */
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
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.style.cssText = "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:#111;color:#eee;font-family:sans-serif";
    overlay.innerHTML = `<form style="display:flex;flex-direction:column;gap:12px;min-width:240px">
      <label for="ui-pin">PIN</label>
      <input id="ui-pin" type="password" inputmode="numeric" autocomplete="one-time-code" style="padding:10px;font-size:18px" />
      <button type="submit" style="padding:10px;font-size:16px">Kirjaudu</button>
      <div id="ui-pin-error" style="color:#f88;min-height:1em"></div></form>`;
    document.body.appendChild(overlay);
    const form = overlay.querySelector("form") as HTMLFormElement;
    const input = overlay.querySelector("#ui-pin") as HTMLInputElement;
    const error = overlay.querySelector("#ui-pin-error") as HTMLElement;
    input.focus();
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const res = await fetch(`${base}/ui/api/login`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pin: input.value })
        });
        if (!res.ok) {
          error.textContent = "Väärä PIN";
          input.value = "";
          input.focus();
          return;
        }
        const body = (await res.json()) as { role: string };
        overlay.remove();
        resolve(body);
      } catch {
        error.textContent = "Yhteys ei onnistu";
      }
    });
  });
}
