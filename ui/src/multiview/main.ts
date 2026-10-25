import "./multiview.css";
import { resolveApiBase } from "./config";
import { PiMatrixApi } from "./api";
import { MultiviewGrid } from "./grid";
import { CropModal } from "./crop-modal";
import { byId } from "./dom";
import type {
  EffectsEventPayload,
  EffectsPipeline,
  MultiviewSnapshot,
  PiPgmEventPayload,
  SourceEventPayload
} from "./types";

// Entry point of multiview.html. Everything is rendered in the browser from the
// pimatrix JSON API; the server only supplies data, never HTML.

const base = resolveApiBase();
const api = new PiMatrixApi(base);
const effects = new Map<string, EffectsPipeline>();
let snapshot: MultiviewSnapshot | null = null;
const indicator = byId("sse-indicator");

const crop = new CropModal({
  api,
  getEffects: (id) => effects.get(id),
  setEffects
});

const grid = new MultiviewGrid(
  base,
  { onCrop: (id, label) => void crop.open(id, label) },
  (id) => effects.get(id)
);

function setEffects(fx: EffectsPipeline): void {
  effects.set(fx.sourceId, fx);
  grid.refreshTile(fx.sourceId);
  if (crop.openSourceId === fx.sourceId) crop.refresh();
}

function renderAll(): void {
  if (snapshot) grid.render(snapshot);
}

async function loadSnapshot(): Promise<void> {
  snapshot = await api.get<MultiviewSnapshot>("/api/v1/outputs/multiview");
  renderAll();
}

async function loadEffects(): Promise<void> {
  const { items } = await api.get<{ items: EffectsPipeline[] }>("/api/v1/effects");
  effects.clear();
  for (const fx of items) effects.set(fx.sourceId, fx);
  renderAll();
}

async function resync(): Promise<void> {
  try {
    await Promise.all([loadSnapshot(), loadEffects()]);
  } catch (err) {
    console.error("Multiview: could not load from pimatrix", err);
    setIndicator(false, "○ No data from pimatrix");
  }
}

// A source or pipgm event for a tile that is not on the page may mean the
// slot layout changed; reload the snapshot, but not once per event.
let reloadTimer: number | undefined;
function scheduleSnapshotReload(): void {
  if (reloadTimer !== undefined) return;
  reloadTimer = window.setTimeout(() => {
    reloadTimer = undefined;
    loadSnapshot().catch((err) => console.error("Multiview: snapshot reload failed", err));
  }, 500);
}

function setIndicator(live: boolean, text?: string): void {
  indicator.style.color = live ? "#22c55e" : "#ef4444";
  indicator.textContent = text ?? (live ? "● Live" : "○ Reconnecting");
}

function onSource(raw: string): void {
  const data = JSON.parse(raw) as SourceEventPayload;
  const tile = grid.getTile(data.id);
  if (!tile || !snapshot) {
    scheduleSnapshotReload();
    return;
  }
  tile.label = data.label ?? tile.label;
  tile.kind = data.kind ?? tile.kind;
  tile.state = data.state;
  tile.preview = data.preview ?? tile.preview;
  grid.refreshTile(data.id);
}

function onPipgm(raw: string): void {
  const { pipeline: p } = JSON.parse(raw) as PiPgmEventPayload;
  if (!p) return;
  const tile = grid.getTile(p.id);
  if (!tile) {
    scheduleSnapshotReload();
    return;
  }
  tile.state = p.state;
  tile.pipgm = {
    orientation: p.orientation,
    fadeToBlack: p.fadeToBlack,
    audioEnabled: p.audioEnabled,
    signCode: tile.pipgm?.signCode,
    cuedSummary: p.mobileAlert?.cuedSummary ?? null
  };
  grid.refreshTile(p.id);
}

function onEffects(raw: string): void {
  const { effects: fx } = JSON.parse(raw) as EffectsEventPayload;
  if (fx?.sourceId) setEffects(fx);
}

api.subscribe(
  {
    source: (d) => safe(() => onSource(d)),
    pipgm: (d) => safe(() => onPipgm(d)),
    effects: (d) => safe(() => onEffects(d))
  },
  (open) => {
    if (open) {
      setIndicator(true);
      // Re-sync on every (re)connect so events missed while disconnected are not lost.
      void resync();
    } else {
      setIndicator(false);
    }
  }
);

function safe(fn: () => void): void {
  try {
    fn();
  } catch (err) {
    console.error("Multiview: bad event payload", err);
  }
}

void resync();
