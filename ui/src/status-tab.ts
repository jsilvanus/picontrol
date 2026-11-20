import { resolveApiUrl } from "./config";
import type {
  EcosystemStatus,
  FleetWorkerInfo,
  FpsBudget,
  SystemHostMetrics,
  SystemTelemetryResponse,
} from "./types";

let latestTelemetry: SystemTelemetryResponse | null = null;
let pollTimer: number | null = null;
let lastEco: EcosystemStatus | null = null;
let lastServerModules: string[] | null = null;

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMb(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function barColor(percent: number): string {
  if (percent >= 95) return "bg-rose-500";
  if (percent >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function renderFpsSection(fps: FpsBudget | null | undefined): string {
  if (!fps) {
    return `
      <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30">
        <div class="flex items-center justify-between mb-1">
          <span class="font-headline-sm text-[13px] font-bold text-on-surface">Hardware FPS Budget (1080p30)</span>
          <span class="text-[11px] text-on-surface-variant">PiMatrix unavailable</span>
        </div>
        <p class="text-[11px] text-on-surface-variant opacity-75">Connect PiMatrix to view live encode/decode FPS load.</p>
      </div>`;
  }

  const encPct = Math.min(100, Math.max(0, fps.encodePercent));
  const decPct = Math.min(100, Math.max(0, fps.decodePercent));
  const chips =
    fps.contributors.length > 0
      ? fps.contributors
          .map((c) => {
            const parts: string[] = [];
            if (c.encodeFps > 0) parts.push(`${c.encodeFps} enc`);
            if (c.decodeFps > 0) parts.push(`${c.decodeFps} dec`);
            const rate = parts.length ? parts.join(" / ") : "0 fps";
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/30 text-[11px] text-on-surface">
              <span class="font-semibold">${esc(c.label)}</span>
              <span class="text-on-surface-variant">(${esc(rate)})</span>
            </span>`;
          })
          .join("")
      : `<span class="text-[11px] text-on-surface-variant opacity-75">No active encode/decode streams (0 fps)</span>`;

  return `
    <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="font-headline-sm text-[13px] font-bold text-on-surface">Hardware FPS Budget</span>
        <span class="text-[11px] font-semibold text-on-surface-variant">${fps.budgetFps} fps ceiling</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-semibold text-on-surface">Encode FPS</span>
            <span class="font-mono font-bold ${fps.encodePercent >= 95 ? "text-rose-600" : "text-on-surface"}">${fps.encodeFps} / ${fps.budgetFps} fps (${fps.encodePercent}%)</span>
          </div>
          <div class="h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div class="h-full rounded-full transition-all ${barColor(fps.encodePercent)}" style="width: ${encPct}%"></div>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-semibold text-on-surface">Decode FPS</span>
            <span class="font-mono font-bold ${fps.decodePercent >= 95 ? "text-rose-600" : "text-on-surface"}">${fps.decodeFps} / ${fps.budgetFps} fps (${fps.decodePercent}%)</span>
          </div>
          <div class="h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div class="h-full rounded-full transition-all ${barColor(fps.decodePercent)}" style="width: ${decPct}%"></div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-1.5 pt-0.5">${chips}</div>
    </div>`;
}

function renderSystemSection(
  system: SystemHostMetrics | null | undefined,
  sourceLabel: string
): string {
  if (!system) {
    return "";
  }
  const cpuPct = Math.min(100, Math.max(0, system.cpuUsagePercent));
  const memPct = Math.min(100, Math.max(0, system.memory.usedPercent));
  const loadStr = system.loadAvg.map((v) => v.toFixed(2)).join(" / ");

  return `
    <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="font-headline-sm text-[13px] font-bold text-on-surface">Host CPU & Memory</span>
        <span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">${esc(sourceLabel)}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-semibold text-on-surface">CPU Use (${system.cpuCores} cores)</span>
            <span class="font-mono font-bold text-on-surface">${system.cpuUsagePercent.toFixed(1)}%</span>
          </div>
          <div class="h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div class="h-full rounded-full transition-all ${barColor(cpuPct)}" style="width: ${cpuPct}%"></div>
          </div>
          <div class="text-[10px] text-on-surface-variant">Load avg: ${esc(loadStr)}</div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-semibold text-on-surface">Memory Use</span>
            <span class="font-mono font-bold text-on-surface">${formatMb(system.memory.usedBytes)} / ${formatMb(system.memory.totalBytes)} (${system.memory.usedPercent.toFixed(0)}%)</span>
          </div>
          <div class="h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div class="h-full rounded-full transition-all ${barColor(memPct)}" style="width: ${memPct}%"></div>
          </div>
          <div class="text-[10px] text-on-surface-variant">Process RSS: ${formatMb(system.memory.processRssBytes)}</div>
        </div>
      </div>
    </div>`;
}

function statusPill(label: string, state: "online" | "standby" | "offline", detail?: string): string {
  const cls =
    state === "online"
      ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-800"
      : state === "standby"
        ? "bg-amber-500/15 border-amber-500/35 text-amber-800"
        : "bg-rose-500/10 border-rose-500/30 text-rose-700";
  const dot =
    state === "online" ? "bg-emerald-500" : state === "standby" ? "bg-amber-500" : "bg-rose-500";
  return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium ${cls}">
    <span class="w-2 h-2 rounded-full ${dot}"></span>
    <span class="font-semibold">${esc(label)}</span>
    ${detail ? `<span class="opacity-75 text-[10px]">${esc(detail)}</span>` : ""}
  </span>`;
}

function renderConnectionsSection(
  telemetry: SystemTelemetryResponse | null,
  eco: EcosystemStatus | null
): string {
  const fleet = telemetry?.fffleet;
  const fleetState: "online" | "standby" | "offline" =
    fleet?.status === "connected" ? "online" : fleet?.status === "not-configured" ? "standby" : "offline";
  const workers: FleetWorkerInfo[] = fleet?.workers ?? [];

  const workerPills =
    workers.length > 0
      ? workers
          .map((w) => {
            const st: "online" | "standby" | "offline" =
              w.status === "online" ? "online" : w.status === "offline" ? "offline" : "standby";
            const jobs = typeof w.activeJobs === "number" ? `${w.activeJobs} jobs` : undefined;
            return statusPill(w.id, st, jobs);
          })
          .join("")
      : `<span class="text-[11px] text-on-surface-variant opacity-75">No remote workers reported</span>`;

  const media = telemetry?.mediaMtx;
  const mediaState: "online" | "standby" | "offline" =
    media?.status === "connected" ? "online" : media?.status === "not-configured" ? "standby" : "offline";
  const mediaDetail = media?.readyPaths?.length ? `${media.readyPaths.length} paths` : undefined;

  const atem = telemetry?.connections?.atem;
  const atemState: "online" | "standby" | "offline" = atem?.connected
    ? "online"
    : atem?.configured
      ? "offline"
      : "standby";

  const ecoServices: Array<{ id: string; label: string }> = [
    { id: "pimatrix", label: "PiMatrix" },
    { id: "piprogram", label: "PiProgram" },
    { id: "picam", label: "PiCam" },
    { id: "pivoice", label: "PiVoice" },
    { id: "pistorage", label: "PiStorage" },
    { id: "pisound", label: "PiSound" },
    { id: "pitube", label: "PiTube" },
    { id: "pitally", label: "PiTally" },
    { id: "piencoder", label: "PiEncoder" },
  ];

  const servicePills = [
    statusPill("MediaMTX", mediaState, mediaDetail),
    statusPill("ATEM / PiSwitch", atemState, atem?.connected ? "connected" : atem?.configured ? "disconnected" : "off"),
    ...ecoServices.map(({ id, label }) => {
      const comp = eco?.components?.[id];
      const st: "online" | "standby" | "offline" = comp?.available || comp?.connecting
        ? "online"
        : comp?.configured || comp?.active
          ? "standby"
          : "offline";
      return statusPill(label, st);
    }),
  ].join("");

  return `
    <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="font-headline-sm text-[13px] font-bold text-on-surface">Live Connections & fffleet</span>
        ${statusPill("fffleet", fleetState, fleet?.status ?? "unknown")}
      </div>
      <div class="space-y-1.5">
        <div class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">fffleet Workers</div>
        <div class="flex flex-wrap gap-1.5">${workerPills}</div>
      </div>
      <div class="space-y-1.5 pt-1">
        <div class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">Services</div>
        <div class="flex flex-wrap gap-1.5">${servicePills}</div>
      </div>
    </div>`;
}

function renderModuleButtons(eco: EcosystemStatus | null, serverModules: string[] | null): string {
  const moduleInfo: Array<{ key: string; label: string; component?: string }> = [
    { key: "matrix", label: "PiMatrix", component: "pimatrix" },
    { key: "outputs", label: "Outputs", component: "pimatrix" },
    { key: "pivoice", label: "PiVoice", component: "pivoice" },
    { key: "piencoder", label: "PiEncoder", component: "piencoder" },
    { key: "pitube", label: "PiTube", component: "pitube" },
    { key: "pisound", label: "PiSound", component: "pisound" },
    { key: "pitally", label: "PiTally", component: "pitally" },
    { key: "radio", label: "Radio", component: "radioRelay" },
    { key: "pispace", label: "PiSpace", component: "cameras" },
    { key: "piprogram", label: "PiProgram", component: "piprogram" },
    { key: "pistorage", label: "PiStorage", component: "pistorage" },
    { key: "picam", label: "PiCam", component: "picam" },
  ];

  const effectiveModules = serverModules != null ? new Set(serverModules) : null;

  const buttons = moduleInfo
    .map(({ key, label, component }) => {
      const comp = component ? eco?.components?.[component] : undefined;
      const enabled = effectiveModules == null || effectiveModules.has(key);
      const online = Boolean(comp?.available || comp?.connecting);
      const active = Boolean(comp?.active);

      let btnCls: string;
      let dotCls: string;
      let stateLabel: string;

      if (!enabled) {
        btnCls = "bg-surface-container-high border-outline-variant/30 text-on-surface-variant opacity-55";
        dotCls = "bg-slate-400";
        stateLabel = "OFF";
      } else if (online) {
        btnCls = "bg-emerald-500/15 border-emerald-500/40 text-emerald-900 hover:bg-emerald-500/20";
        dotCls = "bg-emerald-500";
        stateLabel = "ON";
      } else if (active) {
        btnCls = "bg-amber-500/15 border-amber-500/40 text-amber-900 hover:bg-amber-500/20";
        dotCls = "bg-amber-500";
        stateLabel = "STBY";
      } else {
        btnCls = "bg-rose-500/10 border-rose-500/30 text-rose-800 hover:bg-rose-500/15";
        dotCls = "bg-rose-500";
        stateLabel = "OFF";
      }

      return `<button type="button" title="${esc(comp?.description || label)}" class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-left transition-all ${btnCls}">
        <span class="flex items-center gap-1.5 min-w-0">
          <span class="w-2 h-2 rounded-full flex-shrink-0 ${dotCls}"></span>
          <span class="text-[12px] font-semibold truncate">${esc(label)}</span>
        </span>
        <span class="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-black/5 flex-shrink-0">${stateLabel}</span>
      </button>`;
    })
    .join("");

  return `
    <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
      <div class="font-headline-sm text-[13px] font-bold text-on-surface">Modules</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">${buttons}</div>
    </div>`;
}

export function renderStatusTab(
  eco: EcosystemStatus | null = lastEco,
  serverModules: string[] | null = lastServerModules
): void {
  lastEco = eco;
  lastServerModules = serverModules;

  const root = document.getElementById("status-root");
  if (!root) return;

  const telemetry = latestTelemetry;
  const effectiveEco = eco ?? telemetry?.ecosystem ?? null;
  const fps = telemetry?.fps ?? telemetry?.pimatrix?.fps ?? null;
  const system = telemetry?.pimatrix?.system ?? telemetry?.system ?? telemetry?.gateway ?? null;
  const hostLabel = telemetry?.pimatrix?.system ? "pimatrix" : "pigateway";
  const updatedTime = telemetry?.timestamp ?? effectiveEco?.updatedAt;
  const updatedBadge = updatedTime
    ? `<span class="text-[10px] text-on-surface-variant">Updated: ${new Date(updatedTime).toLocaleTimeString()}</span>`
    : "";

  root.innerHTML = `
    <div class="flex items-center justify-between mb-1">
      <h2 class="font-headline-sm text-[15px] font-bold text-on-surface">System & Module Status</h2>
      <div class="flex items-center gap-2">
        ${updatedBadge}
        <button type="button" onclick="triggerEcosystemProbe()" class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container text-on-surface-variant hover:text-on-primary-container font-label-sm text-[11px] uppercase font-semibold transition-all active:scale-95">Probe</button>
      </div>
    </div>
    <div class="space-y-3">
      ${renderFpsSection(fps)}
      ${renderSystemSection(system, hostLabel)}
      ${renderConnectionsSection(telemetry, effectiveEco)}
      ${renderModuleButtons(effectiveEco, serverModules)}
    </div>`;
}

export async function refreshStatusTelemetry(): Promise<void> {
  try {
    const res = await fetch(resolveApiUrl("/api/v1/system/telemetry"));
    if (!res.ok) return;
    latestTelemetry = (await res.json()) as SystemTelemetryResponse;
    renderStatusTab(lastEco ?? latestTelemetry.ecosystem ?? null, lastServerModules);
  } catch {
    // Ignore transient polling errors
  }
}

export function setStatusTabActive(active: boolean): void {
  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
  if (active) {
    void refreshStatusTelemetry();
    pollTimer = window.setInterval(() => {
      void refreshStatusTelemetry();
    }, 3000);
  }
}
