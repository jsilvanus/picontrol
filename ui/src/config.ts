/// <reference types="vite/client" />

/**
 * Normalizes a base URL string by trimming whitespace and removing trailing slashes.
 * Special tokens like "same-origin", "origin", or "/" resolve to "" (same host as the build).
 */
export function normalizeBaseUrl(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "same-origin" || trimmed === "origin" || trimmed === "/") {
    return "";
  }
  return trimmed.replace(/\/+$/, "");
}

/**
 * Resolves the Gateway base URL for all API and telemetry communication.
 *
 * Precedence:
 *   1. Explicit `search` parameter or `window.location.search` (`?gateway=<url>` or `?api=<url>`)
 *   2. Injected window property: `window.__PICONTROL_GATEWAY_URL__`
 *   3. Build-time environment variable: `import.meta.env.VITE_GATEWAY_URL` or `VITE_PIGATEWAY_URL`
 *   4. Default: "" (Empty string = same host/origin that the static bundle is served from)
 */
export function resolveGatewayBaseUrl(search?: string): string {
  const queryStr = search !== undefined
    ? search
    : typeof window !== "undefined" && window.location
      ? window.location.search
      : "";

  if (queryStr) {
    try {
      const params = new URLSearchParams(queryStr);
      const fromQuery = params.get("gateway") || params.get("api");
      if (fromQuery) {
        return normalizeBaseUrl(fromQuery);
      }
    } catch {
      // Ignore malformed query string
    }
  }

  // Runtime injection
  if (typeof window !== "undefined") {
    const fromWindow = (window as unknown as { __PICONTROL_GATEWAY_URL__?: string }).__PICONTROL_GATEWAY_URL__;
    if (fromWindow) {
      return normalizeBaseUrl(fromWindow);
    }
  }

  // Build-time Vite env variable
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    const fromEnv = env?.VITE_GATEWAY_URL ?? env?.VITE_PIGATEWAY_URL;
    if (fromEnv) {
      return normalizeBaseUrl(fromEnv);
    }
  } catch {
    // Non-Vite / Node environment
  }

  // Default: Same host that the build is served from
  return "";
}

/**
 * Resolves a path (such as `/api/v1/status` or `/api/v1/events`) against the configured gateway.
 * When gateway is unset (""), returns the relative path directly so requests hit the same host.
 */
export function resolveApiUrl(path: string, search?: string): string {
  const base = resolveGatewayBaseUrl(search);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!base) {
    return cleanPath;
  }
  return `${base}${cleanPath}`;
}
