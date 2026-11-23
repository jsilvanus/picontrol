// Pure helpers for the typed library in the piprogram tab: query strings, recording support, file reading.
import type { ActiveReason, LibraryItem, LibraryQuery } from "./types.ts";

/** Browser upload limit before base64 (the service accepts a 50 MB request body; base64 adds a third). */
export const MAX_SOUND_BYTES = 30 * 1024 * 1024;

export const TYPE_LABEL: Record<string, string> = {
  sound: "Sound", tts: "TTS", hymn: "Hymn", song: "Song", image: "Image", video: "Video", slides: "Slides", canva: "Canva"
};

export function typeLabel(type: string | undefined): string {
  if (!type) return "Other";
  return TYPE_LABEL[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/** "?type=a,b&usedFrom=..." (empty string when there is nothing to send). */
export function itemsQueryString(q: LibraryQuery): string {
  const p = new URLSearchParams();
  if (q.type?.length) p.set("type", q.type.join(","));
  if (q.hymnal?.length) p.set("hymnal", q.hymnal.join(","));
  if (q.q?.trim()) p.set("q", q.q.trim());
  if (q.unscheduled) p.set("unscheduled", "true");
  else {
    if (q.usedFrom) p.set("usedFrom", q.usedFrom);
    if (q.usedTo) p.set("usedTo", q.usedTo);
  }
  if (q.sort) p.set("sort", q.sort);
  if (q.limit) p.set("limit", String(q.limit));
  if (q.offset) p.set("offset", String(q.offset));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function toggleType(selected: readonly string[], type: string): string[] {
  return selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type];
}

/** YYYY-MM-DD of a local date. */
export function localDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export type DatePreset = "today" | "week" | "month";

export function presetRange(preset: DatePreset, now = new Date()): { from: string; to: string } {
  const from = new Date(now);
  const to = new Date(now);
  to.setDate(to.getDate() + (preset === "today" ? 0 : preset === "week" ? 7 : 30));
  return { from: localDay(from), to: localDay(to) };
}

export interface RecordingSupport {
  ok: boolean;
  /** Plain-language reason when not ok. */
  reason?: string;
}

export interface RecordingEnv {
  isSecureContext?: boolean;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
}

/** Recording needs HTTPS (or localhost). The LAN page may be plain http: say so instead of failing silently. */
export function recordingSupport(env: RecordingEnv): RecordingSupport {
  if (!env.isSecureContext) {
    return { ok: false, reason: "Recording needs a secure (https) page. Open the control page through the https address, or upload a file instead." };
  }
  if (!env.hasGetUserMedia || !env.hasMediaRecorder) {
    return { ok: false, reason: "This browser cannot record sound. Upload a file instead." };
  }
  return { ok: true };
}

const MIME_PREFERENCE = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"];

export function pickRecorderMime(isSupported: (mime: string) => boolean): string | undefined {
  return MIME_PREFERENCE.find((m) => isSupported(m));
}

export function extensionForMime(mime: string): string {
  const base = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  const map: Record<string, string> = {
    "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/wav": "wav", "audio/x-wav": "wav",
    "audio/flac": "flac", "audio/aac": "aac"
  };
  return map[base] ?? "bin";
}

export function titleFromFilename(name: string): string {
  return name.replace(/\.[^./\\]+$/, "").replace(/[_]+/g, " ").trim();
}

export function recordingFilename(now = new Date(), mime = "audio/webm"): string {
  const stamp = `${localDay(now)}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  return `recording-${stamp}.${extensionForMime(mime)}`;
}

/** Checks a chosen file before upload. Returns an error text or null. */
export function checkSoundFile(file: { name: string; type: string; size: number }): string | null {
  if (file.size <= 0) return "The file is empty.";
  if (file.size > MAX_SOUND_BYTES) return `The file is too large (${Math.round(file.size / 1048576)} MB). The limit is ${MAX_SOUND_BYTES / 1048576} MB.`;
  const looksAudio = file.type.startsWith("audio/") || file.type === "video/webm" || /\.(wav|mp3|m4a|aac|ogg|oga|opus|flac|webm|mp4)$/i.test(file.name);
  return looksAudio ? null : "This does not look like a sound file.";
}

/** Normalises a typed library type: lowercase letters, digits and dashes, at most 32 characters. */
export function normalizeType(raw: string): string | undefined {
  const t = raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  return t || undefined;
}

export function formatDuration(ms: number | undefined): string {
  if (!ms || ms < 0) return "";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function reasonLabel(reason: ActiveReason): string {
  return reason === "date" ? "by date" : reason === "manual" ? "picked" : "by date + picked";
}

/** A date-only entry cannot be removed by hand: it leaves when its use date passes or changes. */
export function canRemoveFromActive(reason: ActiveReason): boolean {
  return reason !== "date";
}

/** The hymnal prefix of a hymn number: "LV 12" -> LV; a bare number is the Virsikirja (VK). */
export function hymnalPrefixOf(hymnNumber: string | undefined): string {
  const m = /^\s*([A-Za-zÅÄÖåäö]{1,6})[\s.\-:]*\d/.exec(hymnNumber ?? "");
  return m?.[1] ? m[1].toUpperCase() : "VK";
}

/** What to send as the number of a new hymn: the picked hymnal's prefix, unless the user typed one or it is the Virsikirja. */
export function composeHymnNumber(prefix: string, typed: string): string {
  const number = typed.trim();
  if (!number || /^[A-Za-zÅÄÖåäö]/.test(number)) return number;
  return !prefix || prefix === "VK" ? number : `${prefix} ${number}`;
}

export type Preview =
  | { kind: "audio" | "image" | "video"; url: string; mime?: string }
  | { kind: "hymn"; stanzas: Array<{ number: string; text: string }> }
  | { kind: "youtube"; url?: string }
  | { kind: "steps"; count: number }
  | { kind: "none" };

/** What the card shows for an item. `assetUrl` is the service path (/api/v1/pipgm/assets/...); `resolve` makes it loadable. */
export function previewOf(item: LibraryItem, resolve: (path: string) => string): Preview {
  const asset = (path: string | undefined): string | undefined => (path ? resolve(path) : undefined);
  if (item.kind === "audio" && item.audio?.assetUrl) return { kind: "audio", url: asset(item.audio.assetUrl)!, ...(item.audio.mimeType ? { mime: item.audio.mimeType } : {}) };
  if (item.kind === "image" && item.image?.assetUrl) return { kind: "image", url: asset(item.image.assetUrl)! };
  if (item.kind === "video" && item.video?.assetUrl) return { kind: "video", url: asset(item.video.assetUrl)!, ...(item.video.mimeType ? { mime: item.video.mimeType } : {}) };
  if (item.kind === "hymn" && item.hymn?.stanzas?.length) {
    return { kind: "hymn", stanzas: item.hymn.stanzas.map((s) => ({ number: s.stanzaNumber, text: s.lines.join("\n") })) };
  }
  if (item.kind === "youtube") return { kind: "youtube", ...(item.youtube?.url ? { url: item.youtube.url } : {}) };
  if ((item.steps?.length ?? 0) > 0) return { kind: "steps", count: item.steps!.length };
  return { kind: "none" };
}

/** "Uploaded", "Recorded" or "Created": how the item came to the library. */
export function originLabel(item: LibraryItem): string {
  if (item.kind === "audio") return item.audio?.origin === "recording" ? "Recorded" : item.audio?.origin === "tts" ? "Created" : "Uploaded";
  return item.kind === "hymn" ? "Created" : "Uploaded";
}

/** "23.11.2026 14.32" in the browser's time zone; empty when the time is missing or not a date. */
export function formatStamp(iso: string | undefined, locale = "fi-FI"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString(locale)} ${d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
}
