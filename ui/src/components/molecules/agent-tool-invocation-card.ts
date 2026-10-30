export interface AgentToolInvocationProps {
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "executed" | "error";
  error?: string;
  className?: string;
}

export function renderAgentToolInvocationCard(props: AgentToolInvocationProps): string {
  const { tool, args, result, status, error } = props;

  let statusBadge = "";
  let borderClass = "border-outline-variant/30";

  switch (status) {
    case "pending":
      statusBadge = `<span class="px-1.5 py-0.5 text-[9px] font-mono rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">CALLING...</span>`;
      borderClass = "border-amber-500/40";
      break;
    case "executed":
      statusBadge = `<span class="px-1.5 py-0.5 text-[9px] font-mono rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">EXECUTED</span>`;
      borderClass = "border-emerald-500/30";
      break;
    case "error":
      statusBadge = `<span class="px-1.5 py-0.5 text-[9px] font-mono rounded bg-rose-500/15 text-rose-500 border border-rose-500/30">FAILED</span>`;
      borderClass = "border-rose-500/40";
      break;
  }

  const argsJson = JSON.stringify(args, null, 2);
  const resultJson = result !== undefined ? JSON.stringify(result, null, 2) : "";

  return `
    <div class="my-1.5 p-2.5 rounded-lg bg-surface-container-low border ${borderClass} text-xs font-mono max-w-full overflow-hidden ${props.className || ""}">
      <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-outline-variant/20">
        <div class="flex items-center gap-1.5 font-semibold text-primary">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>tool: ${tool}</span>
        </div>
        ${statusBadge}
      </div>

      <div class="mt-2 text-[10px] text-on-surface-variant overflow-x-auto">
        <div class="opacity-70 mb-0.5">Parameters:</div>
        <pre class="bg-surface-container-highest/50 p-1.5 rounded overflow-x-auto">${argsJson}</pre>
      </div>

      ${error ? `<div class="mt-2 text-[10px] text-error bg-error/10 p-1.5 rounded border border-error/20">Error: ${error}</div>` : ""}

      ${resultJson && !error ? `
        <div class="mt-2 text-[10px] text-on-surface-variant overflow-x-auto">
          <div class="opacity-70 mb-0.5">Result:</div>
          <pre class="bg-surface-container-highest/50 p-1.5 rounded overflow-x-auto text-emerald-600 dark:text-emerald-400">${resultJson}</pre>
        </div>
      ` : ""}
    </div>
  `.trim();
}
