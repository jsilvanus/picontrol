// Client for piprogram through the gateway (/api/v1/pipgm/*) and a small poller.
// Writes need the gateway's own key; the browser only carries its session cookie.
import type {
  ControlRequest, FeedId, LibraryItem, LibraryStorage, LoadReport, Pipeline, PlaylistDocument,
  PlaylistSummary, SavedPlaylist, StepsResponse
} from "./types.ts";

export class PipgmError extends Error {
  status: number;
  code: string | undefined;
  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "PipgmError";
    this.status = status;
    this.code = code;
  }
}

export interface ClientOptions {
  /** Maps "/api/v1/..." to a URL; the tab passes resolveApiUrl. */
  resolve: (path: string) => string;
  fetch?: typeof fetch;
}

const PREFIX = "/api/v1/pipgm";

export function createPipgmClient(options: ClientOptions) {
  const doFetch = options.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));

  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    let res: Response;
    try {
      res = await doFetch(options.resolve(`${PREFIX}${path}`), {
        method,
        headers,
        credentials: "include",
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch (error) {
      throw new PipgmError(0, "NETWORK", error instanceof Error ? error.message : "Network error");
    }
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = undefined;
    }
    if (!res.ok) {
      const err = (json as { error?: { code?: string; message?: string } | string } | undefined)?.error;
      const code = typeof err === "object" ? err?.code : undefined;
      const message = typeof err === "object" ? err?.message : typeof err === "string" ? err : "";
      throw new PipgmError(res.status, code, message || `piprogram answered ${res.status}`);
    }
    return json as T;
  }

  const enc = encodeURIComponent;

  return {
    // reads
    async getPipelines(): Promise<Pipeline[]> {
      const r = await call<{ items: Pipeline[] }>("GET", "/pipelines");
      return r.items.filter((p) => !p.hidden);
    },
    getPipeline: (id: FeedId) => call<Pipeline>("GET", `/pipelines/${id}`),
    getSteps: (id: FeedId) => call<StepsResponse>("GET", `/pipelines/${id}/playlist/steps`),
    async getItems(): Promise<LibraryItem[]> {
      return (await call<{ items: LibraryItem[] }>("GET", "/items")).items;
    },
    getStorage: () => call<LibraryStorage>("GET", "/library/storage"),
    async listPlaylists(): Promise<PlaylistSummary[]> {
      return (await call<{ items: PlaylistSummary[] }>("GET", "/playlists")).items;
    },
    getPlaylist: (id: string) => call<SavedPlaylist>("GET", `/playlists/${enc(id)}`),

    // operate
    control: (id: FeedId, req: ControlRequest) => call<Pipeline>("POST", `/pipelines/${id}/control`, req),
    ftb: (id: FeedId, on: boolean) => call<Pipeline>("POST", `/pipelines/${id}/ftb`, { fadeToBlack: on }),
    audioArm: (id: FeedId, armSeconds?: number) =>
      call<Pipeline>("POST", `/pipelines/${id}/audio`, { audioEnabled: true, ...(armSeconds ? { armSeconds } : {}) }),
    audioDisarm: (id: FeedId) => call<Pipeline>("POST", `/pipelines/${id}/audio`, { audioEnabled: false }),
    audioStop: (id: FeedId) => call<Pipeline>("POST", `/pipelines/${id}/audio/stop`, {}),
    async audioKill(): Promise<Pipeline[]> {
      return (await call<{ items: Pipeline[] }>("POST", "/audio/kill", {})).items;
    },

    // live playlist
    setOrder: (id: FeedId, itemIds: string[]) => call<Pipeline>("PUT", `/pipelines/${id}/playlist/order`, { itemIds }),
    addToPlaylist: (id: FeedId, itemId: string) => call<Pipeline>("POST", `/pipelines/${id}/playlist`, { itemId }),
    removeFromPlaylist: (id: FeedId, itemId: string) => call<Pipeline>("DELETE", `/pipelines/${id}/playlist/${enc(itemId)}`),

    // saved playlists
    savePlaylist: (id: FeedId, name: string, playlistId?: string) =>
      call<SavedPlaylist>("POST", `/pipelines/${id}/playlist/save`, { name, ...(playlistId ? { playlistId } : {}) }),
    loadPlaylist: (id: FeedId, playlistId: string, mode: "replace" | "append" = "replace") =>
      call<{ pipeline: Pipeline; report: LoadReport }>("POST", `/pipelines/${id}/playlist/load`, { playlistId, mode }),
    createPlaylist: (doc: PlaylistDocument) => call<SavedPlaylist>("POST", "/playlists", doc),
    deletePlaylist: (playlistId: string) => call<void>("DELETE", `/playlists/${enc(playlistId)}`),
    generate: (date: string, orientation?: string) =>
      call<{ date: string; draft: PlaylistDocument }>("POST", "/playlists/generate", { date, ...(orientation ? { orientation } : {}) }),

    // library
    prepareItem: (itemId: string, orientation: string) => call<unknown>("POST", `/items/${enc(itemId)}/prepare?orientation=${orientation}`, {}),
    addHymn: (title: string, hymnNumber: string) => call<LibraryItem>("POST", "/items/hymn", { title, hymnNumber }),
    addYoutube: (url: string) => call<LibraryItem>("POST", "/items/youtube", { url }),

    // URLs for <img>
    frameUrl(id: FeedId, width: number, bust: number): string {
      return options.resolve(`${PREFIX}/pipelines/${id}/frame.png?width=${width}&t=${bust}`);
    },
    /** thumbnailUrl values come from the service as paths under /api/v1/pipgm. */
    assetUrl: (path: string) => options.resolve(path)
  };
}

export type PipgmClient = ReturnType<typeof createPipgmClient>;

export interface PollerHandlers {
  onData: (pipelines: Pipeline[]) => void;
  onError: (error: PipgmError) => void;
}

/** Polls pipelines: 1 s on air, 10 s idle, 15 s while the page is hidden. Safe to start twice. */
export function createPoller(
  client: Pick<PipgmClient, "getPipelines">,
  handlers: PollerHandlers,
  interval: (pipelines: Pipeline[]) => number,
  timers: { set: typeof setTimeout; clear: typeof clearTimeout } = { set: setTimeout, clear: clearTimeout }
) {
  let handle: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let last: Pipeline[] = [];

  async function tick(): Promise<void> {
    if (!running) return;
    let next = 10000;
    try {
      last = await client.getPipelines();
      handlers.onData(last);
      next = interval(last);
    } catch (error) {
      handlers.onError(error instanceof PipgmError ? error : new PipgmError(0, "NETWORK", String(error)));
      next = 5000;
    }
    if (running) handle = timers.set(() => void tick(), next);
  }

  return {
    start(): void {
      if (running) return;
      running = true;
      void tick();
    },
    stop(): void {
      running = false;
      if (handle !== undefined) timers.clear(handle);
      handle = undefined;
    },
    /** Poll now, e.g. right after a control action. */
    refresh(): void {
      if (!running) return;
      if (handle !== undefined) timers.clear(handle);
      void tick();
    }
  };
}
