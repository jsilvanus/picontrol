/// <reference types="vite/client" />

// Base URL of the pimatrix server. Resolution order:
//   1. ?api=<url> query parameter (e.g. multiview.html?api=http://192.168.1.10:3100)
//   2. VITE_PIMATRIX_URL at build time
//   3. "" (same origin: all calls are relative, e.g. /api/v1/events)
// The result never ends with a slash, so callers append "/api/v1/...".

function normalise(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed.replace(/\/+$/, "");
}

export function resolveApiBase(search: string = window.location.search): string {
  try {
    const fromQuery = normalise(new URLSearchParams(search).get("api"));
    if (fromQuery !== null) return fromQuery;
  } catch {
    // Malformed query string: fall through to the build-time default.
  }
  const fromEnv = normalise(import.meta.env.VITE_PIMATRIX_URL as string | undefined);
  return fromEnv ?? "";
}
