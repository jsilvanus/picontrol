export interface AgentChatBubbleProps {
  id: string;
  role: "user" | "assistant" | "system" | "thought";
  content: string;
  agentName?: string;
  timestamp?: string;
  isStreaming?: boolean;
  className?: string;
}

export function renderAgentChatBubble(props: AgentChatBubbleProps): string {
  const { id, role, content, agentName, timestamp, isStreaming } = props;

  const isUser = role === "user";
  const isThought = role === "thought";
  const isSystem = role === "system";

  let containerClasses = "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed transition-all";
  let wrapperClasses = "flex w-full";

  if (isUser) {
    wrapperClasses += " justify-end";
    containerClasses += " bg-primary text-on-primary rounded-br-xs";
  } else if (isThought) {
    wrapperClasses += " justify-start";
    containerClasses += " bg-surface-container-highest/60 text-on-surface-variant font-mono text-[11px] border border-outline-variant/30 rounded-bl-xs italic";
  } else if (isSystem) {
    wrapperClasses += " justify-center";
    containerClasses += " bg-surface-container-low text-on-surface-variant text-[10px] font-mono border border-outline-variant/20 rounded-md py-1 px-3 text-center";
  } else {
    // Assistant
    wrapperClasses += " justify-start";
    containerClasses += " bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-bl-xs";
  }

  const cursorHtml = isStreaming
    ? `<span class="inline-block w-1.5 h-3 ml-1 bg-current animate-pulse align-middle"></span>`
    : "";

  const timeHtml = timestamp
    ? `<span class="text-[9px] opacity-60 font-mono mt-1 ${isUser ? 'text-right' : 'text-left'}">${timestamp}</span>`
    : "";

  const senderTag = agentName && !isUser && !isSystem
    ? `<span class="text-[9px] font-semibold tracking-wider uppercase opacity-75 mb-1 font-mono">${isThought ? 'Thought Trace' : agentName}</span>`
    : "";

  return `
    <div class="${wrapperClasses} ${props.className || ""}" data-message-id="${id}">
      <div class="${containerClasses}">
        ${senderTag}
        <div class="whitespace-pre-wrap break-words">${content}${cursorHtml}</div>
        ${timeHtml}
      </div>
    </div>
  `.trim();
}
