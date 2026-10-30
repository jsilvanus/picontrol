import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";
import { renderIcon } from "../atoms/icon.js";
import { renderMeter } from "../atoms/meter.js";
import { renderSlider } from "../atoms/slider.js";

export interface AudioFaderProps {
  id: string;
  name: string;
  role: string;
  profile?: string;
  group?: "handheld" | "madonna" | "wired" | "master";
  volumePercent: number;
  isMuted: boolean;
  isSolo?: boolean;
  peakDbfs?: number;
  signalPresent?: boolean;
  onVolumeChangeAttr?: string;
  onMuteToggleAttr?: string;
  onSoloToggleAttr?: string;
  className?: string;
}

export function renderAudioFader(props: AudioFaderProps): string {
  const peak = props.peakDbfs ?? -60;
  const isTalking = props.signalPresent ?? (peak > -45);
  const isMuted = props.isMuted;

  let groupIcon = "mic";
  if (props.group === "madonna") groupIcon = "headset_mic";
  else if (props.group === "wired") groupIcon = "settings_voice";
  else if (props.group === "master") groupIcon = "volume_up";

  const talkerDot = isTalking && !isMuted
    ? `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active talker"></span>`
    : `<span class="w-2 h-2 rounded-full bg-outline/30"></span>`;

  const muteBtn = renderButton({
    label: isMuted ? "MUTED" : "ON",
    variant: isMuted ? "danger" : "surface-high",
    size: "xs",
    onClickAttr: props.onMuteToggleAttr,
    dataAttributes: { channel: props.id, action: "toggle-mute" },
    className: "w-14"
  });

  const soloBtn = props.isSolo !== undefined
    ? renderButton({
        label: "SOLO",
        variant: props.isSolo ? "primary" : "ghost",
        size: "xs",
        onClickAttr: props.onSoloToggleAttr,
        dataAttributes: { channel: props.id, action: "toggle-solo" },
        className: "w-11"
      })
    : "";

  const slider = renderSlider({
    id: `fader-${props.id}`,
    min: 0,
    max: 100,
    value: props.volumePercent,
    disabled: isMuted,
    onInputAttr: props.onVolumeChangeAttr,
    dataAttributes: { channel: props.id }
  });

  const meter = renderMeter({
    value: isMuted ? -60 : peak,
    min: -60,
    max: 0,
    className: "flex-1"
  });

  const extraClass = props.className ?? "";
  const borderHighlight = isTalking && !isMuted ? "border-emerald-500/40" : "border-outline-variant/30";

  return `<div class="p-2.5 rounded-xl bg-surface-container-low border ${borderHighlight} flex flex-col gap-2 transition-all ${extraClass}">
    <div class="flex items-center justify-between gap-1.5">
      <div class="flex items-center gap-1.5 min-w-0">
        <div class="w-6 h-6 rounded-md bg-surface-container-highest text-on-surface flex items-center justify-center flex-shrink-0">
          ${renderIcon({ name: groupIcon, size: 15 })}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1">
            ${talkerDot}
            <h4 class="font-headline-sm text-[13px] font-bold text-on-surface truncate leading-tight">${props.name}</h4>
          </div>
          <span class="text-[9px] font-label-sm text-on-surface-variant block truncate leading-tight">${props.role}</span>
        </div>
      </div>

      <div class="flex items-center gap-1 flex-shrink-0">
        ${soloBtn}
        ${muteBtn}
      </div>
    </div>

    <div class="flex items-center gap-2 pt-0.5">
      <div class="flex-1">
        ${slider}
      </div>
      <span class="font-mono text-[11px] font-bold w-9 text-right text-on-surface">${props.volumePercent}%</span>
    </div>

    <div class="pt-0.5">
      ${meter}
    </div>
  </div>`;
}
