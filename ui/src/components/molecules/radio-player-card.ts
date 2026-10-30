import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderCard } from "../atoms/card.js";
import { renderStatDisplay } from "../atoms/stat-display.js";

export interface RadioPlayerCardProps {
  streamName: string;
  mountPoint: string;
  streamUrl: string;
  isStreaming: boolean;
  listenersCount: number;
  soundComingIn?: boolean;
  captionsComingIn?: boolean;
  onPlayToggleAttr?: string;
  isPlaying?: boolean;
  className?: string;
}

export function renderRadioPlayerCard(props: RadioPlayerCardProps): string {
  const isStreaming = props.isStreaming;

  const statusBadge = renderBadge({
    label: isStreaming ? "ON AIR / STREAMING" : "OFFLINE",
    variant: isStreaming ? "success" : "neutral",
    dot: isStreaming ? "live" : "offline",
    pulse: isStreaming,
    size: "xs"
  });

  const soundBadge = renderBadge({
    label: props.soundComingIn ? "Audio: Active" : "Audio: Silent",
    variant: props.soundComingIn ? "success" : "neutral",
    size: "xs"
  });

  const captionsBadge = renderBadge({
    label: props.captionsComingIn ? "Captions: Sync" : "Captions: Waiting",
    variant: props.captionsComingIn ? "success" : "neutral",
    size: "xs"
  });

  const playBtn = renderButton({
    label: props.isPlaying ? "Stop Monitor" : "Play Confidence Audio",
    icon: props.isPlaying ? "pause" : "play_arrow",
    variant: props.isPlaying ? "primary" : "surface-high",
    size: "sm",
    onClickAttr: props.onPlayToggleAttr
  });

  const statsRow = `<div class="grid grid-cols-2 gap-2">
    ${renderStatDisplay({ label: "Listeners", value: props.listenersCount, unit: "tuntia/hlö", size: "sm", color: props.listenersCount > 0 ? "success" : "neutral" })}
    ${renderStatDisplay({ label: "Mount", value: props.mountPoint, size: "sm" })}
  </div>`;

  const content = `<div class="space-y-2.5">
    ${statsRow}

    <div class="flex items-center justify-between text-[11px] font-mono p-2 rounded-lg bg-surface-container border border-outline-variant/30">
      <span class="text-on-surface-variant truncate mr-2">URL: ${props.streamUrl}</span>
      <div class="flex items-center gap-1 flex-shrink-0">
        ${soundBadge}
        ${captionsBadge}
      </div>
    </div>

    <div class="flex justify-end pt-1 border-t border-outline-variant/20">
      ${playBtn}
    </div>
  </div>`;

  return renderCard({
    title: props.streamName,
    subtitle: "Web Radio Relay • Low-latency HLS & MP3 Broadcast Stream",
    icon: "radio",
    badgeHtml: statusBadge,
    content,
    className: props.className
  });
}
