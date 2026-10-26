// Composite tab of the Crop & Effects dialog. It edits the slide composite frame
// (pimatrix /api/v1/composites): side, aspect, size and vertical position of the slide
// on the key page. It is the same layout as the Crop tab: preview on top, a draggable
// frame below, presets and nudge buttons under that.

import type { Composite, CompositeId, CompositePatch } from "./composite/types";

const SCALE_STEP = 0.05;
const MIN_SCALE = 0.6;
const MAX_SCALE = 1;
const FREE_STEP = 0.05;
/** Positions the slide snaps to on each axis: the edges, the centre and the halves between. */
const SNAP_POINTS = [-1, -0.5, 0, 0.5, 1];
const SNAP_KEY = "picontrol.compositeSnap";
const SLIDE_RATIO = { "10:16": 10 / 16, "9:16": 9 / 16 } as const;

let toast: (message: string) => void = () => undefined;
let target: CompositeId = "compose1";
let comp: Composite | null = null;
let previewUrl: string | null = null;
let previewTimer: ReturnType<typeof setTimeout> | null = null;
let loadSeq = 0;
/** The source that was long-pressed to open the dialog (null = opened some other way). */
let context: string | null = null;
let snap = readSnap();
const PIPGM_IDS: readonly string[] = ["PiPGM1", "PiPGM2", "PiPGM3"];

const COMPOSITE_PATH = "/api/v1/composites";

function readSnap(): boolean {
  try {
    return localStorage.getItem(SNAP_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Round to the nearest snap point when snapping is on, else to 0.01. */
function place(value: number): number {
  const v = clamp(value, -1, 1);
  if (!snap) return Math.round(v * 100) / 100;
  return SNAP_POINTS.reduce((best, p) => (Math.abs(p - v) < Math.abs(best - v) ? p : best), SNAP_POINTS[0]);
}

/** Arrow step: the next snap point in that direction, or a small nudge when snap is off. */
function stepped(value: number, dir: 1 | -1): number {
  if (!snap) return clamp(Math.round((value + dir * FREE_STEP) * 100) / 100, -1, 1);
  const eps = 1e-6;
  const next = dir > 0 ? SNAP_POINTS.find((p) => p > value + eps) : [...SNAP_POINTS].reverse().find((p) => p < value - eps);
  return next ?? clamp(value, -1, 1);
}

function renderSnap(): void {
  const btn = byId("comp-snap-btn");
  const label = byId("comp-snap-label");
  if (label) label.textContent = snap ? "Snap on" : "Snap off";
  if (btn) {
    btn.className = `px-2 h-6 rounded-md font-label-sm text-[9px] font-bold uppercase flex items-center gap-1 active:scale-95 ${snap ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`;
  }
}

function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

async function send(method: "GET" | "PUT" | "POST", path: string, body?: unknown): Promise<Composite | null> {
  try {
    const init: RequestInit = { method };
    if (method !== "GET") {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(body ?? {});
    }
    const res = await fetch(path, init);
    if (!res.ok) {
      toast(`Composite: ${await errorMessage(res)}`);
      return null;
    }
    return (await res.json()) as Composite;
  } catch {
    toast("Composite request failed");
    return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** The slide rectangle as fractions of the frame, same rule as pimatrix' key page. */
export function slideRect(c: Pick<Composite, "width" | "height" | "side" | "slideAspect" | "slideScale" | "offsetX" | "offsetY">): { x: number; y: number; w: number; h: number } {
  const h = clamp(c.slideScale, MIN_SCALE, MAX_SCALE);
  const w = Math.min(1, h * SLIDE_RATIO[c.slideAspect] * (c.height / c.width));
  const free = 1 - h;
  return {
    x: ((1 - w) / 2) * (1 + (c.offsetX ?? (c.side === "left" ? -1 : 1))),
    y: (free / 2) * (1 + (c.offsetY ?? 0)),
    w,
    h
  };
}

function csError(message: string | null): void {
  const el = byId("cs-error");
  if (!el) return;
  el.textContent = message ?? "";
  el.classList.toggle("hidden", message === null);
}

function render(): void {
  for (const id of ["compose1", "compose2"] as const) {
    const btn = byId(`comp-target-${id}`);
    if (!btn) continue;
    const active = id === target;
    btn.className = active
      ? "flex-1 px-1.5 py-1 rounded font-label-sm text-[10px] uppercase font-bold bg-surface text-primary shadow-sm"
      : "flex-1 px-1.5 py-1 rounded font-label-sm text-[10px] uppercase text-on-surface-variant";
  }
  const status = byId("comp-status");
  const readout = byId("comp-readout");
  const run = byId("comp-run-btn");
  const frame = byId("comp-frame");
  const slide = byId("comp-slide");
  const tag = byId("comp-slide-tag");
  if (!comp) {
    if (status) status.textContent = "Loading...";
    return;
  }
  renderInput();
  renderSnap();
  if (status) {
    const parts: string[] = [comp.enabled ? comp.state : "stopped"];
    if (!comp.hasSlide) parts.push("no slide yet");
    if (comp.lastError) parts.push(comp.lastError);
    status.textContent = parts.join(" • ");
  }
  if (readout) {
    readout.textContent = `${comp.slideAspect} • ${Math.round(comp.slideScale * 100)}% • X ${Math.round((comp.offsetX ?? 0) * 100)}% • Y ${Math.round((comp.offsetY ?? 0) * 100)}%`;
  }
  if (run) {
    run.textContent = comp.enabled ? "Stop" : "Start";
    run.className = comp.enabled
      ? "px-3 h-8 rounded-lg bg-error text-on-error font-label-sm text-[10px] font-bold uppercase active:scale-95"
      : "px-3 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-[10px] font-bold uppercase active:scale-95";
  }
  if (frame) {
    frame.style.aspectRatio = `${comp.width} / ${comp.height}`;
    if (comp.kind === "atem-media") {
      frame.style.background = "repeating-conic-gradient(#3b3631 0% 25%, #4a443e 0% 50%) 50% / 16px 16px";
    } else {
      frame.style.background = comp.keyMode === "luma" ? "#000000" : comp.keyColor;
      frame.style.backgroundSize = "";
    }
  }
  if (slide) {
    const r = slideRect(comp);
    slide.style.left = `${r.x * 100}%`;
    slide.style.top = `${r.y * 100}%`;
    slide.style.width = `${r.w * 100}%`;
    slide.style.height = `${r.h * 100}%`;
  }
  if (tag) tag.textContent = comp.slideAspect;
  for (const [id, active] of [
    ["comp-preset-left", (comp.offsetX ?? -1) === -1],
    ["comp-preset-right", (comp.offsetX ?? -1) === 1],
    ["comp-preset-10-16", comp.slideAspect === "10:16"],
    ["comp-preset-9-16", comp.slideAspect === "9:16"]
  ] as const) {
    const b = byId(id);
    b?.classList.toggle("ring-2", active);
    b?.classList.toggle("ring-primary", active);
  }
}

/** The value of the Input dropdown for a composite: "upload" or the followed pipeline. */
function inputOf(c: Composite): string {
  return c.slideSource === "piprogram" ? c.pipelineId : "upload";
}

/** Input dropdown, and the blurred "move composite here" cover for another source. */
function renderInput(): void {
  const select = byId<HTMLSelectElement>("comp-input-select");
  if (select && comp) select.value = inputOf(comp);
  const overlay = byId("comp-move-overlay");
  if (!overlay) return;
  const other = comp !== null && context !== null && context !== "compose1" && context !== "compose2" && inputOf(comp) !== context;
  overlay.classList.toggle("hidden", !other);
  overlay.classList.toggle("flex", other);
  const text = byId("comp-move-text");
  const btn = byId<HTMLButtonElement>("comp-move-btn");
  if (!other || !comp) return;
  const movable = context !== null && PIPGM_IDS.includes(context);
  if (text) {
    text.textContent = movable
      ? `Composite input is ${inputOf(comp) === "upload" ? "an uploaded slide" : inputOf(comp)}`
      : "Only piprogram sources can feed the composite";
  }
  if (btn) btn.classList.toggle("hidden", !movable);
}

/** Records which source opened the dialog; the composite tab reacts on its next render. */
export function setCompositeContext(sourceId: string | null): void {
  context = sourceId;
  renderInput();
}

function showPreviewEmpty(text: string): void {
  const img = byId<HTMLImageElement>("comp-preview-img");
  const empty = byId("comp-preview-empty");
  img?.classList.add("hidden");
  if (empty) {
    empty.textContent = text;
    empty.classList.remove("hidden");
  }
}

async function refreshPreview(): Promise<void> {
  if (!comp) return;
  const seq = loadSeq;
  if (!comp.hasSlide) {
    showPreviewEmpty("No preview yet. Send a slide first.");
    return;
  }
  try {
    const res = await fetch(`${COMPOSITE_PATH}/${comp.id}/preview.png`);
    if (!res.ok) {
      showPreviewEmpty(`Preview unavailable (${res.status})`);
      return;
    }
    const blob = await res.blob();
    if (seq !== loadSeq) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(blob);
    const img = byId<HTMLImageElement>("comp-preview-img");
    if (img) {
      img.src = previewUrl;
      img.classList.remove("hidden");
    }
    byId("comp-preview-empty")?.classList.add("hidden");
  } catch {
    showPreviewEmpty("Preview unavailable");
  }
}

function schedulePreview(): void {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(() => void refreshPreview(), 500);
}

async function load(): Promise<void> {
  const seq = ++loadSeq;
  comp = null;
  render();
  const loaded = await send("GET", `${COMPOSITE_PATH}/${target}`);
  if (seq !== loadSeq) return;
  comp = loaded;
  render();
  void refreshPreview();
}

async function patch(change: CompositePatch): Promise<void> {
  if (!comp) return;
  const updated = await send("PUT", `${COMPOSITE_PATH}/${comp.id}`, change);
  if (updated) {
    comp = updated;
    render();
    schedulePreview();
  }
}

/** Called when the dialog switches to the Composite tab. */
export function openCompositeTab(): void {
  void load();
}

/** Called when the dialog closes. */
export function closeCompositeTab(): void {
  loadSeq++;
  if (previewTimer) clearTimeout(previewTimer);
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
}

function bindDrag(): void {
  const frame = byId("comp-frame");
  if (!frame) return;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;

  frame.addEventListener("pointerdown", (e) => {
    if (!comp) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startOffsetX = comp.offsetX ?? (comp.side === "left" ? -1 : 1);
    startOffsetY = comp.offsetY ?? 0;
    try {
      frame.setPointerCapture(e.pointerId);
    } catch {
      // synthetic events have no active pointer
    }
  });
  const move = (e: PointerEvent): void => {
    if (!dragging || !comp) return;
    const rect = frame.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const r = slideRect(comp);
    // The slide follows the finger: a drag across the free space moves it from edge to edge.
    const freeX = 1 - r.w;
    const freeY = 1 - r.h;
    if (freeX > 0) comp.offsetX = place(startOffsetX + (e.clientX - startX) / (rect.width * (freeX / 2)));
    if (freeY > 0) comp.offsetY = place(startOffsetY + (e.clientY - startY) / (rect.height * (freeY / 2)));
    comp.side = (comp.offsetX ?? -1) < 0 ? "left" : "right";
    render();
  };
  frame.addEventListener("pointermove", move);
  const end = (): void => {
    if (!dragging || !comp) return;
    dragging = false;
    void patch({ offsetX: comp.offsetX, offsetY: comp.offsetY ?? 0 });
  };
  frame.addEventListener("pointerup", end);
  frame.addEventListener("pointercancel", end);
}

export function initCompositeTab(showToast: (message: string) => void): void {
  window.compSelectInput = async (value) => {
    await patch(value === "upload" ? { slideSource: "upload" } : { slideSource: "piprogram", pipelineId: value as Composite["pipelineId"] });
  };
  window.compMoveHere = async () => {
    if (context && PIPGM_IDS.includes(context)) await window.compSelectInput(context);
  };
  toast = showToast;
  bindDrag();

  window.setCropDialogTab = (tab) => {
    const isComposite = tab === "composite";
    byId("crop-pane-crop")?.classList.toggle("hidden", isComposite);
    byId("crop-pane-composite")?.classList.toggle("hidden", !isComposite);
    const active = "flex-1 px-2 py-1 rounded font-label-sm text-[11px] uppercase font-bold bg-surface text-primary shadow-sm";
    const idle = "flex-1 px-2 py-1 rounded font-label-sm text-[11px] uppercase text-on-surface-variant";
    const cropTab = byId("crop-tab-crop");
    const compTab = byId("crop-tab-composite");
    if (cropTab) cropTab.className = isComposite ? idle : active;
    if (compTab) compTab.className = isComposite ? active : idle;
    const subtitle = byId("crop-dialog-subtitle");
    if (subtitle) {
      subtitle.textContent = isComposite
        ? "Drag the slide • Presets left and right"
        : "Drag lower box • Upper view shows unobstructed crop";
    }
    if (isComposite) openCompositeTab();
    else closeCompositeTab();
  };

  window.compSelectTarget = async (id) => {
    target = id;
    await load();
  };

  window.compToggleRun = async () => {
    if (!comp) return;
    const updated = await send("POST", `${COMPOSITE_PATH}/${comp.id}/${comp.enabled ? "stop" : "start"}`);
    if (updated) {
      comp = updated;
      render();
    }
  };

  window.compPreset = async (preset) => {
    if (preset === "left" || preset === "right") await patch({ side: preset });
    else if (preset === "reset") await patch({ offsetX: -1, slideAspect: "10:16", slideScale: 1, offsetY: 0 });
    else await patch({ slideAspect: preset });
  };

  window.compMove = async (direction) => {
    if (!comp) return;
    const x = comp.offsetX ?? (comp.side === "left" ? -1 : 1);
    const y = comp.offsetY ?? 0;
    if (direction === "center") await patch({ offsetX: 0, offsetY: 0 });
    else if (direction === "left") await patch({ offsetX: stepped(x, -1) });
    else if (direction === "right") await patch({ offsetX: stepped(x, 1) });
    else await patch({ offsetY: stepped(y, direction === "up" ? -1 : 1) });
  };

  window.compToggleSnap = () => {
    snap = !snap;
    try {
      localStorage.setItem(SNAP_KEY, snap ? "on" : "off");
    } catch {
      // the choice just is not remembered
    }
    renderSnap();
  };

  window.openCompositeSettings = () => {
    if (!comp) return;
    const set = (id: string, value: string): void => {
      const el = byId<HTMLInputElement>(id);
      if (el) el.value = value;
    };
    set("cs-width", String(comp.width));
    set("cs-height", String(comp.height));
    set("cs-source", comp.slideSource);
    set("cs-pipeline", comp.pipelineId);
    set("cs-key-color", comp.keyColor);
    set("cs-key-mode", comp.keyMode);
    set("cs-media-slot", String(comp.atem.mediaSlot));
    set("cs-media-player", String(comp.atem.mediaPlayer));
    set("cs-dsk", String(comp.atem.dskIndex));
    const auto = byId<HTMLInputElement>("cs-auto-on-air");
    if (auto) auto.checked = comp.atem.autoOnAir;
    byId("cs-key-fields")?.classList.toggle("hidden", comp.kind !== "hdmi-key");
    byId("cs-atem-fields")?.classList.toggle("hidden", comp.kind !== "atem-media");
    const sub = byId("comp-settings-sub");
    if (sub) sub.textContent = comp.id;
    csError(null);
    const dialog = byId<HTMLDialogElement>("comp-settings-modal");
    if (dialog && !dialog.open) dialog.showModal();
  };

  window.closeCompositeSettings = () => {
    const dialog = byId<HTMLDialogElement>("comp-settings-modal");
    if (dialog?.open) dialog.close();
  };

  window.compSaveSettings = async () => {
    if (!comp) return;
    const num = (id: string): number => Number(byId<HTMLInputElement>(id)?.value);
    const patchBody: CompositePatch = {
      width: num("cs-width"),
      height: num("cs-height"),
      slideSource: (byId<HTMLSelectElement>("cs-source")?.value ?? comp.slideSource) as Composite["slideSource"],
      pipelineId: (byId<HTMLSelectElement>("cs-pipeline")?.value ?? comp.pipelineId) as Composite["pipelineId"]
    };
    if (comp.kind === "hdmi-key") {
      patchBody.keyColor = byId<HTMLInputElement>("cs-key-color")?.value ?? comp.keyColor;
      patchBody.keyMode = (byId<HTMLSelectElement>("cs-key-mode")?.value ?? comp.keyMode) as Composite["keyMode"];
    } else {
      patchBody.atem = {
        mediaSlot: num("cs-media-slot"),
        mediaPlayer: num("cs-media-player"),
        dskIndex: num("cs-dsk"),
        autoOnAir: byId<HTMLInputElement>("cs-auto-on-air")?.checked ?? false
      };
    }
    try {
      const res = await fetch(`${COMPOSITE_PATH}/${comp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody)
      });
      if (!res.ok) {
        csError(await errorMessage(res));
        return;
      }
      comp = (await res.json()) as Composite;
      render();
      schedulePreview();
      window.closeCompositeSettings();
    } catch {
      csError("Request failed");
    }
  };

  window.compSendSlide = async () => {
    const file = byId<HTMLInputElement>("cs-slide-file")?.files?.[0];
    if (!file) {
      csError("Choose a PNG file first");
      return;
    }
    try {
      const res = await fetch(`${COMPOSITE_PATH}/slide`, { method: "PUT", headers: { "Content-Type": "image/png" }, body: file });
      if (!res.ok) {
        csError(await errorMessage(res));
        return;
      }
      csError(null);
      toast("Test slide sent");
      await load();
    } catch {
      csError("Request failed");
    }
  };

  window.compResize = async (action) => {
    if (!comp) return;
    const next = clamp(comp.slideScale + (action === "in" ? -SCALE_STEP : SCALE_STEP), MIN_SCALE, MAX_SCALE);
    await patch({ slideScale: Math.round(next * 100) / 100 });
  };
}
