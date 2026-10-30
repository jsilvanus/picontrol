import { renderBadge } from "../atoms/badge.js";

export interface PtzPresetCardProps {
  cameraId: "cam1" | "cam2" | string;
  presetId: number;
  name: string;
  isActive?: boolean;
  thumbnailUrl?: string;
  onClickAttr?: string;
  className?: string;
}

export function renderPtzPresetCard(props: PtzPresetCardProps): string {
  const activeClass = props.isActive
    ? "border-primary ring-2 ring-primary/40 bg-primary/5"
    : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container";

  const numBadge = renderBadge({
    label: `#${props.presetId}`,
    variant: props.isActive ? "primary" : "neutral",
    size: "xs"
  });

  const onclickAttr = props.onClickAttr ? ` onclick="${props.onClickAttr}"` : "";
  const extraClass = props.className ?? "";

  const thumbHtml = props.thumbnailUrl
    ? `<img src="${props.thumbnailUrl}" alt="${props.name}" class="w-full h-16 object-cover rounded-md border border-outline-variant/20 mb-1.5" />`
    : `<div class="w-full h-16 rounded-md bg-surface-container-highest/60 flex items-center justify-center border border-outline-variant/20 mb-1.5 text-on-surface-variant">
        <span class="material-symbols-outlined text-[24px] opacity-40">videocam</span>
      </div>`;

  return `<button
    type="button"
    ${onclickAttr}
    data-cam="${props.cameraId}"
    data-preset="${props.presetId}"
    class="p-2 rounded-xl border text-left flex flex-col justify-between transition-all select-none active:scale-95 ${activeClass} ${extraClass}"
  >
    ${thumbHtml}
    <div class="flex items-center justify-between gap-1 w-full">
      <span class="font-headline-sm text-[12px] font-bold text-on-surface truncate leading-tight">${props.name}</span>
      ${numBadge}
    </div>
  </button>`;
}
