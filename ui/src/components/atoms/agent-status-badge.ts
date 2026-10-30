import { renderStatusDot } from "./status-dot.js";

export type AgentStatusType = "idle" | "running" | "interrupted" | "error";

export interface AgentStatusBadgeProps {
  status: AgentStatusType;
  showDot?: boolean;
  pulse?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function renderAgentStatusBadge(props: AgentStatusBadgeProps): string {
  const { status, showDot = true, size = "sm" } = props;

  const sizeClass =
    size === "xs"
      ? "px-1.5 py-0.5 text-[9px]"
      : size === "md"
        ? "px-3 py-1 text-xs"
        : "px-2 py-0.5 text-[10px]";

  let colorClasses = "";
  let dotStatus: "online" | "standby" | "offline" | "error" = "standby";
  let label = status.toUpperCase();

  switch (status) {
    case "running":
      colorClasses = "bg-primary/15 text-primary border border-primary/30";
      dotStatus = "online";
      label = "RUNNING";
      break;
    case "interrupted":
      colorClasses = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
      dotStatus = "error";
      label = "INTERRUPTED";
      break;
    case "error":
      colorClasses = "bg-error/15 text-error border border-error/30";
      dotStatus = "error";
      label = "ERROR";
      break;
    case "idle":
    default:
      colorClasses = "bg-surface-container-high text-on-surface-variant border border-outline-variant/30";
      dotStatus = "standby";
      label = "IDLE";
      break;
  }

  const dotHtml = showDot
    ? `<span class="inline-flex mr-1.5">${renderStatusDot({
        status: dotStatus,
        pulse: status === "running" || props.pulse,
        size: size === "xs" ? "xs" : "sm",
      })}</span>`
    : "";

  return `
    <span class="inline-flex items-center font-mono font-medium rounded-full tracking-wider uppercase ${sizeClass} ${colorClasses} ${props.className || ""}">
      ${dotHtml}
      <span>${label}</span>
    </span>
  `.trim();
}
