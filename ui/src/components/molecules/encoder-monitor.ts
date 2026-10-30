import { renderBadge } from "../atoms/badge.js";
import { renderCard } from "../atoms/card.js";
import { renderStatDisplay } from "../atoms/stat-display.js";

export interface EncoderStreamInfo {
  mode: string;
  state: "streaming" | "recording" | "idle" | "error" | "starting" | string;
  bitrateKbps?: number;
}

export interface EncoderMonitorProps {
  name?: string;
  connected: boolean;
  encoder1: EncoderStreamInfo;
  encoder2: EncoderStreamInfo;
  error?: string;
  className?: string;
}

export function renderEncoderMonitor(props: EncoderMonitorProps): string {
  const isEnc1Active = props.encoder1.state.toLowerCase() === "streaming" || props.encoder1.state.toLowerCase() === "active";
  const isEnc2Active = props.encoder2.state.toLowerCase() === "recording" || props.encoder2.state.toLowerCase() === "active";

  const enc1Badge = renderBadge({
    label: props.encoder1.state.toUpperCase(),
    variant: isEnc1Active ? "success" : "neutral",
    dot: isEnc1Active ? "live" : "offline",
    pulse: isEnc1Active,
    size: "xs"
  });

  const enc2Badge = renderBadge({
    label: props.encoder2.state.toUpperCase(),
    variant: isEnc2Active ? "error" : "neutral",
    dot: isEnc2Active ? "live" : "offline",
    pulse: isEnc2Active,
    size: "xs"
  });

  const connBadge = renderBadge({
    label: props.connected ? "ONLINE" : "OFFLINE",
    variant: props.connected ? "success" : "neutral",
    dot: props.connected ? "online" : "offline",
    size: "xs"
  });

  const content = `<div class="space-y-2.5">
    <div class="grid grid-cols-2 gap-2">
      <!-- Encoder 1: Streaming -->
      <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-label-sm uppercase font-bold text-on-surface-variant">Enc 1: Stream (RTMP)</span>
          ${enc1Badge}
        </div>
        <div class="flex items-baseline justify-between text-[11px] font-mono">
          <span class="text-on-surface-variant">Mode: ${props.encoder1.mode}</span>
          <span class="font-bold text-on-surface">${props.encoder1.bitrateKbps ? `${props.encoder1.bitrateKbps} kbps` : "--"}</span>
        </div>
      </div>

      <!-- Encoder 2: Recording -->
      <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-label-sm uppercase font-bold text-on-surface-variant">Enc 2: Record (File)</span>
          ${enc2Badge}
        </div>
        <div class="flex items-baseline justify-between text-[11px] font-mono">
          <span class="text-on-surface-variant">Mode: ${props.encoder2.mode}</span>
          <span class="font-bold text-on-surface">${props.encoder2.bitrateKbps ? `${props.encoder2.bitrateKbps} kbps` : "--"}</span>
        </div>
      </div>
    </div>

    ${props.error ? `<div class="p-2 rounded bg-error-container text-on-error-container text-[11px]">${props.error}</div>` : ""}
  </div>`;

  return renderCard({
    title: props.name ?? "Matrox Monarch HDX",
    subtitle: "Hardware H.264 Broadcast Encoder Dual Channel",
    icon: "memory",
    badgeHtml: connBadge,
    content,
    className: props.className
  });
}
