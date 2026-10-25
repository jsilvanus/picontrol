// ATEM view of the Video page: an input row that works in preview/program mode
// (green = preview, red = program), FTB / CUT / AUTO, and DSK tie / on air.
// Everything goes through the pimatrix ATEM API; nothing is sent until a button is pressed.

export interface AtemState {
  connected: boolean;
  programInput: number | null;
  previewInput: number | null;
  transition: { inTransition: boolean; remainingFrames: number };
  fadeToBlack: { fullyBlack: boolean; inTransition: boolean; remainingFrames: number };
  downstreamKeyers: Array<{ dsk: number; onAir: boolean; tie: boolean; inTransition: boolean }>;
}

const POLL_MS = 1000;
const INPUTS = [1, 2, 3] as const;

let state: AtemState | null = null;
let selectedDsk = 1;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let toast: (message: string) => void = () => undefined;

function byId(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function setClass(id: string, base: string, extra: string[]): void {
  const el = byId(id);
  if (!el) return;
  el.className = [base, ...extra].filter(Boolean).join(" ");
}

export function renderAtem(): void {
  const connected = state?.connected === true;
  const status = byId("atem-status");
  if (status) {
    status.textContent = !state
      ? "Connecting..."
      : connected
        ? `PGM ${state.programInput ?? "-"} • PVW ${state.previewInput ?? "-"}`
        : "Offline";
  }

  for (const input of INPUTS) {
    const classes: string[] = [];
    if (connected && state?.programInput === input) classes.push("atem-pgm");
    else if (connected && state?.previewInput === input) classes.push("atem-pvw");
    setClass(`atem-in-${input}`, "atem-btn", classes);
  }

  const ftb = state?.fadeToBlack;
  setClass("atem-ftb", "atem-btn atem-btn-text", ftb?.fullyBlack || ftb?.inTransition ? ["atem-pgm", ftb.inTransition ? "atem-pulse" : ""] : []);
  setClass("atem-auto", "atem-btn atem-btn-text", state?.transition.inTransition ? ["atem-pgm", "atem-pulse"] : []);
  setClass("atem-cut", "atem-btn atem-btn-text", []);

  const selected = state?.downstreamKeyers.find((k) => k.dsk === selectedDsk);
  for (const dsk of [1, 2]) {
    const keyer = state?.downstreamKeyers.find((k) => k.dsk === dsk);
    setClass(`atem-dsk-${dsk}`, "atem-btn atem-dsk", [dsk === selectedDsk ? "atem-selected" : "", keyer?.onAir ? "atem-pgm" : ""]);
  }
  setClass("atem-tie", "atem-btn atem-btn-text", selected?.tie ? ["atem-tie"] : []);
  setClass("atem-onair", "atem-btn atem-btn-text", selected?.onAir ? ["atem-pgm"] : []);

  for (const id of ["atem-in-1", "atem-in-2", "atem-in-3", "atem-ftb", "atem-cut", "atem-auto", "atem-dsk-1", "atem-dsk-2", "atem-tie", "atem-onair"]) {
    (byId(id) as HTMLButtonElement | null)?.toggleAttribute("disabled", !connected);
  }
}

async function call(method: "GET" | "POST" | "PUT", path: string, body?: unknown): Promise<AtemState | null> {
  try {
    const init: RequestInit = { method };
    if (method !== "GET") {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(body ?? {});
    }
    const res = await fetch(path, init);
    if (res.status === 503) {
      state = { connected: false, programInput: null, previewInput: null, transition: { inTransition: false, remainingFrames: 0 }, fadeToBlack: { fullyBlack: false, inTransition: false, remainingFrames: 0 }, downstreamKeyers: [] };
      renderAtem();
      if (method !== "GET") toast("ATEM is not connected");
      return null;
    }
    if (!res.ok) {
      if (method !== "GET") toast(`ATEM command failed (${res.status})`);
      return null;
    }
    state = (await res.json()) as AtemState;
    renderAtem();
    return state;
  } catch {
    if (method !== "GET") toast("ATEM request failed");
    return null;
  }
}

export function refreshAtem(): Promise<AtemState | null> {
  return call("GET", "/api/v1/atem");
}

/** Polls while the ATEM view is on screen. */
export function setAtemActive(active: boolean): void {
  if (!active) {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    return;
  }
  if (pollTimer) return;
  void refreshAtem();
  pollTimer = setInterval(() => {
    if (!document.hidden) void refreshAtem();
  }, POLL_MS);
}

export function initAtemView(showToast: (message: string) => void): void {
  toast = showToast;
  window.atemSelectInput = async (input) => {
    await call("PUT", "/api/v1/atem/preview", { input });
  };
  window.atemCut = async () => {
    await call("POST", "/api/v1/atem/cut");
  };
  window.atemAuto = async () => {
    await call("POST", "/api/v1/atem/auto");
  };
  window.atemFtb = async () => {
    await call("POST", "/api/v1/atem/ftb");
  };
  window.atemSelectDsk = (dsk) => {
    selectedDsk = dsk;
    renderAtem();
  };
  window.atemToggleTie = async () => {
    const current = state?.downstreamKeyers.find((k) => k.dsk === selectedDsk);
    await call("PUT", `/api/v1/atem/dsk/${selectedDsk}/tie`, { tie: !(current?.tie ?? false) });
  };
  window.atemToggleOnAir = async () => {
    const current = state?.downstreamKeyers.find((k) => k.dsk === selectedDsk);
    await call("PUT", `/api/v1/atem/dsk/${selectedDsk}/on-air`, { onAir: !(current?.onAir ?? false) });
  };
  renderAtem();
}
