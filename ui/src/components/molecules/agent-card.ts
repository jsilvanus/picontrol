import { renderAgentStatusBadge, type AgentStatusType } from "../atoms/agent-status-badge.js";
import { renderAgentPriorityPill, type AgentPriorityType } from "../atoms/agent-priority-pill.js";
import { renderModelBadge } from "../atoms/model-badge.js";
import { renderButton } from "../atoms/button.js";

export interface AgentCardProps {
  id: string;
  name: string;
  description?: string;
  model: string;
  priority: AgentPriorityType;
  status: AgentStatusType;
  currentTurnId?: string;
  toolsCount?: number;
  unreadCount?: number;
  lastExecutionAt?: string;
  className?: string;
}

export function renderAgentCard(props: AgentCardProps): string {
  const {
    id,
    name,
    description = "",
    model,
    priority,
    status,
    toolsCount = 0,
    unreadCount = 0,
  } = props;

  const isRunning = status === "running";

  const stopBtn = isRunning
    ? renderButton({
        label: "Emergency Stop",
        variant: "danger",
        size: "xs",
        icon: "stop",
        dataAttributes: { action: "stop-agent", agentId: id },
      })
    : "";

  const chatBtn = renderButton({
    label: "Open Chat",
    variant: "primary",
    size: "xs",
    icon: "chat",
    dataAttributes: { action: "open-agent-chat", agentId: id },
  });

  const unreadPill = unreadCount > 0
    ? `<span class="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-primary text-on-primary">${unreadCount} unread</span>`
    : "";

  return `
    <div class="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-3 shadow-xs transition-all hover:border-outline-variant/60 ${props.className || ""}" data-agent-id="${id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-on-surface tracking-tight">${name}</span>
            <span class="text-[10px] font-mono text-on-surface-variant/70">#${id}</span>
            ${unreadPill}
          </div>
          ${description ? `<p class="text-xs text-on-surface-variant line-clamp-1 mt-0.5">${description}</p>` : ""}
        </div>
        ${renderAgentStatusBadge({ status, size: "xs" })}
      </div>

      <div class="flex flex-wrap items-center gap-1.5 text-xs">
        ${renderModelBadge({ model, size: "xs" })}
        ${renderAgentPriorityPill({ priority, size: "xs" })}
        ${toolsCount > 0 ? `<span class="px-2 py-0.5 text-[9px] font-mono rounded bg-surface-container-high text-on-surface-variant">${toolsCount} tools</span>` : ""}
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20 mt-auto">
        <div class="text-[10px] text-on-surface-variant/60 font-mono">
          ${props.lastExecutionAt ? `Last active: ${new Date(props.lastExecutionAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Standby"}
        </div>
        <div class="flex items-center gap-1.5">
          ${stopBtn}
          ${chatBtn}
        </div>
      </div>
    </div>
  `.trim();
}
