// Subset of the pimatrix OpenAPI types that the composite page uses (schemas Composite,
// CompositeList, CompositePatch in pimatrix openapi/openapi.yaml). Keep in step with it.

export type CompositeId = "compose1" | "compose2";
export type CompositeOutputKind = "hdmi-key" | "atem-media";
export type CompositeSide = "left" | "right";
export type SlideAspect = "10:16" | "9:16";
export type KeyMode = "chroma" | "luma";
export type CompositeState = "stopped" | "waiting" | "busy" | "running" | "failed";
/** "upload" = the PNG sent on this page; "piprogram" = the frame of pipelineId as its slide changes; "source" = the live video of sourceId (compose1 only). */
export type SlideSource = "upload" | "piprogram" | "source";
export type LiveSourceId = "hama" | "rtmp1" | "rtmp2" | "cam1" | "cam2" | "cam3" | "PiPGM1" | "PiPGM2" | "PiPGM3";
export const LIVE_SOURCE_IDS: readonly LiveSourceId[] = ["hama", "rtmp1", "rtmp2", "cam1", "cam2", "cam3", "PiPGM1", "PiPGM2", "PiPGM3"];
export type PiprogramPipelineId = "PiPGM1" | "PiPGM2" | "PiPGM3";
export const PIPROGRAM_PIPELINE_IDS: readonly PiprogramPipelineId[] = ["PiPGM1", "PiPGM2", "PiPGM3"];

export interface CompositeAtem {
  mediaSlot: number;
  mediaPlayer: number;
  dskIndex: number;
  autoOnAir: boolean;
}

export interface Composite {
  id: CompositeId;
  kind: CompositeOutputKind;
  enabled: boolean;
  width: number;
  height: number;
  side: CompositeSide;
  slideAspect: SlideAspect;
  slideScale: number;
  /** -1 top edge, 0 centred, 1 bottom edge. */
  /** -1 left edge, 0 centred, 1 right edge; side follows it. */
  offsetX: number;
  offsetY: number;
  keyColor: string;
  keyMode: KeyMode;
  atem: CompositeAtem;
  state: CompositeState;
  lastError: string | null;
  hasSlide: boolean;
  slideSource: SlideSource;
  pipelineId: PiprogramPipelineId;
  sourceId: LiveSourceId;
  /** Why the piprogram feed last failed, or null. */
  feedError: string | null;
  updatedAt: string;
}

export interface CompositeList {
  items: Composite[];
}

export interface CompositePatch {
  enabled?: boolean;
  width?: number;
  height?: number;
  side?: CompositeSide;
  slideAspect?: SlideAspect;
  slideScale?: number;
  offsetX?: number;
  offsetY?: number;
  keyColor?: string;
  keyMode?: KeyMode;
  atem?: Partial<CompositeAtem>;
  slideSource?: SlideSource;
  pipelineId?: PiprogramPipelineId;
  sourceId?: LiveSourceId;
}

export const COMPOSITE_IDS: readonly CompositeId[] = ["compose1", "compose2"];

// Labels for the output kinds. The kind is fixed per id on the server (compose1 = HDMI key,
// compose2 = ATEM media), so the page picks the output by picking the composite.
export const KIND_LABEL: Record<CompositeOutputKind, string> = {
  "hdmi-key": "HDMI key (compose1)",
  "atem-media": "ATEM media pool (compose2)"
};
