export interface MeterProps {
  value: number; // e.g. -60 to 0 (dBFS), or 0 to 100 (%)
  min?: number;
  max?: number;
  orientation?: "horizontal" | "vertical";
  showTicks?: boolean;
  alertLevel?: number; // threshold above which it turns amber/red
  id?: string;
  className?: string;
  label?: string;
}

export function renderMeter(props: MeterProps): string {
  const min = props.min ?? -60;
  const max = props.max ?? 0;
  const clamped = Math.max(min, Math.min(max, props.value));
  const percent = Math.max(0, Math.min(100, ((clamped - min) / (max - min)) * 100));

  let colorClass = "bg-emerald-500";
  if (percent > 90) {
    colorClass = "bg-red-500";
  } else if (percent > 75) {
    colorClass = "bg-amber-500";
  }

  const idAttr = props.id ? ` id="${props.id}"` : "";
  const extraClass = props.className ?? "";

  if (props.orientation === "vertical") {
    return `<div class="flex flex-col items-center gap-1 ${extraClass}">
      <div${idAttr} class="w-2.5 h-24 bg-surface-container-highest rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-outline-variant/30">
        <div class="w-full rounded-full transition-all duration-75 ${colorClass}" style="height: ${percent}%;"></div>
      </div>
      ${props.label ? `<span class="text-[9px] font-mono text-on-surface-variant">${props.label}</span>` : ""}
    </div>`;
  }

  return `<div class="w-full ${extraClass}">
    ${props.label ? `<div class="flex justify-between text-[9px] font-mono text-on-surface-variant mb-0.5"><span>${props.label}</span><span>${Math.round(clamped)} dB</span></div>` : ""}
    <div${idAttr} class="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
      <div class="h-full rounded-full transition-all duration-75 ${colorClass}" style="width: ${percent}%;"></div>
    </div>
  </div>`;
}
