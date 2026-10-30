export interface StatDisplayProps {
  label: string;
  value: string | number;
  sublabel?: string;
  unit?: string;
  alert?: boolean;
  color?: "primary" | "success" | "warning" | "error" | "neutral";
  size?: "sm" | "md" | "lg";
  id?: string;
  className?: string;
}

export function renderStatDisplay(props: StatDisplayProps): string {
  const sizeClass = props.size === "sm"
    ? "p-1.5 text-[10px]"
    : props.size === "lg"
      ? "p-3 text-[14px]"
      : "p-2 text-[11px]";

  let valueColor = "text-on-surface";
  if (props.alert || props.color === "error") {
    valueColor = "text-error";
  } else if (props.color === "success") {
    valueColor = "text-emerald-600 dark:text-emerald-400";
  } else if (props.color === "warning") {
    valueColor = "text-amber-600 dark:text-amber-400";
  } else if (props.color === "primary") {
    valueColor = "text-primary";
  }

  const idAttr = props.id ? ` id="${props.id}"` : "";
  const extraClass = props.className ?? "";

  return `<div${idAttr} class="rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col justify-between ${sizeClass} ${extraClass}">
    <span class="text-on-surface-variant block uppercase font-bold text-[9px] tracking-wider truncate">${props.label}</span>
    <div class="flex items-baseline gap-1 mt-0.5">
      <span class="font-bold font-mono text-[14px] leading-tight ${valueColor}">${props.value}</span>
      ${props.unit ? `<span class="text-[10px] font-mono text-on-surface-variant">${props.unit}</span>` : ""}
    </div>
    ${props.sublabel ? `<span class="text-[9px] text-on-surface-variant/80 mt-0.5 truncate">${props.sublabel}</span>` : ""}
  </div>`;
}
