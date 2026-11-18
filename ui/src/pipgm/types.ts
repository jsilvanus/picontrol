// Shapes of the piprogram 1.0 API as the gateway proxies it (/api/v1/pipgm/*).
// Only the fields the UI reads are listed; the service may send more.

export type FeedId = "PiPGM1" | "PiPGM2" | "PiPGM3";
export const FEED_IDS: FeedId[] = ["PiPGM1", "PiPGM2", "PiPGM3"];

export type Orientation = "landscape" | "portrait";
export type PlaybackState = "playing" | "paused" | "stopped";
export type PipelineState = "idle" | "live" | "blackout" | "starting" | "degraded" | "failed";
export type ItemKind = "pptx" | "canva" | "youtube" | "video" | "image" | "hymn" | "audio";

export interface StepDescriptor {
  stepIndex: number;
  totalSteps: number;
  label: string;
  subLabel?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  kind: ItemKind;
  createdAt?: string;
  useAt?: string[];
  steps?: StepDescriptor[];
  hymn?: { hymnNumber: string; title: string };
  canva?: { exportJob?: { status?: string; error?: string | null } };
}

export interface Pipeline {
  id: FeedId;
  label: string;
  hidden?: boolean;
  orientation: Orientation;
  resolution: { width: number; height: number };
  state: PipelineState;
  fadeToBlack: boolean;
  audioEnabled: boolean;
  audioArmedUntil: string | null;
  volume: number;
  audioTrack: { title: string } | null;
  activeItemId: string | null;
  activeItemIndex: number;
  currentStep: number;
  totalSteps: number;
  currentStepDetail: StepDescriptor | null;
  nextStepDetail: StepDescriptor | null;
  playbackState: PlaybackState;
  playlist: LibraryItem[];
}

export interface StepRow {
  itemId: string;
  itemIndex: number;
  itemTitle: string;
  itemKind: ItemKind | string;
  stepIndex: number;
  label: string;
  thumbnailUrl: string | null;
  isActive: boolean;
}

export interface StepsResponse {
  pipelineId: FeedId;
  orientation: Orientation;
  activeItemId: string | null;
  currentStep: number;
  steps: StepRow[];
}

export interface PlaylistEntry {
  itemId?: string;
  pause?: true;
  label?: string;
  advanceSeconds?: number;
  kind?: string;
  title?: string;
  hymn?: { number: number | string };
}

export interface PlaylistDocument {
  schema?: "piprogram.playlist/1";
  name: string;
  orientation?: Orientation;
  items: PlaylistEntry[];
}

export interface SavedPlaylist extends PlaylistDocument {
  id: string;
  savedAt: string;
}

export interface PlaylistSummary {
  id: string;
  name: string;
  savedAt: string;
  orientation?: Orientation;
  itemCount: number;
}

export interface LoadReport {
  mode: "replace" | "append";
  resolved: Array<{ index: number; itemId: string; by: string }>;
  missing: Array<{ index: number; itemId: string; kind?: string; title?: string; hymn?: { number?: number | string } }>;
  duplicates: Array<{ index: number; itemId: string }>;
  skipped: Array<{ index: number; reason: string }>;
  keptActiveItemId: string | null;
  carriedActiveItem: boolean;
}

export type ControlAction = "next" | "prev" | "gotoStep" | "gotoItem" | "play" | "pause" | "stop" | "restart";

export interface ControlRequest {
  action: ControlAction;
  stepIndex?: number;
  itemId?: string;
  itemIndex?: number;
}

export interface LibraryStorage {
  configured?: boolean;
  ok?: boolean;
  loaded?: boolean;
  [key: string]: unknown;
}
