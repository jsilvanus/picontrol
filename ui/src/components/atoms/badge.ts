import { renderStatusDot, type StatusState } from "./status-dot.js";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "accent"
  | "crop"
  | "ftb"
  | "outline";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "xs" | "sm" | "md";
  dot?: boolean | StatusState;
  pulse?: boolean;
  icon?: string;
  className?: string;
  id?: string;
  title?: string;
}

export function renderBadge(props: BadgeProps): string {
  const sizeClass = props.size === "xs"
    ? "px-1.5 py-0.5 text-[9px]"
    : props.size === "md"
      ? "px-3 py-1 text-[11px]"
      : "px-2 py-0.5 text-[10px]";

  let variantClass = "bg-surface-container-high text-on-surface-variant border border-outline-variant/30";

  switch (props.variant) {
    case "primary":
      variantClass = "bg-primary text-on-primary";
      break;
    case "secondary":
      variantClass = "bg-secondary-container text-on-secondary-container";
      break;
    case "success":
      variantClass = "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30";
      break;
    case "warning":
      variantClass = "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30";
      break;
    case "error":
      variantClass = "bg-error text-on-error";
      break;
    case "crop":
      variantClass = "bg-secondary-container text-on-secondary-container";
      break;
    case "ftb":
      variantClass = "bg-error text-on-error animate-pulse";
      break;
    case "outline":
      variantClass = "bg-transparent text-on-surface border border-outline-variant/40";
      break;
    case "accent":
      variantClass = "bg-primary-fixed text-on-primary-fixed border border-primary/20";
      break;
    case "neutral":
    default:
      variantClass = "bg-surface-container-high text-on-surface-variant border border-outline-variant/30";
      break;
  }

  const pulseClass = props.pulse ? "animate-pulse" : "";
  const idAttr = props.id ? ` id="${props.id}"` : "";
  const titleAttr = props.title ? ` title="${props.title}"` : "";
  const extraClass = props.className ?? "";

  let dotHtml = "";
  if (props.dot) {
    const dotStatus: StatusState = typeof props.dot === "string" ? props.dot : "online";
    dotHtml = renderStatusDot({ status: dotStatus, size: "xs", pulse: props.pulse });
  }

  const iconHtml = props.icon
    ? `<span class="material-symbols-outlined text-[13px] leading-none">${props.icon}</span>`
    : "";

  return `<span${idAttr}${titleAttr} class="inline-flex items-center gap-1 rounded-full font-label-sm font-bold uppercase tracking-wider ${sizeClass} ${variantClass} ${pulseClass} ${extraClass}">
    ${dotHtml}
    ${iconHtml}
    <span>${props.label}</span>
  </span>`;
}
