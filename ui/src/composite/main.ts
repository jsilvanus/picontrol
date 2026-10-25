import "../devices/devices.css";
import "./composite.css";
import { resolveApiBase } from "../multiview/config";
import { PiMatrixApi, ApiError } from "../devices/api";
import { byId, el } from "../multiview/dom";
import {
  COMPOSITE_IDS,
  KIND_LABEL,
  type Composite,
  type CompositeId,
  type CompositeList,
  type CompositePatch,
  type CompositeSide,
  type KeyMode,
  type PiprogramPipelineId,
  type SlideAspect,
  type SlideSource
} from "./types";

// Entry point of composite.html: the two slide composites (compose1 HDMI key, compose2 ATEM
// media). Settings are saved with an explicit Save; side, start and stop act at once.
// The status is polled, but the form is only filled from the server when the selected
// composite changes or after a save, so a half-edited form is never overwritten.

const api = new PiMatrixApi(resolveApiBase());
const POLL_MS = 2000;
const MIN_SIDE = 16;
const MAX_SIDE = 3840;

const composites = new Map<CompositeId, Composite>();
let selected: CompositeId = "compose1";
let previewUrl: string | null = null;
let previewKey = "";

const apiStatus = byId("api-status");

function setStatus(text: string, ok: boolean): void {
  apiStatus.textContent = text;
  apiStatus.classList.toggle("ok", ok);
}

function describe(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return err instanceof Error ? err.message : "Request failed";
}

function showError(id: string, err: unknown | null): void {
  byId(id).textContent = err === null ? "" : describe(err);
}

function current(): Composite | undefined {
  return composites.get(selected);
}

function store(list: Composite[]): void {
  for (const composite of list) composites.set(composite.id, composite);
}

// --- Tabs ----------------------------------------------------------------

function renderTabs(): void {
  const tabs = byId("tabs");
  tabs.replaceChildren(
    ...COMPOSITE_IDS.map((id) => {
      const composite = composites.get(id);
      const label = composite ? KIND_LABEL[composite.kind] : id;
      const button = el("button", "", label);
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(id === selected));
      button.addEventListener("click", () => selectComposite(id));
      return button;
    })
  );
  const composite = current();
  byId("kind-note").textContent = composite
    ? composite.kind === "hdmi-key"
      ? "Full-frame key page for a Pi HDMI output. The ATEM keys it with chroma or luma."
      : "Slide as a PNG with alpha, uploaded to an ATEM media slot and driven on a DSK."
    : "Not configured on pimatrix.";
}

function selectComposite(id: CompositeId): void {
  selected = id;
  showError("settings-error", null);
  renderAll();
  fillForm();
  void refreshPreview(true);
}

// --- Status --------------------------------------------------------------

function renderStatus(): void {
  const composite = current();
  const state = byId("state");
  if (!composite) {
    state.textContent = "Not loaded";
    state.className = "pill";
    return;
  }
  state.textContent = `${composite.state}${composite.enabled ? "" : " (off)"}`;
  state.className = `pill state-${composite.state}`;
  byId("has-slide").textContent = composite.hasSlide ? "Slide received" : "No slide yet";
  byId("last-error").textContent = composite.lastError ?? "";
  byId("feed-error").textContent =
    composite.slideSource === "piprogram" && composite.feedError ? `Feed: ${composite.feedError}` : "";
  byId<HTMLButtonElement>("start").disabled = composite.enabled;
  byId<HTMLButtonElement>("stop").disabled = !composite.enabled;
  byId("side-left").setAttribute("aria-pressed", String(composite.side === "left"));
  byId("side-right").setAttribute("aria-pressed", String(composite.side === "right"));
}

function renderKindFields(): void {
  const composite = current();
  const isKey = composite?.kind !== "atem-media";
  byId("key-fields").hidden = !isKey;
  byId("atem-fields").hidden = isKey;
}

function renderAll(): void {
  renderTabs();
  renderStatus();
  renderKindFields();
}

// --- Settings form -------------------------------------------------------

function fillForm(): void {
  const composite = current();
  if (!composite) return;
  byId<HTMLInputElement>("width").value = String(composite.width);
  byId<HTMLInputElement>("height").value = String(composite.height);
  byId<HTMLSelectElement>("slide-aspect").value = composite.slideAspect;
  byId<HTMLSelectElement>("slide-source").value = composite.slideSource;
  byId<HTMLSelectElement>("pipeline-id").value = composite.pipelineId;
  setSlideScale(composite.slideScale);
  byId<HTMLInputElement>("key-color").value = composite.keyColor;
  byId<HTMLSelectElement>("key-mode").value = composite.keyMode;
  byId<HTMLInputElement>("media-slot").value = String(composite.atem.mediaSlot);
  byId<HTMLInputElement>("media-player").value = String(composite.atem.mediaPlayer);
  byId<HTMLInputElement>("dsk-index").value = String(composite.atem.dskIndex);
  byId<HTMLInputElement>("auto-on-air").checked = composite.atem.autoOnAir;
  renderKindFields();
}

function setSlideScale(value: number): void {
  byId<HTMLInputElement>("slide-scale").value = String(value);
  byId("slide-scale-value").textContent = `${Math.round(value * 100)}%`;
}

function integerInput(id: string): number {
  return Number(byId<HTMLInputElement>(id).value);
}

// Reads the form into a patch. Returns a message instead when a value is out of range,
// so the operator sees the reason before the server answers 422.
function readForm(composite: Composite): CompositePatch | string {
  const width = integerInput("width");
  const height = integerInput("height");
  for (const [label, value] of [["Width", width], ["Height", height]] as const) {
    if (!Number.isInteger(value) || value % 2 !== 0 || value < MIN_SIDE || value > MAX_SIDE) {
      return `${label} must be an even whole number from ${MIN_SIDE} to ${MAX_SIDE}`;
    }
  }
  const patch: CompositePatch = {
    width,
    height,
    slideAspect: byId<HTMLSelectElement>("slide-aspect").value as SlideAspect,
    slideScale: Number(byId<HTMLInputElement>("slide-scale").value),
    slideSource: byId<HTMLSelectElement>("slide-source").value as SlideSource,
    pipelineId: byId<HTMLSelectElement>("pipeline-id").value as PiprogramPipelineId
  };
  if (composite.kind === "hdmi-key") {
    patch.keyColor = byId<HTMLInputElement>("key-color").value;
    patch.keyMode = byId<HTMLSelectElement>("key-mode").value as KeyMode;
  } else {
    const slot = integerInput("media-slot");
    const player = integerInput("media-player");
    const dsk = integerInput("dsk-index");
    if (!Number.isInteger(slot) || slot < 1 || slot > 64) return "Media slot must be a whole number from 1 to 64";
    if (!Number.isInteger(player) || player < 1 || player > 4) return "Media player must be a whole number from 1 to 4";
    if (!Number.isInteger(dsk) || dsk < 1 || dsk > 4) return "DSK must be a whole number from 1 to 4";
    patch.atem = {
      mediaSlot: slot,
      mediaPlayer: player,
      dskIndex: dsk,
      autoOnAir: byId<HTMLInputElement>("auto-on-air").checked
    };
  }
  return patch;
}

async function saveSettings(event: Event): Promise<void> {
  event.preventDefault();
  const composite = current();
  if (!composite) return;
  const patch = readForm(composite);
  if (typeof patch === "string") {
    showError("settings-error", new Error(patch));
    return;
  }
  await update(composite.id, patch, "settings-error", true);
}

// Applies a patch and takes the server's answer as the new state. The form is refilled only
// after a Save, so a side change does not discard values typed but not yet saved.
async function update(id: CompositeId, patch: CompositePatch, errorId: string, refill: boolean): Promise<void> {
  try {
    const updated = await api.put<Composite>(`/api/v1/composites/${id}`, patch);
    composites.set(id, updated);
    showError(errorId, null);
    renderAll();
    if (refill && id === selected) fillForm();
    void refreshPreview(false);
  } catch (err) {
    showError(errorId, err);
  }
}

async function act(path: "start" | "stop"): Promise<void> {
  const composite = current();
  if (!composite) return;
  try {
    composites.set(composite.id, await api.post<Composite>(`/api/v1/composites/${composite.id}/${path}`, {}));
    showError("status-error", null);
    renderAll();
    void refreshPreview(false);
  } catch (err) {
    showError("status-error", err);
  }
}

// --- Preview -------------------------------------------------------------

// The preview is a PNG that needs the Bearer token, so it is fetched and shown as an object
// URL. It is refetched only when the composite changed (updatedAt or state), not every poll.
async function refreshPreview(force: boolean): Promise<void> {
  const composite = current();
  const image = byId<HTMLImageElement>("preview");
  const empty = byId("preview-empty");
  if (!composite || !composite.hasSlide) {
    image.hidden = true;
    empty.hidden = false;
    setPreviewUrl(null);
    previewKey = "";
    return;
  }
  const key = `${composite.id}|${composite.updatedAt}|${composite.state}|${composite.width}x${composite.height}`;
  if (!force && key === previewKey && previewUrl !== null) return;
  try {
    const blob = await api.getBlob(`/api/v1/composites/${composite.id}/preview.png`);
    setPreviewUrl(URL.createObjectURL(blob));
    previewKey = key;
    image.src = previewUrl ?? "";
    image.hidden = false;
    empty.hidden = true;
    showError("preview-error", null);
  } catch (err) {
    showError("preview-error", err);
  }
}

function setPreviewUrl(url: string | null): void {
  if (previewUrl !== null) URL.revokeObjectURL(previewUrl);
  previewUrl = url;
}

// --- Test slide ----------------------------------------------------------

async function sendSlide(): Promise<void> {
  const input = byId<HTMLInputElement>("slide-file");
  const file = input.files?.[0];
  if (!file) {
    showError("slide-error", new Error("Choose a PNG file first"));
    return;
  }
  if (file.type !== "image/png") {
    showError("slide-error", new Error("The slide must be a PNG file"));
    return;
  }
  try {
    const list = await api.putRaw<CompositeList>("/api/v1/composites/slide", file, "image/png");
    store(list.items);
    showError("slide-error", null);
    renderAll();
    void refreshPreview(true);
  } catch (err) {
    showError("slide-error", err);
  }
}

// --- Polling -------------------------------------------------------------

async function refresh(): Promise<void> {
  try {
    const list = await api.get<CompositeList>("/api/v1/composites");
    store(list.items);
    setStatus("Connected", true);
    renderAll();
    void refreshPreview(false);
  } catch (err) {
    setStatus("Offline", false);
    showError("status-error", err);
  }
}

// --- Wiring --------------------------------------------------------------

byId("settings-form").addEventListener("submit", (event) => void saveSettings(event));
byId("start").addEventListener("click", () => void act("start"));
byId("stop").addEventListener("click", () => void act("stop"));
byId("side-left").addEventListener("click", () => void setSide("left"));
byId("side-right").addEventListener("click", () => void setSide("right"));
byId("slide-scale").addEventListener("input", (event) => {
  setSlideScale(Number((event.target as HTMLInputElement).value));
});
byId("preview-refresh").addEventListener("click", () => void refreshPreview(true));
byId("slide-send").addEventListener("click", () => void sendSlide());

async function setSide(side: CompositeSide): Promise<void> {
  const composite = current();
  if (!composite || composite.side === side) return;
  await update(composite.id, { side }, "status-error", false);
}

async function start(): Promise<void> {
  renderTabs();
  renderKindFields();
  await refresh();
  fillForm();
  setInterval(() => void refresh(), POLL_MS);
}

void start();
