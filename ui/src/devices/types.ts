// Subset of the pimatrix OpenAPI types that the devices page uses.
// Source of truth: pimatrix openapi/openapi.yaml. Keep in step with it.

export type CameraId = "cam1" | "cam2" | "cam3";
export type MoveDirection =
  | "up" | "down" | "left" | "right" | "upleft" | "upright" | "downleft" | "downright" | "stop" | "home" | "reset";

export interface Camera {
  id: CameraId;
  label: string;
  model: string;
  connection: "connected" | "disconnected" | "simulated";
  streaming: boolean;
  privacyBlur?: boolean;
}

export interface AtemState {
  connected: boolean;
  programInput: number | null;
  previewInput: number | null;
}

export type OutputId = "hdmi0" | "hdmi1" | "multiview";

export interface Output {
  id: OutputId;
  desiredSource: SourceId | null;
  observedSource: SourceId | null;
  state: "unavailable" | "starting" | "active" | "failed";
}

// Sources an output can show (SourceId in the OpenAPI spec). null = output off.
export const SOURCE_IDS = ["hama", "rtmp1", "rtmp2", "cam1", "cam2", "cam3", "PiPGM1", "PiPGM2", "PiPGM3"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];
