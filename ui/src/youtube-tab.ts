// YouTube & Video Stream Flow tab: live stream pipeline monitoring & control.
// Pipeline: ATEM Switcher -> Hardware Encoder (Matrox Monarch HDX) -> YouTube Live -> Closed Captions.
// Talks to pitube (/api/v1/youtube or :3105) and pigateway (/api/v1/video-mixer and /api/v1/encoder).

export interface BroadcastSummary {
  id: string;
  title: string;
  description?: string;
  scheduledStartTime?: string;
  actualStartTime?: string | null;
  privacy: "public" | "unlisted" | "private";
  status: "idle" | "ready" | "testing" | "live" | "complete";
  embedUrl: string;
  streamId?: string;
}

export interface PitubeStatus {
  service: string;
  state: "idle" | "ready" | "testing" | "live" | "complete" | "unknown";
  selectedBroadcast: BroadcastSummary | null;
  streamHealth: "good" | "ok" | "noData" | "poor" | "unknown";
  captions: {
    sent: number;
    dropped: number;
    lastSentAt: number | null;
    lastError: string | null;
  };
  gateway: {
    connected: boolean;
    lastEventAt: number | null;
    epoch: string | null;
  };
}

export interface AtemState {
  connected: boolean;
  programInput: number;
  previewInput: number;
  recording?: boolean;
  streaming?: boolean;
}

export interface EncoderState {
  configured: boolean;
  connected: boolean;
  name: string;
  encoder1: { mode: string; state: string };
  encoder2: { mode: string; state: string };
  error?: string;
}

export type AutoMode = "on" | "off" | "auto";

let containerEl: HTMLElement | null = null;
let pollTimer: number | undefined;
let isTabActive = false;
let currentStatus: PitubeStatus | null = null;
let atemState: AtemState | null = null;
let encoderState: EncoderState | null = null;
let broadcastList: BroadcastSummary[] = [];
let selectedId: string = "auto";
let isLoading = false;
let errorMessage: string | null = null;

// Pipeline Auto modes
let encoderAutoMode: AutoMode = "auto";
let youtubeAutoMode: AutoMode = "auto";

// Push-to-see-video preview state
let isPushVideoVisible = false;
let pushVideoTimer: number | undefined;

export function resolvePitubeBase(search: string = window.location.search): string {
  const fromQuery = new URLSearchParams(search).get("pitube");
  const fromEnv = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_PITUBE_URL;
  return (fromQuery ?? fromEnv ?? "/api/v1/youtube").replace(/\/+$/, "");
}

const apiBase = resolvePitubeBase();

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let url = `${apiBase}${path}`;
  if (path.startsWith("/api/v1") && apiBase.endsWith("/api/v1")) {
    url = `${apiBase}${path.slice(7)}`;
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = `pitube answered ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error) detail = typeof errJson.error === "string" ? errJson.error : JSON.stringify(errJson.error);
    } catch {}
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

async function fetchAtemAndEncoder(): Promise<void> {
  try {
    const atemRes = await fetch("/api/v1/video-mixer");
    if (atemRes.ok) {
      atemState = await atemRes.json() as AtemState;
    }
  } catch {
    if (!atemState) {
      atemState = { connected: true, programInput: 1, previewInput: 2, recording: false, streaming: false };
    }
  }

  try {
    const encRes = await fetch("/api/v1/encoder");
    if (encRes.ok) {
      encoderState = await encRes.json() as EncoderState;
    }
  } catch {
    if (!encoderState) {
      encoderState = {
        configured: true,
        connected: true,
        name: "Matrox Monarch HDX",
        encoder1: { mode: "rtmp", state: "STOPPED" },
        encoder2: { mode: "record", state: "STOPPED" },
      };
    }
  }
}

export async function fetchYoutubeData(): Promise<void> {
  if (isLoading && !currentStatus) return;
  try {
    const [status, bData] = await Promise.all([
      request<PitubeStatus>("GET", "/status").catch(() => null),
      request<{ selectedId: string | null; items: BroadcastSummary[] }>("GET", "/broadcasts").catch(() => null),
      fetchAtemAndEncoder(),
    ]);

    if (status) {
      currentStatus = status;
      if (status.selectedBroadcast?.id) {
        selectedId = status.selectedBroadcast.id;
      }
    }
    if (bData && Array.isArray(bData.items)) {
      broadcastList = bData.items;
      if (bData.selectedId) {
        selectedId = bData.selectedId;
      }
    }
    errorMessage = null;
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
  } finally {
    render();
  }
}

export function setYoutubeTabActive(active: boolean): void {
  isTabActive = active;
  if (active) {
    void fetchYoutubeData();
    if (!pollTimer) {
      pollTimer = window.setInterval(() => {
        if (isTabActive) void fetchYoutubeData();
      }, 3000);
    }
  } else {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
    if (pushVideoTimer) {
      window.clearTimeout(pushVideoTimer);
      pushVideoTimer = undefined;
      isPushVideoVisible = false;
    }
  }
}

export function initYoutubeTab(root: HTMLElement): void {
  containerEl = root;
  render();
}

export async function controlEncoder(action: "start" | "stop", target: 1 | 2 | "both" = "both"): Promise<void> {
  try {
    await fetch(`/api/v1/encoder/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encoder: target }),
    });
    showToast(`Enkooderi: ${action.toUpperCase()} (${target})`);
    void fetchAtemAndEncoder().then(render);
  } catch (err: unknown) {
    alert("Enkooderin ohjaus epäonnistui: " + (err instanceof Error ? err.message : String(err)));
  }
}

export async function switchAtemCut(): Promise<void> {
  try {
    await fetch("/api/v1/video-mixer/cut", { method: "POST" });
    showToast("ATEM CUT suoritettu");
    void fetchAtemAndEncoder().then(render);
  } catch (err: unknown) {
    showToast("ATEM CUT virhe");
  }
}

export async function switchAtemAuto(): Promise<void> {
  try {
    await fetch("/api/v1/video-mixer/auto", { method: "POST" });
    showToast("ATEM AUTO siirtymä suoritettu");
    void fetchAtemAndEncoder().then(render);
  } catch (err: unknown) {
    showToast("ATEM AUTO virhe");
  }
}

export async function setAtemProgramInput(input: number): Promise<void> {
  try {
    await fetch("/api/v1/video-mixer/program", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    showToast(`ATEM Program: Input ${input}`);
    void fetchAtemAndEncoder().then(render);
  } catch (err: unknown) {
    showToast("ATEM Program vaihto epäonnistui");
  }
}

function getStatusBadge(state: string): { label: string; bg: string; text: string; pulse: boolean } {
  switch (state.toLowerCase()) {
    case "live":
      return { label: "LIVE", bg: "bg-error", text: "text-on-error", pulse: true };
    case "testing":
      return { label: "TESTING", bg: "bg-amber-500", text: "text-white", pulse: true };
    case "ready":
      return { label: "READY", bg: "bg-blue-600", text: "text-white", pulse: false };
    case "complete":
      return { label: "COMPLETED", bg: "bg-surface-container-highest", text: "text-on-surface-variant", pulse: false };
    default:
      return { label: "OFFLINE", bg: "bg-surface-container-highest", text: "text-on-surface-variant", pulse: false };
  }
}

function getHealthBadge(health: string): { label: string; bg: string; text: string } {
  switch (health?.toLowerCase()) {
    case "good":
      return { label: "Ingest: Good", bg: "bg-green-600/20 text-green-700 dark:text-green-300 border-green-500/40", text: "text-green-700" };
    case "ok":
      return { label: "Ingest: OK", bg: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40", text: "text-amber-700" };
    case "poor":
      return { label: "Ingest: Poor", bg: "bg-error-container text-on-error-container border-error/40", text: "text-error" };
    default:
      return { label: "Ingest: No Data", bg: "bg-surface-container-highest text-on-surface-variant border-outline-variant/30", text: "text-on-surface-variant" };
  }
}

function renderAutoButtons(domain: "encoder" | "youtube", current: AutoMode): string {
  const modes: AutoMode[] = ["on", "off", "auto"];
  return modes.map(m => {
    const active = m === current;
    const style = active ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant bg-surface-container-highest hover:text-on-surface";
    return `<button type="button" data-auto-domain="${domain}" data-auto-value="${m}" class="px-2.5 py-1 rounded-md text-[10px] font-label-sm font-bold uppercase transition-all ${style}">${m.toUpperCase()}</button>`;
  }).join("");
}

function render(): void {
  if (!containerEl) return;

  const state = currentStatus?.state ?? "offline";
  const statusBadge = getStatusBadge(state);
  const healthBadge = getHealthBadge(currentStatus?.streamHealth ?? "noData");
  const currentBroadcast = currentStatus?.selectedBroadcast;
  const broadcastId = currentBroadcast?.id;

  const captionSent = currentStatus?.captions?.sent ?? 0;
  const captionDropped = currentStatus?.captions?.dropped ?? 0;
  const isCaptionsActive = state === "live" && captionSent >= 0;

  const isLive = state === "live";
  const canGoLive = Boolean(broadcastId) && !isLive;

  // ATEM status
  const isAtemOnline = atemState?.connected ?? true;
  const atemPgm = atemState?.programInput ?? 1;
  const atemPrv = atemState?.previewInput ?? 2;

  // Encoder status
  const enc1Running = encoderState?.encoder1?.state === "RUNNING" || encoderState?.encoder1?.state === "ACTIVE";
  const enc2Running = encoderState?.encoder2?.state === "RUNNING" || encoderState?.encoder2?.state === "ACTIVE";
  const isEncoderActive = enc1Running || enc2Running;

  containerEl.innerHTML = `
    <div class="space-y-space-md">
      <!-- PIPELINE HEADER WITH BREADCRUMB -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-red-600/15 text-red-600 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[20px]">smart_display</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Video Stream Flow</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${statusBadge.bg} ${statusBadge.text} ${statusBadge.pulse ? "animate-pulse" : ""}">
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>${statusBadge.label}</span>
                </span>
              </div>
              <span class="font-label-sm text-[10px] text-on-surface-variant">ATEM &rarr; Matrox Monarch HDX &rarr; YouTube Live &rarr; Captions</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${healthBadge.bg}">
              ${healthBadge.label}
            </span>
            <button type="button" id="yt-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä tila">
              <span class="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>
        </div>

        <!-- 4-Step Pipeline Flow Strip -->
        <div class="grid grid-cols-4 gap-1 pt-1 text-center font-label-sm text-[10px] font-bold">
          <div class="p-1.5 rounded-lg ${isAtemOnline ? "bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30" : "bg-surface-container text-on-surface-variant"}">
            1. ATEM Switcher
          </div>
          <div class="p-1.5 rounded-lg ${isEncoderActive ? "bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30" : "bg-surface-container text-on-surface-variant"}">
            2. Matrox Encoder
          </div>
          <div class="p-1.5 rounded-lg ${isLive ? "bg-red-600/15 text-red-700 dark:text-red-300 border border-red-500/30" : "bg-surface-container text-on-surface-variant"}">
            3. YouTube Live
          </div>
          <div class="p-1.5 rounded-lg ${isCaptionsActive ? "bg-primary/20 text-primary border border-primary/40" : "bg-surface-container text-on-surface-variant"}">
            4. Closed Captions
          </div>
        </div>
      </div>

      ${errorMessage ? `
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${escapeHtml(errorMessage)}</span>
        </div>
      ` : ""}

      <!-- STEP 1: ATEM SWITCHER STATUS CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">view_carousel</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 1: ATEM Switcher</h3>
          </div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${isAtemOnline ? "bg-green-600 text-white" : "bg-error text-white"}">
            ${isAtemOnline ? "ATEM Online" : "ATEM Offline"}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
            <span class="text-on-surface-variant font-bold text-[10px] uppercase">Program (On Air):</span>
            <span class="px-2 py-0.5 rounded bg-error text-on-error font-mono font-bold text-[11px]">Input ${atemPgm}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
            <span class="text-on-surface-variant font-bold text-[10px] uppercase">Preview (Next):</span>
            <span class="px-2 py-0.5 rounded bg-green-600 text-white font-mono font-bold text-[11px]">Input ${atemPrv}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
          <button type="button" id="atem-cut-btn" class="flex-1 h-9 rounded-lg bg-surface-container-high hover:bg-error hover:text-white text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all shadow-sm">
            CUT Leikkaus
          </button>
          <button type="button" id="atem-auto-btn" class="flex-1 h-9 rounded-lg bg-surface-container-high hover:bg-primary hover:text-white text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all shadow-sm">
            AUTO Siirtymä
          </button>
        </div>
      </div>

      <!-- STEP 2: VIDEO ENCODER (MATROX MONARCH HDX) + PUSH-TO-SEE-VIDEO PREVIEW -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">videocam</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 2: Video Encoder (Matrox Monarch HDX)</h3>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-label-sm text-on-surface-variant">Auto:</span>
            <div class="flex gap-0.5 p-0.5 bg-surface-container-highest rounded-md">
              ${renderAutoButtons("encoder", encoderAutoMode)}
            </div>
          </div>
        </div>

        <!-- Encoder 1 & Encoder 2 Toggles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Encoder 1: RTMP Stream -->
          <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-[12px] block text-on-surface">Encoder 1 (Stream RTMP)</span>
                <span class="text-[10px] text-on-surface-variant font-mono">1080p50 @ 6000 kbps</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${enc1Running ? "bg-green-600 text-white" : "bg-surface-container-highest text-on-surface-variant"}">
                ${enc1Running ? "STREAMING" : "STOPPED"}
              </span>
            </div>
            <div class="flex gap-1.5">
              <button type="button" data-enc-action="start" data-enc-id="1" class="flex-1 h-8 rounded-md bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-[10px] font-bold uppercase transition-all">
                Käynnistä
              </button>
              <button type="button" data-enc-action="stop" data-enc-id="1" class="flex-1 h-8 rounded-md bg-surface-container-high hover:bg-error hover:text-white text-on-surface font-label-sm text-[10px] font-bold uppercase transition-all">
                Pysäytä
              </button>
            </div>
          </div>

          <!-- Encoder 2: MP4 Record -->
          <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-[12px] block text-on-surface">Encoder 2 (Tallennus MP4)</span>
                <span class="text-[10px] text-on-surface-variant font-mono">USB / SD Master</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${enc2Running ? "bg-red-600 text-white animate-pulse" : "bg-surface-container-highest text-on-surface-variant"}">
                ${enc2Running ? "RECORDING" : "STOPPED"}
              </span>
            </div>
            <div class="flex gap-1.5">
              <button type="button" data-enc-action="start" data-enc-id="2" class="flex-1 h-8 rounded-md bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-[10px] font-bold uppercase transition-all">
                Käynnistä
              </button>
              <button type="button" data-enc-action="stop" data-enc-id="2" class="flex-1 h-8 rounded-md bg-surface-container-high hover:bg-error hover:text-white text-on-surface font-label-sm text-[10px] font-bold uppercase transition-all">
                Pysäytä
              </button>
            </div>
          </div>
        </div>

        <!-- PUSH-TO-SEE-VIDEO CONFIDENCE PREVIEW -->
        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-primary">visibility</span>
              <span class="font-bold text-[12px] text-on-surface">Enkooderin videokuvan esikatselu</span>
            </div>
            <button
              type="button"
              id="push-to-see-video-btn"
              class="px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 shadow-sm ${isPushVideoVisible ? "bg-amber-500 text-white" : "bg-primary text-on-primary hover:bg-primary/90"}">
              <span class="material-symbols-outlined text-[15px]">${isPushVideoVisible ? "visibility_off" : "touch_app"}</span>
              <span>${isPushVideoVisible ? "Piilota kuva" : "Push to see video"}</span>
            </button>
          </div>

          <p class="text-[10px] font-body-sm text-on-surface-variant">
            Esikatselu on oletuksena suljettuna verkkokuorman säästämiseksi. Paina painiketta nähdäksesi enkooderin kuvan hetkeksi.
          </p>

          ${isPushVideoVisible ? `
            <div class="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-outline-variant/40 shadow-inner flex items-center justify-center animate-fadeIn">
              <img
                src="/api/v1/snapshot?t=${Date.now()}"
                alt="Encoder Preview"
                class="w-full h-full object-cover"
                onerror="this.style.display='none'; document.getElementById('snapshot-fallback').classList.remove('hidden');" />
              <div id="snapshot-fallback" class="hidden flex flex-col items-center justify-center gap-2 p-4 text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-[36px] text-primary animate-spin">refresh</span>
                <span class="text-[11px] font-mono">Haetaan suoraa videokuvaa enkooderilta…</span>
              </div>
              <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[9px]">
                Auto-closing in 20s
              </div>
            </div>
          ` : ""}
        </div>
      </div>

      <!-- STEP 3: YOUTUBE LIVE STATUS & CONTROLS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">event</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 3: YouTube Live Broadcast</h3>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <span class="text-[10px] font-label-sm text-on-surface-variant">Auto:</span>
              <div class="flex gap-0.5 p-0.5 bg-surface-container-highest rounded-md">
                ${renderAutoButtons("youtube", youtubeAutoMode)}
              </div>
            </div>
            <button type="button" id="yt-open-create-btn" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-[11px] font-bold uppercase transition-all hover:bg-primary/90 active:scale-95 shadow-sm">
              <span class="material-symbols-outlined text-[15px]">add_circle</span>
              <span>+ Uusi lähetys</span>
            </button>
          </div>
        </div>

        <!-- Target Broadcast Selector -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div class="relative flex-1">
            <select id="yt-broadcast-select" class="w-full h-10 px-3 bg-surface-container rounded-lg border border-outline-variant/50 text-on-surface font-body-sm text-[13px] focus:outline-none focus:border-primary appearance-none pr-8">
              <option value="auto" ${selectedId === "auto" ? "selected" : ""}>[Auto: Valitse lähin aikataulutettu lähetys]</option>
              ${broadcastList.map(b => {
                const isSel = b.id === selectedId;
                const dateStr = b.scheduledStartTime ? new Date(b.scheduledStartTime).toLocaleString("fi-FI", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
                return `<option value="${escapeHtml(b.id)}" ${isSel ? "selected" : ""}>${escapeHtml(b.title)} (${b.privacy.toUpperCase()}) ${dateStr ? "— " + dateStr : ""}</option>`;
              }).join("")}
            </select>
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">arrow_drop_down</span>
          </div>

          <button type="button" id="yt-select-confirm-btn" class="h-10 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 flex-shrink-0">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>Valitse</span>
          </button>
        </div>

        ${currentBroadcast ? `
          <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/25 space-y-1 text-[11px] font-body-sm">
            <div class="flex items-center justify-between text-on-surface">
              <span class="font-bold text-[12px] truncate">${escapeHtml(currentBroadcast.title)}</span>
              <span class="font-mono text-[10px] uppercase font-bold text-primary">${escapeHtml(currentBroadcast.privacy)}</span>
            </div>
            <div class="flex items-center justify-between pt-1 text-[10px]">
              <span class="font-mono text-on-surface-variant">ID: ${escapeHtml(currentBroadcast.id)}</span>
              <div class="flex items-center gap-2">
                <a href="https://studio.youtube.com/video/${escapeHtml(currentBroadcast.id)}/livestreaming" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  <span>Studio</span>
                  <span class="material-symbols-outlined text-[11px]">open_in_new</span>
                </a>
                <a href="https://youtu.be/${escapeHtml(currentBroadcast.id)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  <span>Watch</span>
                  <span class="material-symbols-outlined text-[11px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        ` : ""}

        <!-- YouTube Live Embedded Confidence Player -->
        <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          ${broadcastId ? `
            <iframe
              id="yt-preview-iframe"
              class="w-full h-full border-0"
              src="https://www.youtube.com/embed/${escapeHtml(broadcastId)}?autoplay=1&mute=1&enablejsapi=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          ` : `
            <div class="flex flex-col items-center justify-center gap-2 p-6 text-center text-on-surface-variant/60">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant/40">tv_off</span>
              <p class="font-body-sm text-[12px]">Ei aktiivista esikatselua. Valitse lähetys nähdäksesi kuvan.</p>
            </div>
          `}
        </div>

        <!-- Controls: Go Live / End -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            id="yt-go-live-btn"
            ${canGoLive ? "" : "disabled"}
            class="h-12 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[13px] font-bold uppercase transition-all shadow-sm ${canGoLive ? "bg-primary hover:bg-primary/90 text-on-primary active:scale-95" : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"}">
            <span class="material-symbols-outlined text-[20px]">podcasts</span>
            <span>Aloita lähetys / Go Live</span>
          </button>

          <button
            type="button"
            id="yt-end-live-btn"
            ${isLive ? "" : "disabled"}
            class="h-12 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[13px] font-bold uppercase transition-all shadow-sm ${isLive ? "bg-error hover:bg-error/90 text-on-error active:scale-95" : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"}">
            <span class="material-symbols-outlined text-[20px]">stop_circle</span>
            <span>Lopeta lähetys / End</span>
          </button>
        </div>
      </div>

      <!-- STEP 4: CLOSED CAPTIONS INGESTION INFO -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">closed_caption</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 4: YouTube Closed Captions Telemetry</h3>
          </div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${isCaptionsActive ? "bg-primary/15 text-primary border-primary/30" : "bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
            ${isCaptionsActive ? `Streaming (${captionSent} pkt)` : "Waiting"}
          </span>
        </div>

        <!-- Explanatory Banner regarding unidirectional HTTP chunked captions -->
        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-[11px] font-body-sm space-y-1.5">
          <div class="flex items-start gap-2">
            <span class="material-symbols-outlined text-[16px] text-amber-500 flex-shrink-0 mt-0.5">info</span>
            <div class="space-y-1 text-on-surface-variant">
              <p>
                <strong>Huomio tekstityksen tilasta:</strong> Tekstitykset lähetetään YouTubeen yksisuuntaisella HTTP chunked POST -siirrolla 30 sekunnin aikaoffsetilla. YouTube Data API ei tarjoa kuittausta (ack/readback) tekstityksen vastaanotosta.
              </p>
              <p class="text-primary font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">touch_app</span>
                <span>Varmista tekstityksen toimivuus soittimen omalla <strong>[CC]</strong> -painikkeella yllä olevassa YouTube-esikatselussa.</span>
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Captions Sent</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">${captionSent}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Dropped</span>
            <span class="font-bold text-on-surface font-mono text-[13px] ${captionDropped > 0 ? "text-error" : ""}">${captionDropped}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Delay Offset</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">30 s</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Protocol</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">HTTP POST</span>
          </div>
        </div>
      </div>
    </div>
  `;

  attachHandlers();
}

function attachHandlers(): void {
  // Refresh button
  const refreshBtn = document.getElementById("yt-refresh-btn");
  if (refreshBtn) {
    refreshBtn.onclick = () => void fetchYoutubeData();
  }

  // ATEM actions
  const cutBtn = document.getElementById("atem-cut-btn");
  if (cutBtn) cutBtn.onclick = () => void switchAtemCut();

  const autoBtn = document.getElementById("atem-auto-btn");
  if (autoBtn) autoBtn.onclick = () => void switchAtemAuto();

  // Encoder actions
  const encActionBtns = containerEl?.querySelectorAll("[data-enc-action]");
  encActionBtns?.forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-enc-action") as "start" | "stop";
      const idStr = btn.getAttribute("data-enc-id");
      const target = idStr === "1" ? 1 : idStr === "2" ? 2 : "both";
      if (action) void controlEncoder(action, target);
    });
  });

  // Push to see video button
  const pushVideoBtn = document.getElementById("push-to-see-video-btn");
  if (pushVideoBtn) {
    pushVideoBtn.onclick = () => {
      isPushVideoVisible = !isPushVideoVisible;
      if (isPushVideoVisible) {
        if (pushVideoTimer) clearTimeout(pushVideoTimer);
        // Automatically close after 20 seconds to conserve resources
        pushVideoTimer = window.setTimeout(() => {
          isPushVideoVisible = false;
          render();
        }, 20000);
      }
      render();
    };
  }

  // Auto mode toggles
  const autoDomainBtns = containerEl?.querySelectorAll("[data-auto-domain]");
  autoDomainBtns?.forEach(btn => {
    btn.addEventListener("click", () => {
      const domain = btn.getAttribute("data-auto-domain");
      const val = btn.getAttribute("data-auto-value") as AutoMode;
      if (domain === "encoder") {
        encoderAutoMode = val;
        showToast(`Enkooderin automaatiotila: ${val.toUpperCase()}`);
      } else if (domain === "youtube") {
        youtubeAutoMode = val;
        showToast(`YouTuben automaatiotila: ${val.toUpperCase()}`);
      }
      render();
    });
  });

  // Target broadcast select confirmation
  const selectConfirmBtn = document.getElementById("yt-select-confirm-btn");
  if (selectConfirmBtn) {
    selectConfirmBtn.onclick = async () => {
      const sel = document.getElementById("yt-broadcast-select") as HTMLSelectElement | null;
      if (!sel) return;
      const bId = sel.value;
      if (bId === "auto") {
        selectedId = "auto";
        showToast("Auto-valinta käytössä");
        void fetchYoutubeData();
        return;
      }
      try {
        await request("POST", "/broadcasts/select", { broadcastId: bId });
        selectedId = bId;
        showToast(`Lähetys valittu: ${bId}`);
        void fetchYoutubeData();
      } catch (err: unknown) {
        alert("Valinta epäonnistui: " + (err instanceof Error ? err.message : String(err)));
      }
    };
  }

  // Go Live button
  const goLiveBtn = document.getElementById("yt-go-live-btn");
  if (goLiveBtn) {
    goLiveBtn.onclick = async () => {
      if (!confirm("Oletko varma että haluat aloittaa suoran lähetyksen YouTubessa?")) return;
      try {
        await request("POST", "/broadcasts/start");
        showToast("YouTube suora lähetys käynnistetty!");
        void fetchYoutubeData();
      } catch (err: unknown) {
        alert("Lähetyksen aloitus epäonnistui: " + (err instanceof Error ? err.message : String(err)));
      }
    };
  }

  // End Live button
  const endLiveBtn = document.getElementById("yt-end-live-btn");
  if (endLiveBtn) {
    endLiveBtn.onclick = () => {
      executeStopBroadcast();
    };
  }

  // Open create modal button
  const createBtn = document.getElementById("yt-open-create-btn");
  if (createBtn) {
    createBtn.onclick = () => {
      const modal = document.getElementById("yt-create-modal");
      if (modal) modal.classList.remove("hidden");
    };
  }
}

export async function submitAdHocBroadcast(title: string, privacy: string, description: string = ""): Promise<void> {
  try {
    const res = await request<{ broadcast?: BroadcastSummary; id?: string }>("POST", "/broadcasts/create", {
      title,
      privacy,
      description,
    });
    const bId = res?.broadcast?.id || res?.id;
    if (bId) {
      selectedId = bId;
      showToast(`Uusi lähetys luotu: ${title}`);
    }
    void fetchYoutubeData();
  } catch (err: unknown) {
    alert("Lähetyksen luonti epäonnistui: " + (err instanceof Error ? err.message : String(err)));
  }
}

export async function executeStopBroadcast(): Promise<void> {
  if (!confirm("Haluatko varmasti lopettaa suoran lähetyksen? Lähetystä ei voi avata uudelleen.")) return;
  try {
    await request("POST", "/broadcasts/stop");
    showToast("Suora lähetys päättynyt.");
    void fetchYoutubeData();
  } catch (err: unknown) {
    alert("Lähetyksen lopetus epäonnistui: " + (err instanceof Error ? err.message : String(err)));
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
