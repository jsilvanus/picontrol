// Thin fetch helpers. Every path is relative to the base URL from config.ts.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class PiMatrixApi {
  constructor(readonly base: string) {}

  url(path: string): string {
    return `${this.base}${path}`;
  }

  // Bearer token used by the picontrol UI (localStorage key shared with the main UI).
  // Reading localStorage can throw in private windows, so it is wrapped.
  private authHeaders(): Record<string, string> {
    try {
      const token = window.localStorage.getItem("pimatrix_auth_token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { ...this.authHeaders() };
    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    const res = await fetch(this.url(path), init);
    if (!res.ok) {
      throw new ApiError(`${method} ${path} failed with ${res.status}`, res.status);
    }
    return (await res.json()) as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  // Opens the server-sent event stream. Returns a close function.
  // EventSource reconnects by itself; the caller only reacts to events.
  subscribe(handlers: Record<string, (data: string) => void>, onState: (open: boolean) => void): () => void {
    const es = new EventSource(this.url("/api/v1/events"));
    es.addEventListener("open", () => onState(true));
    es.addEventListener("error", () => onState(false));
    for (const [name, handler] of Object.entries(handlers)) {
      es.addEventListener(name, (ev) => handler((ev as MessageEvent<string>).data));
    }
    return () => es.close();
  }
}
