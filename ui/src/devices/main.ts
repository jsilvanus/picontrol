import "./devices.css";
import { resolveApiBase } from "../multiview/config";
import { PiMatrixApi, ApiError } from "./api";
import { byId, el } from "../multiview/dom";
import { SOURCE_IDS, type AtemState, type Camera, type CameraId, type MoveDirection, type Output, type OutputId, type SourceId } from "./types";

// Entry point of devices.html: camera PTZ and presets, ATEM program/preview/cut,
// and the HDMI output sources. Everything goes through the pimatrix JSON API.

const api = new PiMatrixApi(resolveApiBase());
const PRESETS = [1, 2, 3, 4, 5, 6];
const PAN_TILT: Array<{ label: string; direction: MoveDirection }> = [
  { label: "↖", direction: "upleft" },
  { label: "↑", direction: "up" },
  { label: "↗", direction: "upright" },
  { label: "←", direction: "left" },
  { label: "■", direction: "stop" },
  { label: "→", direction: "right" },
  { label: "↙", direction: "downleft" },
  { label: "↓", direction: "down" },
  { label: "↘", direction: "downright" }
];

const apiStatus = byId("api-status");

function setStatus(text: string, ok: boolean): void {
  apiStatus.textContent = text;
  apiStatus.classList.toggle("ok", ok);
}

function describe(err: unknown): string {
  if (err instanceof ApiError) return `${err.message}`;
  return err instanceof Error ? err.message : "Request failed";
}

function showError(id: string, err: unknown | null): void {
  byId(id).textContent = err === null ? "" : describe(err);
}

// --- Cameras -------------------------------------------------------------

function cameraCard(camera: Camera): HTMLElement {
  const card = el("div", "camera");
  card.append(el("div", "camera-title", `${camera.label} (${camera.model})`));
  card.append(el("div", "muted", `${camera.connection}${camera.streaming ? ", streaming" : ""}`));

  const pad = el("div", "pad");
  for (const { label, direction } of PAN_TILT) {
    const button = el("button", "pad-btn", label);
    button.type = "button";
    button.setAttribute("aria-label", direction);
    button.addEventListener("click", () => void moveCamera(camera.id, direction));
    pad.append(button);
  }
  card.append(pad);

  const zoom = el("div", "row");
  for (const [label, action] of [["Zoom −", "out"], ["Stop", "stop"], ["Zoom +", "in"]] as const) {
    const button = el("button", "", label);
    button.type = "button";
    button.addEventListener("click", () => void zoomCamera(camera.id, action));
    zoom.append(button);
  }
  card.append(zoom);

  const presets = el("div", "row");
  for (const preset of PRESETS) {
    const button = el("button", "", `P${preset}`);
    button.type = "button";
    button.title = `Recall preset ${preset}`;
    button.addEventListener("click", () => void recallPreset(camera.id, preset));
    presets.append(button);
  }
  card.append(presets);

  // Privacy blur: manual focus driven to the nearest point; off returns to autofocus.
  const blurOn = camera.privacyBlur === true;
  const blur = el("button", "", blurOn ? "Privacy blur: on (back to AF)" : "Privacy blur");
  blur.type = "button";
  blur.setAttribute("aria-pressed", String(blurOn));
  blur.title = blurOn ? "Return the camera to autofocus" : "Blur the picture: manual focus, nearest point";
  blur.addEventListener("click", () => void setPrivacyBlur(camera.id, !blurOn));
  card.append(blur);
  return card;
}

async function setPrivacyBlur(id: CameraId, enabled: boolean): Promise<void> {
  try {
    await api.post(`/api/v1/cameras/${id}/privacy-blur`, { enabled });
    showError("cameras-error", null);
    await loadCameras();
  } catch (err) {
    showError("cameras-error", err);
  }
}

async function moveCamera(id: CameraId, direction: MoveDirection): Promise<void> {
  try {
    await api.post(`/api/v1/cameras/${id}/move`, { direction });
    showError("cameras-error", null);
  } catch (err) {
    showError("cameras-error", err);
  }
}

async function zoomCamera(id: CameraId, action: "in" | "out" | "stop"): Promise<void> {
  try {
    await api.post(`/api/v1/cameras/${id}/zoom`, { action });
  } catch (err) {
    showError("cameras-error", err);
  }
}

async function recallPreset(id: CameraId, preset: number): Promise<void> {
  try {
    await api.post(`/api/v1/cameras/${id}/presets/${preset}/recall`, {});
  } catch (err) {
    showError("cameras-error", err);
  }
}

async function loadCameras(): Promise<void> {
  const container = byId("cameras");
  try {
    const body = await api.get<{ items: Camera[] }>("/api/v1/cameras");
    container.replaceChildren(...body.items.map(cameraCard));
    if (body.items.length === 0) container.textContent = "No cameras configured.";
  } catch (err) {
    container.textContent = describe(err);
  }
}

// --- ATEM ----------------------------------------------------------------

function renderAtem(state: AtemState): void {
  byId("atem-state").textContent = state.connected
    ? `Program ${state.programInput ?? "–"} · Preview ${state.previewInput ?? "–"}`
    : "ATEM is not connected";
}

function atemInput(): number | null {
  const value = Number(byId<HTMLInputElement>("atem-input").value);
  return Number.isInteger(value) && value >= 1 && value <= 40 ? value : null;
}

async function atemSwitch(kind: "program" | "preview"): Promise<void> {
  const input = atemInput();
  if (input === null) {
    showError("atem-error", new Error("Input must be a whole number from 1 to 40"));
    return;
  }
  try {
    renderAtem(await api.put<AtemState>(`/api/v1/atem/${kind}`, { input }));
    showError("atem-error", null);
  } catch (err) {
    showError("atem-error", err);
  }
}

// --- Outputs -------------------------------------------------------------

async function loadOutputs(): Promise<void> {
  const container = byId("outputs");
  try {
    const body = await api.get<{ items: Output[] }>("/api/v1/outputs");
    container.replaceChildren(...body.items.filter((o) => o.id !== "multiview").map(outputRow));
    showError("outputs-error", null);
  } catch (err) {
    showError("outputs-error", err);
  }
}

function outputRow(output: Output): HTMLElement {
  const row = el("div", "output");
  row.append(el("div", "camera-title", `${output.id}: ${output.state}`));
  const select = el("select");
  select.setAttribute("aria-label", `Source for ${output.id}`);
  select.append(new Option("Off", ""));
  for (const source of SOURCE_IDS) select.append(new Option(source, source));
  select.value = output.desiredSource ?? "";
  select.addEventListener("change", () => void setOutputSource(output.id, select.value === "" ? null : (select.value as SourceId)));
  row.append(select);
  row.append(el("div", "muted", `Showing ${output.observedSource ?? "nothing"}`));
  return row;
}

async function setOutputSource(id: OutputId, sourceId: SourceId | null): Promise<void> {
  try {
    await api.put(`/api/v1/outputs/${id}/source`, { sourceId });
    showError("outputs-error", null);
    await loadOutputs();
  } catch (err) {
    showError("outputs-error", err);
  }
}

// --- Wiring --------------------------------------------------------------

byId("atem-form").addEventListener("submit", (event) => {
  event.preventDefault();
  void atemSwitch("program");
});
byId("atem-card").addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (target.dataset.atem === "preview") void atemSwitch("preview");
});
byId("atem-cut").addEventListener("click", () => {
  void api
    .post<AtemState>("/api/v1/atem/cut", {})
    .then(renderAtem)
    .catch((err: unknown) => showError("atem-error", err));
});

async function start(): Promise<void> {
  try {
    await api.get("/api/v1/status");
    setStatus("Connected", true);
  } catch (err) {
    setStatus("Offline", false);
    showError("outputs-error", err);
  }
  await Promise.all([loadCameras(), loadOutputs()]);
  try {
    renderAtem(await api.get<AtemState>("/api/v1/atem"));
  } catch (err) {
    showError("atem-error", err);
  }
}

void start();
