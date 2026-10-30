import { renderBadge } from "../atoms/badge.js";
import { renderCard } from "../atoms/card.js";
import { renderStatusDot } from "../atoms/status-dot.js";

export interface LedZoneState {
  index: number; // 0..8
  color: [number, number, number]; // RGB
  label?: string;
  facetType?: string;
}

export interface TallyFacetWidgetProps {
  id: string;
  name: string;
  host: string;
  fallbackIp?: string;
  mode: string;
  brightness?: "low" | "medium" | "high";
  activeFacet?: string;
  zones?: LedZoneState[];
  connected?: boolean;
  className?: string;
}

export function renderTallyFacetWidget(props: TallyFacetWidgetProps): string {
  const isConnected = props.connected ?? true;

  const connBadge = renderBadge({
    label: isConnected ? "ONLINE" : "OFFLINE",
    variant: isConnected ? "success" : "neutral",
    dot: isConnected ? "online" : "offline",
    size: "xs"
  });

  const modeBadge = renderBadge({
    label: props.mode.toUpperCase(),
    variant: props.mode === "pgm" ? "error" : props.mode === "prv" ? "success" : "neutral",
    size: "xs"
  });

  // Render 9 LED circles
  const defaultZones: LedZoneState[] = props.zones ?? Array.from({ length: 9 }, (_, i) => ({
    index: i,
    color: props.mode === "pgm" ? [255, 0, 0] : props.mode === "prv" ? [0, 255, 0] : [40, 40, 40]
  }));

  const ledsHtml = defaultZones.map((z, idx) => {
    const rgbStr = `rgb(${z.color[0]}, ${z.color[1]}, ${z.color[2]})`;
    const isLit = z.color[0] > 30 || z.color[1] > 30 || z.color[2] > 30;
    const glowStyle = isLit ? `box-shadow: 0 0 8px ${rgbStr};` : "";

    return `<div class="flex flex-col items-center gap-1">
      <div class="w-6 h-6 rounded-full border border-black/40 transition-all flex items-center justify-center text-[8px] font-mono font-bold text-white/90" style="background-color: ${rgbStr}; ${glowStyle}">
        ${idx + 1}
      </div>
    </div>`;
  }).join("");

  const facetInfo = props.activeFacet
    ? `<div class="flex items-center justify-between text-[11px] font-label-sm pt-1 border-t border-outline-variant/20">
        <span class="text-on-surface-variant">Active Facet:</span>
        <span class="font-bold text-primary font-mono">${props.activeFacet}</span>
      </div>`
    : "";

  const content = `<div class="space-y-2.5">
    <!-- LED Matrix Grid (9 zones in a single row or 3x3) -->
    <div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-1">
      ${ledsHtml}
    </div>

    <div class="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
      <span>Host: ${props.host}</span>
      ${props.fallbackIp ? `<span>Fallback: ${props.fallbackIp}</span>` : ""}
    </div>

    ${facetInfo}
  </div>`;

  return renderCard({
    title: props.name,
    subtitle: `Tally-Ma Wireless LED Controller • 9-Zone Segmented`,
    icon: "highlight",
    badgeHtml: `<div class="flex items-center gap-1">${modeBadge}${connBadge}</div>`,
    content,
    className: props.className
  });
}
