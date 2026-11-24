// PiPGM Renderer tab: operate the three piprogram feeds (PiPGM1/2/3).
// Talks to pigateway /api/v1/pipgm/* (the gateway holds piprogram's key). Layout follows
// docs/piprogram-control-plan.md: feed cards, feed focus view, playlist draft editor,
// saved playlists, library, generate-for-date and monitor tiles.
import { isOutsideLan, resolveApiUrl } from "./config";
import { createPipgmClient, createPoller, PipgmError } from "./pipgm/api";
import {
  activeRowIndex, adviceFor, armSecondsLeft, comingUp, describeLoadReport, draftFromPipeline,
  formatCountdown, groupSteps, moveEntry, parsePlaylistDocument, pollIntervalMs, removeAt, sameIds, addUnique, toDocument,
  type StepGroup
} from "./pipgm/logic";
import {
  checkSoundFile, extensionForMime, formatDuration, localDay, normalizeType, pickRecorderMime, presetRange, reasonLabel,
  canRemoveFromActive, composeHymnNumber, formatStamp, hymnalPrefixOf, originLabel, previewOf, recordingFilename, recordingSupport, titleFromFilename, toggleType, typeLabel, type DatePreset
} from "./pipgm/library";
import {
  FEED_IDS, type ActiveFolder, type FeedId, type LibraryItem, type LibraryPage, type Pipeline, type PlaylistSummary, type PublishState,
  type StepsResponse, type LoadReport
} from "./pipgm/types";

type View = { name: "operate" } | { name: "monitor" } | { name: "library" } | { name: "feed"; id: FeedId };

const client = createPipgmClient({ resolve: (p) => resolveApiUrl(p) });
const FEED_LABEL: Record<FeedId, string> = { PiPGM1: "PiPGM 1", PiPGM2: "PiPGM 2", PiPGM3: "PiPGM 3" };
const KIND_ICON: Record<string, string> = {
  hymn: "music_note", pptx: "slideshow", canva: "palette", youtube: "smart_display", video: "movie", image: "image", audio: "headphones"
};

let root: HTMLElement | null = null;
let active = false;
let view: View = { name: "operate" };
let pipelines: Pipeline[] = [];
let stepsByFeed = new Map<FeedId, StepsResponse>();
let stepsKey = new Map<FeedId, string>();
let drafts = new Map<FeedId, string[]>();
let library: LibraryItem[] | null = null;
let saved: PlaylistSummary[] | null = null;
let banner: { title: string; next: string } | null = null;
let notice = "";
let loadReport: { feed: FeedId; report: LoadReport } | null = null;
let dialog: "generate" | "save" | "permanent" | "edit-item" | null = null;
/** The item open in the edit dialog: its title and library type as typed so far. */
let editItem: { id: string; title: string; type: string } | null = null;
/** An add waiting for the "is this a permanent asset?" answer (no use date was given). */
let pendingAdd: (() => void) | null = null;
let generateState: { date: string; busy: boolean; draftName: string; items: string[]; missing: number } | null = null;
const PAGE_SIZE = 100;
let libFilter = {
  types: [] as string[], hymnals: [] as string[], from: "", to: "", unscheduled: false, sort: "newest" as "newest" | "oldest" | "title" | "used",
  text: "", target: "PiPGM1" as FeedId
};
/** The filtered, paged answer of the service (the full list in `library` stays for lookups). */
let libPage: LibraryPage | null = null;
let libLimit = PAGE_SIZE;
let activeFolder: ActiveFolder | null = null;
let activeDate = "";
let plpForm = { name: "", orientation: "", includeAudio: false };
/** A sound waiting for its title, type and use date: a recording or a chosen file. */
let soundSrc: { blob: Blob; filename: string; mime: string; recorded: boolean; url: string } | null = null;
let soundForm = { title: "", type: "", useAt: "" };
let rec: { recorder: MediaRecorder; stream: MediaStream; chunks: Blob[]; startedAt: number; mime: string; tick: number } | null = null;
let textTimer: number | undefined;
let panelOpen: { editor: boolean; saved: boolean } = { editor: true, saved: false };
let dragIndex: number | null = null;
let lastSignature = "";
let busyCount = 0;
let frameTimer: number | undefined;
let clockTimer: number | undefined;
let offline = false;
/** Publishing to MediaMTX per feed; null until known or when the gateway does not answer. */
let publish: PublishState | null = null;

const poller = createPoller(
  client,
  {
    onData: (data) => {
      pipelines = data;
      offline = false;
      if (banner?.title === "Cannot reach the gateway") banner = null;
      void syncSteps().then(() => render());
      void client.getPublish().then((state) => { publish = state; render(); }, () => { publish = null; });
    },
    onError: (error) => {
      offline = true;
      banner = adviceFor(error.status, error.code, error.message);
      render();
    }
  },
  (p) => pollIntervalMs(p, typeof document !== "undefined" && document.hidden)
);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function esc(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function feed(id: FeedId): Pipeline | undefined {
  return pipelines.find((p) => p.id === id);
}

function showError(error: unknown): void {
  const e = error instanceof PipgmError ? error : new PipgmError(0, "NETWORK", String(error));
  banner = adviceFor(e.status, e.code, e.message);
  render();
}

async function act<T>(fn: () => Promise<T>, then?: (result: T) => void): Promise<void> {
  busyCount++;
  try {
    const result = await fn();
    banner = null;
    then?.(result);
  } catch (error) {
    showError(error);
  } finally {
    busyCount--;
    poller.refresh();
    render();
  }
}

function applyPipeline(p: Pipeline): void {
  pipelines = pipelines.map((x) => (x.id === p.id ? p : x));
}

async function syncSteps(): Promise<void> {
  if (view.name !== "feed") return;
  const id = view.id;
  const p = feed(id);
  if (!p) return;
  const key = `${p.activeItemId}|${p.currentStep}|${p.playlist.map((i) => i.id).join(",")}|${p.orientation}`;
  if (stepsKey.get(id) === key && stepsByFeed.has(id)) return;
  try {
    stepsByFeed.set(id, await client.getSteps(id));
    stepsKey.set(id, key);
  } catch (error) {
    if (error instanceof PipgmError && error.status !== 404) showError(error);
  }
}

async function ensureLibrary(force = false): Promise<void> {
  if (library && !force) return;
  try {
    library = await client.getItems();
  } catch (error) {
    showError(error);
  }
  if (force) void loadLibraryPage();
  render();
}

async function loadLibraryPage(): Promise<void> {
  try {
    libPage = await client.getLibraryPage({
      type: libFilter.types, hymnal: libFilter.hymnals, q: libFilter.text, usedFrom: libFilter.from, usedTo: libFilter.to,
      unscheduled: libFilter.unscheduled, sort: libFilter.sort, limit: libLimit
    });
  } catch (error) {
    showError(error);
  }
  lastSignature = "";
  const el = document.activeElement as HTMLInputElement | null;
  const keep = !!el && el.dataset?.lib === "text";
  const pos = el?.selectionStart ?? 0;
  render(keep);
  if (keep) {
    const again = root?.querySelector<HTMLInputElement>("[data-lib=text]");
    again?.focus();
    again?.setSelectionRange(pos, pos);
  }
}

async function loadActive(): Promise<void> {
  try {
    activeFolder = await client.getActive(activeDate || undefined);
    if (!activeDate) activeDate = activeFolder.date;
  } catch (error) {
    showError(error);
  }
  lastSignature = "";
  render();
}

function openLibrary(): void {
  void ensureLibrary();
  void loadLibraryPage();
  void loadActive();
}

async function ensureSaved(force = false): Promise<void> {
  if (saved && !force) return;
  try {
    saved = await client.listPlaylists();
  } catch (error) {
    saved = [];
    showError(error);
  }
  render();
}

function draftOf(id: FeedId): string[] {
  const existing = drafts.get(id);
  if (existing) return existing;
  const p = feed(id);
  return p ? draftFromPipeline(p) : [];
}

function setDraft(id: FeedId, list: string[]): void {
  drafts.set(id, list);
}

function isDirty(id: FeedId): boolean {
  const d = drafts.get(id);
  const p = feed(id);
  return !!d && !!p && !sameIds(d, draftFromPipeline(p));
}

function itemById(id: string): LibraryItem | undefined {
  return library?.find((i) => i.id === id) ?? pipelines.flatMap((p) => p.playlist).find((i) => i.id === id);
}

function goto(next: View): void {
  view = next;
  lastSignature = "";
  if (next.name === "feed") {
    void syncSteps().then(() => render());
    void ensureLibrary();
  }
  if (next.name === "library") openLibrary();
  render();
  refreshFrames();
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------
function stateBadge(p: Pipeline): string {
  const color = p.fadeToBlack ? "bg-slate-700 text-white"
    : p.playbackState === "playing" && p.state === "live" ? "bg-emerald-600 text-white"
    : p.state === "failed" || p.state === "degraded" ? "bg-error text-on-error"
    : "bg-surface-container-high text-on-surface-variant";
  const text = p.fadeToBlack ? "Faded" : p.state === "live" ? (p.playbackState === "paused" ? "Paused" : "On air") : p.state;
  return `<span class="px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase font-bold ${color}">${esc(text)}</span>`;
}

function currentTitle(p: Pipeline): string {
  const item = p.playlist.find((i) => i.id === p.activeItemId);
  return item ? item.title : "Nothing cued";
}

function stepLine(p: Pipeline): string {
  if (!p.activeItemId) return "";
  return `Step ${p.currentStep + 1} of ${p.totalSteps}${p.currentStepDetail?.label ? ` · ${esc(p.currentStepDetail.label)}` : ""}`;
}

function frameImg(p: Pipeline, cls: string, width: number): string {
  const ratio = p.orientation === "portrait" ? "9 / 16" : "16 / 9";
  const has = p.slideFeed?.hasSlide ?? !!p.activeItemId;
  if (!has) {
    return `<div class="${cls} bg-black text-white/50 flex items-center justify-center font-label-sm text-[11px]" style="aspect-ratio:${ratio}">${p.fadeToBlack ? "Black" : "No picture"}</div>`;
  }
  return `<img data-frame="${p.id}" data-width="${width}" alt="${esc(p.label)} now" class="${cls} bg-black object-contain" style="aspect-ratio:${ratio}" src="${client.frameUrl(p.id, width, Date.now())}">`;
}

function renderKillBar(): string {
  const armed = pipelines.filter((p) => armSecondsLeft(p) > 0 || p.audioTrack);
  const chips = armed.map((p) => {
    const left = armSecondsLeft(p);
    return `<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 font-label-sm text-[10px] font-bold uppercase">${FEED_LABEL[p.id]} ${left ? formatCountdown(left) : "playing"}</span>`;
  }).join("");
  return `<div class="flex items-center gap-3 flex-wrap">
    <button type="button" data-action="kill-audio" title="Kill audio on every feed" aria-label="Kill audio on every feed" class="w-6 h-6 rounded flex items-center justify-center transition-all active:scale-90 bg-error/15 text-error hover:bg-error/25">
      <span class="material-symbols-outlined text-[13px]">volume_off</span>
    </button>
    <div class="flex gap-1.5 flex-wrap text-on-surface-variant font-label-sm text-[11px]">${armed.length ? chips : "Sound is off on every feed"}</div>
  </div>`;
}

function renderNav(): string {
  const tabs: Array<[string, string, boolean]> = [
    ["operate", "Operate", view.name === "operate" || view.name === "feed"],
    ["monitor", "Monitor", view.name === "monitor"],
    ["library", "Library", view.name === "library"]
  ];
  return `<div class="flex gap-1.5">${tabs.map(([name, label, on]) =>
    `<button type="button" data-action="view" data-view="${name}" class="px-3 h-9 rounded-md font-label-sm text-[12px] uppercase font-bold ${on ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"}">${label}</button>`
  ).join("")}</div>`;
}

function renderBanner(): string {
  if (!banner) return notice ? `<div class="p-3 rounded-lg bg-primary/10 text-on-surface font-body-sm">${esc(notice)}</div>` : "";
  return `<div role="alert" class="p-3 rounded-lg bg-error/10 border border-error/30 flex items-start gap-3">
    <span class="material-symbols-outlined text-error">error</span>
    <div class="flex-1"><div class="font-label-md font-bold text-on-surface">${esc(banner.title)}</div><div class="font-body-sm text-on-surface-variant">${esc(banner.next)}</div></div>
    <button type="button" data-action="dismiss-banner" class="text-on-surface-variant" aria-label="Dismiss"><span class="material-symbols-outlined">close</span></button>
  </div>`;
}

function renderFeedCard(p: Pipeline): string {
  const left = armSecondsLeft(p);
  const dirty = isDirty(p.id);
  return `<div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-2" data-feed-card="${p.id}">
    <div class="flex items-center justify-between gap-2">
      <button type="button" data-action="open-feed" data-feed="${p.id}" class="font-headline-sm text-[16px] font-bold text-on-surface text-left">${FEED_LABEL[p.id]}</button>
      <div class="flex items-center gap-1.5">${stateBadge(p)}<button type="button" data-action="kill-feed" data-feed="${p.id}" title="Kill audio on this feed" aria-label="Kill audio on this feed" class="w-6 h-6 rounded flex items-center justify-center transition-all active:scale-90 ${p.audioTrack || armSecondsLeft(p) > 0 ? "bg-error text-on-error" : "bg-surface-container hover:bg-surface-container-lowest text-on-surface-variant"}"><span class="material-symbols-outlined text-[13px]">volume_off</span></button></div>
    </div>
    <button type="button" data-action="open-feed" data-feed="${p.id}" class="block text-left">${frameImg(p, "w-full rounded-md", 480)}</button>
    <div class="min-h-[2.5rem]">
      <div class="font-label-md font-bold text-on-surface truncate">${esc(currentTitle(p))}</div>
      <div class="font-label-sm text-[11px] text-on-surface-variant">${stepLine(p) || "&nbsp;"}${dirty ? ` · <span class="text-amber-600">draft not applied</span>` : ""}</div>
    </div>
    <div class="grid grid-cols-4 gap-1.5">
      <button type="button" data-action="ctl" data-feed="${p.id}" data-ctl="prev" class="${btn()}" aria-label="Back"><span class="material-symbols-outlined">skip_previous</span></button>
      <button type="button" data-action="ctl" data-feed="${p.id}" data-ctl="${p.playbackState === "playing" ? "pause" : "play"}" class="${btn()}" aria-label="Play or pause"><span class="material-symbols-outlined">${p.playbackState === "playing" ? "pause" : "play_arrow"}</span></button>
      <button type="button" data-action="ctl" data-feed="${p.id}" data-ctl="next" class="${btn(true)}" aria-label="Next"><span class="material-symbols-outlined">skip_next</span></button>
      <button type="button" data-action="ftb" data-feed="${p.id}" class="${btn(false, p.fadeToBlack)}" aria-label="Fade to black"><span class="material-symbols-outlined">contrast</span></button>
    </div>
    <div class="flex items-center justify-between gap-2 font-label-sm text-[11px] text-on-surface-variant">
      ${left > 0
        ? `<span>Sound armed ${formatCountdown(left)}</span><button type="button" data-action="disarm" data-feed="${p.id}" class="underline">Disarm</button>`
        : `<span>Sound off</span><button type="button" data-action="arm" data-feed="${p.id}" class="underline">Arm 15 min</button>`}
    </div>
  </div>`;
}

function btn(primary = false, on = false): string {
  const base = "h-11 rounded-lg flex items-center justify-center active:scale-95 transition-all";
  if (primary) return `${base} bg-primary text-on-primary shadow-sm`;
  if (on) return `${base} bg-slate-800 text-white`;
  return `${base} bg-surface-container-highest text-on-surface`;
}

function renderPublishBar(): string {
  if (!publish) return "";
  const p = publish;
  const toggles = FEED_IDS.map((id) => {
    const on = p.feeds[id] === true;
    return `<button type="button" data-action="publish-feed" data-feed="${id}" data-on="${on ? "0" : "1"}" aria-pressed="${on}" ${p.rtspBase ? "" : "disabled"} title="${on ? "Stop" : "Start"} publishing ${FEED_LABEL[id]} to MediaMTX" class="px-2 h-7 rounded-md font-label-sm text-[11px] font-bold ${on ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"} ${p.rtspBase ? "" : "opacity-50"}">${FEED_LABEL[id]} ${on ? "on" : "off"}</button>`;
  }).join("");
  const address = p.rtspBase
    ? `<span class="text-on-surface-variant font-label-sm text-[11px]">${esc(p.rtspBase)}</span>`
    : `<button type="button" data-action="publish-address" class="px-2 h-7 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-[11px] font-bold" title="Use the MediaMTX on this Pi">Set address (local MediaMTX)</button>`;
  return `<div class="flex items-center gap-2 flex-wrap"><span class="font-label-sm text-[11px] uppercase font-bold text-on-surface-variant">Publish</span>${toggles}${address}</div>`;
}

function renderOperate(): string {
  if (!pipelines.length) return `<div class="p-4 text-on-surface-variant font-body-md">${offline ? "Waiting for the gateway…" : "Loading feeds…"}</div>`;
  return `<div class="grid gap-3 items-start sm:grid-cols-2 lg:grid-cols-3">${pipelines.map(renderFeedCard).join("")}</div>`;
}

function renderMonitor(): string {
  if (!pipelines.length) return renderOperate();
  return `<div class="grid grid-cols-3 gap-2">${pipelines.map((p) => `
    <button type="button" data-action="open-feed" data-feed="${p.id}" class="p-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-left flex flex-col gap-1">
      ${frameImg(p, "w-full rounded", 320)}
      <div class="flex items-center justify-between gap-1"><span class="font-label-sm text-[11px] font-bold">${FEED_LABEL[p.id]}</span>${stateBadge(p)}</div>
      <div class="font-label-sm text-[10px] text-on-surface-variant truncate">${esc(currentTitle(p))}${p.activeItemId ? ` · ${p.currentStep + 1}/${p.totalSteps}` : ""}</div>
    </button>`).join("")}</div>`;
}

function renderThumb(row: StepGroup["steps"][number], portrait: boolean): string {
  const ratio = portrait ? "9 / 16" : "16 / 9";
  const w = portrait ? "w-14" : "w-28";
  const inner = row.thumbnailUrl
    ? `<img loading="lazy" src="${esc(client.assetUrl(row.thumbnailUrl))}" alt="" class="w-full h-full object-cover">`
    : `<div class="w-full h-full flex items-center justify-center text-on-surface-variant font-label-sm text-[10px] text-center p-1 bg-surface-container-high">${esc(row.label)}</div>`;
  return `<button type="button" data-action="goto-step" data-item="${esc(row.itemId)}" data-step="${row.stepIndex}" title="${esc(row.label)}"
    class="shrink-0 ${w} rounded overflow-hidden border-2 ${row.isActive ? "border-primary" : "border-transparent"}" style="aspect-ratio:${ratio}">${inner}</button>`;
}

function renderStrip(id: FeedId, p: Pipeline): string {
  const steps = stepsByFeed.get(id);
  if (!steps) return `<div class="text-on-surface-variant font-body-sm">Loading steps…</div>`;
  const rows = comingUp(steps.steps);
  if (!rows.length) return `<div class="text-on-surface-variant font-body-sm">The playlist is empty.</div>`;
  const portrait = p.orientation === "portrait";
  const missing = new Set(groupSteps(rows).filter((g) => g.steps.some((s) => !s.thumbnailUrl) && g.itemKind !== "youtube" && g.itemKind !== "video" && g.itemKind !== "audio").map((g) => g.itemId));
  return `<div class="flex gap-3 overflow-x-auto pb-2">${groupSteps(rows).map((g) => `
    <div class="shrink-0 flex flex-col gap-1">
      <div class="flex items-center gap-1.5 font-label-sm text-[11px] text-on-surface-variant"><span class="material-symbols-outlined text-[14px]">${KIND_ICON[g.itemKind] ?? "article"}</span><span class="font-bold text-on-surface truncate max-w-[10rem]">${esc(g.itemTitle)}</span>
        ${missing.has(g.itemId) ? `<button type="button" data-action="prepare" data-item="${esc(g.itemId)}" class="underline text-primary">Prepare</button>` : ""}</div>
      <div class="flex gap-1.5">${g.steps.map((s) => renderThumb(s, portrait)).join("")}</div>
    </div>`).join("")}</div>`;
}

function renderEditor(id: FeedId, p: Pipeline): string {
  const draft = draftOf(id);
  const dirty = isDirty(id);
  const rows = draft.map((draftId, i) => {
    const entry = p.playlist.find((e) => e.entryId === draftId);
    const itemId = entry?.id ?? draftId;
    const item = itemById(itemId);
    const live = entry ? p.activeEntryId === draftId || (p.activeEntryId == null && p.activeItemId === itemId) : false;
    return `<li draggable="true" data-drag="${i}" class="flex items-center gap-2 p-2 rounded-lg bg-surface-container border ${live ? "border-primary" : "border-outline-variant/30"}">
      <span class="material-symbols-outlined text-on-surface-variant cursor-grab">drag_indicator</span>
      <span class="material-symbols-outlined text-[18px] text-on-surface-variant">${KIND_ICON[item?.kind ?? ""] ?? "article"}</span>
      <span class="flex-1 truncate font-body-md">${esc(item?.title ?? itemId)}${live ? ` <span class="text-primary font-label-sm text-[10px] uppercase">on air</span>` : ""}</span>
      <button type="button" data-action="move" data-index="${i}" data-dir="-1" class="p-1" aria-label="Move up" ${i === 0 ? "disabled" : ""}><span class="material-symbols-outlined text-[18px]">arrow_upward</span></button>
      <button type="button" data-action="move" data-index="${i}" data-dir="1" class="p-1" aria-label="Move down" ${i === draft.length - 1 ? "disabled" : ""}><span class="material-symbols-outlined text-[18px]">arrow_downward</span></button>
      <button type="button" data-action="remove-draft" data-index="${i}" class="p-1 text-error" aria-label="Remove"><span class="material-symbols-outlined text-[18px]">close</span></button>
    </li>`;
  }).join("");
  const addable = (library ?? []).filter((i) => i.kind !== "audio");
  return `<div class="flex flex-col gap-2">
    <ul class="flex flex-col gap-1.5" data-droplist>${rows || `<li class="text-on-surface-variant font-body-sm">Empty. Add items from the library.</li>`}</ul>
    <div class="flex gap-2 flex-wrap items-center">
      <select data-add-select class="h-10 px-2 rounded-lg bg-surface-container-highest font-body-sm max-w-[16rem]">
        <option value="">Add from library…</option>${addable.map((i) => `<option value="${esc(i.id)}">${esc(i.title)} (${esc(i.kind)})</option>`).join("")}
      </select>
      <button type="button" data-action="add-selected" class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md">Add</button>
      <span class="flex-1"></span>
      <button type="button" data-action="revert-draft" class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md" ${dirty ? "" : "disabled"}>Revert</button>
      <button type="button" data-action="apply-draft" class="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md font-bold ${dirty ? "" : "opacity-50"}" ${dirty ? "" : "disabled"}>Apply to ${FEED_LABEL[id]}</button>
    </div>
    <div class="font-label-sm text-[11px] text-on-surface-variant">Edits stay in this draft until you apply them. The item on air keeps its place.</div>
  </div>`;
}

function renderSavedPanel(id: FeedId, p: Pipeline): string {
  const list = saved ?? [];
  const reportBlock = loadReport && loadReport.feed === id ? describeLoadReport(loadReport.report) : [];
  return `<div class="flex flex-col gap-2">
    <div class="flex gap-2 flex-wrap">
      <button type="button" data-action="open-save" class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md">Save current…</button>
      <button type="button" data-action="export" class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md">Export file</button>
      <label class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md flex items-center cursor-pointer">Import file<input type="file" accept="application/json,.json" data-import class="hidden"></label>
      <button type="button" data-action="open-generate" class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md">Generate for a date…</button>
    </div>
    ${saved === null ? `<div class="text-on-surface-variant font-body-sm">Loading…</div>` : list.length === 0 ? `<div class="text-on-surface-variant font-body-sm">No saved playlists yet.</div>` : `<ul class="flex flex-col gap-1.5">${list.map((s) => `
      <li class="flex items-center gap-2 p-2 rounded-lg bg-surface-container">
        <div class="flex-1 min-w-0"><div class="font-body-md truncate">${esc(s.name)}</div><div class="font-label-sm text-[11px] text-on-surface-variant">${s.itemCount} items · ${esc(new Date(s.savedAt).toLocaleString("fi-FI"))}${s.orientation && s.orientation !== p.orientation ? ` · ${esc(s.orientation)}` : ""}</div></div>
        <button type="button" data-action="load-saved" data-id="${esc(s.id)}" data-mode="replace" class="h-9 px-2.5 rounded-md bg-primary text-on-primary font-label-sm text-[12px]">Load</button>
        <button type="button" data-action="load-saved" data-id="${esc(s.id)}" data-mode="append" class="h-9 px-2.5 rounded-md bg-surface-container-highest font-label-sm text-[12px]">Append</button>
        <button type="button" data-action="delete-saved" data-id="${esc(s.id)}" class="p-1 text-error" aria-label="Delete"><span class="material-symbols-outlined text-[18px]">delete</span></button>
      </li>`).join("")}</ul>`}
    ${reportBlock.length ? `<div class="p-2 rounded-lg bg-amber-500/10 text-on-surface font-body-sm"><div class="font-bold">After loading</div><ul class="list-disc pl-5">${reportBlock.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div>` : ""}
  </div>`;
}

function collapsible(name: "editor" | "saved", title: string, body: string): string {
  const open = panelOpen[name];
  return `<section class="rounded-xl bg-surface-container-low border border-outline-variant/40">
    <button type="button" data-action="toggle-panel" data-panel="${name}" class="w-full flex items-center justify-between p-3 font-label-md font-bold uppercase text-on-surface">
      ${esc(title)}<span class="material-symbols-outlined">${open ? "expand_less" : "expand_more"}</span></button>
    ${open ? `<div class="p-3 pt-0">${body}</div>` : ""}</section>`;
}

function renderFocus(id: FeedId): string {
  const p = feed(id);
  if (!p) return `<div class="text-on-surface-variant">Feed not found.</div>`;
  const left = armSecondsLeft(p);
  const portrait = p.orientation === "portrait";
  const controls = `<div class="grid grid-cols-4 gap-2">
      <button type="button" data-action="ctl" data-feed="${id}" data-ctl="prev" class="${btn()} px-2 gap-1 font-label-md"><span class="material-symbols-outlined">skip_previous</span>Back</button>
      <button type="button" data-action="ctl" data-feed="${id}" data-ctl="${p.playbackState === "playing" ? "pause" : "play"}" class="${btn()} px-2 gap-1 font-label-md"><span class="material-symbols-outlined">${p.playbackState === "playing" ? "pause" : "play_arrow"}</span>${p.playbackState === "playing" ? "Pause" : "Play"}</button>
      <button type="button" data-action="ctl" data-feed="${id}" data-ctl="next" class="${btn(true)} px-2 gap-1 font-label-md font-bold"><span class="material-symbols-outlined">skip_next</span>Next</button>
      <button type="button" data-action="ftb" data-feed="${id}" class="${btn(false, p.fadeToBlack)} px-2 gap-1 font-label-md"><span class="material-symbols-outlined">contrast</span>${p.fadeToBlack ? "Unfade" : "Fade"}</button>
    </div>
    <div class="font-label-sm text-[11px] text-on-surface-variant">Space or → next · ← or B back</div>`;
  const info = `<div class="flex items-center gap-2 flex-wrap">${stateBadge(p)}<span class="font-label-md font-bold">${esc(currentTitle(p))}</span><span class="font-label-sm text-on-surface-variant">${stepLine(p)}</span></div>
    <div class="flex items-center gap-3 font-label-sm text-[11px] text-on-surface-variant">${left > 0
      ? `Sound armed ${formatCountdown(left)} <button type="button" data-action="disarm" data-feed="${id}" class="underline">Disarm</button>`
      : `Sound off <button type="button" data-action="arm" data-feed="${id}" class="underline">Arm 15 min</button>`}
      ${p.audioTrack ? `<button type="button" data-action="audio-stop" data-feed="${id}" class="underline">Stop track</button>` : ""}</div>`;
  const pinned = portrait
    ? `<div class="flex gap-3 items-start"><div class="flex-1 flex flex-col gap-2 min-w-0">${info}</div><div class="w-28 shrink-0">${frameImg(p, "w-full rounded-md", 360)}</div></div>${controls}`
    : `${frameImg(p, "w-full rounded-lg", 960)}${info}${controls}`;
  return `<div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <button type="button" data-action="view" data-view="operate" class="h-9 px-2 rounded-md bg-surface-container-highest flex items-center font-label-sm"><span class="material-symbols-outlined text-[18px]">arrow_back</span>Feeds</button>
      <h2 class="font-headline-sm text-[16px] font-bold flex-1">${FEED_LABEL[id]}</h2>
      ${FEED_IDS.filter((f) => f !== id).map((f) => `<button type="button" data-action="open-feed" data-feed="${f}" class="h-9 px-2 rounded-md bg-surface-container-highest font-label-sm">${FEED_LABEL[f]}</button>`).join("")}
    </div>
    ${pinned}
    <section><div class="font-label-md font-bold uppercase text-on-surface mb-1">Coming up</div>${renderStrip(id, p)}</section>
    ${collapsible("editor", `Playlist${isDirty(id) ? " (draft)" : ""}`, renderEditor(id, p))}
    ${collapsible("saved", "Saved playlists", renderSavedPanel(id, p))}
  </div>`;
}

const INPUT = "h-10 px-3 rounded-lg bg-surface-container-highest font-body-sm";
const BTN = "h-10 px-3 rounded-lg bg-surface-container-highest font-label-md";
const BTN_PRIMARY = "h-10 px-3 rounded-lg bg-primary text-on-primary font-label-md font-bold";

function recordingSupportNow() {
  if (typeof window === "undefined") return { ok: false, reason: "" };
  return recordingSupport({
    isSecureContext: window.isSecureContext,
    hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
    hasMediaRecorder: typeof MediaRecorder !== "undefined"
  });
}

function renderTypeChips(): string {
  const types = libPage?.types ?? [];
  const total = types.reduce((n, t) => n + t.count, 0);
  const chip = (on: boolean) => `h-9 px-3 rounded-full font-label-sm text-[12px] ${on ? "bg-primary text-on-primary" : "bg-surface-container-highest"}`;
  return `<div class="flex gap-1.5 flex-wrap" role="group" aria-label="Filter by type">
    <button type="button" data-action="lib-type-all" class="${chip(libFilter.types.length === 0)}">All (${total})</button>
    ${types.map((t) => `<button type="button" data-action="lib-type" data-type="${esc(t.type)}" aria-pressed="${libFilter.types.includes(t.type)}" class="${chip(libFilter.types.includes(t.type))}">${esc(typeLabel(t.type))} (${t.count})</button>`).join("")}
  </div>`;
}

function renderDateFilters(): string {
  const preset = (p: DatePreset, label: string) => `<button type="button" data-action="lib-preset" data-preset="${p}" class="h-9 px-2.5 rounded-md bg-surface-container-highest font-label-sm text-[12px]">${label}</button>`;
  return `<div class="flex gap-2 flex-wrap items-center">
    <span class="font-label-sm text-on-surface-variant">Used</span>
    <input data-lib="from" type="date" value="${esc(libFilter.from)}" ${libFilter.unscheduled ? "disabled" : ""} class="${INPUT}" aria-label="Used from">
    <span class="font-label-sm text-on-surface-variant">to</span>
    <input data-lib="to" type="date" value="${esc(libFilter.to)}" ${libFilter.unscheduled ? "disabled" : ""} class="${INPUT}" aria-label="Used to">
    ${preset("today", "Today")}${preset("week", "Next 7 days")}${preset("month", "Next 30 days")}
    <label class="flex items-center gap-1 font-label-sm"><input type="checkbox" data-lib="unscheduled" ${libFilter.unscheduled ? "checked" : ""}> No date (permanent)</label>
    ${libFilter.from || libFilter.to || libFilter.unscheduled ? `<button type="button" data-action="lib-clear-dates" class="h-9 px-2.5 rounded-md bg-surface-container-highest font-label-sm text-[12px]">Clear dates</button>` : ""}
  </div>`;
}

function renderActiveFolder(): string {
  const a = activeFolder;
  const lan = !isOutsideLan();
  const rows = (a?.items ?? []).map(({ item, reason }) => `<li class="flex items-center gap-2 p-2 rounded-lg bg-surface-container">
      <span class="material-symbols-outlined text-on-surface-variant">${KIND_ICON[item.kind] ?? "article"}</span>
      <div class="flex-1 min-w-0"><div class="font-body-md truncate">${esc(item.title)}</div>
        <div class="font-label-sm text-[11px] text-on-surface-variant">${esc(typeLabel(item.type ?? item.kind))}${item.useAt?.length ? ` · ${esc(item.useAt.join(", "))}` : ""}</div></div>
      <span class="px-2 py-0.5 rounded-full bg-secondary-container font-label-sm text-[11px]">${esc(reasonLabel(reason))}</span>
      ${canRemoveFromActive(reason) ? `<button type="button" data-action="active-remove" data-id="${esc(item.id)}" aria-label="Remove ${esc(item.title)} from the active folder" class="h-9 w-9 rounded-md bg-surface-container-highest"><span class="material-symbols-outlined">close</span></button>` : ""}
    </li>`).join("");
  return `<section class="rounded-xl bg-surface-container-low border border-outline-variant/40 p-3 flex flex-col gap-2">
    <div class="flex gap-2 flex-wrap items-center">
      <div class="font-label-md font-bold uppercase">Active folder</div>
      <input data-active="date" type="date" value="${esc(activeDate)}" class="${INPUT}" aria-label="Active folder day">
      <span class="font-label-sm text-on-surface-variant">${a ? `${a.dateCount} by date · ${a.manualCount} picked` : "Loading…"}</span>
      ${lan && a?.manualCount ? `<button type="button" data-action="active-clear" class="${BTN} ml-auto">Clear picked</button>` : ""}
    </div>
    <div class="font-label-sm text-[11px] text-on-surface-variant">Items whose use date covers the day are here by themselves. Add other items by hand with the star in the list below.</div>
    <ul class="flex flex-col gap-1.5">${rows || `<li class="text-on-surface-variant font-body-sm">${a ? "Nothing is in the active folder for this day." : ""}</li>`}</ul>
    ${a?.items.length ? `<div class="flex gap-2 flex-wrap items-center pt-1 border-t border-outline-variant/40">
      <input data-plp="name" value="${esc(plpForm.name)}" placeholder="Playlist name" class="${INPUT} flex-1 min-w-[10rem]" aria-label="Playlist name">
      <select data-plp="orientation" class="${INPUT}" aria-label="Orientation">${[["", "Default orientation"], ["landscape", "Landscape"], ["portrait", "Portrait"]].map(([v, l]) => `<option value="${v}" ${plpForm.orientation === v ? "selected" : ""}>${l}</option>`).join("")}</select>
      <label class="flex items-center gap-1 font-label-sm"><input type="checkbox" data-plp="includeAudio" ${plpForm.includeAudio ? "checked" : ""}> Include sounds</label>
      <button type="button" data-action="active-playlist" class="${BTN_PRIMARY}">Create playlist from active folder</button>
    </div>` : ""}
  </section>`;
}

function renderSoundSection(): string {
  const support = recordingSupportNow();
  const types = [...new Set(["sound", "tts", "song", ...(libPage?.standardTypes ?? [])])];
  let capture: string;
  if (soundSrc) {
    capture = `<div class="flex flex-col gap-2">
      <div class="font-label-sm">${soundSrc.recorded ? "Recording ready" : "File chosen"}: ${esc(soundSrc.filename)}</div>
      <audio controls src="${esc(soundSrc.url)}" class="w-full" aria-label="Preview on this device"></audio>
      <div class="font-label-sm text-[11px] text-on-surface-variant">The preview plays on this device only, not on the church speakers.</div>
      <div class="flex gap-2 flex-wrap">
        <input data-snd="title" value="${esc(soundForm.title)}" placeholder="Title" class="${INPUT} flex-1 min-w-[10rem]">
        <input data-snd="type" value="${esc(soundForm.type)}" list="lib-types" placeholder="Type (default sound)" class="${INPUT} w-44">
        <datalist id="lib-types">${types.map((t) => `<option value="${esc(t)}"></option>`).join("")}</datalist>
        <input data-snd="useAt" value="${esc(soundForm.useAt)}" placeholder="Use date (optional), e.g. 2026-11-29" class="${INPUT} w-full">
      </div>
      <div class="flex gap-2"><button type="button" data-action="sound-save" class="${BTN_PRIMARY}">Save to library</button><button type="button" data-action="sound-discard" class="${BTN}">Discard</button></div>
    </div>`;
  } else if (rec) {
    capture = `<div class="flex items-center gap-3"><span class="inline-block w-3 h-3 rounded-full bg-error animate-pulse" aria-hidden="true"></span>
      <span class="font-body-md">Recording <span data-rec-elapsed>0:00</span></span>
      <button type="button" data-action="rec-stop" class="${BTN_PRIMARY}">Stop</button></div>`;
  } else {
    capture = `<div class="flex gap-2 flex-wrap items-center">
      <button type="button" data-action="rec-start" ${support.ok ? "" : "disabled"} class="${BTN} ${support.ok ? "" : "opacity-50"}"><span class="material-symbols-outlined align-middle">mic</span> Record sound</button>
      <label class="${BTN} inline-flex items-center cursor-pointer"><span class="material-symbols-outlined align-middle mr-1">upload_file</span> Upload sound<input type="file" data-snd-file accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.opus,.flac,.webm" class="sr-only"></label>
      ${support.ok ? "" : `<div class="font-label-sm text-[11px] text-on-surface-variant w-full">${esc(support.reason)}</div>`}
    </div>`;
  }
  return `<section class="rounded-xl bg-surface-container-low border border-outline-variant/40 p-3 flex flex-col gap-2">
    <div class="font-label-md font-bold uppercase">Add sound</div>
    <div class="font-label-sm text-[11px] text-on-surface-variant">Any format (wav, mp3, m4a, ogg, flac…); piprogram converts it. Adding a sound plays nothing.</div>
    ${capture}</section>`;
}

function renderLibrary(): string {
  const page = libPage;
  if (!page) return `<div class="text-on-surface-variant">Loading library…</div>`;
  const lan = !isOutsideLan();
  const pickedIds = new Set((activeFolder?.items ?? []).filter((a) => a.reason !== "date").map((a) => a.item.id));
  const inFolder = new Set((activeFolder?.items ?? []).map((a) => a.item.id));
  return `<div class="flex flex-col gap-3">
    ${renderActiveFolder()}
    ${renderSoundSection()}
    ${renderTypeChips()}
    ${renderHymnalChips()}
    <div class="flex gap-2 flex-wrap items-center">
      <input data-lib="text" value="${esc(libFilter.text)}" placeholder="Search title" class="${INPUT}">
      <select data-lib="sort" class="${INPUT}" aria-label="Sort">${[["newest", "Newest"], ["oldest", "Oldest"], ["title", "Title"], ["used", "Use date"]].map(([v, l]) => `<option value="${v}" ${libFilter.sort === v ? "selected" : ""}>${l}</option>`).join("")}</select>
      <select data-lib="target" class="${INPUT}" aria-label="Add to feed">${FEED_IDS.map((f) => `<option value="${f}" ${f === libFilter.target ? "selected" : ""}>Add to ${FEED_LABEL[f]}</option>`).join("")}</select>
      <button type="button" data-action="reload-library" class="${BTN}">Reload</button>
    </div>
    ${renderDateFilters()}
    <div class="font-label-sm text-on-surface-variant">${page.total} item${page.total === 1 ? "" : "s"}</div>
    <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">${page.items.map((i) => renderItemCard(i, { lan, picked: pickedIds.has(i.id), inFolder: inFolder.has(i.id) })).join("") || `<li class="text-on-surface-variant font-body-sm">Nothing matches.</li>`}</ul>
    ${page.items.length < page.total ? `<button type="button" data-action="lib-more" class="${BTN} self-center">Show more (${page.total - page.items.length} left)</button>` : ""}
    <section class="rounded-xl bg-surface-container-low border border-outline-variant/40 p-3 flex flex-col gap-2">
      <div class="font-label-md font-bold uppercase">Add content</div>
      <div class="flex gap-2 flex-wrap items-center">
        <input data-new="use-at" placeholder="Use date (optional), e.g. 2026-11-22" class="h-10 px-3 rounded-lg bg-surface-container-highest font-body-sm w-full">
        <div class="font-label-sm text-[11px] text-on-surface-variant w-full">Without a date the item is kept as a permanent asset.</div>
        <input data-new="youtube" placeholder="YouTube link" class="h-10 px-3 rounded-lg bg-surface-container-highest font-body-sm flex-1 min-w-[12rem]">
        <button type="button" data-action="add-youtube" class="${BTN}">Add video</button>
      </div>
      <div class="flex gap-2 flex-wrap items-start">
        <select data-new="hymn-hymnal" aria-label="Hymnal" class="${INPUT}">${(page.hymnalList ?? [{ prefix: "VK", name: "Virsikirja" }, { prefix: "LV", name: "Lasten virsi" }]).map((h) => `<option value="${esc(h.prefix)}" title="${esc(h.name)}">${esc(h.prefix)} · ${esc(h.name.length > 24 ? h.name.slice(0, 22) + "…" : h.name)}</option>`).join("")}</select>
        <input data-new="hymn-number" placeholder="Number" inputmode="numeric" class="h-10 w-24 px-3 rounded-lg bg-surface-container-highest font-body-sm">
        <input data-new="hymn-title" placeholder="Hymn title" class="h-10 px-3 rounded-lg bg-surface-container-highest font-body-sm flex-1 min-w-[10rem]">
        <textarea data-new="hymn-text" rows="3" placeholder="Stanzas (blank line between stanzas)" class="px-3 py-2 rounded-lg bg-surface-container-highest font-body-sm w-full"></textarea>
        <button type="button" data-action="add-hymn" class="${BTN}">Add hymn</button>
      </div>
    </section>
  </div>`;
}

function renderHymnalChips(): string {
  const counts = libPage?.hymnals ?? [];
  if (!counts.length && !libFilter.hymnals.length) return "";
  const names = new Map((libPage?.hymnalList ?? []).map((h) => [h.prefix, h.name]));
  const total = counts.reduce((n, h) => n + h.count, 0);
  const chip = (on: boolean) => `h-9 px-3 rounded-full font-label-sm text-[12px] ${on ? "bg-primary text-on-primary" : "bg-surface-container-highest"}`;
  return `<div class="flex gap-1.5 flex-wrap items-center" role="group" aria-label="Filter by hymnal">
    <span class="font-label-sm text-on-surface-variant">Hymnal</span>
    <button type="button" data-action="lib-hymnal-all" class="${chip(libFilter.hymnals.length === 0)}">All (${total})</button>
    ${counts.map((h) => `<button type="button" data-action="lib-hymnal" data-prefix="${esc(h.prefix)}" aria-pressed="${libFilter.hymnals.includes(h.prefix)}" title="${esc(names.get(h.prefix) ?? h.prefix)}" class="${chip(libFilter.hymnals.includes(h.prefix))}">${esc(h.prefix)} (${h.count})</button>`).join("")}
  </div>`;
}

function renderPreview(i: LibraryItem): string {
  const pv = previewOf(i, (path) => resolveApiUrl(path));
  switch (pv.kind) {
    // Previews play in this browser only (the page's own speakers), never on the church sound system.
    case "audio": return `<audio controls preload="none" src="${esc(pv.url)}" class="w-full" aria-label="Preview of ${esc(i.title)}"></audio>`;
    case "video": return `<video controls preload="metadata" playsinline src="${esc(pv.url)}" class="w-full max-h-56 rounded-md bg-black" aria-label="Preview of ${esc(i.title)}"></video>`;
    case "image": return `<img loading="lazy" src="${esc(pv.url)}" alt="${esc(i.title)}" class="w-full max-h-56 object-contain rounded-md bg-surface-container-highest">`;
    case "hymn": return `<div class="max-h-48 overflow-auto rounded-md bg-surface-container-highest p-2 font-body-sm whitespace-pre-wrap">${pv.stanzas.map((st) => `<div class="mb-2"><span class="font-label-sm text-on-surface-variant">${esc(st.number)}.</span> ${esc(st.text)}</div>`).join("")}</div>`;
    case "youtube": return `<div class="rounded-md bg-surface-container-highest p-2 font-body-sm text-on-surface-variant">YouTube video${pv.url ? `: <span class="break-all">${esc(pv.url)}</span>` : ""}</div>`;
    case "steps": return `<div class="rounded-md bg-surface-container-highest p-2 font-body-sm text-on-surface-variant">${pv.count} step${pv.count === 1 ? "" : "s"}</div>`;
    default: return "";
  }
}

function renderItemCard(i: LibraryItem, ctx: { lan: boolean; picked: boolean; inFolder: boolean }): string {
  const canva = i.canva?.exportJob;
  const canvaBad = canva?.status === "failed";
  const canvaBusy = canva && canva.status && !["ready", "completed", "success", "failed", "idle"].includes(canva.status);
  const star = ctx.inFolder && !ctx.picked ? `<span class="material-symbols-outlined text-primary" title="In the active folder by date" aria-label="In the active folder by date">event_available</span>`
    : `<button type="button" data-action="${ctx.picked ? "active-remove" : "active-add"}" data-id="${esc(i.id)}" aria-pressed="${ctx.picked}" aria-label="${ctx.picked ? "Remove from" : "Add to"} the active folder" class="h-9 w-9 rounded-md bg-surface-container-highest"><span class="material-symbols-outlined ${ctx.picked ? "text-primary" : ""}">${ctx.picked ? "star" : "star_border"}</span></button>`;
  const chip = "px-1.5 py-0.5 rounded-full bg-secondary-container";
  const hymnal = i.kind === "hymn" ? `<span class="${chip}" title="Hymnal">${esc(hymnalPrefixOf(i.hymn?.hymnNumber))}</span>` : "";
  const when = formatStamp(i.createdAt);
  return `<li class="flex flex-col gap-2 p-3 rounded-xl bg-surface-container" data-card="${esc(i.id)}">
    <div class="flex items-start gap-2">
      <span class="material-symbols-outlined text-on-surface-variant">${KIND_ICON[i.kind] ?? "article"}</span>
      <div class="flex-1 min-w-0"><div class="font-body-md font-bold break-words">${esc(i.title)}</div>
        <div class="flex flex-wrap gap-1 mt-0.5 font-label-sm text-[11px] text-on-surface-variant"><span class="${chip}">${esc(typeLabel(i.type ?? i.kind))}</span>${hymnal}${i.audio?.durationMs ? `<span>${esc(formatDuration(i.audio.durationMs))}</span>` : ""}${canvaBusy ? `<span class="text-amber-600">Canva ${esc(canva?.status)}…</span>` : ""}${canvaBad ? `<span class="text-error">Canva failed${canva?.error ? `: ${esc(canva.error)}` : ""}</span>` : ""}</div></div>
    </div>
    ${renderPreview(i)}
    <div class="font-label-sm text-[11px] text-on-surface-variant">${when ? `${esc(originLabel(i))} ${esc(when)}` : ""}${i.useAt?.length ? `${when ? " · " : ""}Use ${esc(i.useAt.join(", "))}` : `${when ? " · " : ""}Permanent`}</div>
    <div class="flex flex-col gap-1 font-label-sm text-[11px]">
      <div class="flex flex-wrap items-center gap-1.5"><span class="text-on-surface-variant">Used on:</span>${(i.usedOn ?? []).length ? (i.usedOn ?? []).map((d) => `<span class="${chip} inline-flex items-center gap-1">${esc(d)}${ctx.lan ? `<button type="button" data-action="lib-used-remove" data-id="${esc(i.id)}" data-date="${esc(d)}" aria-label="Remove use on ${esc(d)} from ${esc(i.title)}" class="material-symbols-outlined text-[14px] leading-none">close</button>` : ""}</span>`).join("") : `<span class="text-on-surface-variant">not yet</span>`}</div>
      ${ctx.lan ? `<div class="flex items-center gap-1.5"><input type="date" data-used-for="${esc(i.id)}" aria-label="New use date for ${esc(i.title)}" class="h-9 px-2 rounded-md bg-surface-container-highest"><button type="button" data-action="lib-used-add" data-id="${esc(i.id)}" class="h-9 px-2.5 rounded-md bg-surface-container-highest">Add use date</button></div>` : ""}
    </div>
    <div class="flex items-center gap-1.5 flex-wrap">
      <button type="button" data-action="item-edit" data-id="${esc(i.id)}" aria-label="Edit ${esc(i.title)}" class="h-9 px-2.5 rounded-md bg-surface-container-highest font-label-sm text-[12px] flex items-center gap-1"><span class="material-symbols-outlined text-[18px]">edit</span>Edit</button>
      ${star}
      ${i.kind === "audio" ? "" : `<button type="button" data-action="lib-add" data-id="${esc(i.id)}" class="h-9 px-2.5 rounded-md bg-primary text-on-primary font-label-sm text-[12px]">Add</button>`}
      ${ctx.lan ? `<button type="button" data-action="lib-delete" data-id="${esc(i.id)}" aria-label="Delete ${esc(i.title)}" class="h-9 w-9 rounded-md bg-surface-container-highest ml-auto"><span class="material-symbols-outlined">delete</span></button>` : ""}
    </div>
  </li>`;
}

function renderEditDialog(): string {
  const e = editItem;
  const it = e ? libPage?.items.find((x) => x.id === e.id) ?? itemById(e.id) : undefined;
  if (!e || !it) return "";
  const known = [...new Set([...(libPage?.standardTypes ?? []), ...(libPage?.types ?? []).map((t) => t.type)])];
  const current = normalizeType(e.type);
  const body = `<label class="flex flex-col gap-1 font-label-sm text-on-surface-variant">Title
      <input data-edit="title" value="${esc(e.title)}" maxlength="200" class="${INPUT} w-full font-body-md text-on-surface"></label>
    <div class="font-label-sm text-on-surface-variant">Type</div>
    <div class="flex gap-1.5 flex-wrap" role="group" aria-label="Library type">${known.map((t) => `<button type="button" data-action="edit-pick-type" data-type="${esc(t)}" aria-pressed="${current === t}" class="h-9 px-3 rounded-full font-label-sm text-[12px] ${current === t ? "bg-primary text-on-primary" : "bg-surface-container-highest"}">${esc(typeLabel(t))}</button>`).join("")}</div>
    <input data-edit="type" value="${esc(e.type)}" placeholder="Or type your own (jingle, prayer…)" aria-label="Custom type" class="${INPUT} w-full">
    <div class="font-label-sm text-[11px] text-on-surface-variant">Default for this kind of item: ${esc(typeLabel(defaultTypeOfKind(it)))}. Lowercase letters, digits and dashes.</div>`;
  return modal("Edit item", body,
    `<button type="button" data-action="item-type-default" class="${BTN}" title="Use the default type of this kind of item">Default type</button>
     <button type="button" data-action="item-save" class="${BTN_PRIMARY}">Save</button>`);
}

function defaultTypeOfKind(i: LibraryItem): string {
  if (i.kind === "audio") return i.audio?.origin === "tts" || i.id.startsWith("tts-") ? "tts" : "sound";
  return ({ hymn: "hymn", image: "image", video: "video", youtube: "video", pptx: "slides", canva: "canva" } as Record<string, string>)[i.kind] ?? "other";
}

function renderDialog(): string {
  if (dialog === "edit-item") return renderEditDialog();
  if (dialog === "permanent") {
    return modal("Permanent asset?", `<div class="font-body-md">No use date was given. Add this as a permanent asset that stays in the library until you delete it?</div>`,
      `<button type="button" data-action="confirm-permanent" class="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md font-bold">Yes, permanent</button>`);
  }
  if (dialog === "save" && view.name === "feed") {
    const p = feed(view.id);
    return modal("Save playlist", `<input data-save-name class="h-10 w-full px-3 rounded-lg bg-surface-container-highest font-body-md" placeholder="Name" value="${esc(p ? `${FEED_LABEL[p.id]} ${new Date().toLocaleDateString("fi-FI")}` : "")}">
      <div class="font-label-sm text-[11px] text-on-surface-variant mt-1">Saves what the feed plays now, not the unapplied draft.</div>`,
      `<button type="button" data-action="save-confirm" class="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md font-bold">Save</button>`);
  }
  if (dialog === "generate" && view.name === "feed") {
    const g = generateState ?? { date: nextSunday(), busy: false, draftName: "", items: [], missing: 0 };
    const body = `<div class="flex gap-2 items-center"><input data-gen-date type="date" value="${esc(g.date)}" class="h-10 px-2 rounded-lg bg-surface-container-highest font-body-md">
      <button type="button" data-action="generate-run" class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md" ${g.busy ? "disabled" : ""}>${g.busy ? "Generating…" : "Generate"}</button></div>
      ${g.items.length ? `<div class="mt-2 font-label-sm text-on-surface-variant">Draft “${esc(g.draftName)}” has ${g.items.length} items. It goes to the draft of ${FEED_LABEL[view.id]}; nothing goes on air until you apply it.${g.missing ? ` ${g.missing} entries have no library match.` : ""}</div>
      <ol class="list-decimal pl-5 mt-1 max-h-48 overflow-auto font-body-sm">${g.items.map((id) => `<li>${esc(itemById(id)?.title ?? id)}</li>`).join("")}</ol>` : `<div class="mt-2 font-label-sm text-on-surface-variant">Picks library items whose use-at date matches the day: hymns, slides, Canva, images, video.</div>`}`;
    return modal("Generate for a date", body, g.items.length ? `<button type="button" data-action="generate-use" class="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md font-bold">Use as draft</button>` : "");
  }
  return "";
}

function modal(title: string, body: string, actions: string): string {
  return `<div class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" data-modal>
    <div class="w-full max-w-md rounded-xl bg-surface p-4 shadow-xl flex flex-col gap-3" role="dialog" aria-label="${esc(title)}">
      <div class="flex items-center justify-between"><h3 class="font-headline-sm text-[16px] font-bold">${esc(title)}</h3><button type="button" data-action="close-dialog" aria-label="Close"><span class="material-symbols-outlined">close</span></button></div>
      ${body}
      <div class="flex justify-end gap-2">${actions}<button type="button" data-action="close-dialog" class="h-10 px-3 rounded-lg bg-surface-container-highest font-label-md">Cancel</button></div>
    </div></div>`;
}

function nextSunday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return d.toISOString().slice(0, 10);
}

function signature(): string {
  const mins = Math.floor(Date.now() / 1000); // arm countdowns tick once a second
  return JSON.stringify([
    view, pipelines.map((p) => [p.id, p.state, p.playbackState, p.fadeToBlack, p.activeItemId, p.currentStep, p.totalSteps, p.audioEnabled, p.audioArmedUntil, !!p.audioTrack, p.playlist.map((i) => i.id), p.orientation]),
    [...stepsByFeed.entries()].map(([k, v]) => [k, v.steps.length, v.currentStep]), stepsKey.size,
    libPage?.items.map((i) => [i.id, i.title, i.type, i.useAt, i.createdAt]), libPage?.total, libPage?.types, libPage?.hymnals, activeFolder?.items.map((a) => [a.item.id, a.reason]),
    activeDate, plpForm, editItem, soundSrc?.url, soundForm, rec ? 1 : 0, recordingSupportNow().ok,
    [...drafts.entries()], library?.length, saved?.map((s) => s.id), banner, notice, loadReport?.report.mode, dialog, generateState,
    libFilter, panelOpen, offline, publish, pipelines.some((p) => armSecondsLeft(p) > 0) ? mins : 0
  ]);
}

function render(force = false): void {
  if (!root || !active) return;
  // Do not rebuild the DOM while the operator is typing or dragging.
  const el = document.activeElement;
  const typing = !!el && root.contains(el) && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
  if (dragIndex !== null || (typing && !force)) return;
  const sig = signature();
  if (sig === lastSignature) return;
  lastSignature = sig;
  let body = "";
  if (view.name === "operate") body = renderOperate();
  else if (view.name === "monitor") body = renderMonitor();
  else if (view.name === "library") body = renderLibrary();
  else body = renderFocus(view.id);
  root.innerHTML = `<div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-3 flex-wrap">${renderKillBar()}${renderNav()}</div>
    ${view.name === "operate" ? renderPublishBar() : ""}${renderBanner()}${body}</div>${renderDialog()}`;
  refreshFrames();
}

// ---------------------------------------------------------------------------
// live frames (throttled, preloaded so the picture never flashes)
// ---------------------------------------------------------------------------
function refreshFrames(): void {
  if (!root || !active || document.hidden) return;
  root.querySelectorAll<HTMLImageElement>("img[data-frame]").forEach((img) => {
    const id = img.dataset.frame as FeedId;
    const width = Number(img.dataset.width) || 480;
    const next = new Image();
    next.onload = () => { img.src = next.src; };
    next.src = client.frameUrl(id, width, Date.now());
  });
}

// ---------------------------------------------------------------------------
// actions
// ---------------------------------------------------------------------------
function control(id: FeedId, action: "next" | "prev" | "play" | "pause"): void {
  void act(() => client.control(id, { action }), applyPipeline);
}

async function exportCurrent(id: FeedId): Promise<void> {
  const p = feed(id);
  if (!p) return;
  const doc = toDocument(`${FEED_LABEL[id]} playlist`, p, p.playlist);
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `piprogram-playlist-${id}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function onClick(event: Event): void {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const id = (target.dataset.feed as FeedId | undefined) ?? (view.name === "feed" ? view.id : undefined);

  switch (action) {
    case "kill-audio":
      void act(() => client.audioKill(), (items) => { pipelines = items.filter((p) => !p.hidden); notice = "Audio killed on every feed."; setTimeout(() => { notice = ""; render(); }, 4000); });
      break;
    case "publish-feed":
      if (id) void act(() => client.setPublishFeed(id, target.dataset.on === "1"), (state) => { publish = state; });
      break;
    case "publish-address":
      void act(() => client.setPublishAddress("rtsp://127.0.0.1:8554"), (state) => { publish = state; });
      break;
    case "kill-feed":
      if (id) void act(async () => { const stopped = await client.audioStop(id);
        // Disarming is a LAN-only route; from outside the stop above is what counts, so a refusal is not an error.
        try { return await client.audioDisarm(id); } catch { return stopped; } }, applyPipeline);
      break;
    case "dismiss-banner": banner = null; render(); break;
    case "view": goto({ name: target.dataset.view as "operate" | "monitor" | "library" }); break;
    case "open-feed": if (id) goto({ name: "feed", id }); break;
    case "ctl": if (id) control(id, target.dataset.ctl as "next" | "prev" | "play" | "pause"); break;
    case "ftb": if (id) { const p = feed(id); void act(() => client.ftb(id, !p?.fadeToBlack), applyPipeline); } break;
    case "arm": if (id) void act(() => client.audioArm(id, 900), applyPipeline); break;
    case "disarm": if (id) void act(() => client.audioDisarm(id), applyPipeline); break;
    case "audio-stop": if (id) void act(() => client.audioStop(id), applyPipeline); break;
    case "goto-step": {
      if (!id) break;
      const itemId = target.dataset.item ?? "";
      const stepIndex = Number(target.dataset.step);
      const p = feed(id);
      if (p?.activeItemId === itemId) void act(() => client.control(id, { action: "gotoStep", stepIndex }), applyPipeline);
      else void act(() => client.control(id, { action: "gotoItem", itemId }).then((r) => stepIndex > 0 ? client.control(id, { action: "gotoStep", stepIndex }) : r), applyPipeline);
      break;
    }
    case "prepare": {
      const itemId = target.dataset.item;
      const p = id ? feed(id) : undefined;
      if (itemId && p) void act(() => client.prepareItem(itemId, p.orientation), () => { notice = "Preparing step pictures…"; stepsKey.clear(); setTimeout(() => { notice = ""; render(); }, 4000); });
      break;
    }
    case "toggle-panel": {
      const name = target.dataset.panel as "editor" | "saved";
      panelOpen = { ...panelOpen, [name]: !panelOpen[name] };
      if (name === "saved" && panelOpen.saved) void ensureSaved();
      render();
      break;
    }
    // draft editor
    case "move": {
      if (!id) break;
      const i = Number(target.dataset.index);
      setDraft(id, moveEntry(draftOf(id), i, i + Number(target.dataset.dir)));
      render();
      break;
    }
    case "remove-draft": if (id) { setDraft(id, removeAt(draftOf(id), Number(target.dataset.index))); render(); } break;
    case "add-selected": {
      const select = root?.querySelector<HTMLSelectElement>("[data-add-select]");
      if (id && select?.value) { setDraft(id, addUnique(draftOf(id), select.value)); render(); }
      break;
    }
    case "revert-draft": if (id) { drafts.delete(id); render(); } break;
    case "apply-draft":
      if (id) void act(() => client.setOrder(id, draftOf(id)), (p) => { applyPipeline(p); drafts.delete(id); stepsKey.delete(id); });
      break;
    // saved playlists
    case "open-save": dialog = "save"; render(); break;
    case "open-generate": dialog = "generate"; generateState = null; void ensureLibrary(); render(); break;
    case "close-dialog": dialog = null; editItem = null; pendingAdd = null; render(); break;
    case "confirm-permanent": { const run = pendingAdd; dialog = null; pendingAdd = null; render(); run?.(); break; }
    case "save-confirm": {
      const name = root?.querySelector<HTMLInputElement>("[data-save-name]")?.value.trim();
      if (!id || !name) break;
      dialog = null;
      void act(() => client.savePlaylist(id, name), () => { saved = null; notice = `Saved “${name}”.`; setTimeout(() => { notice = ""; render(); }, 4000); void ensureSaved(true); });
      break;
    }
    case "load-saved": {
      if (!id) break;
      const playlistId = target.dataset.id ?? "";
      const mode = target.dataset.mode === "append" ? "append" : "replace";
      const p = feed(id);
      const onAir = p?.state === "live" && p.playbackState === "playing";
      if (onAir && mode === "replace" && !window.confirm(`${FEED_LABEL[id]} is on air. Load keeps the current item until you press Next. Load anyway?`)) break;
      void act(() => client.loadPlaylist(id, playlistId, mode), (r) => { applyPipeline(r.pipeline); loadReport = { feed: id, report: r.report }; drafts.delete(id); stepsKey.delete(id); void ensureLibrary(true); });
      break;
    }
    case "delete-saved":
      if (window.confirm("Delete this saved playlist?")) void act(() => client.deletePlaylist(target.dataset.id ?? ""), () => { void ensureSaved(true); });
      break;
    case "export": if (id) void exportCurrent(id); break;
    case "generate-run": {
      const date = root?.querySelector<HTMLInputElement>("[data-gen-date]")?.value || nextSunday();
      const p = id ? feed(id) : undefined;
      generateState = { date, busy: true, draftName: "", items: [], missing: 0 };
      render();
      void (async () => {
        try {
          await ensureLibrary();
          const r = await client.generate(date, p?.orientation);
          const known = new Set((library ?? []).map((i) => i.id));
          const ids = r.draft.items.flatMap((e) => (e.itemId && known.has(e.itemId) ? [e.itemId] : []));
          generateState = { date, busy: false, draftName: r.draft.name, items: ids, missing: r.draft.items.length - ids.length };
        } catch (error) {
          generateState = { date, busy: false, draftName: "", items: [], missing: 0 };
          showError(error);
        }
        render();
      })();
      break;
    }
    case "generate-use":
      if (id && generateState) { setDraft(id, generateState.items); dialog = null; generateState = null; panelOpen = { ...panelOpen, editor: true }; render(); }
      break;
    // library
    case "reload-library": library = null; void ensureLibrary(true); void loadActive(); break;
    case "lib-type": libFilter.types = toggleType(libFilter.types, target.dataset.type ?? ""); libLimit = PAGE_SIZE; void loadLibraryPage(); break;
    case "lib-type-all": libFilter.types = []; libLimit = PAGE_SIZE; void loadLibraryPage(); break;
    case "lib-preset": { const r = presetRange((target.dataset.preset ?? "today") as DatePreset); libFilter.from = r.from; libFilter.to = r.to; libFilter.unscheduled = false; libLimit = PAGE_SIZE; void loadLibraryPage(); break; }
    case "lib-clear-dates": libFilter.from = ""; libFilter.to = ""; libFilter.unscheduled = false; libLimit = PAGE_SIZE; void loadLibraryPage(); break;
    case "lib-more": libLimit += PAGE_SIZE; void loadLibraryPage(); break;
    case "lib-hymnal": { const p = target.dataset.prefix ?? ""; libFilter.hymnals = libFilter.hymnals.includes(p) ? libFilter.hymnals.filter((x) => x !== p) : [...libFilter.hymnals, p]; libLimit = PAGE_SIZE; void loadLibraryPage(); break; }
    case "lib-hymnal-all": libFilter.hymnals = []; libLimit = PAGE_SIZE; void loadLibraryPage(); break;
    case "item-edit": {
      const it = page_item(target.dataset.id ?? "") ?? itemById(target.dataset.id ?? "");
      if (it) { editItem = { id: it.id, title: it.title, type: it.type ?? "" }; dialog = "edit-item"; lastSignature = ""; render(); }
      break;
    }
    case "edit-pick-type": if (editItem) { editItem.type = target.dataset.type ?? ""; lastSignature = ""; render(true); } break;
    case "item-save": case "item-type-default": {
      if (!editItem) break;
      const it = page_item(editItem.id) ?? itemById(editItem.id);
      const title = editItem.title.trim();
      const type = action === "item-type-default" ? null : normalizeType(editItem.type);
      if (!title) { banner = { title: "Title is empty", next: "Type a title for the item." }; render(); break; }
      if (action === "item-save" && !type) { banner = { title: "Type is empty", next: "Pick a type or type a name, or press Default type." }; render(); break; }
      const id = editItem.id;
      const patch: { title?: string; type?: string | null } = {};
      if (title !== it?.title) patch.title = title;
      if (action === "item-type-default" || type !== (it?.type ?? undefined)) patch.type = type;
      void act(() => client.updateItem(id, patch), () => { dialog = null; editItem = null; library = null; void ensureLibrary(true); void loadActive(); });
      break;
    }
    case "lib-used-add": {
      const itemId = target.dataset.id ?? "";
      const date = root?.querySelector<HTMLInputElement>(`[data-used-for="${CSS.escape(itemId)}"]`)?.value ?? "";
      if (!itemId) break;
      if (!date) { banner = { title: "No date chosen", next: "Pick the day the item was used, then press Add use date." }; render(); break; }
      void act(() => client.addUsedOn(itemId, date), () => { library = null; void ensureLibrary(true); });
      break;
    }
    case "lib-used-remove": {
      const itemId = target.dataset.id ?? "";
      const date = target.dataset.date ?? "";
      if (itemId && date) void act(() => client.removeUsedOn(itemId, date), () => { library = null; void ensureLibrary(true); });
      break;
    }
    case "lib-delete": {
      const itemId = target.dataset.id ?? "";
      const it = itemById(itemId);
      if (itemId && window.confirm(`Delete “${it?.title ?? itemId}” from the library? It also leaves every playlist.`)) {
        void act(() => client.deleteItem(itemId), () => { library = null; void ensureLibrary(true); void loadActive(); });
      }
      break;
    }
    case "active-add": if (target.dataset.id) void act(() => client.addActive(target.dataset.id as string), (f) => { activeFolder = f; }); break;
    case "active-remove": if (target.dataset.id) void act(() => client.removeActive(target.dataset.id as string), (f) => { activeFolder = f; }); break;
    case "active-clear": void act(() => client.clearActive(), () => { void loadActive(); }); break;
    case "active-playlist": {
      const name = plpForm.name.trim();
      if (!name) { banner = { title: "The playlist needs a name", next: "Type a name, then create it." }; render(); break; }
      void act(
        () => client.playlistFromActive({ name, date: activeDate || undefined, includeAudio: plpForm.includeAudio, ...(plpForm.orientation ? { orientation: plpForm.orientation } : {}) }),
        (r) => {
          plpForm = { ...plpForm, name: "" };
          notice = `Saved playlist “${r.name}” (${r.items.length} items${r.skippedAudio ? `, ${r.skippedAudio} sound(s) left out` : ""}). Load it from a feed.`;
          setTimeout(() => { notice = ""; render(); }, 6000);
          void ensureSaved(true);
        }
      );
      break;
    }
    case "rec-start": void startRecording(); break;
    case "rec-stop": stopRecording(); break;
    case "sound-discard": clearSound(); render(); break;
    case "sound-save": saveSound(); break;
    case "lib-add": {
      const itemId = target.dataset.id ?? "";
      const t = libFilter.target;
      setDraft(t, addUnique(draftOf(t), itemId));
      notice = `Added to the draft of ${FEED_LABEL[t]}. Open the feed and apply it.`;
      setTimeout(() => { notice = ""; render(); }, 4000);
      render();
      break;
    }
    case "add-youtube": {
      const input = root?.querySelector<HTMLInputElement>("[data-new=youtube]");
      const v = input?.value.trim();
      if (v) withUseDate((useAt) => void act(async () => { const it = await client.addYoutube(v); if (useAt) await client.setUseAt(it.id, useAt); return it; }, () => { if (input) input.value = ""; void ensureLibrary(true); }));
      break;
    }
    case "add-hymn": {
      const q = (n: string) => root?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-new=${n}]`);
      const title = q("hymn-title")?.value.trim() || (q("hymn-number")?.value.trim() ? `Virsi ${q("hymn-number")?.value.trim()}` : "");
      const text = q("hymn-text")?.value.trim() ?? "";
      const number = composeHymnNumber((root?.querySelector<HTMLSelectElement>("[data-new=hymn-hymnal]")?.value) ?? "VK", q("hymn-number")?.value ?? "");
      if (!title || !text) { banner = { title: "Hymn needs a title and text", next: "Fill in the title (or number) and paste the stanzas." }; render(); break; }
      withUseDate((useAt) => void act(async () => { const it = await client.addHymn(title, number, text); if (useAt) await client.setUseAt(it.id, useAt); return it; }, () => { ["hymn-number", "hymn-title", "hymn-text"].forEach((n) => { const e = q(n); if (e) e.value = ""; }); void ensureLibrary(true); }));
      break;
    }
  }
}

/** Runs an add with its optional use date; with no date, asks first whether it is a permanent asset. */
function withUseDate(run: (useAt: string) => void): void {
  const useAt = root?.querySelector<HTMLInputElement>("[data-new=use-at]")?.value.trim() ?? "";
  if (useAt) { run(useAt); return; }
  pendingAdd = () => run("");
  dialog = "permanent";
  render();
}

/** Keeps what is typed in the sound and playlist forms, without rebuilding the page. */
function page_item(id: string): LibraryItem | undefined {
  return libPage?.items.find((i) => i.id === id);
}

function storeForm(t: HTMLElement): void {
  const el = t as HTMLInputElement;
  if (t.dataset.edit) { if (editItem) editItem[t.dataset.edit as "title" | "type"] = el.value; return; }
  const snd = t.dataset.snd as "title" | "type" | "useAt" | undefined;
  if (snd) soundForm[snd] = el.value;
  const plp = t.dataset.plp;
  if (plp === "name") plpForm.name = el.value;
  else if (plp === "orientation") plpForm.orientation = el.value;
  else if (plp === "includeAudio") plpForm.includeAudio = el.checked;
}

function clearSound(): void {
  if (soundSrc) URL.revokeObjectURL(soundSrc.url);
  soundSrc = null;
  soundForm = { title: "", type: "", useAt: "" };
}

function setSound(blob: Blob, filename: string, mime: string, recorded: boolean): void {
  clearSound();
  soundSrc = { blob, filename, mime, recorded, url: URL.createObjectURL(blob) };
  soundForm.title = recorded ? "" : titleFromFilename(filename);
  lastSignature = "";
  render(true);
}

async function startRecording(): Promise<void> {
  const support = recordingSupportNow();
  if (!support.ok) { banner = { title: "Cannot record here", next: support.reason ?? "" }; render(); return; }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    banner = { title: "The microphone is not available", next: "Allow microphone access for this page in the browser, or upload a file instead." };
    render();
    return;
  }
  const mime = pickRecorderMime((m) => MediaRecorder.isTypeSupported(m)) ?? "";
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  } catch {
    stream.getTracks().forEach((tr) => tr.stop());
    banner = { title: "Recording is not supported", next: "This browser cannot record in a usable format. Upload a file instead." };
    render();
    return;
  }
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  recorder.onstop = () => {
    stream.getTracks().forEach((tr) => tr.stop());
    if (rec) window.clearInterval(rec.tick);
    rec = null;
    const type = recorder.mimeType || mime || "audio/webm";
    const blob = new Blob(chunks, { type });
    if (!blob.size) { banner = { title: "Nothing was recorded", next: "Check the microphone and try again." }; render(); return; }
    setSound(blob, recordingFilename(new Date(), type), type, true);
  };
  const startedAt = Date.now();
  const tick = window.setInterval(() => {
    const secs = Math.floor((Date.now() - startedAt) / 1000);
    const el = root?.querySelector("[data-rec-elapsed]");
    if (el) el.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    if (secs >= 15 * 60) stopRecording();
  }, 500);
  rec = { recorder, stream, chunks, startedAt, mime, tick };
  recorder.start(1000);
  lastSignature = "";
  render(true);
}

function stopRecording(): void {
  if (rec && rec.recorder.state !== "inactive") rec.recorder.stop();
}

function readBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
    reader.readAsDataURL(blob);
  });
}

function saveSound(): void {
  const src = soundSrc;
  if (!src) return;
  const go = (): void => {
    void act(async () => {
      const dataBase64 = await readBase64(src.blob);
      const filename = /\.[a-z0-9]+$/i.test(src.filename) ? src.filename : `${src.filename}.${extensionForMime(src.mime)}`;
      const type = normalizeType(soundForm.type);
      return client.uploadSound({
        filename, mimeType: src.mime, dataBase64, recorded: src.recorded,
        ...(soundForm.title.trim() ? { title: soundForm.title.trim() } : {}),
        ...(type ? { type } : {}), ...(soundForm.useAt.trim() ? { useAt: soundForm.useAt.trim() } : {})
      });
    }, (item) => {
      clearSound();
      notice = `Saved “${item.title}” to the library.`;
      setTimeout(() => { notice = ""; render(); }, 4000);
      library = null;
      void ensureLibrary(true);
      void loadActive();
    });
  };
  if (soundForm.useAt.trim()) { go(); return; }
  pendingAdd = go;
  dialog = "permanent";
  render();
}

function onChange(event: Event): void {
  const t = event.target as HTMLElement;
  if (t instanceof HTMLInputElement && t.dataset.import !== undefined) {
    const file = t.files?.[0];
    const id = view.name === "feed" ? view.id : undefined;
    if (!file || !id) return;
    void file.text().then((text) => {
      const parsed = parsePlaylistDocument(text);
      if (!parsed.ok) { banner = { title: "Cannot import this file", next: parsed.error }; render(); return; }
      void act(() => client.createPlaylist(parsed.doc), (s) => { notice = `Imported “${s.name}”. Load it from the list.`; void ensureSaved(true); });
    });
    t.value = "";
    return;
  }
  if (t instanceof HTMLInputElement && t.dataset.sndFile !== undefined) {
    const file = t.files?.[0];
    t.value = "";
    if (!file) return;
    const problem = checkSoundFile(file);
    if (problem) { banner = { title: "Cannot use this file", next: problem }; render(); return; }
    setSound(file, file.name, file.type || "audio/mpeg", false);
    return;
  }
  const d = t.dataset;
  if (d.snd || d.plp || d.edit) { storeForm(t); return; }
  if (d.active === "date" && t instanceof HTMLInputElement) { activeDate = t.value; void loadActive(); return; }
  const lib = d.lib;
  if (lib && (t instanceof HTMLInputElement || t instanceof HTMLSelectElement)) {
    if (lib === "unscheduled") libFilter.unscheduled = (t as HTMLInputElement).checked;
    else (libFilter as unknown as Record<string, string>)[lib] = t.value;
    lastSignature = "";
    if (lib !== "target") { libLimit = PAGE_SIZE; void loadLibraryPage(); }
    render(true);
  }
}

function onInput(event: Event): void {
  const t = event.target;
  if (t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement) {
    if (t.dataset.snd || t.dataset.plp || t.dataset.edit) { storeForm(t); return; }
  }
  if (t instanceof HTMLInputElement && t.dataset.lib === "text") {
    libFilter.text = t.value;
    // Ask the service after a short pause; the box keeps focus (render() skips while typing).
    if (textTimer !== undefined) window.clearTimeout(textTimer);
    textTimer = window.setTimeout(() => { libLimit = PAGE_SIZE; void loadLibraryPage(); }, 300);
  }
}

function onKey(event: KeyboardEvent): void {
  if (!active || view.name !== "feed" || dialog) return;
  const el = event.target as HTMLElement | null;
  if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const id = view.id;
  if (event.key === " " || event.key === "ArrowRight") { event.preventDefault(); control(id, "next"); }
  else if (event.key === "ArrowLeft" || event.key.toLowerCase() === "b") { event.preventDefault(); control(id, "prev"); }
}

// Drag and drop reordering of the draft.
function onDragStart(event: DragEvent): void {
  const li = (event.target as HTMLElement).closest<HTMLElement>("[data-drag]");
  if (!li) return;
  dragIndex = Number(li.dataset.drag);
  event.dataTransfer?.setData("text/plain", String(dragIndex));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}
function onDragOver(event: DragEvent): void {
  if (dragIndex !== null) event.preventDefault();
}
function onDrop(event: DragEvent): void {
  const li = (event.target as HTMLElement).closest<HTMLElement>("[data-drag]");
  const from = dragIndex;
  dragIndex = null;
  if (!li || from === null || view.name !== "feed") { render(); return; }
  event.preventDefault();
  setDraft(view.id, moveEntry(draftOf(view.id), from, Number(li.dataset.drag)));
  lastSignature = "";
  render();
}
function onDragEnd(): void {
  dragIndex = null;
  lastSignature = "";
  render();
}

// ---------------------------------------------------------------------------
// lifecycle
// ---------------------------------------------------------------------------
/** Mounts the tab into #renderer-root. Call once at startup. */
export function initRendererTab(): void {
  root = document.getElementById("renderer-root");
  if (!root) return;
  root.addEventListener("click", onClick);
  root.addEventListener("change", onChange);
  root.addEventListener("input", onInput);
  root.addEventListener("dragstart", onDragStart);
  root.addEventListener("dragover", onDragOver);
  root.addEventListener("drop", onDrop);
  root.addEventListener("dragend", onDragEnd);
  document.addEventListener("keydown", onKey);
}

/** Polls piprogram only while the tab is visible. */
export function setRendererTabActive(next: boolean): void {
  if (next === active) return;
  active = next;
  if (active) {
    lastSignature = "";
    render();
    poller.start();
    frameTimer = window.setInterval(() => refreshFrames(), 3000);
    clockTimer = window.setInterval(() => render(), 1000);
  } else {
    poller.stop();
    if (frameTimer !== undefined) window.clearInterval(frameTimer);
    if (clockTimer !== undefined) window.clearInterval(clockTimer);
    frameTimer = clockTimer = undefined;
  }
}
