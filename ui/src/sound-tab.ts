/**
 * Sound / Mixer Tab (d:\picontrol\ui\src\sound-tab.ts)
 *
 * Full multi-mix audio mixer interface for Riihimäen Keskuskirkko:
 * - Multi-mix: Sali (Kirkkosali PA), Striimi (Broadcast / YouTube), Web Radio output master.
 * - Sali & Striimi have independent per-channel faders and mute/unmute toggles.
 * - Real-time VU meter peaks (-60 to 0 dBFS) and active talker indicators via SSE.
 * - Configurable channel visibility with modal, presets ("Messu", "Bändi", "Kaikki"),
 *   and localStorage persistence.
 * - Master output section for Sali, Striimi, and Web Radio (RADIO VOL, Harman Obj 360).
 */

export interface ChannelMeta {
  id: string;
  name: string;
  role: string;
  group: "handheld" | "madonna" | "wired";
  channelIndex: number;
  profile: string;
}

export const ALL_CHANNELS: ChannelMeta[] = [
  // Wireless Handhelds (1-4)
  { id: "kapula1", name: "Kapula 1", role: "Liturgi / Pappi", group: "handheld", channelIndex: 0, profile: "speech" },
  { id: "kapula2", name: "Kapula 2", role: "Kanttori / Avustaja", group: "handheld", channelIndex: 1, profile: "speech" },
  { id: "kapula3", name: "Kapula 3", role: "Lukija / Tekstinlukija", group: "handheld", channelIndex: 2, profile: "speech" },
  { id: "kapula4", name: "Kapula 4", role: "Vierailija / Varakapula", group: "handheld", channelIndex: 3, profile: "speech" },

  // Wireless Madonnas (1-10)
  { id: "madonna1", name: "Madonna 1", role: "Pappi / Liturgi", group: "madonna", channelIndex: 4, profile: "speech" },
  { id: "madonna2", name: "Madonna 2", role: "Avustava pappi", group: "madonna", channelIndex: 5, profile: "speech" },
  { id: "madonna3", name: "Madonna 3", role: "Kanttori", group: "madonna", channelIndex: 6, profile: "speech" },
  { id: "madonna4", name: "Madonna 4", role: "Nuorisotyöntekijä", group: "madonna", channelIndex: 7, profile: "speech" },
  { id: "madonna5", name: "Madonna 5", role: "Varamadonna 5", group: "madonna", channelIndex: 8, profile: "speech" },
  { id: "madonna6", name: "Madonna 6", role: "Varamadonna 6", group: "madonna", channelIndex: 9, profile: "speech" },
  { id: "madonna7", name: "Madonna 7", role: "Varamadonna 7", group: "madonna", channelIndex: 10, profile: "speech" },
  { id: "madonna8", name: "Madonna 8", role: "Varamadonna 8", group: "madonna", channelIndex: 11, profile: "speech" },
  { id: "madonna9", name: "Madonna 9", role: "Varamadonna 9", group: "madonna", channelIndex: 12, profile: "speech" },
  { id: "madonna10", name: "Madonna 10", role: "Varamadonna 10", group: "madonna", channelIndex: 13, profile: "speech" },

  // Sanctuary Fixed Speech Mics (1-6)
  { id: "wired1", name: "Saarnatuoli", role: "Kiinteä saarnamikki", group: "wired", channelIndex: 14, profile: "speech" },
  { id: "wired2", name: "Alttari Vasen", role: "Alttarimikki V", group: "wired", channelIndex: 15, profile: "speech" },
  { id: "wired3", name: "Alttari Oikea", role: "Alttarimikki O", group: "wired", channelIndex: 16, profile: "speech" },
  { id: "wired4", name: "Lukupulpetti", role: "Tekstinlukupulpetti", group: "wired", channelIndex: 17, profile: "speech" },
  { id: "wired5", name: "Kuoro Vasen", role: "Kuoromikki V", group: "wired", channelIndex: 18, profile: "choir" },
  { id: "wired6", name: "Kuoro Oikea", role: "Kuoromikki O", group: "wired", channelIndex: 19, profile: "choir" },

  // Pulpit Drops & Instruments (7-12)
  { id: "wired7", name: "AV09 Vasen", role: "Lattiarasia 1 (piano)", group: "wired", channelIndex: 20, profile: "piano" },
  { id: "wired8", name: "AV09 Oikea", role: "Lattiarasia 2 (kitara)", group: "wired", channelIndex: 21, profile: "guitar" },
  { id: "wired9", name: "AV10 Vasen", role: "Lattiarasia 3 (rummut)", group: "wired", channelIndex: 22, profile: "drums" },
  { id: "wired10", name: "AV10 Oikea", role: "Lattiarasia 4 (bändi)", group: "wired", channelIndex: 23, profile: "custom" },
  { id: "wired11", name: "Urut", role: "Pääurut / parvi", group: "wired", channelIndex: 24, profile: "organ" },
  { id: "wired12", name: "Parvi Ambient", role: "Tilaääni (vain striimi/radio)", group: "wired", channelIndex: 25, profile: "ambient" }
];

export const PRESET_MESSU = ["kapula1", "kapula2", "madonna1", "wired1", "wired2", "wired3", "wired4", "wired11", "wired12"];
export const PRESET_BANDI = ["kapula1", "kapula2", "kapula3", "kapula4", "madonna1", "madonna2", "wired7", "wired8", "wired9", "wired10", "wired11", "wired12"];

const STORAGE_VISIBLE_KEY = "picontrol_visible_mics";
const STORAGE_MIX_KEY = "picontrol_sound_active_mix";

export type ActiveMixId = "sali" | "striimi";

let containerEl: HTMLElement | null = null;
let activeMix: ActiveMixId = (localStorage.getItem(STORAGE_MIX_KEY) as ActiveMixId) || "sali";
let visibleChannelIds: Set<string> = loadVisibleChannels();
let soundApiBase: string = resolveSoundBase();
let toastCallback: ((msg: string) => void) | null = null;

// Local channel snapshot cache
interface LocalChannelState {
  id: string;
  name: string;
  role: string;
  profile: string;
  volumePercent: number;
  isOn: boolean;
  peakDbfs: number;
  signalPresent: boolean;
  isSolo?: boolean;
}

const localChannels = new Map<string, LocalChannelState>();
const masterLevels: Record<string, { volumePercent: number; isMuted: boolean }> = {
  sali: { volumePercent: 80, isMuted: false },
  striimi: { volumePercent: 75, isMuted: false },
  webradio: { volumePercent: 85, isMuted: false }
};

let isConnected = false;
let isStale = true;

function loadVisibleChannels(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_VISIBLE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return new Set(arr);
    }
  } catch {
    // fallback
  }
  return new Set(PRESET_MESSU);
}

function saveVisibleChannels(ids: Set<string>): void {
  visibleChannelIds = ids;
  localStorage.setItem(STORAGE_VISIBLE_KEY, JSON.stringify([...ids]));
}

export function resolveSoundBase(search: string = window.location.search): string {
  const fromQuery = new URLSearchParams(search).get("sound");
  const fromEnv = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_PISOUND_API_URL;
  if (fromQuery) return fromQuery.replace(/\/+$/, "");
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  // Default to pisound port 3300 on current host
  const host = typeof window !== "undefined" && window.location ? window.location.hostname : "127.0.0.1";
  return `http://${host}:3300`;
}

function escapeHtml(val: unknown): string {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function apiCall<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  const url = `${soundApiBase}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      console.warn(`[SoundTab] API call ${method} ${path} failed with ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[SoundTab] API call ${method} ${path} error:`, err);
    return null;
  }
}

export function initSoundTab(root: HTMLElement, showToast?: (msg: string) => void): void {
  containerEl = root;
  if (showToast) toastCallback = showToast;

  // Initialize local channels from ALL_CHANNELS
  for (const ch of ALL_CHANNELS) {
    localChannels.set(ch.id, {
      id: ch.id,
      name: ch.name,
      role: ch.role,
      profile: ch.profile,
      volumePercent: ch.id === "wired12" && activeMix === "sali" ? 0 : 75,
      isOn: ch.id === "wired12" && activeMix === "sali" ? false : ch.id === "kapula1" || ch.id === "wired1" || ch.id === "wired3",
      peakDbfs: -60,
      signalPresent: false,
      isSolo: false
    });
  }

  render();
  void fetchInitialMixState();
}

export function setSoundTabActive(active: boolean): void {
  if (active) {
    void fetchInitialMixState();
  }
}

async function fetchInitialMixState(): Promise<void> {
  const data = await apiCall<{
    mixes?: Array<{ id: string; name: string }>;
    masterStates?: Array<{ id: string; volumePercent: number; isMuted: boolean }>;
  }>("GET", "/api/v1/mixes");

  if (data?.masterStates) {
    for (const m of data.masterStates) {
      if (masterLevels[m.id]) {
        masterLevels[m.id] = { volumePercent: m.volumePercent, isMuted: m.isMuted };
      }
    }
  }

  // Also fetch channel states for active mix
  const mixDetail = await apiCall<{
    id: string;
    channels?: Record<string, { enabled: boolean; volumePercent: number }>;
  }>("GET", `/api/v1/mixes/${activeMix}`);

  if (mixDetail?.channels) {
    for (const [id, send] of Object.entries(mixDetail.channels)) {
      const local = localChannels.get(id);
      if (local) {
        local.isOn = send.enabled;
        local.volumePercent = send.volumePercent;
      }
    }
  }

  isConnected = true;
  isStale = false;
  renderChannelGrid();
  renderMasterOutputs();
}

export function handlePisoundTelemetry(data: any): void {
  if (!data) return;
  isConnected = Boolean(data.connected);
  isStale = Boolean(data.stale);

  // Update connection pill
  const pill = document.getElementById("sound-conn-pill");
  if (pill) {
    if (isConnected && !isStale) {
      pill.className = "px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1";
      pill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>Live DSP</span>`;
    } else {
      pill.className = "px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1";
      pill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span><span>${isStale ? "Stale" : "Offline"}</span>`;
    }
  }

  // Update mixes master volume if provided
  if (Array.isArray(data.mixes)) {
    for (const m of data.mixes) {
      if (masterLevels[m.id]) {
        masterLevels[m.id]!.volumePercent = m.masterVolume;
        masterLevels[m.id]!.isMuted = m.masterMuted;
        updateMasterDom(m.id);
      }
    }
  }

  // Fast VU meter updates for channels
  if (Array.isArray(data.channels)) {
    const activeMask = typeof data.activeTalkersMask === "number" ? data.activeTalkersMask : 0;

    for (const ch of data.channels) {
      const idx = ch.channelIndex;
      const peakMilli = typeof ch.peakMilliDbfs === "number" ? ch.peakMilliDbfs : -60000;
      const db = peakMilli / 1000;
      const isTalking = Boolean(ch.signalPresent) || (activeMask & (1 << idx)) !== 0;

      // Update local cache
      const meta = ALL_CHANNELS[idx];
      if (meta) {
        const local = localChannels.get(meta.id);
        if (local) {
          local.peakDbfs = db;
          local.signalPresent = isTalking;
          if (ch.mixSends && ch.mixSends[activeMix]) {
            local.isOn = ch.mixSends[activeMix].enabled;
            local.volumePercent = ch.mixSends[activeMix].volumePercent;
          }
        }
      }

      // Fast DOM update for VU meter bar & text
      const vuBar = document.getElementById(`sound-vu-bar-${idx}`);
      const vuText = document.getElementById(`sound-vu-text-${idx}`);
      const talkerDot = document.getElementById(`sound-talker-${idx}`);

      if (vuBar) {
        // -60 dBFS to 0 dBFS mapped to 0% to 100%
        const pct = Math.max(0, Math.min(100, Math.round(((db + 60) / 60) * 100)));
        vuBar.style.width = `${pct}%`;

        if (db >= -6) {
          vuBar.className = "h-full bg-red-500 transition-all duration-75";
        } else if (db >= -18) {
          vuBar.className = "h-full bg-amber-400 transition-all duration-75";
        } else {
          vuBar.className = "h-full bg-emerald-500 transition-all duration-75";
        }
      }

      if (vuText) {
        vuText.textContent = db <= -58 ? "–∞" : `${db.toFixed(1)} dB`;
      }

      if (talkerDot) {
        if (isTalking) {
          talkerDot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-ping";
        } else {
          talkerDot.className = "w-2 h-2 rounded-full bg-outline-variant/40";
        }
      }
    }
  }
}

function updateMasterDom(mixId: string): void {
  const state = masterLevels[mixId];
  if (!state) return;

  const fader = document.getElementById(`sound-master-fader-${mixId}`) as HTMLInputElement | null;
  const label = document.getElementById(`sound-master-val-${mixId}`);
  const muteBtn = document.getElementById(`sound-master-mute-${mixId}`);

  if (fader && document.activeElement !== fader) {
    fader.value = String(state.volumePercent);
  }
  if (label) {
    label.textContent = `${state.volumePercent}%`;
  }
  if (muteBtn) {
    if (state.isMuted) {
      muteBtn.className = "px-3 py-1.5 rounded-lg bg-red-600 text-white font-label-sm text-[11px] font-bold uppercase shadow-sm flex items-center gap-1";
      muteBtn.innerHTML = `<span class="material-symbols-outlined text-[15px]">volume_off</span><span>MUTED</span>`;
    } else {
      muteBtn.className = "px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-bold uppercase flex items-center gap-1";
      muteBtn.innerHTML = `<span class="material-symbols-outlined text-[15px]">volume_up</span><span>UNMUTED</span>`;
    }
  }
}

function render(): void {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div class="space-y-space-md select-none">
      <!-- 1. TOP MIXER HEADER STRIP -->
      <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[20px]">tune</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-headline-sm text-[15px] font-bold text-on-surface leading-none">Äänimikseri</span>
              <span id="sound-conn-pill" class="px-2 py-0.5 rounded-full text-[10px] font-label-sm font-bold uppercase ${isConnected && !isStale ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1" : "bg-surface-container-highest text-on-surface-variant flex items-center gap-1"}">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>${isConnected && !isStale ? "Live DSP" : "Standby"}</span>
              </span>
            </div>
            <span class="font-label-sm text-[10px] text-on-surface-variant">BSS London BLU-100 &bull; Multi-Mix</span>
          </div>
        </div>

        <!-- MIX TOGGLE PILLS -->
        <div class="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant/30">
          <button type="button" id="sound-mix-sali-btn" class="px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${activeMix === "sali" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"}">
            <span class="material-symbols-outlined text-[16px]">church</span>
            <span>Sali (PA)</span>
          </button>
          <button type="button" id="sound-mix-striimi-btn" class="px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 ${activeMix === "striimi" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"}">
            <span class="material-symbols-outlined text-[16px]">smart_display</span>
            <span>Striimi</span>
          </button>
        </div>

        <!-- CHANNEL VISIBILITY CONFIG BUTTON -->
        <div class="flex items-center gap-1.5">
          <button type="button" id="sound-config-channels-btn" class="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 font-label-sm text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all active:scale-95">
            <span class="material-symbols-outlined text-[16px] text-primary">view_column</span>
            <span>Kanavat (${visibleChannelIds.size}/${ALL_CHANNELS.length})</span>
          </button>
          <button type="button" id="sound-refresh-btn" class="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-all" title="Päivitä mikseri">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      <!-- ACTIVE MIX NOTICE BANNER -->
      <div class="px-3 py-2 rounded-lg ${activeMix === "sali" ? "bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200" : "bg-primary/10 border border-primary/20 text-primary"} flex items-center justify-between text-[11px]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">${activeMix === "sali" ? "campaign" : "podcasts"}</span>
          <span>Säädetään miksausta: <strong>${activeMix === "sali" ? "Kirkkosali (PA-kaiuttimet)" : "Striimi (YouTube Broadcast)"}</strong></span>
        </div>
        <span class="text-[10px] opacity-80">${activeMix === "sali" ? "Parvi Ambient lukittu 0% kiertovaaran vuoksi" : "Parvi Ambient aktiivinen taustaäänenä"}</span>
      </div>

      <!-- 2. MASTER OUTPUTS BAR -->
      <div id="sound-master-section"></div>

      <!-- 3. CHANNEL STRIPS CONTAINER -->
      <div id="sound-channel-grid"></div>
    </div>

    <!-- 4. CHANNEL VISIBILITY CONFIGURATION MODAL -->
    <dialog id="sound-channels-modal" class="broadcast-dialog" closedby="closerequest" aria-labelledby="sound-config-modal-title">
      <div class="bg-surface-container-low rounded-2xl w-full max-w-lg p-4 shadow-xl border border-outline-variant/40 space-y-3.5">
        <div class="flex items-center justify-between pb-2 border-b border-outline-variant/30">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">checklist</span>
            </div>
            <div>
              <h4 class="font-headline-sm text-[15px] font-bold text-on-surface leading-none" id="sound-config-modal-title">Valitse näkyvät kanavat</h4>
              <span class="font-label-sm text-[10px] text-on-surface-variant uppercase">Miksausnäkymän räätälöinti</span>
            </div>
          </div>
          <button type="button" class="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center" id="sound-modal-close-x">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- QUICK PRESET BUTTONS -->
        <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-surface-container border border-outline-variant/20">
          <span class="text-[10px] font-bold uppercase text-on-surface-variant mr-1">Pikavalinnat:</span>
          <button type="button" id="sound-preset-messu-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-[11px] font-bold transition-all">
            Messu (9)
          </button>
          <button type="button" id="sound-preset-bandi-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-[11px] font-bold transition-all">
            Bändi / Musiikki (12)
          </button>
          <button type="button" id="sound-preset-all-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-[11px] font-bold transition-all">
            Kaikki (26)
          </button>
          <button type="button" id="sound-preset-clear-btn" class="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-error-container hover:text-on-error text-on-surface-variant text-[11px] font-bold transition-all ml-auto">
            Tyhjennä
          </button>
        </div>

        <!-- CHECKBOXES GROUPED -->
        <div class="max-h-[60vh] overflow-y-auto pr-1 space-y-3" id="sound-modal-checkboxes"></div>

        <div class="flex justify-between items-center pt-2 border-t border-outline-variant/20">
          <span class="text-[11px] text-on-surface-variant" id="sound-modal-count-label"></span>
          <div class="flex gap-2">
            <button type="button" id="sound-modal-cancel-btn" class="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-[11px] font-bold uppercase">Peruuta</button>
            <button type="button" id="sound-modal-save-btn" class="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold uppercase shadow-sm">Tallenna ja ota käyttöön</button>
          </div>
        </div>
      </div>
    </dialog>
  `;

  bindTopEvents();
  renderMasterOutputs();
  renderChannelGrid();
}

function bindTopEvents(): void {
  document.getElementById("sound-mix-sali-btn")?.addEventListener("click", () => switchActiveMix("sali"));
  document.getElementById("sound-mix-striimi-btn")?.addEventListener("click", () => switchActiveMix("striimi"));
  document.getElementById("sound-config-channels-btn")?.addEventListener("click", openChannelConfigModal);
  document.getElementById("sound-refresh-btn")?.addEventListener("click", () => {
    void fetchInitialMixState();
    toastCallback?.("Mikserin tila päivitetty");
  });

  // Modal events
  document.getElementById("sound-modal-close-x")?.addEventListener("click", closeChannelConfigModal);
  document.getElementById("sound-modal-cancel-btn")?.addEventListener("click", closeChannelConfigModal);
  document.getElementById("sound-modal-save-btn")?.addEventListener("click", saveChannelConfigModal);

  document.getElementById("sound-preset-messu-btn")?.addEventListener("click", () => setModalSelections(new Set(PRESET_MESSU)));
  document.getElementById("sound-preset-bandi-btn")?.addEventListener("click", () => setModalSelections(new Set(PRESET_BANDI)));
  document.getElementById("sound-preset-all-btn")?.addEventListener("click", () => setModalSelections(new Set(ALL_CHANNELS.map((c) => c.id))));
  document.getElementById("sound-preset-clear-btn")?.addEventListener("click", () => setModalSelections(new Set()));
}

function switchActiveMix(mixId: ActiveMixId): void {
  activeMix = mixId;
  localStorage.setItem(STORAGE_MIX_KEY, mixId);
  render();
  void fetchInitialMixState();
  toastCallback?.(`Valittu miksaus: ${mixId === "sali" ? "Sali (PA)" : "Striimi"}`);
}

function renderMasterOutputs(): void {
  const masterContainer = document.getElementById("sound-master-section");
  if (!masterContainer) return;

  masterContainer.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      <!-- 1. SALI MASTER -->
      <div class="p-3 rounded-xl bg-surface-container-low border ${activeMix === "sali" ? "border-primary/50 shadow-sm" : "border-outline-variant/30"} space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">church</span>
            <span class="font-bold text-[13px] text-on-surface">Sali Master (PA)</span>
          </div>
          <span class="font-mono text-[12px] font-bold text-primary" id="sound-master-val-sali">${masterLevels.sali?.volumePercent ?? 80}%</span>
        </div>
        <div class="flex items-center gap-2">
          <input type="range" id="sound-master-fader-sali" min="0" max="100" value="${masterLevels.sali?.volumePercent ?? 80}" class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer">
          <button type="button" id="sound-master-mute-sali" class="px-2.5 py-1 rounded-lg ${masterLevels.sali?.isMuted ? "bg-red-600 text-white" : "bg-surface-container-high text-on-surface"} font-label-sm text-[10px] font-bold uppercase shrink-0">
            ${masterLevels.sali?.isMuted ? "MUTED" : "ON"}
          </button>
        </div>
      </div>

      <!-- 2. STRIIMI MASTER -->
      <div class="p-3 rounded-xl bg-surface-container-low border ${activeMix === "striimi" ? "border-primary/50 shadow-sm" : "border-outline-variant/30"} space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">smart_display</span>
            <span class="font-bold text-[13px] text-on-surface">Striimi Master</span>
          </div>
          <span class="font-mono text-[12px] font-bold text-primary" id="sound-master-val-striimi">${masterLevels.striimi?.volumePercent ?? 75}%</span>
        </div>
        <div class="flex items-center gap-2">
          <input type="range" id="sound-master-fader-striimi" min="0" max="100" value="${masterLevels.striimi?.volumePercent ?? 75}" class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer">
          <button type="button" id="sound-master-mute-striimi" class="px-2.5 py-1 rounded-lg ${masterLevels.striimi?.isMuted ? "bg-red-600 text-white" : "bg-surface-container-high text-on-surface"} font-label-sm text-[10px] font-bold uppercase shrink-0">
            ${masterLevels.striimi?.isMuted ? "MUTED" : "ON"}
          </button>
        </div>
      </div>

      <!-- 3. WEB RADIO MASTER (RADIO VOL, Obj 360) -->
      <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px] text-primary">radio</span>
            <span class="font-bold text-[13px] text-on-surface">Nettiradio Master</span>
          </div>
          <span class="font-mono text-[12px] font-bold text-primary" id="sound-master-val-webradio">${masterLevels.webradio?.volumePercent ?? 85}%</span>
        </div>
        <div class="flex items-center gap-2">
          <input type="range" id="sound-master-fader-webradio" min="0" max="100" value="${masterLevels.webradio?.volumePercent ?? 85}" class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer">
          <button type="button" id="sound-master-mute-webradio" class="px-2.5 py-1 rounded-lg ${masterLevels.webradio?.isMuted ? "bg-red-600 text-white" : "bg-surface-container-high text-on-surface"} font-label-sm text-[10px] font-bold uppercase shrink-0">
            ${masterLevels.webradio?.isMuted ? "MUTED" : "ON"}
          </button>
        </div>
      </div>
    </div>
  `;

  bindMasterEvents("sali");
  bindMasterEvents("striimi");
  bindMasterEvents("webradio");
}

function bindMasterEvents(mixId: string): void {
  const fader = document.getElementById(`sound-master-fader-${mixId}`) as HTMLInputElement | null;
  const label = document.getElementById(`sound-master-val-${mixId}`);
  const muteBtn = document.getElementById(`sound-master-mute-${mixId}`);

  fader?.addEventListener("input", () => {
    const vol = Number(fader.value);
    if (label) label.textContent = `${vol}%`;
    if (masterLevels[mixId]) masterLevels[mixId]!.volumePercent = vol;
  });

  fader?.addEventListener("change", () => {
    const vol = Number(fader.value);
    void apiCall("POST", `/api/v1/mixes/${mixId}/master/volume`, { volumePercent: vol });
  });

  muteBtn?.addEventListener("click", () => {
    const current = masterLevels[mixId]?.isMuted ?? false;
    const next = !current;
    if (masterLevels[mixId]) masterLevels[mixId]!.isMuted = next;
    updateMasterDom(mixId);
    void apiCall("POST", `/api/v1/mixes/${mixId}/master/mute`, { muted: next });
    toastCallback?.(`${mixId.toUpperCase()} Master ${next ? "mykistetty" : "avattu"}`);
  });
}

function renderChannelGrid(): void {
  const grid = document.getElementById("sound-channel-grid");
  if (!grid) return;

  const visibleChannels = ALL_CHANNELS.filter((c) => visibleChannelIds.has(c.id));

  if (visibleChannels.length === 0) {
    grid.innerHTML = `
      <div class="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
        <span class="material-symbols-outlined text-[36px] text-on-surface-variant/50">view_column</span>
        <h4 class="font-headline-sm text-[15px] font-bold text-on-surface">Ei valittuja kanavia</h4>
        <p class="text-[12px] text-on-surface-variant max-w-sm mx-auto">Valitse mikserinäkymässä näytettävät mikrofonit ja instrumenttikanavat painamalla ylhäältä <strong>"Kanavat"</strong>.</p>
        <button type="button" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase shadow-sm" onclick="document.getElementById('sound-config-channels-btn').click()">
          Valitse kanavat
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
      ${visibleChannels.map((ch) => renderChannelStrip(ch)).join("")}
    </div>
  `;

  // Bind channel controls
  for (const ch of visibleChannels) {
    bindChannelStripEvents(ch);
  }
}

function renderChannelStrip(ch: ChannelMeta): string {
  const state = localChannels.get(ch.id);
  const isOn = state?.isOn ?? false;
  const vol = state?.volumePercent ?? 75;
  const isAmbientParviInSali = ch.id === "wired12" && activeMix === "sali";

  return `
    <div class="p-3 rounded-xl bg-surface-container-low border ${isOn ? "border-outline-variant/50 shadow-sm" : "border-outline-variant/20 opacity-80"} flex flex-col justify-between space-y-2 relative" id="sound-strip-${ch.id}">
      <!-- HEADER -->
      <div class="flex items-start justify-between gap-1">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="w-2 h-2 rounded-full bg-outline-variant/40 shrink-0" id="sound-talker-${ch.channelIndex}"></span>
          <div class="min-w-0">
            <span class="font-bold text-[13px] text-on-surface truncate block leading-tight">${escapeHtml(ch.name)}</span>
            <span class="text-[10px] text-on-surface-variant truncate block">${escapeHtml(ch.role)}</span>
          </div>
        </div>

        <span class="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-surface-container-high text-on-surface-variant shrink-0">
          ${escapeHtml(ch.profile)}
        </span>
      </div>

      <!-- AMBIENT FEEDBACK LOCK NOTICE FOR SALI -->
      ${isAmbientParviInSali ? `
        <div class="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-medium leading-tight">
          🚫 Estetty kirkkosaliin (kiertoeste)
        </div>
      ` : ""}

      <!-- VU METER BAR -->
      <div class="space-y-1">
        <div class="flex justify-between text-[10px] font-mono text-on-surface-variant">
          <span>VU</span>
          <span id="sound-vu-text-${ch.channelIndex}">–∞</span>
        </div>
        <div class="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <div id="sound-vu-bar-${ch.channelIndex}" class="h-full bg-emerald-500 transition-all duration-75" style="width: 0%"></div>
        </div>
      </div>

      <!-- FADER SLIDER (0 - 100%) -->
      <div class="space-y-1 pt-1">
        <div class="flex justify-between items-center text-[11px]">
          <span class="font-label-sm text-[10px] text-on-surface-variant uppercase">Taso</span>
          <span class="font-mono font-bold text-on-surface" id="sound-fader-val-${ch.id}">${vol}%</span>
        </div>
        <input type="range" id="sound-fader-${ch.id}" min="0" max="100" value="${vol}" ${isAmbientParviInSali ? "disabled" : ""} class="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer disabled:opacity-40">
      </div>

      <!-- ACTION BUTTONS: ON/MUTE & SOLO -->
      <div class="grid grid-cols-2 gap-1.5 pt-1">
        <button type="button" id="sound-mute-btn-${ch.id}" ${isAmbientParviInSali ? "disabled" : ""} class="h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-xs disabled:opacity-30 ${isOn ? "bg-emerald-600 text-white" : "bg-surface-container-high text-on-surface-variant"}">
          <span class="material-symbols-outlined text-[16px]">${isOn ? "mic" : "mic_off"}</span>
          <span>${isOn ? "ON" : "MUTE"}</span>
        </button>

        <button type="button" id="sound-solo-btn-${ch.id}" class="h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 bg-surface-container-high text-on-surface hover:bg-surface-container-highest">
          <span class="material-symbols-outlined text-[15px]">headphones</span>
          <span>SOLO</span>
        </button>
      </div>
    </div>
  `;
}

function bindChannelStripEvents(ch: ChannelMeta): void {
  const fader = document.getElementById(`sound-fader-${ch.id}`) as HTMLInputElement | null;
  const faderVal = document.getElementById(`sound-fader-val-${ch.id}`);
  const muteBtn = document.getElementById(`sound-mute-btn-${ch.id}`);
  const soloBtn = document.getElementById(`sound-solo-btn-${ch.id}`);

  fader?.addEventListener("input", () => {
    const val = Number(fader.value);
    if (faderVal) faderVal.textContent = `${val}%`;
    const local = localChannels.get(ch.id);
    if (local) local.volumePercent = val;
  });

  fader?.addEventListener("change", () => {
    const val = Number(fader.value);
    void apiCall("POST", `/api/v1/mixes/${activeMix}/channels/${ch.id}`, { volumePercent: val });
  });

  muteBtn?.addEventListener("click", () => {
    const local = localChannels.get(ch.id);
    if (!local) return;
    const next = !local.isOn;
    local.isOn = next;

    // Fast optimistic DOM update
    if (next) {
      muteBtn.className = "h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-xs bg-emerald-600 text-white";
      muteBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">mic</span><span>ON</span>`;
    } else {
      muteBtn.className = "h-9 rounded-lg font-label-sm text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 shadow-xs bg-surface-container-high text-on-surface-variant";
      muteBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">mic_off</span><span>MUTE</span>`;
    }

    void apiCall("POST", `/api/v1/mixes/${activeMix}/channels/${ch.id}/toggle`);
    toastCallback?.(`${ch.name} (${activeMix === "sali" ? "Sali" : "Striimi"}) ${next ? "avattu" : "mykistetty"}`);
  });

  soloBtn?.addEventListener("click", () => {
    void apiCall("POST", `/api/v1/mics/${ch.id}/solo`);
    toastCallback?.(`Solo aktivoitu: ${ch.name}`);
  });
}

// ============================================================================
// Channel Visibility Configuration Modal Logic
// ============================================================================
let pendingSelected = new Set<string>();

function openChannelConfigModal(): void {
  const modal = document.getElementById("sound-channels-modal") as HTMLDialogElement | null;
  if (!modal) return;

  pendingSelected = new Set(visibleChannelIds);
  renderModalCheckboxes();
  updateModalCountLabel();
  modal.showModal();
}

function closeChannelConfigModal(): void {
  const modal = document.getElementById("sound-channels-modal") as HTMLDialogElement | null;
  modal?.close();
}

function saveChannelConfigModal(): void {
  saveVisibleChannels(pendingSelected);
  closeChannelConfigModal();
  renderChannelGrid();
  const configBtn = document.getElementById("sound-config-channels-btn");
  if (configBtn) {
    configBtn.innerHTML = `
      <span class="material-symbols-outlined text-[16px] text-primary">view_column</span>
      <span>Kanavat (${visibleChannelIds.size}/${ALL_CHANNELS.length})</span>
    `;
  }
  toastCallback?.(`Valittu ${visibleChannelIds.size} kanavaa näkymään`);
}

function setModalSelections(ids: Set<string>): void {
  pendingSelected = ids;
  renderModalCheckboxes();
  updateModalCountLabel();
}

function updateModalCountLabel(): void {
  const lbl = document.getElementById("sound-modal-count-label");
  if (lbl) {
    lbl.textContent = `Valittuna ${pendingSelected.size} / ${ALL_CHANNELS.length} kanavaa`;
  }
}

function renderModalCheckboxes(): void {
  const container = document.getElementById("sound-modal-checkboxes");
  if (!container) return;

  const groups: Array<{ key: string; title: string; icon: string; channels: ChannelMeta[] }> = [
    {
      key: "handheld",
      title: "Langattomat kapulat (1-4)",
      icon: "mic",
      channels: ALL_CHANNELS.filter((c) => c.group === "handheld")
    },
    {
      key: "madonna",
      title: "Langattomat madonnat (1-10)",
      icon: "headset_mic",
      channels: ALL_CHANNELS.filter((c) => c.group === "madonna")
    },
    {
      key: "sanctuary",
      title: "Kiinteät salimikit (Saarna, Alttari, Lukupulpetti, Kuoro)",
      icon: "church",
      channels: ALL_CHANNELS.filter((c) => c.group === "wired" && c.channelIndex <= 19)
    },
    {
      key: "drops",
      title: "Lattiarasiat & Urut / Parvi (AV09, AV10, Urut, Ambient)",
      icon: "piano",
      channels: ALL_CHANNELS.filter((c) => c.group === "wired" && c.channelIndex >= 20)
    }
  ];

  container.innerHTML = groups
    .map(
      (g) => `
      <div class="space-y-1.5 p-2 rounded-xl bg-surface-container/50 border border-outline-variant/20">
        <div class="flex items-center gap-1.5 text-[11px] font-bold text-on-surface uppercase tracking-wide px-1">
          <span class="material-symbols-outlined text-[15px] text-primary">${g.icon}</span>
          <span>${g.title}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${g.channels
            .map((ch) => {
              const checked = pendingSelected.has(ch.id);
              return `
              <label class="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer border ${checked ? "border-primary/40 bg-primary/5" : "border-outline-variant/20"}">
                <input type="checkbox" data-channel-id="${ch.id}" ${checked ? "checked" : ""} class="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4">
                <div class="min-w-0 flex-1">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-[12px] text-on-surface block leading-tight truncate">${escapeHtml(ch.name)}</span>
                    <span class="text-[9px] font-mono uppercase opacity-70">${escapeHtml(ch.profile)}</span>
                  </div>
                  <span class="text-[10px] text-on-surface-variant block truncate">${escapeHtml(ch.role)}</span>
                </div>
              </label>
            `;
            })
            .join("")}
        </div>
      </div>
    `
    )
    .join("");

  // Attach change listeners
  container.querySelectorAll<HTMLInputElement>("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.channelId;
      if (!id) return;
      if (cb.checked) {
        pendingSelected.add(id);
      } else {
        pendingSelected.delete(id);
      }
      updateModalCountLabel();
    });
  });
}
