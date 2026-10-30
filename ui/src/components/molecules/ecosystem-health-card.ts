import { renderBadge } from "../atoms/badge.js";
import { renderCard } from "../atoms/card.js";
import { renderStatusDot, type StatusState } from "../atoms/status-dot.js";

export interface EcosystemComponentStatus {
  name: string;
  repo: string;
  description: string;
  port?: number;
  status: "ok" | "degraded" | "down" | "unconfigured" | "unknown";
  latencyMs?: number;
  version?: string;
  lastPing?: number | string;
  epoch?: string;
}

export interface EcosystemHealthCardProps {
  component: EcosystemComponentStatus;
  className?: string;
}

export function renderEcosystemHealthCard(props: EcosystemHealthCardProps): string {
  const c = props.component;

  let dotStatus: StatusState = "offline";
  let badgeVariant: "success" | "warning" | "error" | "neutral" = "neutral";

  switch (c.status) {
    case "ok":
      dotStatus = "online";
      badgeVariant = "success";
      break;
    case "degraded":
      dotStatus = "warning";
      badgeVariant = "warning";
      break;
    case "down":
      dotStatus = "error";
      badgeVariant = "error";
      break;
    default:
      dotStatus = "offline";
      badgeVariant = "neutral";
      break;
  }

  const statusBadge = renderBadge({
    label: c.status.toUpperCase(),
    variant: badgeVariant,
    dot: dotStatus,
    size: "xs"
  });

  const content = `<div class="space-y-2">
    <p class="text-[12px] font-body-sm text-on-surface-variant leading-snug">${c.description}</p>
    <div class="flex items-center justify-between text-[10px] font-mono text-on-surface-variant pt-1 border-t border-outline-variant/20">
      <span>Repo: <strong>${c.repo}</strong></span>
      ${c.port ? `<span>Port: :${c.port}</span>` : ""}
      ${c.latencyMs !== undefined ? `<span>${c.latencyMs} ms</span>` : ""}
    </div>
  </div>`;

  return renderCard({
    title: c.name,
    subtitle: c.version ? `v${c.version}` : undefined,
    badgeHtml: statusBadge,
    content,
    className: props.className
  });
}
