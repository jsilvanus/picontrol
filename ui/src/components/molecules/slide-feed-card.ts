import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderCard } from "../atoms/card.js";
import { renderStatDisplay } from "../atoms/stat-display.js";

export interface SlideFeedCardProps {
  pipelineId?: string;
  slideUrl?: string;
  currentSlideNumber?: number;
  totalSlides?: number;
  keyMode?: "luma" | "chroma" | "off";
  picMute?: boolean;
  onPicMuteToggleAttr?: string;
  onNextSlideAttr?: string;
  onPrevSlideAttr?: string;
  className?: string;
}

export function renderSlideFeedCard(props: SlideFeedCardProps): string {
  const isMuted = props.picMute ?? false;
  const keyMode = props.keyMode ?? "luma";

  const muteBadge = renderBadge({
    label: isMuted ? "PIC MUTE ACTIVE" : "PIC VISIBLE",
    variant: isMuted ? "warning" : "success",
    dot: isMuted ? "warning" : "online",
    size: "xs"
  });

  const keyBadge = renderBadge({
    label: `KEY: ${keyMode.toUpperCase()}`,
    variant: keyMode !== "off" ? "primary" : "neutral",
    size: "xs"
  });

  const picMuteBtn = renderButton({
    label: isMuted ? "Unmute Projector" : "Blackout / Pic Mute",
    icon: isMuted ? "visibility" : "visibility_off",
    variant: isMuted ? "primary" : "surface-high",
    size: "sm",
    onClickAttr: props.onPicMuteToggleAttr
  });

  const prevBtn = renderButton({
    icon: "chevron_left",
    label: "Prev",
    variant: "surface-high",
    size: "sm",
    onClickAttr: props.onPrevSlideAttr
  });

  const nextBtn = renderButton({
    icon: "chevron_right",
    label: "Next",
    variant: "surface-high",
    size: "sm",
    onClickAttr: props.onNextSlideAttr
  });

  const slideDisplay = props.currentSlideNumber !== undefined
    ? `<span class="font-mono text-[12px] font-bold text-on-surface">Slide ${props.currentSlideNumber} / ${props.totalSlides ?? "?"}</span>`
    : "";

  const slidePreview = props.slideUrl
    ? `<img src="${props.slideUrl}" alt="Current slide" class="w-full h-32 object-contain bg-black/80 rounded-lg border border-outline-variant/30" />`
    : `<div class="w-full h-28 bg-surface-container rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface-variant text-[12px] italic">
        No active slide image loaded (Waiting for Canva / PPTX sync)
      </div>`;

  const content = `<div class="space-y-3">
    ${slidePreview}

    <div class="flex items-center justify-between pt-1">
      ${slideDisplay}
      <div class="flex items-center gap-1.5">
        ${prevBtn}
        ${nextBtn}
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20">
      <span class="text-[10px] font-mono text-on-surface-variant">Pipeline: ${props.pipelineId ?? "PiPGM1"}</span>
      ${picMuteBtn}
    </div>
  </div>`;

  return renderCard({
    title: "PiPGM Slide Feed & Presenter",
    subtitle: "Canva App Plugin & PiProgram Graphics Layer",
    icon: "slideshow",
    badgeHtml: `<div class="flex items-center gap-1">${keyBadge}${muteBadge}</div>`,
    content,
    className: props.className
  });
}
