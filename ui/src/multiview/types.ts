// Wire types for the pimatrix API, hand-written from
// pimatrix/packages/api/src (model.ts, effects/effects-model.ts, pipgm, events.ts).
// Keep in step with pimatrix until picontrol gets types from the OpenAPI document.

export type SourceState = "live" | "offline" | string;

export type MultiviewLayoutMode = "auto" | "landscape" | "portrait";

export interface MultiviewTilePiPgmStatus {
  orientation: "landscape" | "portrait" | string;
  fadeToBlack: boolean;
  audioEnabled: boolean;
  signCode?: string;
  cuedSummary: string | null;
}

export interface MultiviewTile {
  index: number;
  sourceId: string;
  replacedSourceId?: string | null;
  label: string;
  kind: string;
  state: SourceState;
  preview: { available: boolean; url: string | null };
  pipgm?: MultiviewTilePiPgmStatus;
}

export interface MultiviewSnapshot {
  id: "multiview";
  label: string;
  layout: MultiviewLayoutMode;
  landscape: { columns: number; rows: number };
  portrait: { columns: number; rows: number };
  tiles: MultiviewTile[];
}

export interface CropSettings {
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  aspectRatio: string;
  lockedAspectRatio: boolean;
}

export interface EffectsPipeline {
  sourceId: string;
  crop: CropSettings;
  rotation: number;
  fadeToBlack: boolean;
  muted: boolean;
  ffmpegFilter: string;
}

// SSE payloads (GET /api/v1/events; event names: source, pipgm, effects, ready, ...)
export interface SourceEventPayload {
  id: string;
  label: string;
  kind: string;
  state: SourceState;
  preview: { available: boolean; url: string | null };
}

export interface PiPgmPipelineSnapshot {
  id: string;
  state: SourceState;
  fadeToBlack: boolean;
  audioEnabled: boolean;
  orientation: "landscape" | "portrait" | string;
  mobileAlert?: { cuedSummary?: string | null } | null;
}

export interface PiPgmEventPayload {
  action: string;
  pipeline: PiPgmPipelineSnapshot;
}

export interface EffectsEventPayload {
  sourceId: string;
  effects: EffectsPipeline;
}
