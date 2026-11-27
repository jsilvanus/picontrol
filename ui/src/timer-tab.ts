// Timer tab: deterministic action runner & pre-flight scheduler (PiTimer integration).
// Talks to pitimer directly (port 3403) or through pigateway /api/v1/timers.

export interface WarningStage {
  offsetMinutes: number;
  notify?: {
    channel?: string;
    message: string;
    level?: "info" | "warn" | "error";
  };
  tally?: {
    lightId?: string;
    color?: string;
    blink?: boolean;
  };
  command?: string;
}

export interface TimerSchedule {
  start?: string; // HH:mm or ISO
  end?: string;   // HH:mm or ISO
  days?: number[]; // 0=Sun..6=Sat
  cron?: string;
  exactDate?: string;
}

export interface TimerDefinition {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  mutedUntil?: string | null;
  schedule: TimerSchedule;
  warnings?: WarningStage[];
  onStart?: string[];
  onEnd?: string[];
  onFailure?: string[];
  scriptText?: string;
}

export interface TimerMuteState {
  muted: boolean;
  mutedUntil?: string | null;
  permanent?: boolean;
}

export interface TimerSystemStatus {
  service: "pitimer";
  version: string;
  active: boolean;
  mute: TimerMuteState;
  timerCount: number;
  activeRunsCount: number;
  lastTickAt?: string;
}

export interface StepLogEntry {
  step: string;
  command: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  durationMs: number;
  error?: string;
  timestamp: string;
}

export interface TimerRunRecord {
  runId: string;
  timerId: string;
  timerName: string;
  phase: "warning" | "start" | "end" | "manual";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt: string;
  finishedAt?: string;
  steps: StepLogEntry[];
  error?: string;
}

let containerEl: HTMLElement | null = null;
let pollTimer: number | undefined;
let isTabActive = false;

let systemStatus: TimerSystemStatus | null = null;
let timers: TimerDefinition[] = [];
let recentRuns: TimerRunRecord[] = [];
let errorMessage: string | null = null;
let successMessage: string | null = null;

// Editor Modal State
let isEditorOpen = false;
let editingTimerId: string | null = null;
let editorMode: "dsl" | "visual" = "dsl";
let dslTextValue = "";
let dslParseError: string | null = null;
let dslParseWarning: string | null = null;

// Runs Drawer State
let isRunsDrawerOpen = false;
let selectedRunId: string | null = null;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function initTimerTab(root: HTMLElement): void {
  containerEl = root;
  render();
  void refreshTimerData();
}

export function setTimerTabActive(active: boolean): void {
  isTabActive = active;
  if (active) {
    void refreshTimerData();
    if (!pollTimer) {
      pollTimer = window.setInterval(() => {
        if (isTabActive) void refreshTimerData();
      }, 5000);
    }
  } else {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err.message) msg = err.message;
      else if (err.error) msg = err.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

async function refreshTimerData(): Promise<void> {
  try {
    const [statusData, timersData, runsData] = await Promise.all([
      apiFetch<TimerSystemStatus>("/api/v1/timers/status").catch(() => null),
      apiFetch<TimerDefinition[]>("/api/v1/timers").catch(() => []),
      apiFetch<TimerRunRecord[]>("/api/v1/timers/runs").catch(() => [])
    ]);

    systemStatus = statusData;
    timers = Array.isArray(timersData) ? timersData : [];
    recentRuns = Array.isArray(runsData) ? runsData : [];
    errorMessage = null;
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }
  render();
}

async function setMute(duration?: "8h" | "24h" | "1w" | "permanent"): Promise<void> {
  try {
    await apiFetch("/api/v1/timers/mute", {
      method: "POST",
      body: JSON.stringify(duration ? { duration } : {})
    });
    successMessage = duration ? `Timers muted for ${duration}` : "Timers muted";
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

async function clearMute(): Promise<void> {
  try {
    await apiFetch("/api/v1/timers/unmute", { method: "POST" });
    successMessage = "All timers unmuted and active";
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

async function muteSingleTimer(id: string, duration?: "1h" | "8h" | "24h" | "1w" | "permanent"): Promise<void> {
  try {
    await apiFetch(`/api/v1/timers/${encodeURIComponent(id)}/mute`, {
      method: "POST",
      body: JSON.stringify(duration ? { duration } : {})
    });
    successMessage = duration ? `Timer "${id}" muted for ${duration}` : `Timer "${id}" muted`;
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

async function unmuteSingleTimer(id: string): Promise<void> {
  try {
    await apiFetch(`/api/v1/timers/${encodeURIComponent(id)}/unmute`, { method: "POST" });
    successMessage = `Timer "${id}" unmuted and active`;
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

async function toggleTimerEnabled(id: string, currentState: boolean): Promise<void> {
  try {
    await apiFetch(`/api/v1/timers/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ enabled: !currentState })
    });
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

async function deleteTimer(id: string): Promise<void> {
  if (!confirm(`Are you sure you want to delete timer "${id}"?`)) return;
  try {
    await apiFetch(`/api/v1/timers/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    successMessage = `Timer "${id}" deleted`;
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

async function runTimerNow(id: string, phase: "start" | "end" = "start"): Promise<void> {
  try {
    await apiFetch(`/api/v1/timers/${encodeURIComponent(id)}/run`, {
      method: "POST",
      body: JSON.stringify({ phase })
    });
    successMessage = `Triggered timer "${id}" (${phase} phase)`;
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

async function cancelRun(runId: string): Promise<void> {
  try {
    await apiFetch(`/api/v1/timers/runs/${encodeURIComponent(runId)}/cancel`, {
      method: "POST"
    });
    successMessage = `Run "${runId}" cancelled`;
    await refreshTimerData();
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
    render();
  }
}

function openCreateModal(): void {
  editingTimerId = null;
  editorMode = "dsl";
  dslTextValue = `@timer sunday-service
  name: "Sunday Service Automation"
  description: "Pre-flight checks, recording, and YouTube automation"
  enabled: true

@schedule
  days: Sun
  start: 09:30
  end: 11:30

@warning 30m
  pinotify: "Church service starts in 30 minutes! Run pre-flight checks."
  pitally: tally01 amber

@warning 5m
  pitally: tally01 red blink

@on-start
  wait 2s
  picontrol sound preset "SundayService"
  picontrol camera cam1 recall "PulpitWide"
  piprogram cue "intro-loop"

@on-end
  pinotify: "Service ended. Stopping broadcast."
  pitube broadcast stop
`;
  dslParseError = null;
  dslParseWarning = null;
  isEditorOpen = true;
  render();
}

function openEditModal(timer: TimerDefinition): void {
  editingTimerId = timer.id;
  editorMode = "dsl";
  dslTextValue = timer.scriptText || generateDslFromTimer(timer);
  dslParseError = null;
  dslParseWarning = null;
  isEditorOpen = true;
  render();
}

function generateDslFromTimer(t: TimerDefinition): string {
  const lines: string[] = [];
  lines.push(`@timer ${t.id}`);
  lines.push(`  name: "${t.name}"`);
  if (t.description) lines.push(`  description: "${t.description}"`);
  lines.push(`  enabled: ${t.enabled}`);
  lines.push("");
  lines.push("@schedule");
  if (t.schedule.days && t.schedule.days.length > 0) {
    const daysStr = t.schedule.days.map((d) => DAY_NAMES[d] || String(d)).join(", ");
    lines.push(`  days: ${daysStr}`);
  }
  if (t.schedule.start) lines.push(`  start: ${t.schedule.start}`);
  if (t.schedule.end) lines.push(`  end: ${t.schedule.end}`);
  if (t.schedule.exactDate) lines.push(`  date: ${t.schedule.exactDate}`);
  if (t.schedule.cron) lines.push(`  cron: "${t.schedule.cron}"`);

  if (t.warnings && t.warnings.length > 0) {
    for (const w of t.warnings) {
      lines.push("");
      lines.push(`@warning ${w.offsetMinutes}m`);
      if (w.notify) lines.push(`  pinotify: "${w.notify.message}"`);
      if (w.tally) lines.push(`  pitally: ${w.tally.lightId || "all"} ${w.tally.color || "amber"}${w.tally.blink ? " blink" : ""}`);
      if (w.command) lines.push(`  ${w.command}`);
    }
  }

  if (t.onStart && t.onStart.length > 0) {
    lines.push("");
    lines.push("@on-start");
    for (const cmd of t.onStart) lines.push(`  ${cmd}`);
  }

  if (t.onEnd && t.onEnd.length > 0) {
    lines.push("");
    lines.push("@on-end");
    for (const cmd of t.onEnd) lines.push(`  ${cmd}`);
  }

  if (t.onFailure && t.onFailure.length > 0) {
    lines.push("");
    lines.push("@on-failure");
    for (const cmd of t.onFailure) lines.push(`  ${cmd}`);
  }

  return lines.join("\n") + "\n";
}

async function validateDsl(): Promise<boolean> {
  dslParseError = null;
  dslParseWarning = null;
  try {
    const parsed = await apiFetch<TimerDefinition>("/api/v1/timers/parse", {
      method: "POST",
      body: JSON.stringify({ scriptText: dslTextValue })
    });
    if (!parsed || !parsed.id) {
      dslParseError = "Parser returned an empty definition";
      render();
      return false;
    }
    dslParseWarning = `Syntax valid: parsed timer "${parsed.id}" (${parsed.name})`;
    render();
    return true;
  } catch (err: unknown) {
    dslParseError = err instanceof Error ? err.message : String(err);
    render();
    return false;
  }
}

async function saveEditorTimer(): Promise<void> {
  const isValid = await validateDsl();
  if (!isValid) return;

  try {
    await apiFetch("/api/v1/timers", {
      method: "POST",
      body: JSON.stringify({ scriptText: dslTextValue })
    });
    isEditorOpen = false;
    successMessage = "Timer saved successfully";
    await refreshTimerData();
  } catch (err: unknown) {
    dslParseError = err instanceof Error ? err.message : String(err);
    render();
  }
}

function render(): void {
  if (!containerEl) return;

  const isMuted = systemStatus?.mute.muted ?? false;
  const mutedUntil = systemStatus?.mute.mutedUntil;
  const isPermanent = systemStatus?.mute.permanent ?? false;

  let muteBadgeHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 flex items-center gap-1.5 border border-emerald-500/30">
    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE
  </span>`;

  if (isMuted) {
    const label = isPermanent ? "PERMANENTLY MUTED" : `MUTED UNTIL ${new Date(mutedUntil || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}`;
    muteBadgeHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 border border-amber-500/40">
      <span class="w-2 h-2 rounded-full bg-amber-500"></span> ${label}
    </span>`;
  }

  const activeRuns = recentRuns.filter((r) => r.status === "running");

  containerEl.innerHTML = `
    <div class="space-y-space-md max-w-7xl mx-auto">
      <!-- NOTIFICATIONS -->
      ${errorMessage ? `
        <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between text-sm">
          <span><strong>Error:</strong> ${errorMessage}</span>
          <button type="button" id="timer-dismiss-error" class="p-1 hover:bg-rose-500/20 rounded">✕</button>
        </div>` : ""}

      ${successMessage ? `
        <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-sm">
          <span>${successMessage}</span>
          <button type="button" id="timer-dismiss-success" class="p-1 hover:bg-emerald-500/20 rounded">✕</button>
        </div>` : ""}

      <!-- GLOBAL MUTE & CONTROL BAR -->
      <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-on-surface">PiTimer Action Runner</h2>
              ${muteBadgeHtml}
            </div>
            <p class="text-xs text-on-surface-variant">Deterministic broadcast automation, pre-flight verifications & lead warnings</p>
          </div>
        </div>

        <!-- MUTE ACTION BUTTONS -->
        <div class="flex flex-wrap items-center gap-2">
          ${isMuted ? `
            <button type="button" id="timer-unmute-btn" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all">
              <span class="material-symbols-outlined text-[16px]">notifications_active</span> Unmute All
            </button>
          ` : `
            <span class="text-xs text-on-surface-variant font-medium mr-1">Quick Mute:</span>
            <button type="button" data-mute="8h" class="timer-mute-btn px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-medium text-on-surface transition-all">
              8 Hours
            </button>
            <button type="button" data-mute="24h" class="timer-mute-btn px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-medium text-on-surface transition-all">
              24 Hours
            </button>
            <button type="button" data-mute="1w" class="timer-mute-btn px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-medium text-on-surface transition-all">
              1 Week
            </button>
            <button type="button" data-mute="permanent" class="timer-mute-btn px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-rose-500/20 hover:text-rose-600 border border-outline-variant/40 text-xs font-medium text-on-surface transition-all">
              Permanent
            </button>
          `}
          <div class="h-6 w-px bg-outline-variant/30 mx-1"></div>
          <button type="button" id="timer-history-btn" class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all relative">
            <span class="material-symbols-outlined text-[16px]">history</span> History
            ${activeRuns.length > 0 ? `<span class="w-2 h-2 rounded-full bg-primary animate-ping absolute -top-1 -right-1"></span>` : ""}
          </button>
          <button type="button" id="timer-new-btn" class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all">
            <span class="material-symbols-outlined text-[18px]">add</span> New Timer
          </button>
        </div>
      </div>

      <!-- ACTIVE RUNNING TASKS BANNER (IF ANY) -->
      ${activeRuns.length > 0 ? `
        <div class="p-3.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3 text-sm">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary animate-spin">sync</span>
            <span class="font-semibold text-on-surface">Currently executing ${activeRuns.length} timer task(s):</span>
            <span class="text-xs text-on-surface-variant font-mono">${activeRuns.map(r => `${r.timerName} (${r.phase})`).join(", ")}</span>
          </div>
          <button type="button" id="timer-view-active-runs-btn" class="px-2.5 py-1 rounded bg-primary text-on-primary text-xs font-bold">View Progress</button>
        </div>` : ""}

      <!-- TIMERS LIST -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${timers.length === 0 ? `
          <div class="col-span-full p-8 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/60 text-center space-y-3">
            <span class="material-symbols-outlined text-4xl text-on-surface-variant/40">alarm_off</span>
            <h3 class="text-base font-bold text-on-surface">No timers configured yet</h3>
            <p class="text-xs text-on-surface-variant max-w-md mx-auto">Create deterministic schedule runners with lead warnings, YouTube pre-flight checks, and ecosystem command pipelines.</p>
            <button type="button" id="timer-empty-new-btn" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs">
              Create First Timer
            </button>
          </div>
        ` : timers.map((t) => {
          const daysStr = t.schedule.days && t.schedule.days.length > 0
            ? t.schedule.days.map(d => DAY_NAMES[d] || String(d)).join(", ")
            : "Specific date";
          const timeStr = `${t.schedule.start || "--:--"} → ${t.schedule.end || "Open"}`;
          const warningsCount = t.warnings ? t.warnings.length : 0;
          const onStartCount = t.onStart ? t.onStart.length : 0;

          const isTimerDisabled = !t.enabled;
          const isTimerMuted = !isTimerDisabled && Boolean(t.mutedUntil && new Date(t.mutedUntil).getTime() > Date.now());
          const timerMutedUntilStr = isTimerMuted && t.mutedUntil ? new Date(t.mutedUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

          let timerStatusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">ACTIVE</span>`;
          if (isTimerDisabled) {
            timerStatusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600">DISABLED</span>`;
          } else if (isTimerMuted) {
            timerStatusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">MUTED (${timerMutedUntilStr})</span>`;
          }

          return `
            <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-xs flex flex-col justify-between gap-3 relative transition-all hover:border-primary/40">
              <div class="space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">${t.id}</span>
                    ${timerStatusBadge}
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" data-timer-toggle="${t.id}" class="sr-only peer" ${t.enabled ? "checked" : ""}>
                    <div class="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <h3 class="text-sm font-bold text-on-surface">${t.name}</h3>
                  ${t.description ? `<p class="text-xs text-on-surface-variant line-clamp-2">${t.description}</p>` : ""}
                </div>

                <div class="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/20 space-y-1.5 text-xs">
                  <div class="flex items-center justify-between text-on-surface">
                    <span class="text-on-surface-variant flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">calendar_month</span> Days:
                    </span>
                    <span class="font-semibold">${daysStr}</span>
                  </div>
                  <div class="flex items-center justify-between text-on-surface">
                    <span class="text-on-surface-variant flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">schedule</span> Window:
                    </span>
                    <span class="font-mono font-bold">${timeStr}</span>
                  </div>
                </div>

                <!-- QUICK SNOOZE / MUTE CONTROLS -->
                <div class="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/20">
                  <span class="text-[10px] text-on-surface-variant font-medium">Snooze:</span>
                  ${isTimerMuted ? `
                    <button type="button" data-single-unmute="${t.id}" class="px-2 py-0.5 rounded bg-emerald-600/15 text-emerald-600 hover:bg-emerald-600/25 text-[10px] font-bold">Unmute</button>
                  ` : `
                    <div class="flex items-center gap-1">
                      <button type="button" data-single-mute="${t.id}" data-dur="1h" class="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-medium text-on-surface">1h</button>
                      <button type="button" data-single-mute="${t.id}" data-dur="8h" class="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-medium text-on-surface">8h</button>
                      <button type="button" data-single-mute="${t.id}" data-dur="24h" class="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-medium text-on-surface">24h</button>
                    </div>
                  `}
                </div>

                <!-- WARNING BADGES -->
                ${warningsCount > 0 ? `
                  <div class="flex flex-wrap gap-1.5 items-center pt-1">
                    <span class="text-[10px] text-on-surface-variant uppercase font-bold tracking-wide">Warnings:</span>
                    ${t.warnings!.map(w => `
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1" title="${w.notify?.message || w.command || 'Warning step'}">
                        <span class="material-symbols-outlined text-[11px]">notifications</span> -${w.offsetMinutes}m
                      </span>
                    `).join("")}
                  </div>
                ` : ""}

                <!-- STEPS SUMMARY -->
                <div class="flex items-center gap-3 text-[11px] text-on-surface-variant pt-1">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">play_circle</span> ${onStartCount} start action(s)
                  </span>
                  ${t.onEnd && t.onEnd.length > 0 ? `
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">stop_circle</span> ${t.onEnd.length} end action(s)
                    </span>
                  ` : ""}
                </div>
              </div>

              <!-- CARD ACTIONS -->
              <div class="flex items-center justify-between pt-2 border-t border-outline-variant/30 mt-2">
                <div class="flex items-center gap-1">
                  <button type="button" data-timer-edit="${t.id}" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1 transition-all">
                    <span class="material-symbols-outlined text-[14px]">edit</span> Edit
                  </button>
                  <button type="button" data-timer-run="${t.id}" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary/20 hover:text-primary text-xs font-semibold text-on-surface flex items-center gap-1 transition-all">
                    <span class="material-symbols-outlined text-[14px]">play_arrow</span> Run Now
                  </button>
                </div>
                <button type="button" data-timer-delete="${t.id}" class="p-1 rounded-lg hover:bg-rose-500/20 text-on-surface-variant hover:text-rose-600 transition-all" title="Delete timer">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- DUAL-MODE SCRIPT & VISUAL EDITOR MODAL -->
      ${isEditorOpen ? `
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="w-full max-w-3xl rounded-2xl bg-surface border border-outline-variant/50 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <!-- MODAL HEADER -->
            <div class="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-2xl">edit_calendar</span>
                <h3 class="text-base font-bold text-on-surface">
                  ${editingTimerId ? `Edit Timer "${editingTimerId}"` : "Create New Timer"}
                </h3>
              </div>
              <button type="button" id="timer-modal-close" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface">✕</button>
            </div>

            <!-- MODAL BODY -->
            <div class="p-4 overflow-y-auto space-y-4 flex-1">
              <div class="flex items-center justify-between">
                <p class="text-xs text-on-surface-variant">
                  Write or paste your timer definition using the deterministic action DSL format.
                </p>
                <button type="button" id="timer-validate-dsl-btn" class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">check_circle</span> Validate Syntax
                </button>
              </div>

              ${dslParseError ? `
                <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono">
                  ${dslParseError}
                </div>` : ""}

              ${dslParseWarning ? `
                <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
                  ${dslParseWarning}
                </div>` : ""}

              <div class="relative">
                <textarea id="timer-dsl-textarea" rows="18" class="w-full font-mono text-xs p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y leading-relaxed" placeholder="@timer example&#10;  name: &quot;My Timer&quot;&#10;@schedule&#10;  days: Sun&#10;  start: 10:00&#10;@on-start&#10;  piprogram cue &quot;welcome&quot;">${dslTextValue}</textarea>
              </div>

              <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1 text-xs text-on-surface-variant">
                <span class="font-bold text-on-surface">DSL Quick Syntax:</span>
                <p>• Directives: <code>@timer &lt;id&gt;</code>, <code>@schedule</code>, <code>@warning &lt;N&gt;m</code>, <code>@on-start</code>, <code>@on-end</code>, <code>@on-failure</code></p>
                <p>• Polling & conditions: <code>wait 5s</code>, <code>wait-until "command" contains "ready"</code>, <code>check "command" --else "fail-cmd"</code></p>
                <p>• Notifications & lights: <code>pinotify: "message"</code>, <code>pitally: tally01 amber blink</code></p>
              </div>
            </div>

            <!-- MODAL FOOTER -->
            <div class="p-4 border-t border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
              <button type="button" id="timer-modal-cancel" class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface">
                Cancel
              </button>
              <button type="button" id="timer-modal-save" class="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-xs flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">save</span> Save Timer
              </button>
            </div>
          </div>
        </div>
      ` : ""}

      <!-- RUN HISTORY & LOGS DRAWER -->
      ${isRunsDrawerOpen ? `
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div class="w-full max-w-xl h-full bg-surface border-l border-outline-variant/50 shadow-2xl flex flex-col">
            <div class="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-xl">history</span>
                <h3 class="text-base font-bold text-on-surface">Execution History & Logs</h3>
              </div>
              <button type="button" id="timer-runs-close" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant">✕</button>
            </div>

            <div class="p-4 overflow-y-auto space-y-3 flex-1">
              ${recentRuns.length === 0 ? `
                <div class="text-center py-12 text-xs text-on-surface-variant">No run history recorded yet</div>
              ` : recentRuns.map((r) => {
                const isRunning = r.status === "running";
                const isFailed = r.status === "failed";
                const isSuccess = r.status === "completed";

                const badgeColor = isRunning ? "bg-primary text-on-primary animate-pulse" : isFailed ? "bg-rose-500/20 text-rose-600" : isSuccess ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-500/20 text-slate-500";

                return `
                  <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor} uppercase">${r.status}</span>
                        <span class="text-xs font-bold text-on-surface">${r.timerName}</span>
                        <span class="text-[11px] text-on-surface-variant font-mono">(${r.phase})</span>
                      </div>
                      ${isRunning ? `
                        <button type="button" data-run-cancel="${r.runId}" class="px-2 py-0.5 rounded bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold">
                          Cancel
                        </button>
                      ` : `
                        <span class="text-[10px] text-on-surface-variant font-mono">${new Date(r.startedAt).toLocaleTimeString()}</span>
                      `}
                    </div>

                    ${r.steps && r.steps.length > 0 ? `
                      <div class="mt-2 space-y-1 bg-surface-container-lowest p-2 rounded-lg font-mono text-[11px]">
                        ${r.steps.map(s => `
                          <div class="flex items-start justify-between gap-2 text-on-surface">
                            <span class="truncate flex-1">${s.command}</span>
                            <span class="${s.error ? 'text-rose-500' : 'text-emerald-500'} font-semibold">${s.durationMs}ms</span>
                          </div>
                          ${s.stdout ? `<div class="text-[10px] text-on-surface-variant/80 pl-2 border-l border-outline-variant/40 whitespace-pre-wrap">${s.stdout.slice(0, 200)}</div>` : ""}
                        `).join("")}
                      </div>
                    ` : ""}

                    ${r.error ? `
                      <div class="p-2 rounded bg-rose-500/10 text-rose-600 font-mono text-[11px]">${r.error}</div>
                    ` : ""}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;

  bindEvents();
}

function bindEvents(): void {
  if (!containerEl) return;

  // Error & Success dismiss
  const dismissErr = containerEl.querySelector<HTMLButtonElement>("#timer-dismiss-error");
  if (dismissErr) dismissErr.onclick = () => { errorMessage = null; render(); };

  const dismissSuccess = containerEl.querySelector<HTMLButtonElement>("#timer-dismiss-success");
  if (dismissSuccess) dismissSuccess.onclick = () => { successMessage = null; render(); };

  // Mute buttons
  containerEl.querySelectorAll<HTMLButtonElement>(".timer-mute-btn").forEach((btn) => {
    btn.onclick = () => {
      const dur = btn.getAttribute("data-mute") as "8h" | "24h" | "1w" | "permanent";
      void setMute(dur);
    };
  });

  const unmuteBtn = containerEl.querySelector<HTMLButtonElement>("#timer-unmute-btn");
  if (unmuteBtn) unmuteBtn.onclick = () => void clearMute();

  // New timer buttons
  const newBtn = containerEl.querySelector<HTMLButtonElement>("#timer-new-btn");
  if (newBtn) newBtn.onclick = openCreateModal;

  const emptyNewBtn = containerEl.querySelector<HTMLButtonElement>("#timer-empty-new-btn");
  if (emptyNewBtn) emptyNewBtn.onclick = openCreateModal;

  // History button
  const historyBtn = containerEl.querySelector<HTMLButtonElement>("#timer-history-btn");
  if (historyBtn) historyBtn.onclick = () => { isRunsDrawerOpen = true; render(); };

  const viewActiveBtn = containerEl.querySelector<HTMLButtonElement>("#timer-view-active-runs-btn");
  if (viewActiveBtn) viewActiveBtn.onclick = () => { isRunsDrawerOpen = true; render(); };

  const runsCloseBtn = containerEl.querySelector<HTMLButtonElement>("#timer-runs-close");
  if (runsCloseBtn) runsCloseBtn.onclick = () => { isRunsDrawerOpen = false; render(); };

  // Timer card toggles
  containerEl.querySelectorAll<HTMLInputElement>("input[data-timer-toggle]").forEach((inp) => {
    inp.onchange = () => {
      const id = inp.getAttribute("data-timer-toggle")!;
      void toggleTimerEnabled(id, !inp.checked);
    };
  });

  // Single timer snooze buttons
  containerEl.querySelectorAll<HTMLButtonElement>("button[data-single-mute]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-single-mute")!;
      const dur = (btn.getAttribute("data-dur") || "1h") as "1h" | "8h" | "24h";
      void muteSingleTimer(id, dur);
    };
  });

  // Single timer unmute buttons
  containerEl.querySelectorAll<HTMLButtonElement>("button[data-single-unmute]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-single-unmute")!;
      void unmuteSingleTimer(id);
    };
  });

  // Timer card edit buttons
  containerEl.querySelectorAll<HTMLButtonElement>("button[data-timer-edit]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-timer-edit")!;
      const timer = timers.find((t) => t.id === id);
      if (timer) openEditModal(timer);
    };
  });

  // Timer card run now buttons
  containerEl.querySelectorAll<HTMLButtonElement>("button[data-timer-run]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-timer-run")!;
      void runTimerNow(id, "start");
    };
  });

  // Timer card delete buttons
  containerEl.querySelectorAll<HTMLButtonElement>("button[data-timer-delete]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-timer-delete")!;
      void deleteTimer(id);
    };
  });

  // Run cancellation
  containerEl.querySelectorAll<HTMLButtonElement>("button[data-run-cancel]").forEach((btn) => {
    btn.onclick = () => {
      const runId = btn.getAttribute("data-run-cancel")!;
      void cancelRun(runId);
    };
  });

  // Modal events
  const modalClose = containerEl.querySelector<HTMLButtonElement>("#timer-modal-close");
  if (modalClose) modalClose.onclick = () => { isEditorOpen = false; render(); };

  const modalCancel = containerEl.querySelector<HTMLButtonElement>("#timer-modal-cancel");
  if (modalCancel) modalCancel.onclick = () => { isEditorOpen = false; render(); };

  const modalValidate = containerEl.querySelector<HTMLButtonElement>("#timer-validate-dsl-btn");
  if (modalValidate) {
    modalValidate.onclick = () => {
      const area = containerEl?.querySelector<HTMLTextAreaElement>("#timer-dsl-textarea");
      if (area) dslTextValue = area.value;
      void validateDsl();
    };
  }

  const modalSave = containerEl.querySelector<HTMLButtonElement>("#timer-modal-save");
  if (modalSave) {
    modalSave.onclick = () => {
      const area = containerEl?.querySelector<HTMLTextAreaElement>("#timer-dsl-textarea");
      if (area) dslTextValue = area.value;
      void saveEditorTimer();
    };
  }
}
