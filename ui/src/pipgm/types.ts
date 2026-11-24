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
  /** Set on a playlist entry: the same item can be listed several times. */
  entryId?: string;
  title: string;
  kind: ItemKind;
  /** Library type (sound, tts, hymn, song, image, video, slides, canva or a custom name). */
  type?: string;
  createdAt?: string;
  audio?: { origin?: string; durationMs?: number; filename?: string; mimeType?: string; assetUrl?: string };
  image?: { filename?: string; mimeType?: string; assetUrl?: string; caption?: string };
  video?: { filename?: string; mimeType?: string; assetUrl?: string; durationMs?: number };
  youtube?: { videoId?: string; url?: string };
  useAt?: string[];
  steps?: StepDescriptor[];
  hymn?: { hymnNumber: string; title: string; stanzas?: Array<{ stanzaNumber: string; lines: string[]; refrain?: boolean }> };
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
  activeEntryId?: string | null;
  activeItemIndex: number;
  currentStep: number;
  totalSteps: number;
  currentStepDetail: StepDescriptor | null;
  nextStepDetail: StepDescriptor | null;
  playbackState: PlaybackState;
  slideFeed?: { hasSlide: boolean };
  playlist: LibraryItem[];
}

export interface StepRow {
  itemId: string;
  entryId?: string | null;
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

export interface LibraryQuery {
  type?: string[];
  /** Hymnal prefixes (VK, LV, ...). */
  hymnal?: string[];
  q?: string;
  usedFrom?: string;
  usedTo?: string;
  unscheduled?: boolean;
  sort?: "newest" | "oldest" | "title" | "used";
  limit?: number;
  offset?: number;
}

export interface LibraryPage {
  items: LibraryItem[];
  total: number;
  /** Matches per type before the type filter, for the filter chips. */
  types: Array<{ type: string; count: number }>;
  standardTypes: string[];
  /** Hymn items per hymnal prefix before the hymnal filter, for the chips. */
  hymnals?: Array<{ prefix: string; count: number }>;
  /** The configured hymnals plus any other prefix in the library. */
  hymnalList?: Hymnal[];
}

export interface Hymnal {
  prefix: string;
  name: string;
}

export type ActiveReason = "date" | "manual" | "both";

export interface ActiveFolder {
  date: string;
  items: Array<{ item: LibraryItem; reason: ActiveReason }>;
  dateCount: number;
  manualCount: number;
}

export interface SoundUpload {
  filename: string;
  mimeType: string;
  dataBase64: string;
  title?: string;
  type?: string;
  useAt?: string;
  recorded?: boolean;
}

/** Runtime publishing of the feeds to MediaMTX (piprogram `/api/v1/pipgm/publish`). */
export interface PublishState {
  enabled: boolean;
  feeds: Record<FeedId, boolean>;
  rtspBase: string | null;
  audio: boolean;
  running: boolean;
}
