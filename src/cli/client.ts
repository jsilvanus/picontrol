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
  apiKey?: string;
  json?: boolean;
}

export class GatewayClient {
  readonly gatewayUrl: string;
  readonly youtubeUrl: string;
  readonly tallyUrl: string;
  readonly voiceUrl: string;
  readonly soundUrl: string;
  readonly apiKey?: string;
  readonly json: boolean;

  constructor(config: CliConfig) {
    this.gatewayUrl = (config.gatewayUrl || "http://127.0.0.1:3100").replace(/\/+$/, "");
    this.youtubeUrl = (config.youtubeUrl || "http://127.0.0.1:3105").replace(/\/+$/, "");
    this.tallyUrl = (config.tallyUrl || "http://127.0.0.1:3200").replace(/\/+$/, "");
    this.voiceUrl = (config.voiceUrl || "http://127.0.0.1:3101").replace(/\/+$/, "");
    this.soundUrl = (config.soundUrl || "http://127.0.0.1:3300").replace(/\/+$/, "");
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
}
