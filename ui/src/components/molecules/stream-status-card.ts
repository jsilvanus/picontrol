import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderCard } from "../atoms/card.js";
import { renderStatDisplay } from "../atoms/stat-display.js";

export type BroadcastState = "idle" | "ready" | "testing" | "live" | "complete" | "unknown";
export type StreamHealth = "good" | "ok" | "poor" | "noData" | "unknown";

export interface StreamStatusCardProps {
  state: BroadcastState;
  health: StreamHealth;
  broadcastTitle?: string;
  privacy?: "public" | "unlisted" | "private";
  embedUrl?: string;
  captionsSent?: number;
  captionsDropped?: number;
  lastSentAt?: number | string | null;
  gatewayConnected?: boolean;
  onStartClickAttr?: string;
  onStopClickAttr?: string;
  onCreateClickAttr?: string;
  onViewClickAttr?: string;
  className?: string;
}

export function renderStreamStatusCard(props: StreamStatusCardProps): string {
  const isLive = props.state === "live";
  const isTesting = props.state === "testing";
  const isReady = props.state === "ready";

  // State badge
  let stateVariant: "success" | "warning" | "error" | "neutral" = "neutral";
  let stateLabel = props.state.toUpperCase();

  if (isLive) {
    stateVariant = "error";
    stateLabel = "LIVE ON AIR";
  } else if (isTesting) {
    stateVariant = "warning";
    stateLabel = "TESTING";
  } else if (isReady) {
    stateVariant = "success";
    stateLabel = "READY";
  }

  const stateBadge = renderBadge({
    label: stateLabel,
    variant: stateVariant,
    dot: isLive ? "live" : isTesting ? "warning" : isReady ? "online" : "offline",
    pulse: isLive || isTesting,
    size: "sm"
  });

  // Health badge
  let healthVariant: "success" | "warning" | "error" | "neutral" = "neutral";
  if (props.health === "good") healthVariant = "success";
  else if (props.health === "ok") healthVariant = "warning";
  else if (props.health === "poor") healthVariant = "error";

  const healthBadge = renderBadge({
    label: `HEALTH: ${props.health.toUpperCase()}`,
    variant: healthVariant,
    size: "xs"
  });

  // Action buttons
  const startBtn = (isReady || isTesting)
    ? renderButton({
        label: isTesting ? "Go Live Now" : "Start Broadcast",
        icon: "podcasts",
        variant: "primary",
        size: "sm",
        onClickAttr: props.onStartClickAttr
      })
    : "";

  const stopBtn = (isLive || isTesting)
    ? renderButton({
        label: "End Stream",
        icon: "stop_circle",
        variant: "danger",
        size: "sm",
        onClickAttr: props.onStopClickAttr
      })
    : "";

  const createBtn = renderButton({
    label: "New Ad-Hoc",
    icon: "add",
    variant: "surface-high",
    size: "sm",
    onClickAttr: props.onCreateClickAttr
  });

  const viewBtn = props.embedUrl
    ? renderButton({
        label: "Watch Feed",
        icon: "open_in_new",
        variant: "ghost",
        size: "sm",
        onClickAttr: props.onViewClickAttr ?? `window.open('${props.embedUrl}', '_blank')`
      })
    : "";

  const titleText = props.broadcastTitle ?? "No broadcast selected (Auto-detecting next event)";
  const privacyText = props.privacy ? props.privacy.toUpperCase() : "PUBLIC";

  const statsRow = `<div class="grid grid-cols-3 gap-2 pt-1">
    ${renderStatDisplay({ label: "Captions Sent", value: props.captionsSent ?? 0, size: "sm", color: "success" })}
    ${renderStatDisplay({ label: "Captions Dropped", value: props.captionsDropped ?? 0, size: "sm", alert: (props.captionsDropped ?? 0) > 0, color: (props.captionsDropped ?? 0) > 0 ? "error" : "neutral" })}
    ${renderStatDisplay({ label: "Gateway Link", value: props.gatewayConnected ? "ACTIVE" : "OFFLINE", size: "sm", color: props.gatewayConnected ? "success" : "neutral" })}
  </div>`;

  const content = `<div class="space-y-3">
    <div class="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-surface-container border border-outline-variant/30">
      <div class="min-w-0">
        <span class="text-[10px] font-label-sm text-on-surface-variant uppercase font-bold block">Selected Broadcast</span>
        <h4 class="font-headline-sm text-[14px] font-bold text-on-surface truncate">${titleText}</h4>
        <span class="text-[10px] font-mono text-on-surface-variant">${privacyText} • YouTube Live</span>
      </div>
      <div class="flex flex-col items-end gap-1 flex-shrink-0">
        ${healthBadge}
      </div>
    </div>

    ${statsRow}

    <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-outline-variant/20">
      <div class="flex items-center gap-1.5">
        ${createBtn}
        ${viewBtn}
      </div>
      <div class="flex items-center gap-1.5">
        ${stopBtn}
        ${startBtn}
      </div>
    </div>
  </div>`;

  return renderCard({
    title: "YouTube Live Broadcast",
    subtitle: "PiTube Lifecycle Coordinator & RTMP Pipeline",
    icon: "smart_display",
    badgeHtml: stateBadge,
    content,
    className: props.className
  });
}
