import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderCard } from "../atoms/card.js";

export interface AtemBusSelectorProps {
  connected: boolean;
  programInput: number | null;
  previewInput: number | null;
  inputs?: Array<{ id: number; label: string }>;
  isCutActive?: boolean;
  isAutoActive?: boolean;
  isFtbActive?: boolean;
  dsk1OnAir?: boolean;
  dsk2OnAir?: boolean;
  onInputSelectAttr?: (input: number) => string;
  onCutClickAttr?: string;
  onAutoClickAttr?: string;
  onFtbClickAttr?: string;
  className?: string;
}

export function renderAtemBusSelector(props: AtemBusSelectorProps): string {
  const inputs = props.inputs ?? [
    { id: 1, label: "CAM 1" },
    { id: 2, label: "CAM 2" },
    { id: 3, label: "PIPGM" }
  ];

  const statusBadge = renderBadge({
    label: props.connected
      ? `PGM ${props.programInput ?? "-"} • PVW ${props.previewInput ?? "-"}`
      : "OFFLINE",
    variant: props.connected ? "success" : "neutral",
    dot: props.connected ? "online" : "offline",
    size: "xs"
  });

  const inputButtons = inputs.map(inp => {
    const isPgm = props.connected && props.programInput === inp.id;
    const isPvw = props.connected && props.previewInput === inp.id;

    let variant: "atem-pgm" | "atem-pvw" | "surface-high" = "surface-high";
    if (isPgm) variant = "atem-pgm";
    else if (isPvw) variant = "atem-pvw";

    return renderButton({
      label: `${inp.id}: ${inp.label}`,
      variant,
      size: "md",
      className: "flex-1 h-11 text-[13px]",
      dataAttributes: { "atem-in": inp.id },
      onClickAttr: props.onInputSelectAttr ? props.onInputSelectAttr(inp.id) : undefined
    });
  }).join("");

  const cutBtn = renderButton({
    label: "CUT",
    variant: "surface-high",
    size: "sm",
    className: "flex-1 font-mono font-bold",
    onClickAttr: props.onCutClickAttr
  });

  const autoBtn = renderButton({
    label: "AUTO",
    variant: props.isAutoActive ? "atem-pgm" : "surface-high",
    size: "sm",
    className: `flex-1 font-mono font-bold ${props.isAutoActive ? "animate-pulse" : ""}`,
    onClickAttr: props.onAutoClickAttr
  });

  const ftbBtn = renderButton({
    label: "FTB",
    variant: props.isFtbActive ? "danger" : "surface-high",
    size: "sm",
    className: `flex-1 font-mono font-bold ${props.isFtbActive ? "animate-pulse" : ""}`,
    onClickAttr: props.onFtbClickAttr
  });

  const content = `<div class="space-y-2.5">
    <!-- Camera / Input Selectors -->
    <div class="flex gap-2">
      ${inputButtons}
    </div>

    <!-- Transition Control Bar -->
    <div class="flex gap-2 pt-1 border-t border-outline-variant/20">
      ${cutBtn}
      ${autoBtn}
      ${ftbBtn}
    </div>
  </div>`;

  return renderCard({
    title: "ATEM Switcher Bus",
    subtitle: "Hardware Video Mixer • Preview / Program Transition Engine",
    icon: "switch_video",
    badgeHtml: statusBadge,
    content,
    className: props.className
  });
}
