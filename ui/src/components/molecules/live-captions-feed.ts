import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderCard } from "../atoms/card.js";
import { renderStatDisplay } from "../atoms/stat-display.js";
import { renderCaptionItem, type CaptionItemProps } from "./caption-item.js";

export interface LiveCaptionsFeedProps {
  captions: CaptionItemProps[];
  isVoiceActive?: boolean;
  sttBusy?: boolean;
  processedCount?: number;
  droppedCount?: number;
  lagMs?: number;
  language?: string;
  onRefreshClickAttr?: string;
  maxHeight?: string;
  className?: string;
}

export function renderLiveCaptionsFeed(props: LiveCaptionsFeedProps): string {
  const isVoiceActive = props.isVoiceActive ?? false;
  const sttBusy = props.sttBusy ?? false;
  const processed = props.processedCount ?? 0;
  const dropped = props.droppedCount ?? 0;
  const lagMs = props.lagMs ?? 120;
  const lang = props.language ?? "fi";

  // Badges in header
  const vadBadge = renderBadge({
    label: isVoiceActive ? "Voice Detected" : "Silence / VAD Idle",
    variant: isVoiceActive ? "success" : "neutral",
    dot: isVoiceActive ? "live" : "offline",
    pulse: isVoiceActive,
    size: "xs"
  });

  const sttBadge = renderBadge({
    label: sttBusy ? "Transcribing…" : "STT Ready",
    variant: sttBusy ? "warning" : "success",
    dot: sttBusy ? "busy" : "online",
    size: "xs"
  });

  const refreshBtn = renderButton({
    icon: "refresh",
    variant: "surface-high",
    size: "xs",
    title: "Refresh Transcripts",
    onClickAttr: props.onRefreshClickAttr
  });

  // Telemetry stats row
  const statsHtml = `<div class="grid grid-cols-4 gap-1.5 pt-1">
    ${renderStatDisplay({ label: "Language", value: lang.toUpperCase(), size: "sm" })}
    ${renderStatDisplay({ label: "Lag", value: lagMs, unit: "ms", size: "sm", color: lagMs > 1000 ? "warning" : "primary" })}
    ${renderStatDisplay({ label: "Processed", value: processed, size: "sm", color: "success" })}
    ${renderStatDisplay({ label: "Dropped", value: dropped, size: "sm", alert: dropped > 0, color: dropped > 0 ? "error" : "neutral" })}
  </div>`;

  // Caption items list
  const listHeight = props.maxHeight ?? "max-h-56";
  const captionsListHtml = props.captions.length > 0
    ? `<div class="space-y-1.5 overflow-y-auto ${listHeight} pr-0.5">
        ${props.captions.map(c => renderCaptionItem(c)).join("")}
      </div>`
    : `<div class="p-4 text-center text-[12px] text-on-surface-variant italic rounded-lg bg-surface-container/50 border border-outline-variant/20">
        No captions received yet. Live speech from Sanctuary mics will appear here with delivery flags.
      </div>`;

  const content = `<div class="space-y-2.5">
    ${statsHtml}
    <div class="pt-1">
      <div class="flex items-center justify-between text-[11px] font-label-sm mb-1.5">
        <span class="font-bold text-on-surface uppercase">Live Transcript Stream</span>
        <span class="text-[10px] text-on-surface-variant">Real-time STT & Dispatch Flags</span>
      </div>
      ${captionsListHtml}
    </div>
  </div>`;

  return renderCard({
    title: "Live Speech & Captions Flow",
    subtitle: "Liturgos Auditor STT -> PiVoice -> Pitube & Relay",
    icon: "closed_caption",
    badgeHtml: `<div class="flex items-center gap-1">${vadBadge}${sttBadge}</div>`,
    headerActionHtml: refreshBtn,
    content,
    className: props.className
  });
}
