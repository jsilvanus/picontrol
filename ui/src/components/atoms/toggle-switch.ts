export interface ToggleOption {
  value: string;
  label: string;
  icon?: string;
}

export interface ToggleSwitchProps {
  options: ToggleOption[];
  selectedValue: string;
  actionName?: string;
  sectionName?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
  className?: string;
}

export function renderToggleSwitch(props: ToggleSwitchProps): string {
  const sizeClass = props.size === "sm" ? "p-0.5 text-[10px]" : "p-1 text-[11px]";
  const idAttr = props.id ? ` id="${props.id}"` : "";
  const extraClass = props.className ?? "";

  const buttonsHtml = props.options.map(opt => {
    const active = opt.value === props.selectedValue;
    const activeClass = active
      ? "bg-primary text-on-primary shadow-sm"
      : "text-on-surface-variant bg-transparent hover:text-on-surface hover:bg-surface-container";

    const iconHtml = opt.icon
      ? `<span class="material-symbols-outlined text-[13px] leading-none">${opt.icon}</span>`
      : "";

    const actionAttr = props.actionName ? ` data-action="${props.actionName}"` : "";
    const sectionAttr = props.sectionName ? ` data-section="${props.sectionName}"` : "";
    const disabledAttr = props.disabled ? " disabled" : "";

    return `<button
      type="button"
      data-value="${opt.value}"
      ${actionAttr}
      ${sectionAttr}
      ${disabledAttr}
      class="flex-1 py-1 px-2 rounded-md font-label-sm uppercase font-bold transition-all inline-flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40 ${activeClass}"
    >
      ${iconHtml}
      <span>${opt.label}</span>
    </button>`;
  }).join("");

  return `<div${idAttr} class="flex gap-1 bg-surface-container-highest rounded-lg ${sizeClass} ${extraClass}">
    ${buttonsHtml}
  </div>`;
}
