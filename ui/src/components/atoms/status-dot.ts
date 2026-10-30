export type StatusState =
  | "online"
  | "offline"
  | "live"
  | "warning"
  | "standby"
  | "error"
  | "busy"
  | "good"
  | "poor"
  | "noData";

export interface StatusDotProps {
  status: StatusState;
  pulse?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  id?: string;
  title?: string;
}

export function renderStatusDot(props: StatusDotProps): string {
  const sizeClass = props.size === "xs"
    ? "w-1.5 h-1.5"
    : props.size === "sm"
      ? "w-2 h-2"
      : props.size === "lg"
        ? "w-3 h-3"
        : "w-2.5 h-2.5";

  let colorClass = "bg-slate-400";
  let pulseDefault = false;

  switch (props.status) {
    case "online":
    case "good":
      colorClass = "bg-emerald-500";
      break;
    case "live":
      colorClass = "bg-red-500";
      pulseDefault = true;
      break;
    case "warning":
    case "poor":
    case "standby":
      colorClass = "bg-amber-500";
      break;
    case "error":
      colorClass = "bg-error";
      break;
    case "busy":
      colorClass = "bg-primary";
      pulseDefault = true;
      break;
    case "offline":
    case "noData":
    default:
      colorClass = "bg-outline/50";
      break;
  }

  const shouldPulse = props.pulse ?? pulseDefault;
  const pulseClass = shouldPulse ? "animate-pulse" : "";
  const idAttr = props.id ? ` id="${props.id}"` : "";
  const titleAttr = props.title ? ` title="${props.title}"` : "";
  const extraClass = props.className ?? "";

  return `<span${idAttr}${titleAttr} class="inline-block rounded-full flex-shrink-0 ${sizeClass} ${colorClass} ${pulseClass} ${extraClass}"></span>`;
}
