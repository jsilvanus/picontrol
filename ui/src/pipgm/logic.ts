// Pure helpers for the piprogram tab. No DOM, no fetch, so node can test them.
import type { LoadReport, Pipeline, PlaylistDocument, PlaylistEntry, StepRow, LibraryItem } from "./types.ts";

export interface StepGroup {
  itemId: string;
  itemIndex: number;
  itemTitle: string;
  itemKind: string;
  steps: StepRow[];
}

/** Groups the flat step list by item so item boundaries stay visible. */
export function groupSteps(rows: readonly StepRow[]): StepGroup[] {
  const groups: StepGroup[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.itemId === row.itemId && last.itemIndex === row.itemIndex) {
      last.steps.push(row);
    } else {
      groups.push({ itemId: row.itemId, itemIndex: row.itemIndex, itemTitle: row.itemTitle, itemKind: row.itemKind, steps: [row] });
    }
  }
  return groups;
}

/** Index of the active step in the flat list, or -1. */
export function activeRowIndex(rows: readonly StepRow[]): number {
  return rows.findIndex((r) => r.isActive);
}

/** The steps from the active one on (the active step first). With no active step, all of them. */
export function comingUp(rows: readonly StepRow[]): StepRow[] {
  const at = activeRowIndex(rows);
  return at < 0 ? [...rows] : rows.slice(at);
}

/** Poll interval: quick while a feed is on air, slow when idle. */
export function pollIntervalMs(pipelines: readonly Pipeline[], hidden = false): number {
  if (hidden) return 15000;
  const onAir = pipelines.some((p) => p.state === "live" || p.playbackState === "playing");
  return onAir ? 1000 : 10000;
}

/** Whole seconds of arming left, 0 when disarmed or past. */
export function armSecondsLeft(p: Pick<Pipeline, "audioEnabled" | "audioArmedUntil">, now = Date.now()): number {
  if (!p.audioEnabled || !p.audioArmedUntil) return 0;
  const until = Date.parse(p.audioArmedUntil);
  if (!Number.isFinite(until)) return 0;
  return Math.max(0, Math.ceil((until - now) / 1000));
}

export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ---- draft playlist -------------------------------------------------------

/** Moves one entry; out-of-range indexes leave the list unchanged. Returns a new array. */
export function moveEntry<T>(list: readonly T[], from: number, to: number): T[] {
  const copy = [...list];
  if (from < 0 || from >= copy.length || to < 0 || to >= copy.length || from === to) return copy;
  const [entry] = copy.splice(from, 1);
  copy.splice(to, 0, entry as T);
  return copy;
}

export function removeAt<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

/** The draft starts as the entry ids of what the feed plays now (an item id when an entry has none). */
export function draftFromPipeline(p: Pick<Pipeline, "playlist">): string[] {
  return p.playlist.map((i) => i.entryId ?? i.id);
}

export function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/**
 * The same item may be listed several times: a draft id is an entry id (an existing copy) or a
 * library item id (a new copy), and the service makes a new entry for every item id it meets.
 */
export function addUnique(list: readonly string[], id: string): string[] {
  return [...list, id];
}

// ---- saved playlist documents ---------------------------------------------

export const PLAYLIST_SCHEMA = "piprogram.playlist/1";

/** The saved-file form of a live playlist. */
export function toDocument(name: string, p: Pick<Pipeline, "orientation">, items: readonly LibraryItem[]): PlaylistDocument {
  return {
    schema: PLAYLIST_SCHEMA,
    name,
    orientation: p.orientation,
    items: items.map((item): PlaylistEntry => {
      const entry: PlaylistEntry = { itemId: item.id, kind: item.kind, title: item.title };
      if (item.kind === "hymn" && item.hymn?.hymnNumber) entry.hymn = { number: item.hymn.hymnNumber };
      return entry;
    })
  };
}

export type ParsedDocument = { ok: true; doc: PlaylistDocument } | { ok: false; error: string };

/** Checks an imported file before it is sent anywhere. */
export function parsePlaylistDocument(text: string): ParsedDocument {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "The file is not JSON." };
  }
  if (!raw || typeof raw !== "object") return { ok: false, error: "The file is not a playlist." };
  const o = raw as Record<string, unknown>;
  if (o.schema !== undefined && o.schema !== PLAYLIST_SCHEMA) {
    return { ok: false, error: `Unknown playlist format: ${String(o.schema)}.` };
  }
  if (typeof o.name !== "string" || !o.name.trim()) return { ok: false, error: "The playlist has no name." };
  if (!Array.isArray(o.items)) return { ok: false, error: "The playlist has no items list." };
  if (o.items.length > 500) return { ok: false, error: "More than 500 items." };
  const items: PlaylistEntry[] = [];
  for (const [i, e] of o.items.entries()) {
    if (!e || typeof e !== "object") return { ok: false, error: `Item ${i + 1} is not an object.` };
    const entry = e as Record<string, unknown>;
    const hasId = typeof entry.itemId === "string" && entry.itemId !== "";
    const isPause = entry.pause === true;
    if (hasId === isPause) return { ok: false, error: `Item ${i + 1} must be a library item or a pause.` };
    items.push(entry as PlaylistEntry);
  }
  const doc: PlaylistDocument = { schema: PLAYLIST_SCHEMA, name: o.name.trim().slice(0, 120), items };
  if (o.orientation === "landscape" || o.orientation === "portrait") doc.orientation = o.orientation;
  return { ok: true, doc };
}

/** One line per thing the operator should know after a load. Empty when all went well. */
export function describeLoadReport(report: LoadReport): string[] {
  const lines: string[] = [];
  for (const m of report.missing) {
    const what = m.title || (m.hymn?.number !== undefined ? `hymn ${m.hymn.number}` : m.itemId);
    lines.push(`Missing from the library: ${what}`);
  }
  if (report.duplicates.length) lines.push(`${report.duplicates.length} duplicate item(s) left out`);
  if (report.skipped.length) lines.push(`${report.skipped.length} pause marker(s) skipped (not supported yet)`);
  if (report.carriedActiveItem) lines.push("The item on air stays first until the feed moves on");
  return lines;
}

// ---- library filtering ----------------------------------------------------

/** True when any entry of a useAt list (day, hour, moment or a/b range) touches the given day (YYYY-MM-DD). */
export function useAtMatchesDay(useAt: readonly string[] | undefined, day: string): boolean {
  if (!useAt || !useAt.length) return false;
  for (const entry of useAt) {
    const [a, b] = entry.split("/");
    const from = (a ?? "").slice(0, 10);
    const to = (b ?? a ?? "").slice(0, 10);
    if (from && to && from <= day && day <= to) return true;
  }
  return false;
}

export interface LibraryFilter {
  kind?: string;
  day?: string;
  text?: string;
}

export function filterLibrary(items: readonly LibraryItem[], f: LibraryFilter): LibraryItem[] {
  const text = (f.text ?? "").trim().toLowerCase();
  return items.filter((item) => {
    if (f.kind && item.kind !== f.kind) return false;
    if (f.day && !useAtMatchesDay(item.useAt, f.day)) return false;
    if (text && !item.title.toLowerCase().includes(text)) return false;
    return true;
  });
}

// ---- errors ---------------------------------------------------------------

export interface ErrorAdvice {
  title: string;
  next: string;
}

/** Banner text for an API failure (F11): what happened and what to do next. */
export function adviceFor(status: number, code: string | undefined, message: string): ErrorAdvice {
  if (status === 409 && code === "AUDIO_NOT_ARMED") {
    return { title: "Sound is not armed on this feed", next: "Arm sound for this feed first, then play again." };
  }
  if (status === 503) {
    return { title: "The library store is not reachable", next: "What is on air keeps working. Saving and loading wait until pistorage is back." };
  }
  if (status === 403) {
    return { title: "Not allowed from this connection", next: "This action works only on the church network." };
  }
  if (status === 401) {
    return { title: "Signed out", next: "Enter the PIN again, then retry." };
  }
  if (status === 404) {
    return { title: "Not found", next: "The item or feed no longer exists. Reload the list." };
  }
  if (status === 422) {
    return { title: "Rejected", next: message || "Check the values and try again." };
  }
  if (status === 0) {
    return { title: "Cannot reach the gateway", next: "Check the network connection. The tab keeps retrying." };
  }
  return { title: `Request failed (${status})`, next: message || "Try again." };
}
