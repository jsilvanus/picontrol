// Voice tab: pivoice controls (capture, transcription, web radio and captions) in the picontrol UI.
// Talks to pivoice's /api/v1 with a Bearer token. The base comes from ?voice=, VITE_PIVOICE_URL or
// "/voice" (same origin, behind a proxy). pivoice sends no CORS headers, so cross-origin use does not work.

type Mode = "on" | "off" | "auto";
type Section = "auditor" | "radio" | "relay" | "youtube";

interface VoiceStatus {
  capture: { mode: string; running: boolean; state: string; restarts: number; lastError: string | null };
  transcription: {
    configured: boolean; busy: boolean; queued: number; processed: number; dropped: number;
    failed: number; lagMs: number | null; lastError: string | null; mode: Mode;
  };
  voice: { open: boolean; lastVoiceMs: number | null };
}

interface RadioTarget { id: string; mode: Mode; [key: string]: unknown }

interface VoiceConfig {
  radio?: { targets?: RadioTarget[] };
  auditor?: { mode?: Mode };
  captions?: { relay?: { mode?: Mode }; youtube?: { mode?: Mode } };
}

const MODES: Mode[] = ["on", "off", "auto"];
const MODE_LABEL: Record<Mode, string> = { on: "On", off: "Off", auto: "Auto" };
const TOKEN_KEY = "picontrol.pivoiceToken";
const POLL_MS = 2000;

const SECTIONS: { section: Section; title: string; hint: string }[] = [
  { section: "auditor", title: "Transcription", hint: "auto: only chunks with speech" },
  { section: "radio", title: "Web radio", hint: "all targets" },
  { section: "relay", title: "Captions to relay", hint: "web-radio-relay" },
  { section: "youtube", title: "Captions to YouTube", hint: "auto: while the stream is online" },
];

const base = resolveVoiceBase();
let root: HTMLElement | null = null;
let timer: number | undefined;
let busy = false;
let message = "";

export function resolveVoiceBase(search: string = window.location.search): string {
  const fromQuery = new URLSearchParams(search).get("voice");
  const fromEnv = import.meta.env.VITE_PIVOICE_URL as string | undefined;
  return (fromQuery ?? fromEnv ?? "/voice").replace(/\/+$/, "");
}

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeToken(value: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, value);
  } catch {
    // Private windows can block storage; the token then lasts for this page only.
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${readToken()}` };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(res.status === 401 ? "Token rejected" : `pivoice answered ${res.status}`);
  return (await res.json()) as T;
}

function modeButtons(section: Section, current: Mode | undefined): string {
  return MODES.map(mode => {
    const active = mode === current;
    const style = active
      ? "bg-primary text-on-primary shadow-sm"
      : "text-on-surface-variant bg-surface-container-highest";
    return `<button type="button" data-action="mode" data-section="${section}" data-value="${mode}" ` +
      `class="flex-1 px-2 py-2 rounded-lg font-label-sm text-label-sm uppercase font-bold ${style}" ` +
      `${busy ? "disabled" : ""}>${MODE_LABEL[mode]}</button>`;
  }).join("");
}

function render(status: VoiceStatus | null, config: VoiceConfig | null, error: string): void {
  if (!root) return;
  const radioMode = config?.radio?.targets?.[0]?.mode;
  const modes: Partial<Record<Section, Mode | undefined>> = {
    auditor: config?.auditor?.mode ?? status?.transcription.mode,
    radio: radioMode,
    relay: config?.captions?.relay?.mode,
    youtube: config?.captions?.youtube?.mode,
  };
  const running = status?.capture.running ?? false;

  const statusBlock = status
    ? `<dl class="grid grid-cols-2 gap-x-4 gap-y-2 font-body-md text-body-md">
        <dt class="text-on-surface-variant">Capture</dt><dd class="font-bold">${escapeHtml(status.capture.state)} (${escapeHtml(status.capture.mode)})</dd>
        <dt class="text-on-surface-variant">Voice detected</dt><dd class="font-bold">${status.voice.open ? "yes" : "no"}</dd>
        <dt class="text-on-surface-variant">Transcription</dt><dd class="font-bold">${status.transcription.configured ? (status.transcription.busy ? "busy" : "idle") : "not configured"}</dd>
        <dt class="text-on-surface-variant">Queue</dt><dd class="font-bold">${status.transcription.queued} / ${status.transcription.processed} done, ${status.transcription.dropped} dropped</dd>
        <dt class="text-on-surface-variant">Lag</dt><dd class="font-bold">${status.transcription.lagMs ?? "-"} ms</dd>
        <dt class="text-on-surface-variant">Restarts</dt><dd class="font-bold">${status.capture.restarts}</dd>
      </dl>
      ${status.capture.lastError || status.transcription.lastError
        ? `<p class="text-error font-body-md text-body-md">${escapeHtml(status.capture.lastError ?? status.transcription.lastError)}</p>`
        : ""}`
    : `<p class="text-on-surface-variant font-body-md">${escapeHtml(error || "Waiting for pivoice…")}</p>`;

  const modeRows = SECTIONS.map(({ section, title, hint }) => `
    <div class="space-y-2">
      <div class="flex items-baseline justify-between">
        <span class="font-label-md text-label-md font-bold text-on-surface">${title}</span>
        <span class="font-label-sm text-label-sm text-on-surface-variant">${hint}</span>
      </div>
      <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">${modeButtons(section, modes[section])}</div>
    </div>`).join("");

  root.innerHTML = `
    <div class="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-space-md">
      <div class="flex items-center justify-between gap-3">
        <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Status</h2>
        <button type="button" data-action="${running ? "capture-stop" : "capture-start"}" ${busy ? "disabled" : ""}
          class="px-4 py-2 rounded-lg font-label-md text-label-md font-bold ${running ? "bg-error-container text-on-error-container" : "bg-primary text-on-primary"}">
          ${running ? "Stop capture" : "Start capture"}
        </button>
      </div>
      ${statusBlock}
    </div>
    <div class="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-space-md">
      <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Modes</h2>
      ${modeRows}
      ${message ? `<p class="font-label-sm text-label-sm text-on-surface-variant">${escapeHtml(message)}</p>` : ""}
    </div>
    <div class="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
      <label class="font-label-md text-label-md font-bold text-on-surface" for="voice-token">pivoice token</label>
      <div class="flex gap-2">
        <input id="voice-token" type="password" autocomplete="off" value="${escapeHtml(readToken())}"
          class="flex-1 px-3 py-2 rounded-lg bg-surface-container-highest text-on-surface font-body-md" />
        <button type="button" data-action="save-token" class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold">Save</button>
      </div>
      <p class="font-label-sm text-label-sm text-on-surface-variant">Kept for this browser session only. pivoice at ${escapeHtml(base || "this origin")}.</p>
    </div>`;
}

async function refresh(): Promise<void> {
  try {
    const [status, config] = await Promise.all([
      call<VoiceStatus>("GET", "/api/v1/status"),
      call<VoiceConfig>("GET", "/api/v1/config"),
    ]);
    render(status, config, "");
  } catch (err) {
    render(null, null, err instanceof Error ? err.message : "Cannot reach pivoice");
  }
}

async function run(action: () => Promise<unknown>, done: string): Promise<void> {
  busy = true;
  message = "";
  try {
    await action();
    message = done;
  } catch (err) {
    message = err instanceof Error ? err.message : "Request failed";
  } finally {
    busy = false;
    await refresh();
  }
}

async function setMode(section: Section, mode: Mode): Promise<void> {
  if (section === "auditor") {
    await call("PUT", "/api/v1/config", { auditor: { mode } });
  } else if (section === "radio") {
    const config = await call<VoiceConfig>("GET", "/api/v1/config");
    const targets = (config.radio?.targets ?? []).map(target => ({ ...target, mode }));
    if (targets.length === 0) throw new Error("No web radio targets are configured in pivoice.");
    await call("PUT", "/api/v1/config", { radio: { targets } });
  } else {
    await call("PUT", "/api/v1/config", { captions: { [section]: { mode } } });
  }
}

function onClick(event: Event): void {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target || busy) return;
  const action = target.dataset.action;
  if (action === "capture-start") void run(() => call("POST", "/api/v1/capture/start"), "Capture started");
  else if (action === "capture-stop") void run(() => call("POST", "/api/v1/capture/stop"), "Capture stopped");
  else if (action === "mode") {
    const section = target.dataset.section as Section;
    const mode = target.dataset.value as Mode;
    void run(() => setMode(section, mode), `${section} set to ${mode}`);
  } else if (action === "save-token") {
    const input = root?.querySelector<HTMLInputElement>("#voice-token");
    writeToken(input?.value.trim() ?? "");
    void run(async () => undefined, "Token saved");
  }
}

/** Mounts the voice tab into #voice-root. Safe to call once at startup. */
export function initVoiceTab(): void {
  root = document.getElementById("voice-root");
  if (!root) return;
  root.addEventListener("click", onClick);
}

/** Polls pivoice only while the Voice tab is visible. */
export function setVoiceTabActive(active: boolean): void {
  if (active && timer === undefined) {
    void refresh();
    timer = window.setInterval(() => void refresh(), POLL_MS);
  } else if (!active && timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
}
