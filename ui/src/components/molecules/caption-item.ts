import { renderBadge } from "../atoms/badge.js";
import { renderIcon } from "../atoms/icon.js";

export interface CaptionDeliveryFlags {
  youtube?: "sent" | "dropped" | "pending" | "disabled";
  relay?: "sent" | "dropped" | "pending" | "disabled";
}

export interface CaptionItemProps {
  id?: string;
  seq?: number;
  text: string;
  speaker?: string;
  timestamp?: number | string;
  lagMs?: number;
  language?: string;
  flags?: CaptionDeliveryFlags;
  className?: string;
}

export function renderCaptionItem(props: CaptionItemProps): string {
  const timeFormatted = typeof props.timestamp === "number"
    ? new Date(props.timestamp).toLocaleTimeString("fi-FI")
    : (props.timestamp ?? "");

  const speakerBadge = props.speaker
    ? renderBadge({
        label: props.speaker,
        variant: "primary",
        size: "xs",
        icon: "person"
      })
    : "";

  // Flags for YouTube delivery
  let ytBadge = "";
  if (props.flags?.youtube === "sent") {
    ytBadge = renderBadge({
      label: "YT: Sent",
      variant: "success",
      size: "xs",
      icon: "smart_display"
    });
  } else if (props.flags?.youtube === "dropped") {
    ytBadge = renderBadge({
      label: "YT: Dropped",
      variant: "error",
      size: "xs",
      icon: "error"
    });
  } else if (props.flags?.youtube === "pending") {
    ytBadge = renderBadge({
      label: "YT: In Flight",
      variant: "warning",
      size: "xs",
      pulse: true
    });
  }

  // Flags for Web Radio Relay delivery
  let relayBadge = "";
  if (props.flags?.relay === "sent") {
    relayBadge = renderBadge({
      label: "Relay: Sent",
      variant: "success",
      size: "xs",
      icon: "radio"
    });
  } else if (props.flags?.relay === "dropped") {
    relayBadge = renderBadge({
      label: "Relay: Dropped",
      variant: "error",
      size: "xs",
      icon: "error"
    });
  }

  const lagBadge = props.lagMs !== undefined
    ? `<span class="text-[9px] font-mono text-on-surface-variant/80">${props.lagMs}ms lag</span>`
    : "";

  const extraClass = props.className ?? "";

  return `<div class="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col gap-1.5 transition-all hover:bg-surface-container-high ${extraClass}">
    <div class="flex items-center justify-between gap-2 min-w-0">
      <div class="flex items-center gap-1.5 flex-wrap min-w-0">
        ${speakerBadge}
        ${props.language ? renderBadge({ label: props.language, variant: "outline", size: "xs" }) : ""}
      </div>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        ${ytBadge}
        ${relayBadge}
        <span class="text-[10px] font-mono text-on-surface-variant flex-shrink-0">${timeFormatted}</span>
      </div>
    </div>
    <p class="font-body-md text-[13px] text-on-surface leading-snug break-words">${props.text}</p>
    ${lagBadge ? `<div class="flex justify-end pt-0.5">${lagBadge}</div>` : ""}
  </div>`;
}
