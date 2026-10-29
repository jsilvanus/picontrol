/// <reference types="vite/client" />

// Base URL of the gateway / pimatrix server. Resolution order:
//   1. ?gateway=<url> or ?api=<url> query parameter (e.g. multiview.html?gateway=http://192.168.1.10:3100)
//   2. VITE_GATEWAY_URL / VITE_PIGATEWAY_URL / VITE_PIMATRIX_URL at build time
//   3. "" (same origin: all calls are relative, e.g. /api/v1/events)
// The result never ends with a slash, so callers append "/api/v1/...".

function normalise(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "same-origin" || trimmed === "origin" || trimmed === "/") return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed.replace(/\/+$/, "");
}

export function resolveApiBase(search: string = window.location.search): string {
  try {
    const params = new URLSearchParams(search);
    const fromQuery = normalise(params.get("gateway") || params.get("api"));
    if (fromQuery !== null) return fromQuery;
  } catch {
    // Malformed query string: fall through to the build-time default.
  }
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const fromEnv = normalise(
    env?.VITE_GATEWAY_URL ?? env?.VITE_PIGATEWAY_URL ?? env?.VITE_PIMATRIX_URL
  );
  return fromEnv ?? "";
}
