export interface ModelBadgeProps {
  model: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function renderModelBadge(props: ModelBadgeProps): string {
  const { model, size = "sm" } = props;

  const sizeClass =
    size === "xs"
      ? "px-1.5 py-0.2 text-[8px]"
      : size === "md"
        ? "px-2.5 py-0.5 text-xs"
        : "px-2 py-0.5 text-[9px]";

  // Clean tag (e.g. "llama3.2:3b" -> "Llama 3.2 3B")
  const displayName = model.replace(':latest', '');

  return `
    <span class="inline-flex items-center font-mono font-medium rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant/40 ${sizeClass} ${props.className || ""}" title="Model: ${model}">
      <svg class="w-2.5 h-2.5 mr-1 text-primary opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span>${displayName}</span>
    </span>
  `.trim();
}
