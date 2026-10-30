/**
 * Gateway & Pi ecosystem API client for picontrol CLI.
 */

export interface EcosystemComponent {
  id: string;
  tab: string;
  name: string;
  description: string;
  active: boolean;
  inUse: boolean;
  available: boolean;
  configured: boolean;
  connecting: boolean;
  lastSeenAt: string | null;
  url?: string | null | undefined;
  details?: Record<string, unknown> | undefined;
}

export interface EcosystemStatus {
  service: "pigateway";
  updatedAt: string;
  inUseTabs: string[];
  activePlugins: string[];
  components: Record<string, EcosystemComponent>;
}

export interface CliConfig {
  gatewayUrl: string;
  youtubeUrl?: string;
  tallyUrl?: string;
  voiceUrl?: string;
  soundUrl?: string;
  rundownUrl?: string;
  graphicsUrl?: string;
  programUrl?: string;
  spaceUrl?: string;
  perceptionUrl?: string;
  apiKey?: string;
  json?: boolean;
}

export class GatewayClient {
  readonly gatewayUrl: string;
  readonly youtubeUrl: string;
  readonly tallyUrl: string;
  readonly voiceUrl: string;
  readonly soundUrl: string;
  readonly rundownUrl: string;
  readonly graphicsUrl: string;
  readonly programUrl: string;
  readonly spaceUrl: string;
  readonly perceptionUrl: string;
  readonly apiKey?: string;
  readonly json: boolean;

  constructor(config: CliConfig) {
    this.gatewayUrl = (config.gatewayUrl || "http://127.0.0.1:3100").replace(/\/+$/, "");
    this.youtubeUrl = (config.youtubeUrl || "http://127.0.0.1:3105").replace(/\/+$/, "");
    this.tallyUrl = (config.tallyUrl || "http://127.0.0.1:3200").replace(/\/+$/, "");
    this.voiceUrl = (config.voiceUrl || "http://127.0.0.1:3101").replace(/\/+$/, "");
    this.soundUrl = (config.soundUrl || "http://127.0.0.1:3300").replace(/\/+$/, "");
    this.rundownUrl = (config.rundownUrl || "http://127.0.0.1:3400").replace(/\/+$/, "");
    this.graphicsUrl = (config.graphicsUrl || "http://127.0.0.1:3107").replace(/\/+$/, "");
    this.programUrl = (config.programUrl || "http://127.0.0.1:3104").replace(/\/+$/, "");
    this.spaceUrl = (config.spaceUrl || "http://127.0.0.1:3108").replace(/\/+$/, "");
    this.perceptionUrl = (config.perceptionUrl || "http://127.0.0.1:3110").replace(/\/+$/, "");
    this.apiKey = config.apiKey || process.env.PIGATEWAY_API_KEY;
    this.json = Boolean(config.json);
  }

  async request<T>(baseUrl: string, path: string, method: string = "GET", body?: unknown): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-Api-Key"] = this.apiKey;
    }
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        let errMessage = `HTTP ${res.status} ${res.statusText}`;
        try {
          const json = await res.json() as Record<string, unknown>;
          if (json?.error) {
            errMessage = typeof json.error === "string" ? json.error : (json.error as Record<string, unknown>).message as string || errMessage;
          } else if (json?.message) {
            errMessage = json.message as string;
          }
        } catch {}
        throw new Error(`${url} -> ${errMessage}`);
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to request ${url}: ${msg}`);
    }
  }

  // --- Gateway General Status & Ecosystem ---
  async getStatus(): Promise<Record<string, unknown>> {
    return this.request(this.gatewayUrl, "/api/v1/status");
  }

  async getEcosystem(): Promise<EcosystemStatus> {
    return this.request<EcosystemStatus>(this.gatewayUrl, "/api/v1/ecosystem");
  }

  async probeEcosystem(): Promise<EcosystemStatus> {
    return this.request<EcosystemStatus>(this.gatewayUrl, "/api/v1/ecosystem/probe", "POST");
  }

  // --- PiSound direct or gateway proxy ---
  async getSoundStatus(): Promise<Record<string, unknown>> {
    try {
      return await this.request(this.soundUrl, "/api/v1/status");
    } catch {
      return await this.request(this.gatewayUrl, "/api/v1/sound");
    }
  }

  async probeSound(): Promise<Record<string, unknown>> {
    try {
      return await this.request(this.soundUrl, "/api/v1/probe", "POST");
    } catch {
      return await this.request(this.soundUrl, "/health");
    }
  }

  // --- YouTube / pitube ---
  async getYoutubeStatus(): Promise<Record<string, unknown>> {
    try {
      // Try direct pitube first, fallback to gateway
      return await this.request(this.youtubeUrl, "/api/v1/status");
    } catch {
      return await this.request(this.gatewayUrl, "/api/v1/youtube");
    }
  }

  async listBroadcasts(): Promise<{ selectedId: string | null; items: unknown[] }> {
    return this.request(this.youtubeUrl, "/api/v1/broadcasts");
  }

  async selectBroadcast(broadcastId: string): Promise<unknown> {
    return this.request(this.youtubeUrl, "/api/v1/broadcasts/select", "POST", { broadcastId });
  }

  async createBroadcast(input: { title: string; privacy?: string; description?: string }): Promise<unknown> {
    return this.request(this.youtubeUrl, "/api/v1/broadcasts/create", "POST", input);
  }

  async startBroadcast(): Promise<unknown> {
    return this.request(this.youtubeUrl, "/api/v1/broadcasts/start", "POST");
  }

  async stopBroadcast(): Promise<unknown> {
    return this.request(this.youtubeUrl, "/api/v1/broadcasts/stop", "POST");
  }

  // --- Tally / pilight ---
  async listTallyLights(): Promise<unknown[]> {
    return this.request(this.tallyUrl, "/api/v1/lights");
  }

  async setTallyState(lightId: string, mode: string): Promise<unknown> {
    return this.request(this.tallyUrl, `/api/v1/lights/${encodeURIComponent(lightId)}/state`, "POST", { mode });
  }

  async sendTallyCue(lightId: string, direction: string, durationMs = 2000): Promise<unknown> {
    return this.request(this.tallyUrl, `/api/v1/lights/${encodeURIComponent(lightId)}/cue`, "POST", { direction, durationMs });
  }

  async sendTallyCall(lightId: string): Promise<unknown> {
    return this.request(this.tallyUrl, `/api/v1/lights/${encodeURIComponent(lightId)}/call`, "POST");
  }

  async toggleTallyHold(lightId: string, hold: boolean): Promise<unknown> {
    return this.request(this.tallyUrl, `/api/v1/lights/${encodeURIComponent(lightId)}/hold`, "POST", { hold });
  }

  async setTallyBrightness(lightId: string, brightness: "low" | "medium" | "high"): Promise<unknown> {
    return this.request(this.tallyUrl, `/api/v1/lights/${encodeURIComponent(lightId)}/brightness`, "POST", { brightness });
  }

  async cycleTally(lightId: string): Promise<unknown> {
    return this.request(this.tallyUrl, `/api/v1/lights/${encodeURIComponent(lightId)}/cycle`, "POST");
  }

  // --- Voice / pivoice ---
  async getVoiceStatus(): Promise<Record<string, unknown>> {
    try {
      return await this.request(this.voiceUrl, "/api/v1/status");
    } catch {
      const gw = await this.getStatus();
      return (gw.pivoice as Record<string, unknown>) || {};
    }
  }

  async setVoiceCapture(start: boolean): Promise<unknown> {
    const action = start ? "start" : "stop";
    return this.request(this.voiceUrl, `/api/v1/capture/${action}`, "POST");
  }

  // --- Radio Relay ---
  async getRadioStatus(): Promise<Record<string, unknown>> {
    return this.request(this.gatewayUrl, "/api/v1/radio-relay");
  }

  async startRadio(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/radio-relay/start", "POST");
  }

  async stopRadio(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/radio-relay/stop", "POST");
  }

  // --- Video Mixer (ATEM Switcher / PiSwitch) ---
  async getVideoMixerState(): Promise<Record<string, unknown>> {
    return this.request(this.gatewayUrl, "/api/v1/video-mixer");
  }

  async getAtemState(): Promise<Record<string, unknown>> {
    return this.getVideoMixerState();
  }

  async videoMixerCut(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/video-mixer/cut", "POST");
  }

  async videoMixerAuto(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/video-mixer/auto", "POST");
  }

  async videoMixerPreview(input: number): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/video-mixer/preview", "POST", { input });
  }

  async videoMixerFtb(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/video-mixer/ftb", "POST");
  }

  async atemCut(): Promise<unknown> {
    return this.videoMixerCut();
  }

  async atemAuto(): Promise<unknown> {
    return this.videoMixerAuto();
  }

  async atemPreview(input: number): Promise<unknown> {
    return this.videoMixerPreview(input);
  }

  async atemFtb(): Promise<unknown> {
    return this.videoMixerFtb();
  }

  // --- Encoder (Matrox Monarch HDX) ---
  async getEncoderState(): Promise<Record<string, unknown>> {
    return this.request(this.gatewayUrl, "/api/v1/encoder");
  }

  async startEncoder(encoder: 1 | 2 | "both" = "both"): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/encoder/start", "POST", { encoder });
  }

  async stopEncoder(encoder: 1 | 2 | "both" = "both"): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/encoder/stop", "POST", { encoder });
  }

  async getEncoderSettings(): Promise<Record<string, unknown>> {
    return this.request(this.gatewayUrl, "/api/v1/encoder/settings");
  }



  // --- Atlona Matrix ---
  async getMatrixRoutes(): Promise<Record<string, unknown>> {
    return this.request(this.gatewayUrl, "/api/v1/matrix");
  }

  async routeMatrix(input: number, output: number): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/matrix/route", "POST", { input, output });
  }

  // --- Cameras ---
  async listCameras(): Promise<unknown[]> {
    return this.request(this.gatewayUrl, "/api/v1/cameras");
  }

  async moveCamera(camId: string, direction: string): Promise<unknown> {
    return this.request(this.gatewayUrl, `/api/v1/cameras/${encodeURIComponent(camId)}/move`, "POST", { direction });
  }

  async zoomCamera(camId: string, action: string): Promise<unknown> {
    return this.request(this.gatewayUrl, `/api/v1/cameras/${encodeURIComponent(camId)}/zoom`, "POST", { action });
  }

  async recallPreset(camId: string, presetId: number): Promise<unknown> {
    return this.request(this.gatewayUrl, `/api/v1/cameras/${encodeURIComponent(camId)}/presets/${presetId}/recall`, "POST");
  }

  async savePreset(camId: string, presetId: number): Promise<unknown> {
    return this.request(this.gatewayUrl, `/api/v1/cameras/${encodeURIComponent(camId)}/presets/${presetId}/save`, "POST");
  }

  // --- PiRundown (cues, rundown flow, storage) ---
  async getRundown(): Promise<Record<string, unknown>> {
    try {
      return await this.request(this.rundownUrl, "/api/v1/status");
    } catch {
      return await this.request(this.gatewayUrl, "/api/v1/rundown");
    }
  }

  async nextRundown(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/rundown/next", "POST");
  }

  async prevRundown(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/rundown/previous", "POST");
  }

  async resetRundown(): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/rundown/reset", "POST");
  }

  async fireRundown(target: string | number): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/rundown/fire", "POST", { target });
  }

  async toggleCues(state?: "on" | "off" | "toggle"): Promise<unknown> {
    const endpoint = state === "on" ? "/api/v1/cues/enable" : state === "off" ? "/api/v1/cues/disable" : "/api/v1/cues/toggle";
    return this.request(this.rundownUrl, endpoint, "POST");
  }

  async listRundownStorage(): Promise<unknown[]> {
    try {
      return await this.request(this.rundownUrl, "/api/v1/storage");
    } catch {
      return await this.request(this.gatewayUrl, "/api/v1/rundown/storage");
    }
  }

  async loadRundownStorage(id: string): Promise<unknown> {
    try {
      return await this.request(this.rundownUrl, `/api/v1/storage/${encodeURIComponent(id)}/load`, "POST");
    } catch {
      return await this.request(this.gatewayUrl, `/api/v1/rundown/storage/${encodeURIComponent(id)}/load`, "POST");
    }
  }

  // --- PiGraphics (templates, active graphics overlay) ---
  async getGraphicsStatus(): Promise<Record<string, unknown>> {
    return this.request(this.graphicsUrl, "/api/v1/status");
  }

  async listGraphicsTemplates(): Promise<unknown[]> {
    return this.request(this.graphicsUrl, "/api/v1/graphics/templates");
  }

  async getActiveGraphics(): Promise<unknown[]> {
    return this.request(this.graphicsUrl, "/api/v1/graphics/active");
  }

  async showGraphic(templateId: string, data?: Record<string, unknown>, durationMs?: number): Promise<unknown> {
    return this.request(this.graphicsUrl, "/api/v1/graphics/active/show", "POST", { templateId, data, durationMs });
  }

  async hideGraphic(instanceId: string): Promise<unknown> {
    return this.request(this.graphicsUrl, `/api/v1/graphics/active/hide/${encodeURIComponent(instanceId)}`, "POST");
  }

  async clearGraphics(): Promise<unknown> {
    return this.request(this.graphicsUrl, "/api/v1/graphics/active/clear", "POST");
  }

  // --- PiProgram (presentation, slides, stage pipeline) ---
  async getProgramStatus(): Promise<Record<string, unknown>> {
    return this.request(this.programUrl, "/ready");
  }

  async listPipelines(): Promise<unknown[]> {
    return this.request(this.programUrl, "/api/v1/pipgm/pipelines");
  }

  async getPipeline(id: string): Promise<Record<string, unknown>> {
    return this.request(this.programUrl, `/api/v1/pipgm/pipelines/${encodeURIComponent(id)}`);
  }

  async advanceProgramSlide(pipelineId = "default"): Promise<unknown> {
    return this.request(this.programUrl, `/api/v1/pipgm/pipelines/${encodeURIComponent(pipelineId)}/control`, "POST", { action: "next" });
  }

  async triggerHymn(hymn: string): Promise<unknown> {
    return this.request(this.gatewayUrl, "/api/v1/actions/execute", "POST", { action: "pipgm:hymn", params: { hymn } });
  }

  // --- PiSpace (3D venue, spatial solver, tracking) ---
  async getVenue(): Promise<Record<string, unknown>> {
    try {
      return await this.request(this.spaceUrl, "/api/v1/venue");
    } catch {
      return await this.request(this.gatewayUrl, "/api/v1/venue");
    }
  }

  async getSpatialState(): Promise<Record<string, unknown>> {
    try {
      return await this.request(this.spaceUrl, "/api/v1/spatial");
    } catch {
      return await this.request(this.gatewayUrl, "/api/v1/spatial");
    }
  }

  async solvePtz(target: { x: number; y: number; z: number }, cameraId: string): Promise<unknown> {
    return this.request(this.spaceUrl, "/api/v1/spatial/solve-ptz", "POST", { target, cameraId });
  }

  // --- PiPerception (person detection, target tracks) ---
  async getPerceptionStatus(): Promise<Record<string, unknown>> {
    return this.request(this.perceptionUrl, "/health");
  }

  async getPerceptionTracks(): Promise<unknown[]> {
    return this.request(this.perceptionUrl, "/api/v1/perception/tracks");
  }

  // --- World State & Transcripts (Auditor / Gateway) ---
  async getWorldState(): Promise<Record<string, unknown>> {
    return this.request(this.gatewayUrl, "/api/v1/world-state");
  }

  async getTranscripts(): Promise<unknown[]> {
    return this.request(this.gatewayUrl, "/api/v1/transcripts");
  }
}
