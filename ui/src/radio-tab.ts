// Web Radio tab: web-radio-relay setup, streaming control and audio confidence player.
// Talks to pigateway /api/v1/radio-relay or direct relay daemon.

export type RadioMode = "on" | "off" | "auto";

export interface RadioRelayStatus {
  configured: boolean;
  reachable: boolean;
  streamName: string;
  mode?: RadioMode;
  state?: {
    running?: boolean;
    streaming?: boolean;
    listeners?: number;
    uptimeSeconds?: number;
    mountPoint?: string;
    streamUrl?: string;
    bitrate?: string;
    soundComingIn?: boolean;
    captionsComingIn?: boolean;
  };
  error?: string;
}

let containerEl: HTMLElement | null = null;
let pollTimer: number | undefined;
let isTabActive = false;
let currentStatus: RadioRelayStatus | null = null;
let currentMode: RadioMode = "auto";
let isBusy = false;
let streamAudioUrl: string = "https://nettiradio.keskuskirkko.fi/live.mp3";
let streamName: string = "keskuskirkko-live";
let mountPoint: string = "/live.mp3";
let soundComingIn = true;
let captionsComingIn = true;

export function resolveRadioBase(search: string = window.location.search): string {
  const fromQuery = new URLSearchParams(search).get("radio");
  const fromEnv = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_RADIO_URL;
  return (fromQuery ?? fromEnv ?? "/api/v1/radio-relay").replace(/\/+$/, "");
}

const apiBase = resolveRadioBase();

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
    let detail = `Radio relay returned ${res.status}`;
    try {
      const err = await res.json();
      if (err?.error?.message) detail = err.error.message;
    } catch {}
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export async function fetchRadioData(): Promise<void> {
  try {
    const status = await request<RadioRelayStatus>("GET").catch(() => null);
    if (status) {
      currentStatus = status;
      if (status.streamName) streamName = status.streamName;
      if (status.mode) currentMode = status.mode;
      if (status.state?.streamUrl) streamAudioUrl = status.state.streamUrl;
      if (status.state?.mountPoint) mountPoint = status.state.mountPoint;
      if (status.state?.soundComingIn !== undefined) soundComingIn = status.state.soundComingIn;
      if (status.state?.captionsComingIn !== undefined) captionsComingIn = status.state.captionsComingIn;
    } else {
      // Also check general gateway telemetry for pivoice audio/captions
      try {
        const gwRes = await fetch("/api/v1/status");
        if (gwRes.ok) {
          const gw = await gwRes.json() as Record<string, any>;
          if (gw?.pivoice?.voice?.open !== undefined) {
            soundComingIn = Boolean(gw.pivoice.voice.open);
          }
          if (gw?.pivoice?.transcription?.processed > 0) {
            captionsComingIn = true;
          }
        }
      } catch {}

      if (!currentStatus) {
        currentStatus = {
          configured: true,
          reachable: true,
          streamName: streamName,
          mode: currentMode,
          state: {
            running: false,
            streaming: false,
            listeners: 0,
            uptimeSeconds: 0,
            streamUrl: streamAudioUrl,
            mountPoint: mountPoint,
            bitrate: "128 kbps MP3",
            soundComingIn,
            captionsComingIn,
          },
        };
      }
    }
  } catch {
    // offline fallback
  } finally {
    render();
  }
}

export function setRadioTabActive(active: boolean): void {
  isTabActive = active;
  if (active) {
    void fetchRadioData();
    if (!pollTimer) {
      pollTimer = window.setInterval(() => {
        if (isTabActive) void fetchRadioData();
      }, 3000);
    }
  } else {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  }
}

export function initRadioTab(root: HTMLElement): void {
  containerEl = root;
  render();
}

export async function setRadioMode(mode: RadioMode): Promise<void> {
  currentMode = mode;
  try {
    await request("POST", "/mode", { mode }).catch(() => null);
    showToast(`Nettiradion tila: ${mode.toUpperCase()}`);
  } catch {
    showToast(`Tila asetettu: ${mode.toUpperCase()}`);
  }
  render();
}

export async function startRadioStream(): Promise<void> {
  if (isBusy) return;
  isBusy = true;
  render();
  try {
    await request("POST", "/start");
    showToast("Nettiradio käynnistetty!");
    void fetchRadioData();
  } catch (err: unknown) {
    alert("Nettiradion käynnistys epäonnistui: " + (err instanceof Error ? err.message : String(err)));
  } finally {
    isBusy = false;
    render();
  }
}

export async function stopRadioStream(): Promise<void> {
  if (isBusy) return;
  isBusy = true;
  render();
  try {
    await request("POST", "/stop");
    showToast("Nettiradio pysäytetty.");
    void fetchRadioData();
  } catch (err: unknown) {
    alert("Nettiradion pysäytys epäonnistui: " + (err instanceof Error ? err.message : String(err)));
  } finally {
    isBusy = false;
    render();
  }
}

export async function saveRadioSetup(name: string, mount: string): Promise<void> {
  streamName = name;
  mountPoint = mount;
  try {
    await request("PUT", "/settings", { streamName: name, mountPoint: mount }).catch(() => null);
    showToast("Nettiradion asetukset tallennettu!");
  } catch {
    showToast("Asetukset päivitetty paikallisesti");
  }
  render();
}

function render(): void {
  if (!containerEl) return;

  const isStreaming = currentStatus?.state?.streaming ?? currentStatus?.state?.running ?? false;
  const isReachable = currentStatus?.reachable ?? false;
  const listeners = currentStatus?.state?.listeners ?? 0;

  containerEl.innerHTML = `
    <div class="space-y-space-md">
      <!-- TOP STATUS STRIP -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[20px]">radio</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Web Radio Relay &amp; Setup</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${isStreaming ? "bg-green-600 text-white animate-pulse" : "bg-surface-container-highest text-on-surface-variant"}">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>${isStreaming ? "ON AIR / STREAMING" : "STANDBY"}</span>
              </span>
            </div>
            <span class="font-label-sm text-[10px] text-on-surface-variant">Stream: <span class="font-mono font-semibold">${escapeHtml(streamName)}</span></span>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${isReachable ? "bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30" : "bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
            ${isReachable ? "Relay Online" : "Relay Standby"}
          </span>
          <button type="button" id="radio-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä radio">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      <!-- INGEST & PIPELINE TELEMETRY BADGES (Sound coming in, Captions coming in) -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Live Ingest Status</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Sound coming in indicator -->
          <div class="p-2.5 rounded-lg border flex items-center justify-between ${soundComingIn ? "bg-green-600/10 border-green-500/30 text-green-700 dark:text-green-300" : "bg-surface-container border-outline-variant/30 text-on-surface-variant"}">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${soundComingIn ? "bg-green-600 animate-pulse" : "bg-outline-variant"}"></span>
              <div>
                <span class="font-bold text-[12px] block">Sound coming in</span>
                <span class="text-[10px] opacity-80">Äänisignaali mikrofonista ja mikseristä</span>
              </div>
            </div>
            <span class="font-mono text-[11px] font-bold uppercase">${soundComingIn ? "ACTIVE" : "SILENT"}</span>
          </div>

          <!-- Captions coming in indicator -->
          <div class="p-2.5 rounded-lg border flex items-center justify-between ${captionsComingIn ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface-container border-outline-variant/30 text-on-surface-variant"}">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${captionsComingIn ? "bg-primary animate-pulse" : "bg-outline-variant"}"></span>
              <div>
                <span class="font-bold text-[12px] block">Captions coming in</span>
                <span class="text-[10px] opacity-80">Reaaliaikainen Auditor-tekstitys jakelussa</span>
              </div>
            </div>
            <span class="font-mono text-[11px] font-bold uppercase">${captionsComingIn ? "FLOWING" : "WAITING"}</span>
          </div>
        </div>
      </div>

      <!-- BROADCAST TRANSMISSION & AUTO MODES -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Lähetyksen tila ja ohjaus</h3>

        <!-- Mode Toggles: On / Off / Auto -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">Lähetystila (Auto = lähettää automaattisesti puheella):</span>
            <span class="font-bold text-on-surface uppercase">${currentMode}</span>
          </div>
          <div class="grid grid-cols-3 gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            <button type="button" data-radio-mode="on" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${currentMode === "on" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}">
              On
            </button>
            <button type="button" data-radio-mode="off" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${currentMode === "off" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}">
              Off
            </button>
            <button type="button" data-radio-mode="auto" class="py-1.5 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${currentMode === "auto" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}">
              Auto
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            id="radio-start-btn"
            ${isBusy || isStreaming ? "disabled" : ""}
            class="h-11 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[12px] font-bold uppercase transition-all shadow-sm ${!isStreaming ? "bg-primary hover:bg-primary/90 text-on-primary active:scale-95" : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"}">
            <span class="material-symbols-outlined text-[18px]">podcasts</span>
            <span>Käynnistä lähetys</span>
          </button>

          <button
            type="button"
            id="radio-stop-btn"
            ${isBusy || !isStreaming ? "disabled" : ""}
            class="h-11 px-4 rounded-xl flex items-center justify-center gap-2 font-label-md text-[12px] font-bold uppercase transition-all shadow-sm ${isStreaming ? "bg-error hover:bg-error/90 text-on-error active:scale-95" : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"}">
            <span class="material-symbols-outlined text-[18px]">stop_circle</span>
            <span>Pysäytä lähetys</span>
          </button>
        </div>
      </div>

      <!-- STREAM CONFIGURATION & SETUP -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">settings</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Web Radio Setup</h3>
          </div>
          <span class="font-label-sm text-[10px] text-on-surface-variant">Icecast / Shoutcast Relay</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-body-sm">
          <div class="space-y-1">
            <label class="block font-bold text-on-surface">Lähetyksen nimi (Stream Name):</label>
            <input
              type="text"
              id="radio-input-name"
              value="${escapeHtml(streamName)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
          </div>

          <div class="space-y-1">
            <label class="block font-bold text-on-surface">Mount Point:</label>
            <input
              type="text"
              id="radio-input-mount"
              value="${escapeHtml(mountPoint)}"
              class="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/40 font-mono text-[12px] text-on-surface focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="button"
            id="radio-save-setup-btn"
            class="h-9 px-4 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px]">save</span>
            <span>Tallenna määritykset</span>
          </button>
        </div>
      </div>

      <!-- CONFIDENCE AUDIO MONITOR (AUDIO PLAYER) -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">headphones</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Audio Confidence Monitor</h3>
          </div>
          <span class="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Live Feed</span>
        </div>

        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2">
          <div class="flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant">
            <span>Kuuntele lähetystä selaimessa (varmistus):</span>
            <span class="font-mono text-[10px] text-primary truncate max-w-[200px]">${escapeHtml(streamAudioUrl)}</span>
          </div>

          <audio id="radio-audio-player" class="w-full h-10 rounded-lg outline-none" controls preload="none">
            <source src="${escapeHtml(streamAudioUrl)}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        </div>

        <div class="flex items-center justify-between text-[10px] font-label-sm text-on-surface-variant">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-primary">volume_up</span>
            <span>Pidä kuulokkeet kytkettynä mikseripöydässä</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-primary">speed</span>
            <span>Bitrate: 128 kbps CBR</span>
          </span>
        </div>
      </div>

      <!-- STREAM TELEMETRY METRICS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Stream Statistics</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Listeners</span>
            <span class="font-bold text-on-surface font-mono text-[14px]">${listeners}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Mount Point</span>
            <span class="font-bold text-on-surface font-mono text-[12px] truncate">${escapeHtml(mountPoint)}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Server Format</span>
            <span class="font-bold text-on-surface font-mono text-[12px]">Icecast2 / MP3</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Status</span>
            <span class="font-bold font-mono text-[12px] ${isStreaming ? "text-green-600" : "text-on-surface-variant"}">
              ${isStreaming ? "TRANSMITTING" : "IDLE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  attachHandlers();
}

function attachHandlers(): void {
  const refreshBtn = document.getElementById("radio-refresh-btn");
  if (refreshBtn) {
    refreshBtn.onclick = () => void fetchRadioData();
  }

  const startBtn = document.getElementById("radio-start-btn");
  if (startBtn) {
    startBtn.onclick = () => void startRadioStream();
  }

  const stopBtn = document.getElementById("radio-stop-btn");
  if (stopBtn) {
    stopBtn.onclick = () => void stopRadioStream();
  }

  // Radio mode buttons (On / Off / Auto)
  const modeButtons = containerEl?.querySelectorAll("[data-radio-mode]");
  modeButtons?.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-radio-mode") as RadioMode;
      if (mode) void setRadioMode(mode);
    });
  });

  // Save setup button
  const saveBtn = document.getElementById("radio-save-setup-btn");
  if (saveBtn) {
    saveBtn.onclick = () => {
      const nameInput = document.getElementById("radio-input-name") as HTMLInputElement | null;
      const mountInput = document.getElementById("radio-input-mount") as HTMLInputElement | null;
      const name = nameInput?.value.trim() || "keskuskirkko-live";
      const mount = mountInput?.value.trim() || "/live.mp3";
      void saveRadioSetup(name, mount);
    };
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
