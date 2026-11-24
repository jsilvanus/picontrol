// Client for piprogram through the gateway (/api/v1/pipgm/*) and a small poller.
// Writes need the gateway's own key; the browser only carries its session cookie.
import type {
  ActiveFolder, ControlRequest, FeedId, LibraryItem, LibraryPage, LibraryQuery, LibraryStorage, LoadReport, Pipeline,
  PlaylistDocument, PlaylistSummary, PublishState, SavedPlaylist, SoundUpload, StepsResponse
} from "./types.ts";
import { itemsQueryString } from "./library.ts";

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
    getLibraryPage: (query: LibraryQuery) => call<LibraryPage>("GET", `/items${itemsQueryString(query)}`),
    getActive: (date?: string) => call<ActiveFolder>("GET", `/library/active${date ? `?date=${enc(date)}` : ""}`),
    addActive: (itemId: string) => call<ActiveFolder>("PUT", `/library/active/${enc(itemId)}`),
    removeActive: (itemId: string) => call<ActiveFolder>("DELETE", `/library/active/${enc(itemId)}`),
    /** LAN only on the gateway. */
    clearActive: () => call<unknown>("DELETE", "/library/active"),
    playlistFromActive: (body: { name: string; date?: string; orientation?: string; itemIds?: string[]; includeAudio?: boolean }) =>
      call<SavedPlaylist & { skippedAudio?: number }>("POST", "/library/active/playlist", body),
    /** Any audio format; piprogram converts it. Nothing plays. */
    uploadSound: (u: SoundUpload) =>
      call<LibraryItem>("POST", "/items/media", {
        kind: "audio", filename: u.filename, mimeType: u.mimeType, dataBase64: u.dataBase64,
        ...(u.title ? { title: u.title } : {}), ...(u.type ? { type: u.type } : {}),
        ...(u.useAt ? { useAt: u.useAt } : {}), ...(u.recorded ? { recorded: true } : {})
      }),
    updateItem: (itemId: string, patch: { title?: string; type?: string | null }) => call<LibraryItem>("PATCH", `/items/${enc(itemId)}`, patch),
    /** Records a day the item was used. LAN only on the gateway for writes. */
    addUsedOn: (itemId: string, date: string) => call<LibraryItem>("POST", `/items/${enc(itemId)}/used-on`, { date }),
    removeUsedOn: (itemId: string, date: string) => call<LibraryItem>("DELETE", `/items/${enc(itemId)}/used-on/${enc(date)}`),
    setItemType: (itemId: string, type: string | null) => call<LibraryItem>("PATCH", `/items/${enc(itemId)}`, { type }),
    /** LAN only on the gateway. */
    deleteItem: (itemId: string) => call<void>("DELETE", `/items/${enc(itemId)}`),
    getStorage: () => call<LibraryStorage>("GET", "/library/storage"),
    async listPlaylists(): Promise<PlaylistSummary[]> {
      return (await call<{ items: PlaylistSummary[] }>("GET", "/playlists")).items;
    },
    getPlaylist: (id: string) => call<SavedPlaylist>("GET", `/playlists/${enc(id)}`),

    // publishing of the feeds to MediaMTX (runtime, off by default)
    getPublish: () => call<PublishState>("GET", "/publish"),
    /** One feed on or off; the other feeds are not touched. */
    setPublishFeed: (id: FeedId, on: boolean) => call<PublishState>("PUT", "/publish", { feeds: { [id]: on } }),
    setPublishAddress: (rtspBase: string) => call<PublishState>("PUT", "/publish", { rtspBase }),

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
    addHymn: (title: string, hymnNumber: string, rawText: string) =>
      call<LibraryItem>("POST", "/items/hymn", { title, ...(hymnNumber ? { hymnNumber } : {}), rawText }),
    setUseAt: (itemId: string, useAt: string) =>
      call<LibraryItem>("PUT", `/items/${encodeURIComponent(itemId)}/use-at`, { useAt }),
    addYoutube: (urlOrId: string, title?: string) =>
      call<LibraryItem>("POST", "/items/youtube", { urlOrId, ...(title ? { title } : {}) }),

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
  timers: { set: (fn: () => void, ms: number) => unknown; clear: (handle: never) => void } = {
    set: (fn, ms) => setTimeout(fn, ms),
    clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>)
  }
) {
  let handle: unknown;
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
      if (handle !== undefined) timers.clear(handle as never);
      handle = undefined;
    },
    /** Poll now, e.g. right after a control action. */
    refresh(): void {
      if (!running) return;
      if (handle !== undefined) timers.clear(handle as never);
      void tick();
    }
  };
}
