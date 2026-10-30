export interface SliderProps {
  id: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  disabled?: boolean;
  label?: string;
  unit?: string;
  showValue?: boolean;
  className?: string;
  onInputAttr?: string;
  onChangeAttr?: string;
  dataAttributes?: Record<string, string | number>;
}

export function renderSlider(props: SliderProps): string {
  const step = props.step ?? 1;
  const disabledAttr = props.disabled ? " disabled" : "";
  const oninputAttr = props.onInputAttr ? ` oninput="${props.onInputAttr}"` : "";
  const onchangeAttr = props.onChangeAttr ? ` onchange="${props.onChangeAttr}"` : "";
  const extraClass = props.className ?? "";

  let dataAttrs = "";
  if (props.dataAttributes) {
    for (const [key, val] of Object.entries(props.dataAttributes)) {
      dataAttrs += ` data-${key}="${val}"`;
    }
  }

  const labelRow = (props.label || props.showValue)
    ? `<div class="flex items-center justify-between text-[11px] font-label-sm mb-1">
        ${props.label ? `<span class="text-on-surface-variant">${props.label}</span>` : "<span></span>"}
        ${props.showValue !== false ? `<span class="font-mono font-bold text-on-surface" id="${props.id}-val">${props.value}${props.unit ? ` ${props.unit}` : ""}</span>` : ""}
      </div>`
    : "";

  return `<div class="w-full ${extraClass}">
    ${labelRow}
    <input
      type="range"
      id="${props.id}"
      min="${props.min}"
      max="${props.max}"
      step="${step}"
      value="${props.value}"
      ${disabledAttr}
      ${oninputAttr}
      ${onchangeAttr}
      ${dataAttrs}
      class="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none disabled:opacity-40"
    />
  </div>`;
}
