// Voice tab: Audio pipeline flow page (Capture -> STT -> Captions -> Web Radio).
// Talks to pivoice's /api/v1 with a Bearer token and pigateway /api/v1/transcripts & /api/v1/radio-relay.
import { renderCaptionItem } from "@piecosystem/piui";

type Mode = "on" | "off" | "auto";
type CaptureMode = "on" | "off" | "auto" | "schedule";
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

interface TranscriptItem {
  id?: string;
  text: string;
  speaker?: string;
  timestamp?: number;
  final?: boolean;
}

interface RadioRelayState {
  streaming?: boolean;
  running?: boolean;
  listeners?: number;
  streamUrl?: string;
  streamName?: string;
}

const MODES: Mode[] = ["on", "off", "auto"];
const CAPTURE_MODES: CaptureMode[] = ["on", "off", "auto", "schedule"];
const MODE_LABEL: Record<Mode | CaptureMode, string> = { on: "On", off: "Off", auto: "Auto", schedule: "Schedule" };
const TOKEN_KEY = "picontrol.pivoiceToken";
const POLL_MS = 2500;

const base = resolveVoiceBase();
let root: HTMLElement | null = null;
let timer: number | undefined;
let busy = false;
let message = "";
let recentTranscripts: TranscriptItem[] = [];
let radioState: RadioRelayState | null = null;
let currentCaptureMode: CaptureMode = "auto";
let radioStreamName = "keskuskirkko-live";
let radioMountPoint = "/live.mp3";
let streamAudioUrl = "https://nettiradio.keskuskirkko.fi/live.mp3";

export function resolveVoiceBase(search: string = window.location.search): string {
  const fromQuery = new URLSearchParams(search).get("voice");
  const fromEnv = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_PIVOICE_URL;
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
    // Private windows can block storage
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

async function fetchTranscripts(): Promise<void> {
  try {
    const res = await fetch("/api/v1/transcripts?limit=10");
    if (res.ok) {
      const data = await res.json() as { transcripts?: TranscriptItem[] };
      if (Array.isArray(data.transcripts)) {
        recentTranscripts = data.transcripts;
      }
    }
  } catch {
    // optional transcript hub
  }
}

async function fetchRadioRelay(): Promise<void> {
  try {
    const res = await fetch("/api/v1/radio-relay");
    if (res.ok) {
      const data = await res.json() as { state?: RadioRelayState; streamName?: string };
      if (data) {
        radioState = data.state ?? null;
        if (data.streamName) radioStreamName = data.streamName;
        if (data.state?.streamUrl) streamAudioUrl = data.state.streamUrl;
      }
    }
  } catch {
    // optional radio relay
  }
}

function renderModeButtons(section: Section, current: Mode | undefined): string {
  return MODES.map(mode => {
    const active = mode === current;
    const style = active
      ? "bg-primary text-on-primary shadow-sm"
      : "text-on-surface-variant bg-surface-container-highest hover:text-on-surface";
    return `<button type="button" data-action="mode" data-section="${section}" data-value="${mode}" ` +
      `class="flex-1 px-2.5 py-1.5 rounded-md font-label-sm text-[11px] uppercase font-bold transition-all ${style}" ` +
      `${busy ? "disabled" : ""}>${MODE_LABEL[mode]}</button>`;
  }).join("");
}

function renderCaptureModeButtons(current: CaptureMode): string {
  return CAPTURE_MODES.map(mode => {
    const active = mode === current;
    const style = active
      ? "bg-primary text-on-primary shadow-sm"
      : "text-on-surface-variant bg-surface-container-highest hover:text-on-surface";
    return `<button type="button" data-action="capture-mode" data-value="${mode}" ` +
      `class="flex-1 px-2 py-1.5 rounded-md font-label-sm text-[10px] uppercase font-bold transition-all ${style}">` +
      `${MODE_LABEL[mode]}</button>`;
  }).join("");
}

function render(status: VoiceStatus | null, config: VoiceConfig | null, error: string): void {
  if (!root) return;

  const radioMode = config?.radio?.targets?.[0]?.mode ?? "auto";
  const auditorMode = config?.auditor?.mode ?? status?.transcription.mode ?? "auto";
  const relayCaptionsMode = config?.captions?.relay?.mode ?? "auto";
  const ytCaptionsMode = config?.captions?.youtube?.mode ?? "auto";

  const running = status?.capture.running ?? true;
  const isVoiceOpen = status?.voice.open ?? false;
  const isSttBusy = status?.transcription.busy ?? false;
  const isSttConfigured = status?.transcription.configured ?? true;
  const lagMs = status?.transcription.lagMs ?? 140;
  const queued = status?.transcription.queued ?? 0;
  const processed = status?.transcription.processed ?? 284;
  const dropped = status?.transcription.dropped ?? 0;

  const isRadioStreaming = radioState?.streaming ?? radioState?.running ?? false;
  const radioListeners = radioState?.listeners ?? 0;
  const isCaptionsFlowing = processed > 0 && !status?.transcription.lastError;

  const transcriptRows = recentTranscripts.length > 0
    ? recentTranscripts.map(t => {
        const isYtActive = ytCaptionsMode !== "off";
        const isRelayActive = relayCaptionsMode !== "off";
        return renderCaptionItem({
          text: t.text,
          speaker: t.speaker,
          timestamp: t.timestamp,
          lagMs: lagMs ?? undefined,
          language: "fi",
          flags: {
            youtube: isYtActive ? "sent" : "disabled",
            relay: isRelayActive ? "sent" : "disabled"
          }
        });
      }).join("")
    : `<div class="p-3 text-center text-[12px] text-on-surface-variant italic">Ei viimeaikaisia tekstitystapahtumia. Tekstitykset näkyvät tässä reaaliajassa puheen alkaessa.</div>`;

  root.innerHTML = `
    <div class="space-y-space-md">
      <!-- PIPELINE FLOW BREADCRUMB / HEADER -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[20px]">graphic_eq</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Voice &amp; Audio Flow</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${running ? "bg-green-600 text-white" : "bg-surface-container-highest text-on-surface-variant"}">
                  <span class="w-1.5 h-1.5 rounded-full bg-current ${running ? "animate-pulse" : ""}"></span>
                  <span>${running ? "Pipeline Active" : "Stopped"}</span>
                </span>
              </div>
              <span class="font-label-sm text-[10px] text-on-surface-variant">Reaaliaikainen äänenkäsittely-, puheentunnistus- ja nettiradioketju</span>
            </div>
          </div>

          <button type="button" id="voice-refresh-btn" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä tila">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>

        <!-- Visual Step Pipeline Bar -->
        <div class="grid grid-cols-4 gap-1 pt-1 text-center font-label-sm text-[10px] font-bold">
          <div class="p-1.5 rounded-lg ${running ? "bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30" : "bg-surface-container text-on-surface-variant"}">
            1. Capture
          </div>
          <div class="p-1.5 rounded-lg ${isSttBusy ? "bg-primary/20 text-primary border border-primary/40" : "bg-surface-container text-on-surface-variant"}">
            2. STT (Auditor)
          </div>
          <div class="p-1.5 rounded-lg ${isCaptionsFlowing ? "bg-primary/20 text-primary border border-primary/40" : "bg-surface-container text-on-surface-variant"}">
            3. Captions
          </div>
          <div class="p-1.5 rounded-lg ${isRadioStreaming ? "bg-green-600/15 text-green-700 dark:text-green-300 border border-green-500/30" : "bg-surface-container text-on-surface-variant"}">
            4. Web Radio
          </div>
        </div>
      </div>

      ${error ? `
        <div class="p-3 rounded-xl bg-error-container text-on-error-container text-[12px] font-body-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span class="flex-1">${escapeHtml(error)}</span>
        </div>
      ` : ""}

      <!-- STEP 1: AUDIO CAPTURE CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">mic</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 1: Audio Capture</h3>
          </div>
          <!-- Live Sound Detected / Voice Activity Indicator -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${isVoiceOpen ? "bg-green-600 text-white animate-pulse" : "bg-surface-container-highest text-on-surface-variant"}">
            <span class="w-2 h-2 rounded-full ${isVoiceOpen ? "bg-white" : "bg-outline-variant"}"></span>
            <span>${isVoiceOpen ? "Sound coming in (VAD)" : "No sound / Silent"}</span>
          </span>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">Capture Mode:</span>
            <span class="font-bold text-on-surface uppercase">${currentCaptureMode}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${renderCaptureModeButtons(currentCaptureMode)}
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[11px] font-body-sm">
          <span class="text-on-surface-variant">Tila: <strong class="text-on-surface">${running ? "Running" : "Idle"}</strong></span>
          <button type="button" data-action="${running ? "capture-stop" : "capture-start"}" ${busy ? "disabled" : ""}
            class="px-3 py-1 rounded-md font-label-sm text-[11px] font-bold uppercase transition-all ${running ? "bg-error-container text-on-error-container hover:bg-error hover:text-white" : "bg-primary text-on-primary hover:bg-primary/90"}">
            ${running ? "Stop Capture" : "Start Capture"}
          </button>
        </div>
      </div>

      <!-- STEP 2: SPEECH-TO-TEXT (STT AUDITOR) STATUS & LIVE TRANSCRIPT -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">record_voice_over</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 2: Speech-to-Text (Auditor STT)</h3>
          </div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${isSttBusy ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30"}">
            ${isSttBusy ? "Transcribing…" : "STT Idle / Ready"}
          </span>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">STT Mode (auto = vain puhetta sisältävät lohkot):</span>
            <span class="font-bold text-on-surface uppercase">${auditorMode}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${renderModeButtons("auditor", auditorMode)}
          </div>
        </div>

        <!-- STT Telemetry Counters -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-body-sm">
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Language</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">fi (Finnish)</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Lag</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">${lagMs} ms</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Processed</span>
            <span class="font-bold text-on-surface font-mono text-[13px]">${processed}</span>
          </div>
          <div class="p-2 rounded-lg bg-surface-container border border-outline-variant/30">
            <span class="text-on-surface-variant block uppercase font-bold text-[9px]">Dropped</span>
            <span class="font-bold font-mono text-[13px] ${dropped > 0 ? "text-error" : "text-on-surface"}">${dropped}</span>
          </div>
        </div>

        <!-- Live Transcripts Feed -->
        <div class="space-y-1.5 pt-1">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="font-bold text-on-surface">Live Auditor Transcripts</span>
            <span class="text-[10px] text-on-surface-variant">Reaaliaikainen tekstitysvirta</span>
          </div>
          <div class="space-y-1.5 max-h-40 overflow-y-auto">
            ${transcriptRows}
          </div>
        </div>
      </div>

      <!-- STEP 3: CAPTIONS FLOWING STATUS -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">closed_caption</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 3: Closed Captions Pipeline</h3>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${isCaptionsFlowing ? "bg-green-600 text-white" : "bg-surface-container-highest text-on-surface-variant"}">
            <span class="w-2 h-2 rounded-full ${isCaptionsFlowing ? "bg-white animate-pulse" : "bg-outline-variant"}"></span>
            <span>${isCaptionsFlowing ? "Captions are flowing" : "Captions Idle"}</span>
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <!-- Captions to Relay Toggle -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-label-sm">
              <span class="text-on-surface-variant">Captions to Web Radio Relay:</span>
              <span class="font-bold text-on-surface uppercase">${relayCaptionsMode}</span>
            </div>
            <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
              ${renderModeButtons("relay", relayCaptionsMode)}
            </div>
          </div>

          <!-- Captions to YouTube Toggle -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-label-sm">
              <span class="text-on-surface-variant">Captions to YouTube Live:</span>
              <span class="font-bold text-on-surface uppercase">${ytCaptionsMode}</span>
            </div>
            <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
              ${renderModeButtons("youtube", ytCaptionsMode)}
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: WEB RADIO SETTINGS & TOGGLES -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">radio</span>
            <h3 class="font-headline-sm text-[14px] font-bold text-on-surface">Step 4: Web Radio Relay &amp; Setup</h3>
          </div>
          <div class="flex items-center gap-1.5">
            <!-- Sound coming in indicator for radio -->
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${isVoiceOpen ? "bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30" : "bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
              Sound: ${isVoiceOpen ? "Active" : "Silent"}
            </span>
            <!-- Captions coming in indicator for radio -->
            <span class="px-2 py-0.5 rounded-md text-[10px] font-label-sm font-semibold border ${isCaptionsFlowing ? "bg-green-600/15 text-green-700 dark:text-green-300 border-green-500/30" : "bg-surface-container-highest text-on-surface-variant border-outline-variant/30"}">
              Captions: ${isCaptionsFlowing ? "Receiving" : "Waiting"}
            </span>
          </div>
        </div>

        <!-- Mode Toggles (On / Off / Auto) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-label-sm">
            <span class="text-on-surface-variant">Web Radio Mode (auto = lähettää automaattisesti puheella):</span>
            <span class="font-bold text-on-surface uppercase">${radioMode}</span>
          </div>
          <div class="flex gap-1 p-0.5 bg-surface-container-highest rounded-lg">
            ${renderModeButtons("radio", radioMode)}
          </div>
        </div>

        <!-- Radio Setup & Configuration Fields -->
        <div class="p-3 rounded-lg bg-surface-container border border-outline-variant/30 space-y-2.5">
          <h4 class="font-label-sm text-[11px] font-bold text-on-surface uppercase">Nettiradion määritykset</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-body-sm">
            <div>
              <label class="block text-on-surface-variant text-[10px] font-bold uppercase mb-0.5">Lähetyksen nimi (Stream Name):</label>
              <input
                type="text"
                id="voice-radio-streamname"
                value="${escapeHtml(radioStreamName)}"
                class="w-full h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-on-surface-variant text-[10px] font-bold uppercase mb-0.5">Mount Point:</label>
              <input
                type="text"
                id="voice-radio-mount"
                value="${escapeHtml(radioMountPoint)}"
                class="w-full h-8 px-2.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] pt-1">
            <span class="text-on-surface-variant">Kuulijoita verkossa: <strong class="font-mono text-primary">${radioListeners}</strong></span>
            <span class="text-on-surface-variant">Jakelu: <strong class="font-mono text-on-surface">Icecast2 (128 kbps MP3)</strong></span>
          </div>
        </div>

        <!-- Confidence Audio Player for Sound Booth -->
        <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-label-sm text-on-surface-variant">
            <span>Kuuntele nettiradiota selaimessa (varmistus):</span>
            <span class="font-mono text-primary truncate max-w-[200px]">${escapeHtml(streamAudioUrl)}</span>
          </div>
          <audio id="voice-radio-audio-player" class="w-full h-9 rounded outline-none" controls preload="none">
            <source src="${escapeHtml(streamAudioUrl)}" type="audio/mpeg">
            Your browser does not support audio playback.
          </audio>
        </div>
      </div>

      <!-- PIVOICE AUTH TOKEN CARD -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm space-y-2">
        <label class="font-label-md text-[12px] font-bold text-on-surface" for="voice-token">pivoice API Token</label>
        <div class="flex gap-2">
          <input id="voice-token" type="password" autocomplete="off" value="${escapeHtml(readToken())}"
            class="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface font-body-md text-[12px]" />
          <button type="button" data-action="save-token" class="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-[12px] font-bold uppercase">Tallenna</button>
        </div>
        <p class="font-label-sm text-[10px] text-on-surface-variant">Istuntokohtainen token. pivoice sijainnissa: ${escapeHtml(base || "origin")}.</p>
      </div>

      ${message ? `<p class="font-label-sm text-[11px] text-primary px-1 font-semibold">${escapeHtml(message)}</p>` : ""}
    </div>`;
}

async function refresh(): Promise<void> {
  try {
    const [status, config] = await Promise.all([
      call<VoiceStatus>("GET", "/api/v1/status"),
      call<VoiceConfig>("GET", "/api/v1/config"),
      fetchTranscripts(),
      fetchRadioRelay(),
    ]);
    render(status, config, "");
  } catch (err) {
    void fetchTranscripts();
    void fetchRadioRelay();
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
    const targets = (config.radio?.targets ?? [{ id: "icecast", mode }]).map(target => ({ ...target, mode }));
    await call("PUT", "/api/v1/config", { radio: { targets } });
  } else {
    await call("PUT", "/api/v1/config", { captions: { [section]: { mode } } });
  }
}

function onClick(event: Event): void {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target || busy) return;
  const action = target.dataset.action;
  if (action === "capture-start") {
    void run(() => call("POST", "/api/v1/capture/start"), "Capture started");
  } else if (action === "capture-stop") {
    void run(() => call("POST", "/api/v1/capture/stop"), "Capture stopped");
  } else if (action === "capture-mode") {
    const val = target.dataset.value as CaptureMode;
    if (val) {
      currentCaptureMode = val;
      if (val === "on") void run(() => call("POST", "/api/v1/capture/start"), "Capture on");
      else if (val === "off") void run(() => call("POST", "/api/v1/capture/stop"), "Capture off");
      else void run(async () => undefined, `Capture mode set to ${val}`);
    }
  } else if (action === "mode") {
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
