import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderCard } from "../atoms/card.js";

export type CueDirection = "pan-left" | "pan-right" | "zoom-in" | "zoom-out" | "operator-call";

export interface CueButtonGroupProps {
  targetLightId: string;
  targetLightName?: string;
  onCueClickAttr?: (cue: CueDirection) => string;
  className?: string;
}

export function renderCueButtonGroup(props: CueButtonGroupProps): string {
  const badge = renderBadge({
    label: props.targetLightName ?? props.targetLightId.toUpperCase(),
    variant: "accent",
    size: "xs"
  });

  const panLeftBtn = renderButton({
    label: "Pan V",
    icon: "arrow_back",
    variant: "surface-high",
    size: "sm",
    className: "flex-1",
    dataAttributes: { cue: "pan-left", light: props.targetLightId },
    title: "Cue Operator: Pan Left"
  });

  const panRightBtn = renderButton({
    label: "Pan O",
    icon: "arrow_forward",
    variant: "surface-high",
    size: "sm",
    className: "flex-1",
    dataAttributes: { cue: "pan-right", light: props.targetLightId },
    title: "Cue Operator: Pan Right"
  });

  const zoomInBtn = renderButton({
    label: "Zoom +",
    icon: "zoom_in",
    variant: "surface-high",
    size: "sm",
    className: "flex-1",
    dataAttributes: { cue: "zoom-in", light: props.targetLightId },
    title: "Cue Operator: Zoom In"
  });

  const zoomOutBtn = renderButton({
    label: "Zoom -",
    icon: "zoom_out",
    variant: "surface-high",
    size: "sm",
    className: "flex-1",
    dataAttributes: { cue: "zoom-out", light: props.targetLightId },
    title: "Cue Operator: Zoom Out"
  });

  const callBtn = renderButton({
    label: "Kutsu / Huomio",
    icon: "notifications_active",
    variant: "primary",
    size: "sm",
    className: "w-full",
    dataAttributes: { cue: "operator-call", light: props.targetLightId },
    title: "Call Camera Operator"
  });

  const content = `<div class="space-y-2">
    <div class="grid grid-cols-2 gap-1.5">
      ${panLeftBtn}
      ${panRightBtn}
    </div>
    <div class="grid grid-cols-2 gap-1.5">
      ${zoomInBtn}
      ${zoomOutBtn}
    </div>
    <div class="pt-0.5">
      ${callBtn}
    </div>
  </div>`;

  return renderCard({
    title: "Ohjaajan Kuvaaja-Cuet",
    subtitle: "Tally-Ma langaton LED-merkinanto kuvaajalle",
    icon: "sports_score",
    badgeHtml: badge,
    content,
    className: props.className
  });
}
