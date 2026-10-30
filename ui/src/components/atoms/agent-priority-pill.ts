export type AgentPriorityType = "realtime" | "interactive" | "background";

export interface AgentPriorityPillProps {
  priority: AgentPriorityType;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function renderAgentPriorityPill(props: AgentPriorityPillProps): string {
  const { priority, size = "sm" } = props;

  const sizeClass =
    size === "xs"
      ? "px-1.5 py-0.2 text-[8px]"
      : size === "md"
        ? "px-2.5 py-0.5 text-[11px]"
        : "px-2 py-0.5 text-[9px]";

  let colorClasses = "";
  let icon = "";
  let label = priority.toUpperCase();

  switch (priority) {
    case "realtime":
      colorClasses = "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30";
      icon = `<svg class="w-2.5 h-2.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`;
      label = "REALTIME (100)";
      break;
    case "interactive":
      colorClasses = "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30";
      icon = `<svg class="w-2.5 h-2.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`;
      label = "INTERACTIVE (50)";
      break;
    case "background":
    default:
      colorClasses = "bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30";
      icon = `<svg class="w-2.5 h-2.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
      label = "BACKGROUND (10)";
      break;
  }

  return `
    <span class="inline-flex items-center font-mono font-semibold rounded tracking-wider ${sizeClass} ${colorClasses} ${props.className || ""}">
      ${icon}
      <span>${label}</span>
    </span>
  `.trim();
}
