import { renderButton } from "../atoms/button.js";
import { renderStatusDot } from "../atoms/status-dot.js";

export interface AgentControlToolbarProps {
  agents: Array<{ id: string; name: string; status: string }>;
  selectedAgentId?: string;
  ollamaConnected: boolean;
  runningAgentsCount: number;
  className?: string;
}

export function renderAgentControlToolbar(props: AgentControlToolbarProps): string {
  const { agents, selectedAgentId, ollamaConnected, runningAgentsCount } = props;

  const agentOptions = agents
    .map(
      a =>
        `<option value="${a.id}" ${a.id === selectedAgentId ? "selected" : ""}>${a.name} (${a.status.toUpperCase()})</option>`
    )
    .join("\n");

  const stopAllBtn = renderButton({
    label: `Stop All (${runningAgentsCount})`,
    variant: runningAgentsCount > 0 ? "danger" : "surface",
    size: "xs",
    icon: "stop",
    disabled: runningAgentsCount === 0,
    dataAttributes: { action: "emergency-stop-all" },
  });

  const newAgentBtn = renderButton({
    label: "New Agent",
    variant: "secondary",
    size: "xs",
    icon: "plus",
    dataAttributes: { action: "open-create-agent-modal" },
  });

  return `
    <div class="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shadow-xs ${props.className || ""}">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 text-xs font-mono">
          <span class="inline-flex">${renderStatusDot({ status: ollamaConnected ? "online" : "error", size: "sm" })}</span>
          <span class="text-on-surface-variant font-medium">Ollama: ${ollamaConnected ? "ONLINE" : "OFFLINE"}</span>
        </div>

        <div class="h-4 w-px bg-outline-variant/30"></div>

        <div class="flex items-center gap-1.5">
          <label for="agent-selector" class="text-xs font-medium text-on-surface-variant">Active Agent:</label>
          <select id="agent-selector" class="px-2 py-1 text-xs font-mono rounded bg-surface-container-high border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
            ${agentOptions}
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2">
        ${newAgentBtn}
        ${stopAllBtn}
      </div>
    </div>
  `.trim();
}
