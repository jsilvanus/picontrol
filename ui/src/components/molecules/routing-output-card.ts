import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderIcon } from "../atoms/icon.js";

export interface SourceOption {
  id: string;
  label: string;
  isMuted?: boolean;
  isFtb?: boolean;
}

export interface RoutingOutputCardProps {
  outputIndex: 1 | 2; // Pi 1 (hdmi 0) or Pi 2 (hdmi 1)
  activeSourceId: string;
  isFtb?: boolean;
  isCropped?: boolean;
  routedToLabels?: string[];
  sources?: SourceOption[];
  onSelectSourceAttr?: (out: 1 | 2, src: string) => string;
  onOpenCropAttr?: (out: 1 | 2) => string;
  onToggleFtbAttr?: (out: 1 | 2) => string;
  className?: string;
}

export function renderRoutingOutputCard(props: RoutingOutputCardProps): string {
  const sources: SourceOption[] = props.sources ?? [
    { id: "hama", label: "hama (HDMI Capture)" },
    { id: "rtmp1", label: "rtmp1 (Main Stream)" },
    { id: "rtmp2", label: "rtmp2 (Backup Stream)" },
    { id: "PiPGM1", label: "pipgm 1 (Slides)" },
    { id: "PiPGM2", label: "pipgm 2 (Graphics)" },
    { id: "compose1", label: "compose 1 (Keyed)" }
  ];

  const ftbBadge = props.isFtb
    ? renderBadge({ label: "FTB", variant: "ftb", size: "xs" })
    : "";

  const cropBadge = props.isCropped
    ? renderBadge({ label: "CROP", variant: "crop", size: "xs" })
    : "";

  const routedBadges = (props.routedToLabels && props.routedToLabels.length > 0)
    ? props.routedToLabels.map(r => renderBadge({ label: r, variant: "neutral", size: "xs" })).join("")
    : renderBadge({ label: "Standby", variant: "neutral", size: "xs" });

  const sourceButtons = sources.map(src => {
    const isSelected = props.activeSourceId === src.id;
    return renderButton({
      label: src.label,
      variant: isSelected ? "primary" : "surface-high",
      active: isSelected,
      size: "sm",
      className: "w-full justify-start text-[11px]",
      dataAttributes: { output: props.outputIndex, source: src.id },
      onClickAttr: props.onSelectSourceAttr ? props.onSelectSourceAttr(props.outputIndex, src.id) : undefined
    });
  }).join("");

  const cropButton = renderButton({
    label: "Crop / FX",
    icon: "crop",
    variant: "ghost",
    size: "xs",
    onClickAttr: props.onOpenCropAttr ? props.onOpenCropAttr(props.outputIndex) : undefined
  });

  const ftbToggle = renderButton({
    label: props.isFtb ? "FTB ON" : "FTB",
    variant: props.isFtb ? "danger" : "surface-high",
    size: "xs",
    onClickAttr: props.onToggleFtbAttr ? props.onToggleFtbAttr(props.outputIndex) : undefined
  });

  const extraClass = props.className ?? "";

  return `<div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between shadow-sm space-y-2.5 ${extraClass}">
    <!-- Header -->
    <div class="flex items-start justify-between gap-1 pb-1.5 border-b border-outline-variant/20">
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <h3 class="font-headline-sm text-[16px] font-bold text-on-surface leading-tight">Pi ${props.outputIndex}</h3>
          ${ftbBadge}
          ${cropBadge}
        </div>
        <span class="font-label-sm text-[10px] text-on-surface-variant">hdmi ${props.outputIndex - 1}</span>
      </div>
      <div class="flex flex-col items-end gap-1 flex-shrink-0">
        <span class="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold leading-none">Routed To</span>
        <div class="flex flex-wrap items-center justify-end gap-1">
          ${routedBadges}
        </div>
      </div>
    </div>

    <!-- Active Source & Controls -->
    <div class="flex items-center justify-between text-[11px] font-label-sm">
      <span class="text-on-surface-variant uppercase tracking-wider text-[10px]">Select Input:</span>
      <div class="flex items-center gap-1">
        ${cropButton}
        ${ftbToggle}
      </div>
    </div>

    <!-- Source List -->
    <div class="flex flex-col gap-1.5">
      ${sourceButtons}
    </div>
  </div>`;
}
