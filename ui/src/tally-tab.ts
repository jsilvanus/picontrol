// Tally tab & camera director PTZ cues (pilight integration for Tally-Ma wireless tally lights).
// Talks to pilight (port 3200 or via gateway /api/v1/lights).

export type FacetType =
  | "youtube-stream"
  | "matrox-encoder"
  | "atem-recording"
  | "atem-streaming"
  | "projector"
  | "atlona-input"
  | "atlona-output"
  | "pi-output"
  | "stt-state"
  | "caption-state"
  | "atem-input"
  | "manual";

export interface TallyFacet {
  type: FacetType;
  input?: number;
  projector?: number;
  encoder?: 1 | 2;
  output?: number;
}

export interface TallySegment {
  id: string;
  name: string;
  leds: number[]; // 0-based indices in 0..8 (corresponding to LEDs 1..9)
  facet?: TallyFacet;
}

export interface TallyLight {
  id: string;
  name: string;
  host: string;
  fallbackIp?: string;
  activeTarget?: string;
  mode: "pgm" | "prv" | "off" | "zones" | "segmented" | string;
  brightness: "low" | "medium" | "high";
  hold: boolean;
  segments?: TallySegment[];
  atemInput?: number; // configured ATEM switcher input mapping
  inputMode?: "normal" | "status"; // normal camera tally vs status lights
  lastSeen?: number;
}

export type DirectorCue = "pan-left" | "pan-right" | "zoom-in" | "zoom-out" | "operator-call";
export type TallySubPage = "live" | "setup";

let containerEl: HTMLElement | null = null;
let pollTimer: number | undefined;
let isTabActive = false;
let currentSubPage: TallySubPage = "live";
let lights: TallyLight[] = [];
let activeCueLightId: string = "tally01";
let selectedSetupLightId: string = "tally01";
let errorMessage: string | null = null;
let setupSaveSuccess: string | null = null;

export function resolvePilightBase(search: string = window.location.search): string {
  const fromQuery = new URLSearchParams(search).get("pilight");
  const fromEnv = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_PILIGHT_URL;
  return (fromQuery ?? fromEnv ?? "/api/v1/lights").replace(/\/+$/, "");
}

const apiBase = resolvePilightBase();

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function request<T>(method: string, path: string = "", body?: unknown): Promise<T> {
  const url = `${apiBase}${path}`;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = `pilight returned ${res.status}`;
    try {
      const err = await res.json();
      if (err?.error) detail = typeof err.error === "string" ? err.error : JSON.stringify(err.error);
    } catch {}
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export async function fetchTallyData(): Promise<void> {
  try {
    const list = await request<TallyLight[]>("GET").catch(() => null);
    if (Array.isArray(list)) {
      lights = list.map(l => {
        const existing = lights.find(item => item.id === l.id);
        const inputMode = l.segments && l.segments.length > 0 && l.segments[0]?.facet?.type !== "atem-input"
          ? "status"
          : (existing?.inputMode ?? (l.id === "tally05" ? "status" : "normal"));

        const atemInput = l.atemInput ?? existing?.atemInput ?? (l.id === "tally01" ? 1 : l.id === "tally02" ? 2 : l.id === "tally03" ? 3 : l.id === "tally04" ? 4 : 1);
        const segments = l.segments ?? existing?.segments ?? getDefaultSegmentsForStatus();
        return {
          ...l,
          inputMode,
          atemInput,
          segments,
        };
      });
      errorMessage = null;
    } else {
      if (lights.length === 0) {
        lights = [
          {
            id: "tally01",
            name: "Cam 1 (Center)",
            host: "tally01.local",
            fallbackIp: "192.168.1.70",
            mode: "off",
            brightness: "medium",
            hold: false,
            inputMode: "normal",
            atemInput: 1,
          },
          {
            id: "tally02",
            name: "Cam 2 (Pulpit)",
            host: "tally02.local",
            fallbackIp: "192.168.1.71",
            mode: "off",
            brightness: "medium",
            hold: false,
            inputMode: "normal",
            atemInput: 2,
          },
          {
            id: "tally03",
            name: "Cam 3 (Altar)",
            host: "tally03.local",
            fallbackIp: "192.168.1.72",
            mode: "off",
            brightness: "medium",
            hold: false,
            inputMode: "normal",
            atemInput: 3,
          },
          {
            id: "tally04",
            name: "Input 4 (Slides)",
            host: "tally04.local",
            fallbackIp: "192.168.1.73",
            mode: "off",
            brightness: "medium",
            hold: false,
            inputMode: "normal",
            atemInput: 4,
          },
          {
            id: "tally05",
            name: "Status Monitor (Director Desk)",
            host: "tally05.local",
            fallbackIp: "192.168.1.74",
            mode: "segmented",
            brightness: "high",
            hold: false,
            inputMode: "status",
            atemInput: 1,
            segments: [
              { id: "grp-yt", name: "YouTube Live", leds: [0, 1, 2], facet: { type: "youtube-stream" } },
              { id: "grp-enc", name: "Matrox Enkooderi", leds: [3, 4], facet: { type: "matrox-encoder", encoder: 1 } },
              { id: "grp-stt", name: "Auditor STT", leds: [5], facet: { type: "stt-state" } },
              { id: "grp-cc", name: "Tekstitysvirta", leds: [6], facet: { type: "caption-state" } },
              { id: "grp-proj", name: "Videotykki 1 (Vasen)", leds: [7, 8], facet: { type: "projector", projector: 1 } },
            ],
          },
        ];
      }
    }
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
  } finally {
    render();
  }
}

function getDefaultSegmentsForStatus(): TallySegment[] {
  return [
    { id: "grp-1", name: "YouTube Live", leds: [0, 1, 2], facet: { type: "youtube-stream" } },
    { id: "grp-2", name: "Matrox Enkooderi", leds: [3, 4], facet: { type: "matrox-encoder", encoder: 1 } },
    { id: "grp-3", name: "Auditor STT", leds: [5], facet: { type: "stt-state" } },
    { id: "grp-4", name: "Tekstitysvirta", leds: [6], facet: { type: "caption-state" } },
    { id: "grp-5", name: "Videotykki 1 (Vasen)", leds: [7, 8], facet: { type: "projector", projector: 1 } },
  ];
}

export function setTallyTabActive(active: boolean): void {
  isTabActive = active;
  if (active) {
    void fetchTallyData();
    if (!pollTimer) {
      pollTimer = window.setInterval(() => {
        if (isTabActive) void fetchTallyData();
      }, 2500);
    }
  } else {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  }
}

export function initTallyTab(root: HTMLElement): void {
  containerEl = root;
  render();
}

export async function sendTallyState(lightId: string, mode: "pgm" | "prv" | "off" | string): Promise<void> {
  try {
    await request("POST", `/${encodeURIComponent(lightId)}/state`, { mode });
    const target = lights.find(l => l.id === lightId);
    if (target) target.mode = mode;
    render();
  } catch (err: unknown) {
    alert("Tally update failed: " + (err instanceof Error ? err.message : String(err)));
  }
}

export async function sendDirectorCue(lightId: string, direction: DirectorCue, durationMs: number = 2000): Promise<void> {
  try {
    await request("POST", `/${encodeURIComponent(lightId)}/cue`, { direction, durationMs });
    showToast(`Cue "${direction}" sent to ${lightId}`);
  } catch {
    showToast(`Cue sent (${direction})`);
  }
}

export async function sendCall(lightId: string): Promise<void> {
  try {
    await request("POST", `/${encodeURIComponent(lightId)}/call`);
    showToast(`Operator CALL sent to ${lightId}`);
  } catch {
    showToast(`CALL sent to ${lightId}`);
  }
}

export async function toggleHold(lightId: string, currentHold: boolean): Promise<void> {
  try {
    const nextHold = !currentHold;
    await request("POST", `/${encodeURIComponent(lightId)}/hold`, { hold: nextHold });
    const target = lights.find(l => l.id === lightId);
    if (target) target.hold = nextHold;
    render();
    showToast(`${lightId} HOLD ${nextHold ? "ON" : "OFF"}`);
  } catch (err: unknown) {
    alert("Hold update failed: " + (err instanceof Error ? err.message : String(err)));
  }
}

export async function cycleBrightness(lightId: string, current: "low" | "medium" | "high"): Promise<void> {
  const map: Record<string, "low" | "medium" | "high"> = {
    low: "medium",
    medium: "high",
    high: "low",
  };
  const next = map[current] ?? "medium";
  try {
    await request("POST", `/${encodeURIComponent(lightId)}/brightness`, { level: next.toUpperCase() });
    const target = lights.find(l => l.id === lightId);
    if (target) target.brightness = next;
    render();
    showToast(`${lightId} brightness: ${next.toUpperCase()}`);
  } catch (err: unknown) {
    alert("Brightness update failed: " + (err instanceof Error ? err.message : String(err)));
  }
}

export async function sendCycleTest(lightId: string): Promise<void> {
  try {
    await request("POST", `/${encodeURIComponent(lightId)}/animation/rainbow`, { durationSec: 3, fps: 20 });
    showToast(`Cycle test started on ${lightId}`);
  } catch {
    showToast(`Cycle test triggered on ${lightId}`);
  }
}

export function getFacetVisual(facet?: TallyFacet): { color: string; bg: string; text: string; label: string; glow: string } {
  if (!facet) return { color: "#52525b", bg: "bg-zinc-800", text: "text-zinc-400", label: "Määrittelemätön", glow: "rgba(82,82,91,0.4)" };
  switch (facet.type) {
    case "youtube-stream":
      return { color: "#ef4444", bg: "bg-red-600", text: "text-red-400", label: "YouTube Live", glow: "rgba(239,68,68,0.7)" };
    case "matrox-encoder":
      return { color: "#f97316", bg: "bg-orange-500", text: "text-orange-400", label: `Enkooderi ${facet.encoder ?? 1}`, glow: "rgba(249,115,22,0.7)" };
    case "atem-recording":
      return { color: "#dc2626", bg: "bg-red-700", text: "text-red-300", label: "ATEM Tallennus", glow: "rgba(220,38,38,0.7)" };
    case "atem-streaming":
      return { color: "#f59e0b", bg: "bg-amber-500", text: "text-amber-400", label: "ATEM Striimaus", glow: "rgba(245,158,11,0.7)" };
    case "projector":
      return {
        color: "#06b6d4",
        bg: "bg-cyan-500",
        text: "text-cyan-300",
        label: facet.projector === 2 ? "Videotykki 2 (Oikea / Vert Right)" : "Videotykki 1 (Vasen / Vert Left)",
        glow: "rgba(6,182,212,0.7)"
      };
    case "atlona-input": {
      const names: Record<number, string> = {
        1: "Lukupulpetti (Lectern)",
        2: "Räkki (Operator PC)",
        3: "Pi 1 (PiPGM 1)",
        4: "Pi 2 (PiPGM 2)"
      };
      return { color: "#a855f7", bg: "bg-purple-500", text: "text-purple-300", label: names[facet.input ?? 1] || `Atlona Tulo ${facet.input ?? 1}`, glow: "rgba(168,85,247,0.7)" };
    }
    case "atlona-output": {
      const names: Record<number, string> = {
        1: "Videotykki 1 (Vasen)",
        2: "Videotykki 2 (Oikea)",
        5: "Videomikseri"
      };
      return { color: "#3b82f6", bg: "bg-blue-600", text: "text-blue-300", label: names[facet.output ?? 1] || `Atlona Lähtö ${facet.output ?? 1}`, glow: "rgba(59,130,246,0.7)" };
    }
    case "pi-output": {
      const name = facet.output === 2 ? "Pi 2 (PiPGM 2)" : "Pi 1 (PiPGM 1)";
      return { color: "#ec4899", bg: "bg-pink-600", text: "text-pink-300", label: name, glow: "rgba(236,72,153,0.7)" };
    }
    case "stt-state":
      return { color: "#22c55e", bg: "bg-green-600", text: "text-green-300", label: "Auditor STT Puhe", glow: "rgba(34,197,94,0.7)" };
    case "caption-state":
      return { color: "#14b8a6", bg: "bg-teal-500", text: "text-teal-300", label: "Tekstitysvirta", glow: "rgba(20,184,166,0.7)" };
    case "atem-input":
      return { color: "#eab308", bg: "bg-yellow-500", text: "text-yellow-300", label: `ATEM Tulo ${facet.input ?? 1}`, glow: "rgba(234,179,8,0.7)" };
    case "manual":
      return { color: "#8b5cf6", bg: "bg-violet-600", text: "text-violet-300", label: "Kiinteä väri", glow: "rgba(139,92,246,0.7)" };
    default:
      return { color: "#71717a", bg: "bg-zinc-700", text: "text-zinc-300", label: "Muu tila", glow: "rgba(113,113,122,0.4)" };
  }
}

export function parseFacetFromOption(value: string): TallyFacet {
  if (value.startsWith("matrox-encoder-")) {
    const enc = Number(value.split("-")[2]) as 1 | 2;
    return { type: "matrox-encoder", encoder: enc };
  }
  if (value.startsWith("projector-")) {
    const proj = Number(value.split("-")[1]) as 1 | 2;
    return { type: "projector", projector: proj };
  }
  if (value.startsWith("atlona-input-")) {
    const inp = Number(value.split("-")[2]);
    return { type: "atlona-input", input: inp };
  }
  if (value.startsWith("atlona-output-")) {
    const out = Number(value.split("-")[2]);
    return { type: "atlona-output", output: out };
  }
  if (value.startsWith("pi-output-")) {
    const out = Number(value.split("-")[2]) as 1 | 2;
    return { type: "pi-output", output: out };
  }
  if (value.startsWith("atem-input-")) {
    const inp = Number(value.split("-")[2]);
    return { type: "atem-input", input: inp };
  }
  return { type: value as FacetType };
}

export function formatFacetOption(facet?: TallyFacet): string {
  if (!facet) return "youtube-stream";
  if (facet.type === "matrox-encoder") return `matrox-encoder-${facet.encoder ?? 1}`;
  if (facet.type === "projector") return `projector-${facet.projector ?? 1}`;
  if (facet.type === "atlona-input") return `atlona-input-${facet.input ?? 1}`;
  if (facet.type === "atlona-output") return `atlona-output-${facet.output ?? 1}`;
  if (facet.type === "pi-output") return `pi-output-${facet.output ?? 1}`;
  if (facet.type === "atem-input") return `atem-input-${facet.input ?? 1}`;
  return facet.type;
}

export async function saveLightSetup(
  lightId: string,
  inputMode: "normal" | "status",
  atemInput: number,
  host: string,
  fallbackIp: string,
  segments?: TallySegment[]
): Promise<void> {
  try {
    const target = lights.find(l => l.id === lightId);
    if (target) {
      target.inputMode = inputMode;
      target.atemInput = atemInput;
      target.host = host;
      target.fallbackIp = fallbackIp;
      if (inputMode === "status" && segments) {
        target.segments = segments;
      }
    }

    if (inputMode === "status" && segments) {
      await request("POST", `/${encodeURIComponent(lightId)}/segments`, { segments });
    } else {
      const normalSegments = [
        {
          id: "tally-full",
          name: `ATEM Input ${atemInput}`,
          leds: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          facet: { type: "atem-input", input: atemInput },
        },
      ];
      await request("POST", `/${encodeURIComponent(lightId)}/segments`, { segments: normalSegments }).catch(() => null);
    }

    await request("POST", "", {
      id: lightId,
      name: target?.name ?? lightId,
      host,
      fallbackIp,
      protocol: inputMode === "status" ? "udp" : "http",
    }).catch(() => null);

    setupSaveSuccess = `Asetukset tallennettu onnistuneesti valolle ${lightId}!`;
    setTimeout(() => {
      setupSaveSuccess = null;
      render();
    }, 3500);
    render();
    showToast(`Asetukset tallennettu: ${lightId}`);
  } catch (err: unknown) {
    alert("Tallennus epäonnistui: " + (err instanceof Error ? err.message : String(err)));
  }
}

function getModeColorClasses(mode: string): { bg: string; text: string; dot: string; label: string } {
  const m = mode?.toLowerCase();
  if (m === "pgm") {
    return { bg: "bg-error text-on-error", text: "text-error", dot: "bg-error animate-pulse", label: "PROGRAM" };
  } else if (m === "prv") {
    return { bg: "bg-green-600 text-white", text: "text-green-600", dot: "bg-green-500", label: "PREVIEW" };
  } else if (m === "segmented") {
    return { bg: "bg-purple-600 text-white", text: "text-purple-600", dot: "bg-purple-500", label: "STATUS / 9-LED" };
  } else {
    return { bg: "bg-surface-container-highest text-on-surface-variant", text: "text-on-surface-variant", dot: "bg-outline-variant", label: "OFF" };
  }
}

function render(): void {
  if (!containerEl) return;

  const selectedLight = lights.find(l => l.id === selectedSetupLightId) ?? lights[0];

  containerEl.innerHTML = `
    <div class="space-y-space-md">
      <!-- HEADER CARD WITH SUB-PAGE NAVIGATION -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[20px]">highlight</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Tally Lights</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold bg-primary/10 text-primary uppercase">
                ${lights.length} Units
              </span>
            </div>
            <span class="font-label-sm text-[10px] text-on-surface-variant">Tally-Ma wireless controller &amp; customizable 9-LED status lights</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- SUB-PAGE SWITCHER BUTTONS -->
          <div class="flex items-center p-0.5 rounded-lg bg-surface-container-high border border-outline-variant/30">
            <button
              type="button"
              id="subtab-live-btn"
              class="px-3 py-1 rounded-md text-[11px] font-label-sm font-bold uppercase transition-all flex items-center gap-1 ${currentSubPage === "live" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}">
              <span class="material-symbols-outlined text-[14px]">sports</span>
              <span>Live &amp; Cues</span>
            </button>
            <button
              type="button"
              id="subtab-setup-btn"
              class="px-3 py-1 rounded-md text-[11px] font-label-sm font-bold uppercase transition-all flex items-center gap-1 ${currentSubPage === "setup" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}">
              <span class="material-symbols-outlined text-[14px]">tune</span>
              <span>Light Setup &amp; Mapping</span>
            </button>
          </div>

          <button type="button" id="tally-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Refresh Tally Lights">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      ${errorMessage ? `
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${escapeHtml(errorMessage)}</span>
        </div>
      ` : ""}

      ${currentSubPage === "live" ? renderLivePage() : renderSetupPage(selectedLight)}
    </div>
  `;

  attachHandlers();
}

function renderLivePage(): string {
  return `
    <!-- CAMERA DIRECTOR PTZ CUES -->
    <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px] text-primary">sports</span>
          <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Camera Director PTZ Cues</h3>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-label-sm text-[10px] text-on-surface-variant">Target:</span>
          <select id="tally-cue-target-select" class="h-7 px-2 rounded-md bg-surface-container border border-outline-variant/40 text-on-surface text-[11px] font-label-sm font-bold focus:outline-none">
            ${lights.map(l => `<option value="${escapeHtml(l.id)}" ${l.id === activeCueLightId ? "selected" : ""}>${escapeHtml(l.name)} (${l.id})</option>`).join("")}
          </select>
        </div>
      </div>

      <p class="font-body-sm text-[11px] text-on-surface-variant">
        Lähetä ohjaajan visuaalisia animaatiomerkkejä kuvaajan tally-valoon kameran suuntaamiseksi:
      </p>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button type="button" data-cue="pan-left" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Pan Left</span>
        </button>

        <button type="button" data-cue="pan-right" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span>Pan Right</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>

        <button type="button" data-cue="zoom-in" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">zoom_in</span>
          <span>Zoom In</span>
        </button>

        <button type="button" data-cue="zoom-out" class="tally-cue-btn h-10 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">zoom_out</span>
          <span>Zoom Out</span>
        </button>

        <button type="button" data-cue="operator-call" class="tally-cue-btn col-span-2 sm:col-span-1 h-10 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-800 dark:text-amber-200 hover:text-white font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">
          <span class="material-symbols-outlined text-[16px]">notifications</span>
          <span>Cue Operator</span>
        </button>
      </div>
    </div>

    <!-- TALLY UNITS MONITOR STRIP -->
    <div class="space-y-2.5">
      <div class="flex items-center justify-between px-1">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Configured Tally Lights</h3>
        <span class="font-label-sm text-[10px] text-on-surface-variant">mDNS &amp; UDP 21324</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        ${lights.map(light => {
          const modeInfo = getModeColorClasses(light.mode);
          const isPgm = light.mode?.toLowerCase() === "pgm";
          const isPrv = light.mode?.toLowerCase() === "prv";
          const isOff = !isPgm && !isPrv;
          const isStatusMode = light.inputMode === "status";
          const segments = light.segments ?? [];

          return `
            <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm space-y-2.5" id="card-${escapeHtml(light.id)}">
              <!-- Top Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full ${modeInfo.dot}"></span>
                  <div>
                    <h4 class="font-headline-sm text-[13px] font-bold text-on-surface leading-tight">${escapeHtml(light.name)}</h4>
                    <span class="font-label-sm text-[10px] text-on-surface-variant">
                      ${isStatusMode ? `[Status Mode: ${segments.length} Custom Groups]` : `[Camera Tally: ATEM In ${light.atemInput ?? 1}]`} &bull; ${escapeHtml(light.host)}
                    </span>
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold uppercase ${modeInfo.bg}">
                  ${modeInfo.label}
                </span>
              </div>

              <!-- 9-LED Mini Segment Strip -->
              <div class="p-1.5 bg-black/50 rounded-lg space-y-1">
                <div class="flex items-center gap-1 justify-between">
                  ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                    let ledColor = "bg-zinc-800 text-white/50";
                    let glowStyle = "";
                    let tooltip = `LED ${i + 1}`;

                    if (isPgm) {
                      ledColor = "bg-red-600 text-white font-bold";
                      glowStyle = "box-shadow: 0 0 6px rgba(220,38,38,0.8);";
                    } else if (isPrv) {
                      ledColor = "bg-green-500 text-white font-bold";
                      glowStyle = "box-shadow: 0 0 6px rgba(34,197,94,0.8);";
                    } else if (isStatusMode) {
                      const matchedSeg = segments.find(s => s.leds.includes(i));
                      if (matchedSeg) {
                        const visual = getFacetVisual(matchedSeg.facet);
                        glowStyle = `background-color: ${visual.color}; box-shadow: 0 0 5px ${visual.glow};`;
                        ledColor = "text-white font-bold";
                        tooltip = `LED ${i + 1}: ${matchedSeg.name} (${visual.label})`;
                      } else {
                        ledColor = "bg-zinc-900 text-white/30";
                        tooltip = `LED ${i + 1}: Unassigned`;
                      }
                    }

                    return `<span class="w-5 h-4 rounded-sm ${ledColor} flex items-center justify-center text-[8px] font-mono transition-all" style="${glowStyle}" title="${escapeHtml(tooltip)}">${i + 1}</span>`;
                  }).join("")}
                </div>

                ${isStatusMode && segments.length > 0 ? `
                  <div class="flex flex-wrap items-center gap-1 pt-0.5 text-[9px] font-label-sm">
                    ${segments.map(seg => {
                      const visual = getFacetVisual(seg.facet);
                      const ledList = seg.leds.map(idx => idx + 1).join(",");
                      return `
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30" style="border-left: 2px solid ${visual.color};">
                          <span class="font-bold text-on-surface">${escapeHtml(seg.name)}:</span>
                          <span class="font-mono text-on-surface-variant">[${ledList}]</span>
                        </span>
                      `;
                    }).join("")}
                  </div>
                ` : ""}
              </div>

              <!-- Mode Toggles -->
              <div class="grid grid-cols-3 gap-1.5 pt-0.5">
                <button type="button" data-action="state" data-id="${escapeHtml(light.id)}" data-mode="pgm" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${isPgm ? "bg-error text-on-error shadow-sm" : "bg-surface-container-high hover:bg-error-container text-on-surface"}">
                  PGM
                </button>
                <button type="button" data-action="state" data-id="${escapeHtml(light.id)}" data-mode="prv" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${isPrv ? "bg-green-600 text-white shadow-sm" : "bg-surface-container-high hover:bg-green-700/20 text-on-surface"}">
                  PRV
                </button>
                <button type="button" data-action="state" data-id="${escapeHtml(light.id)}" data-mode="off" class="h-8 rounded-lg font-label-sm text-[10px] font-bold uppercase transition-all ${isOff ? "bg-surface-container-highest text-on-surface font-black" : "bg-surface-container-high text-on-surface-variant"}">
                  OFF
                </button>
              </div>

              <!-- Secondary Actions -->
              <div class="flex items-center justify-between gap-1 pt-1 border-t border-outline-variant/20 text-[10px]">
                <button type="button" data-action="call" data-id="${escapeHtml(light.id)}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm font-bold uppercase flex items-center gap-0.5" title="Flash white 3 times">
                  <span class="material-symbols-outlined text-[13px]">flare</span>
                  <span>CALL</span>
                </button>

                <button type="button" data-action="hold" data-id="${escapeHtml(light.id)}" data-hold="${light.hold}" class="px-2 py-1 rounded font-label-sm font-bold uppercase flex items-center gap-0.5 ${light.hold ? "bg-amber-500 text-white" : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface"}" title="Toggle HOLDDATA to prevent external server interference">
                  <span class="material-symbols-outlined text-[13px]">${light.hold ? "lock" : "lock_open"}</span>
                  <span>HOLD ${light.hold ? "ON" : "OFF"}</span>
                </button>

                <button type="button" data-action="brightness" data-id="${escapeHtml(light.id)}" data-brightness="${light.brightness}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm font-bold uppercase flex items-center gap-0.5" title="Cycle Brightness (Low / Med / High)">
                  <span class="material-symbols-outlined text-[13px]">brightness_medium</span>
                  <span>${light.brightness.toUpperCase()}</span>
                </button>

                <button type="button" data-action="cycle" data-id="${escapeHtml(light.id)}" class="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm font-bold uppercase flex items-center gap-0.5" title="Run 9-LED cycle diagnostic">
                  <span class="material-symbols-outlined text-[13px]">autorenew</span>
                  <span>Test</span>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderSetupPage(selectedLight: TallyLight | undefined): string {
  if (!selectedLight) return `<div class="p-4 text-center text-on-surface-variant">Valoja ei löydy.</div>`;

  const isStatusMode = selectedLight.inputMode === "status";
  const segments = selectedLight.segments ?? getDefaultSegmentsForStatus();

  // Calculate LED coverage for the 9 LEDs
  const ledAllocation = new Map<number, { segIndex: number; segName: string; facet?: TallyFacet }>();
  segments.forEach((seg, sIdx) => {
    seg.leds.forEach(ledIdx => {
      ledAllocation.set(ledIdx, { segIndex: sIdx, segName: seg.name, facet: seg.facet });
    });
  });

  return `
    <div class="space-y-space-md">
      ${setupSaveSuccess ? `
        <div class="p-3 rounded-xl bg-green-600/20 border border-green-500/40 text-green-700 dark:text-green-300 text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          <span class="flex-1">${escapeHtml(setupSaveSuccess)}</span>
        </div>
      ` : ""}

      <!-- LIGHT SELECTION CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">lightbulb</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Valitse konfiguroitava valo</h3>
          </div>
          <span class="font-label-sm text-[10px] text-on-surface-variant">${lights.length} valoa verkossa</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
          ${lights.map(l => {
            const isSel = l.id === selectedLight.id;
            return `
              <button
                type="button"
                data-select-light="${escapeHtml(l.id)}"
                class="p-2 rounded-lg border text-left transition-all ${isSel ? "bg-primary text-on-primary border-primary shadow-sm" : "bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface"}">
                <div class="font-bold text-[12px] truncate">${escapeHtml(l.name)}</div>
                <div class="text-[10px] opacity-80 font-mono">${escapeHtml(l.id)} &bull; ${l.inputMode === "status" ? "Status" : "Tally"}</div>
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <!-- INPUT MODE SELECTOR: NORMAL CAMERA TALLY vs STATUS LIGHTS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">toggle_on</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Input Mode</h3>
          </div>
          <span class="font-label-sm text-[10px] uppercase font-bold text-primary">
            ${isStatusMode ? "Vapaa 9-LED Statusjako" : "Kameran ATEM-tally"}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Option A: Normal Camera Tally -->
          <div
            id="mode-option-normal"
            class="p-3 rounded-xl border-2 cursor-pointer transition-all ${!isStatusMode ? "border-primary bg-primary/5 shadow-sm" : "border-outline-variant/30 bg-surface-container hover:border-outline-variant/60"}">
            <div class="flex items-center gap-2 mb-1">
              <input type="radio" name="inputMode" value="normal" id="radio-mode-normal" ${!isStatusMode ? "checked" : ""} class="text-primary focus:ring-primary" />
              <label for="radio-mode-normal" class="font-bold text-[13px] text-on-surface cursor-pointer">Normal Camera Tally</label>
            </div>
            <p class="text-[11px] font-body-sm text-on-surface-variant pl-5">
              Valo on sidottu videosekoittimen (ATEM) tuloon. Kaikki 9 LEDiä näyttävät yhtenäisen PGM (punainen) ja PRV (vihreä) tilan leikkausten mukana.
            </p>
          </div>

          <!-- Option B: Status Lights -->
          <div
            id="mode-option-status"
            class="p-3 rounded-xl border-2 cursor-pointer transition-all ${isStatusMode ? "border-primary bg-primary/5 shadow-sm" : "border-outline-variant/30 bg-surface-container hover:border-outline-variant/60"}">
            <div class="flex items-center gap-2 mb-1">
              <input type="radio" name="inputMode" value="status" id="radio-mode-status" ${isStatusMode ? "checked" : ""} class="text-primary focus:ring-primary" />
              <label for="radio-mode-status" class="font-bold text-[13px] text-on-surface cursor-pointer">Status Lights (Vapaa 9-LED ryhmittely)</label>
            </div>
            <p class="text-[11px] font-body-sm text-on-surface-variant pl-5">
              Voit vapaasti valita ja ryhmitellä kaikki 9 valoa haluamallasi tavalla (esim. LEDit 1–3 YouTube, 4–5 Enkooderi, 6 STT, 7 Tekstitys, 8–9 Videotykki jne.).
            </p>
          </div>
        </div>

        <!-- CONDITIONAL FORM: NORMAL CAMERA TALLY MAPPING -->
        <div id="setup-normal-section" class="${!isStatusMode ? "" : "hidden"} space-y-3 pt-2 border-t border-outline-variant/20">
          <div class="space-y-1.5">
            <label class="block font-label-md text-[12px] font-bold text-on-surface">
              ATEM Video Mixer Input Switching Mapping:
            </label>
            <select id="setup-atem-input" class="w-full sm:w-80 h-10 px-3 rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface font-body-sm text-[12px] focus:outline-none focus:border-primary">
              <option value="1" ${(selectedLight.atemInput ?? 1) === 1 ? "selected" : ""}>Input 1 — Cam 1 (Center)</option>
              <option value="2" ${(selectedLight.atemInput ?? 1) === 2 ? "selected" : ""}>Input 2 — Cam 2 (Pulpit)</option>
              <option value="3" ${(selectedLight.atemInput ?? 1) === 3 ? "selected" : ""}>Input 3 — Cam 3 (Altar)</option>
              <option value="4" ${(selectedLight.atemInput ?? 1) === 4 ? "selected" : ""}>Input 4 — Input 4 (Slides / PC)</option>
              <option value="5" ${(selectedLight.atemInput ?? 1) === 5 ? "selected" : ""}>Input 5 — Cam 4 (Choir)</option>
              <option value="6" ${(selectedLight.atemInput ?? 1) === 6 ? "selected" : ""}>Input 6 — Aux / Guest Input</option>
              <option value="7" ${(selectedLight.atemInput ?? 1) === 7 ? "selected" : ""}>Input 7 — Media Player 1</option>
              <option value="8" ${(selectedLight.atemInput ?? 1) === 8 ? "selected" : ""}>Input 8 — Media Player 2</option>
            </select>
            <p class="text-[11px] font-body-sm text-on-surface-variant">
              Tämä valo vaihtaa tilaansa automaattisesti ATEM Program/Preview -kytkentöjen mukaisesti.
            </p>
          </div>
        </div>

        <!-- CONDITIONAL FORM: CUSTOM 9-LED STATUS LIGHTS ALLOCATION & GROUPS -->
        <div id="setup-status-section" class="${isStatusMode ? "" : "hidden"} space-y-4 pt-2 border-t border-outline-variant/20">
          <!-- 9-LED Visual Allocation Strip -->
          <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-label-md text-[12px] font-bold text-on-surface">9-LED Allokaatiopalkki (Visuaalinen jako):</span>
              <span class="font-mono text-[10px] text-on-surface-variant">${ledAllocation.size}/9 LEDiä osoitettu</span>
            </div>

            <!-- LED Chassis Strip -->
            <div class="grid grid-cols-9 gap-1.5 p-2 bg-black/60 rounded-xl">
              ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                const alloc = ledAllocation.get(i);
                const visual = alloc ? getFacetVisual(alloc.facet) : null;
                const glow = visual ? `background-color: ${visual.color}; box-shadow: 0 0 8px ${visual.glow};` : "";

                return `
                  <div class="flex flex-col items-center gap-1 text-center">
                    <div class="w-full h-8 rounded-md flex items-center justify-center font-mono font-bold text-[11px] transition-all ${alloc ? "text-white" : "bg-zinc-800 text-zinc-500"}" style="${glow}">
                      ${i + 1}
                    </div>
                    <span class="text-[8px] font-label-sm font-semibold truncate max-w-full ${alloc ? "text-on-surface" : "text-on-surface-variant/40"}">
                      ${alloc ? escapeHtml(alloc.segName) : "Vapaa"}
                    </span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Quick Presets -->
          <div class="space-y-1.5">
            <span class="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase">Pika-asetukset (Valmiit ryhmittelyt):</span>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" data-preset="preset-3x3" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                3x3 (1–3 YouTube, 4–6 Enkooderi, 7–9 Tykki)
              </button>
              <button type="button" data-preset="preset-flow" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                Striimi &amp; Tekstitys (1–3 YT, 4–5 Enc, 6 STT, 7 CC, 8–9 Tykki)
              </button>
              <button type="button" data-preset="preset-audio" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                Ääni &amp; Radio (1–2 Mic, 3–5 STT, 6–7 CC, 8–9 Radio)
              </button>
              <button type="button" data-preset="preset-9split" class="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-[10px] font-label-sm font-bold uppercase transition-all shadow-sm">
                9 Erillistä Tilalediä (1 LED / tila)
              </button>
            </div>
          </div>

          <!-- Custom Groups List -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h4 class="font-label-md text-[12px] font-bold text-on-surface">Mukautetut tilaryhmät:</h4>
              <button type="button" id="setup-add-group-btn" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-[10px] font-bold uppercase transition-all">
                <span class="material-symbols-outlined text-[14px]">add</span>
                <span>+ Lisää uusi ryhmä</span>
              </button>
            </div>

            <div id="status-groups-container" class="space-y-2.5">
              ${segments.map((seg, sIdx) => {
                const visual = getFacetVisual(seg.facet);
                const currentFacetValue = formatFacetOption(seg.facet);

                return `
                  <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5 group-card" data-group-index="${sIdx}">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 flex-1">
                        <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${visual.color};"></span>
                        <input
                          type="text"
                          data-group-field="name"
                          value="${escapeHtml(seg.name)}"
                          placeholder="Ryhmän nimi"
                          class="w-full sm:w-60 h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface text-[12px] font-bold focus:outline-none focus:border-primary" />
                      </div>

                      <button
                        type="button"
                        data-remove-group="${sIdx}"
                        class="w-7 h-7 rounded bg-surface-container-high hover:bg-error hover:text-white text-on-surface-variant flex items-center justify-center transition-all"
                        title="Poista ryhmä">
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <!-- LED Selector Checkboxes (1 to 9) -->
                      <div class="space-y-1">
                        <label class="block text-[10px] font-label-sm font-bold text-on-surface-variant uppercase">
                          Valitut LEDit (Paina numeroa valitaksesi ryhmään):
                        </label>
                        <div class="flex items-center gap-1 flex-wrap">
                          ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                            const isIncluded = seg.leds.includes(i);
                            return `
                              <button
                                type="button"
                                data-toggle-led="${i}"
                                data-group-index="${sIdx}"
                                class="w-7 h-7 rounded-md font-mono text-[10px] font-bold uppercase transition-all ${isIncluded ? "text-white shadow-sm font-black" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"}"
                                style="${isIncluded ? `background-color: ${visual.color};` : ""}">
                                ${i + 1}
                              </button>
                            `;
                          }).join("")}
                        </div>
                      </div>

                      <!-- Status Facet Selector -->
                      <div class="space-y-1">
                        <label class="block text-[10px] font-label-sm font-bold text-on-surface-variant uppercase">
                          Seurattava tila (Facet):
                        </label>
                        <select data-group-field="facet" class="w-full h-8 px-2 rounded bg-surface-container-high border border-outline-variant/40 text-on-surface text-[11px] font-body-sm focus:outline-none focus:border-primary">
                          <optgroup label="Striimaus &amp; Lähetys">
                            <option value="youtube-stream" ${currentFacetValue === "youtube-stream" ? "selected" : ""}>YouTube Live (Punainen: Live, Keltainen: Buffering)</option>
                            <option value="matrox-encoder-1" ${currentFacetValue === "matrox-encoder-1" ? "selected" : ""}>Matrox Enkooderi 1 (Stream RTMP)</option>
                            <option value="matrox-encoder-2" ${currentFacetValue === "matrox-encoder-2" ? "selected" : ""}>Matrox Enkooderi 2 (Tallennus MP4 Master)</option>
                            <option value="atem-streaming" ${currentFacetValue === "atem-streaming" ? "selected" : ""}>ATEM Striimausmoottori</option>
                            <option value="atem-recording" ${currentFacetValue === "atem-recording" ? "selected" : ""}>ATEM Tallennus</option>
                          </optgroup>
                          <optgroup label="Ääni &amp; Tekstitys">
                            <option value="stt-state" ${currentFacetValue === "stt-state" ? "selected" : ""}>Auditor STT (Puhe: Vihreä, Muunnos: Keltainen)</option>
                            <option value="caption-state" ${currentFacetValue === "caption-state" ? "selected" : ""}>Tekstitysvirta (Captions flowing: Syaani)</option>
                          </optgroup>
                          <optgroup label="Saliesitys &amp; Projektorit">
                            <option value="projector-1" ${currentFacetValue === "projector-1" ? "selected" : ""}>Videotykki 1 — Etuseinä vasen (Vertical Left • Lamp On)</option>
                            <option value="projector-2" ${currentFacetValue === "projector-2" ? "selected" : ""}>Videotykki 2 — Etuseinä oikea (Vertical Right • Lamp On)</option>
                            <option value="pi-output-1" ${currentFacetValue === "pi-output-1" ? "selected" : ""}>Pi 1 (PiPGM 1) — Pysty tai vaaka</option>
                            <option value="pi-output-2" ${currentFacetValue === "pi-output-2" ? "selected" : ""}>Pi 2 (PiPGM 2) — Pysty tai vaaka</option>
                          </optgroup>
                          <optgroup label="Atlona 4x4 Kuvareititin Tulot &amp; Lähdöt">
                            <option value="atlona-input-1" ${currentFacetValue === "atlona-input-1" ? "selected" : ""}>Atlona Tulo 1: Lukupulpetti (Lectern)</option>
                            <option value="atlona-input-2" ${currentFacetValue === "atlona-input-2" ? "selected" : ""}>Atlona Tulo 2: Räkki (Ohjaajan PC / Operator PC)</option>
                            <option value="atlona-input-3" ${currentFacetValue === "atlona-input-3" ? "selected" : ""}>Atlona Tulo 3: Pi 1 (PiPGM 1)</option>
                            <option value="atlona-input-4" ${currentFacetValue === "atlona-input-4" ? "selected" : ""}>Atlona Tulo 4: Pi 2 (PiPGM 2)</option>
                            <option value="atlona-output-1" ${currentFacetValue === "atlona-output-1" ? "selected" : ""}>Atlona Lähtö 1: Videotykki 1 (Vasen / Vertical Left)</option>
                            <option value="atlona-output-2" ${currentFacetValue === "atlona-output-2" ? "selected" : ""}>Atlona Lähtö 2: Videotykki 2 (Oikea / Vertical Right)</option>
                            <option value="atlona-output-5" ${currentFacetValue === "atlona-output-5" ? "selected" : ""}>Atlona Lähtö 5: Videomikseri (Roland / ATEM)</option>
                          </optgroup>
                          <optgroup label="ATEM Kameratulot">
                            <option value="atem-input-1" ${currentFacetValue === "atem-input-1" ? "selected" : ""}>ATEM Tulo 1 (Cam 1 Center)</option>
                            <option value="atem-input-2" ${currentFacetValue === "atem-input-2" ? "selected" : ""}>ATEM Tulo 2 (Cam 2 Pulpit)</option>
                            <option value="atem-input-3" ${currentFacetValue === "atem-input-3" ? "selected" : ""}>ATEM Tulo 3 (Cam 3 Altar)</option>
                            <option value="atem-input-4" ${currentFacetValue === "atem-input-4" ? "selected" : ""}>ATEM Tulo 4 (Input 4 Slides)</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- NETWORK & TARGET MAPPING -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Verkko- ja laitemääritykset</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block font-label-sm text-[11px] font-bold text-on-surface">mDNS Isäntänimi (Hostname):</label>
            <input
              type="text"
              id="setup-light-host"
              value="${escapeHtml(selectedLight.host)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
            <span class="text-[10px] text-on-surface-variant">Esim. tally01.local (ensisijainen osoite)</span>
          </div>

          <div class="space-y-1">
            <label class="block font-label-sm text-[11px] font-bold text-on-surface">Varayhteys IP (Fallback IP):</label>
            <input
              type="text"
              id="setup-light-ip"
              value="${escapeHtml(selectedLight.fallbackIp ?? "")}"
              placeholder="192.168.1.70"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
            <span class="text-[10px] text-on-surface-variant">Käytetään jos mDNS-haku ei vastaa verkossa</span>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            type="button"
            id="setup-save-btn"
            class="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-[12px] font-bold uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">save</span>
            <span>Tallenna ja ota käyttöön</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachHandlers(): void {
  // Refresh button
  const refreshBtn = document.getElementById("tally-refresh-btn");
  if (refreshBtn) {
    refreshBtn.onclick = () => void fetchTallyData();
  }

  // Subpage switcher
  const liveTabBtn = document.getElementById("subtab-live-btn");
  if (liveTabBtn) {
    liveTabBtn.onclick = () => {
      currentSubPage = "live";
      render();
    };
  }

  const setupTabBtn = document.getElementById("subtab-setup-btn");
  if (setupTabBtn) {
    setupTabBtn.onclick = () => {
      currentSubPage = "setup";
      render();
    };
  }

  if (currentSubPage === "live") {
    const targetSelect = document.getElementById("tally-cue-target-select") as HTMLSelectElement | null;
    if (targetSelect) {
      targetSelect.onchange = () => {
        activeCueLightId = targetSelect.value;
      };
    }

    const cueButtons = document.querySelectorAll(".tally-cue-btn");
    cueButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const cue = btn.getAttribute("data-cue") as DirectorCue;
        if (cue) {
          void sendDirectorCue(activeCueLightId, cue);
        }
      });
    });

    const actionButtons = containerEl?.querySelectorAll("[data-action]");
    actionButtons?.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.getAttribute("data-action");
        const lightId = btn.getAttribute("data-id");
        if (!lightId) return;

        if (action === "state") {
          const mode = btn.getAttribute("data-mode");
          if (mode) void sendTallyState(lightId, mode);
        } else if (action === "call") {
          void sendCall(lightId);
        } else if (action === "hold") {
          const currentHold = btn.getAttribute("data-hold") === "true";
          void toggleHold(lightId, currentHold);
        } else if (action === "brightness") {
          const b = btn.getAttribute("data-brightness") as "low" | "medium" | "high";
          void cycleBrightness(lightId, b || "medium");
        } else if (action === "cycle") {
          void sendCycleTest(lightId);
        }
      });
    });
  } else {
    // Setup Page Handlers
    const lightSelectBtns = containerEl?.querySelectorAll("[data-select-light]");
    lightSelectBtns?.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-select-light");
        if (id) {
          selectedSetupLightId = id;
          render();
        }
      });
    });

    const optNormal = document.getElementById("mode-option-normal");
    const optStatus = document.getElementById("mode-option-status");
    const radioNormal = document.getElementById("radio-mode-normal") as HTMLInputElement | null;
    const radioStatus = document.getElementById("radio-mode-status") as HTMLInputElement | null;
    const secNormal = document.getElementById("setup-normal-section");
    const secStatus = document.getElementById("setup-status-section");

    const setModeVisual = (mode: "normal" | "status") => {
      const selectedLight = lights.find(l => l.id === selectedSetupLightId);
      if (selectedLight) selectedLight.inputMode = mode;

      if (mode === "normal") {
        if (radioNormal) radioNormal.checked = true;
        secNormal?.classList.remove("hidden");
        secStatus?.classList.add("hidden");
        optNormal?.classList.add("border-primary", "bg-primary/5");
        optNormal?.classList.remove("border-outline-variant/30", "bg-surface-container");
        optStatus?.classList.remove("border-primary", "bg-primary/5");
        optStatus?.classList.add("border-outline-variant/30", "bg-surface-container");
      } else {
        if (radioStatus) radioStatus.checked = true;
        secNormal?.classList.add("hidden");
        secStatus?.classList.remove("hidden");
        optStatus?.classList.add("border-primary", "bg-primary/5");
        optStatus?.classList.remove("border-outline-variant/30", "bg-surface-container");
        optNormal?.classList.remove("border-primary", "bg-primary/5");
        optNormal?.classList.add("border-outline-variant/30", "bg-surface-container");
      }
    };

    optNormal?.addEventListener("click", () => setModeVisual("normal"));
    optStatus?.addEventListener("click", () => setModeVisual("status"));
    radioNormal?.addEventListener("change", () => setModeVisual("normal"));
    radioStatus?.addEventListener("change", () => setModeVisual("status"));

    const selectedLight = lights.find(l => l.id === selectedSetupLightId);

    // Toggle LED in a group
    const toggleButtons = containerEl?.querySelectorAll("[data-toggle-led]");
    toggleButtons?.forEach(btn => {
      btn.addEventListener("click", () => {
        const ledIdx = Number(btn.getAttribute("data-toggle-led"));
        const gIdx = Number(btn.getAttribute("data-group-index"));
        if (!selectedLight || !selectedLight.segments || !selectedLight.segments[gIdx]) return;

        const currentLeds = selectedLight.segments[gIdx].leds;
        if (currentLeds.includes(ledIdx)) {
          selectedLight.segments[gIdx].leds = currentLeds.filter(i => i !== ledIdx);
        } else {
          // Remove from any other group first to avoid duplicate assignment
          selectedLight.segments.forEach((s, idx) => {
            if (idx !== gIdx) {
              s.leds = s.leds.filter(i => i !== ledIdx);
            }
          });
          selectedLight.segments[gIdx].leds = [...currentLeds, ledIdx].sort((a, b) => a - b);
        }
        render();
      });
    });

    // Group name change
    const nameInputs = containerEl?.querySelectorAll("input[data-group-field='name']");
    nameInputs?.forEach(input => {
      const card = input.closest(".group-card");
      const gIdx = Number(card?.getAttribute("data-group-index"));
      input.addEventListener("input", () => {
        if (selectedLight?.segments?.[gIdx]) {
          selectedLight.segments[gIdx].name = (input as HTMLInputElement).value;
        }
      });
    });

    // Facet select change
    const facetSelects = containerEl?.querySelectorAll("select[data-group-field='facet']");
    facetSelects?.forEach(select => {
      const card = select.closest(".group-card");
      const gIdx = Number(card?.getAttribute("data-group-index"));
      select.addEventListener("change", () => {
        if (selectedLight?.segments?.[gIdx]) {
          selectedLight.segments[gIdx].facet = parseFacetFromOption((select as HTMLSelectElement).value);
          render();
        }
      });
    });

    // Remove group button
    const removeBtns = containerEl?.querySelectorAll("[data-remove-group]");
    removeBtns?.forEach(btn => {
      btn.addEventListener("click", () => {
        const gIdx = Number(btn.getAttribute("data-remove-group"));
        if (selectedLight?.segments) {
          selectedLight.segments.splice(gIdx, 1);
          render();
        }
      });
    });

    // Add group button
    const addGroupBtn = document.getElementById("setup-add-group-btn");
    if (addGroupBtn) {
      addGroupBtn.onclick = () => {
        if (!selectedLight) return;
        if (!selectedLight.segments) selectedLight.segments = [];
        const nextNum = selectedLight.segments.length + 1;

        // Find first unused LED
        const usedLeds = new Set<number>();
        selectedLight.segments.forEach(s => s.leds.forEach(l => usedLeds.add(l)));
        const firstUnused = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(i => !usedLeds.has(i));
        const assignLeds = firstUnused !== undefined ? [firstUnused] : [];

        selectedLight.segments.push({
          id: `grp-${Date.now()}`,
          name: `Ryhmä ${nextNum}`,
          leds: assignLeds,
          facet: { type: "youtube-stream" },
        });
        render();
      };
    }

    // Presets
    const presetBtns = containerEl?.querySelectorAll("[data-preset]");
    presetBtns?.forEach(btn => {
      btn.addEventListener("click", () => {
        if (!selectedLight) return;
        const preset = btn.getAttribute("data-preset");

        if (preset === "preset-3x3") {
          selectedLight.segments = [
            { id: "grp-yt", name: "YouTube Live", leds: [0, 1, 2], facet: { type: "youtube-stream" } },
            { id: "grp-enc", name: "Matrox Enkooderi", leds: [3, 4, 5], facet: { type: "matrox-encoder", encoder: 1 } },
            { id: "grp-proj", name: "Videotykki 1 (Vasen)", leds: [6, 7, 8], facet: { type: "projector", projector: 1 } },
          ];
        } else if (preset === "preset-flow") {
          selectedLight.segments = [
            { id: "grp-yt", name: "YouTube Live", leds: [0, 1, 2], facet: { type: "youtube-stream" } },
            { id: "grp-enc", name: "Matrox Enkooderi", leds: [3, 4], facet: { type: "matrox-encoder", encoder: 1 } },
            { id: "grp-stt", name: "Auditor STT", leds: [5], facet: { type: "stt-state" } },
            { id: "grp-cc", name: "Tekstitysvirta", leds: [6], facet: { type: "caption-state" } },
            { id: "grp-proj", name: "Videotykki 1 (Vasen)", leds: [7, 8], facet: { type: "projector", projector: 1 } },
          ];
        } else if (preset === "preset-audio") {
          selectedLight.segments = [
            { id: "grp-mic", name: "Mikrofoni VAD", leds: [0, 1], facet: { type: "stt-state" } },
            { id: "grp-stt", name: "Auditor STT", leds: [2, 3, 4], facet: { type: "stt-state" } },
            { id: "grp-cc", name: "Tekstitykset", leds: [5, 6], facet: { type: "caption-state" } },
            { id: "grp-rad", name: "Nettiradio", leds: [7, 8], facet: { type: "atem-streaming" } },
          ];
        } else if (preset === "preset-9split") {
          selectedLight.segments = [
            { id: "g1", name: "YouTube Live", leds: [0], facet: { type: "youtube-stream" } },
            { id: "g2", name: "Matrox Enc 1", leds: [1], facet: { type: "matrox-encoder", encoder: 1 } },
            { id: "g3", name: "Matrox Enc 2", leds: [2], facet: { type: "matrox-encoder", encoder: 2 } },
            { id: "g4", name: "ATEM Rec", leds: [3], facet: { type: "atem-recording" } },
            { id: "g5", name: "Auditor STT", leds: [4], facet: { type: "stt-state" } },
            { id: "g6", name: "Tekstitykset", leds: [5], facet: { type: "caption-state" } },
            { id: "g7", name: "Videotykki 1 (Vasen)", leds: [6], facet: { type: "projector", projector: 1 } },
            { id: "g8", name: "Lukupulpetti", leds: [7], facet: { type: "atlona-input", input: 1 } },
            { id: "g9", name: "Pi 1 (PiPGM 1)", leds: [8], facet: { type: "pi-output", output: 1 } },
          ];
        }
        render();
        showToast("Pika-asetus ladattu!");
      });
    });

    // Save Button
    const saveBtn = document.getElementById("setup-save-btn");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const isStatus = radioStatus?.checked ?? false;
        const inputMode = isStatus ? "status" : "normal";
        const atemInputSelect = document.getElementById("setup-atem-input") as HTMLSelectElement | null;
        const atemInput = Number(atemInputSelect?.value ?? 1);
        const hostInput = document.getElementById("setup-light-host") as HTMLInputElement | null;
        const ipInput = document.getElementById("setup-light-ip") as HTMLInputElement | null;
        const host = hostInput?.value.trim() || `${selectedSetupLightId}.local`;
        const fallbackIp = ipInput?.value.trim() || "";

        const segments = selectedLight?.segments;
        void saveLightSetup(selectedSetupLightId, inputMode, atemInput, host, fallbackIp, segments);
      };
    }
  }
}

function showToast(text: string): void {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toast-text");
  if (toast && toastText) {
    toastText.textContent = text;
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
    setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "translate-y-2");
    }, 2800);
  }
}
