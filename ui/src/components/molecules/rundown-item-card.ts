import { renderIcon } from "../atoms/icon.js";
import { renderCueTriggerBadge } from "./cue-trigger-badge.js";

export interface RundownItemActionPreview {
  type: string;
  summary: string;
}

export interface RundownItemCardProps {
  id: string;
  index: number;
  title: string;
  section?: string;
  notes?: string;
  cueType?: "fuzzy" | "phrase" | "regex" | "sound" | "manual";
  cueDetails?: {
    phrase?: string;
    threshold?: number;
    event?: string;
    pattern?: string;
  };
  actions?: RundownItemActionPreview[];
  active?: boolean;
  selected?: boolean;
  className?: string;
  dataId?: string;
}

export function renderRundownItemCard(props: RundownItemCardProps): string {
  const extraClass = props.className ?? "";
  const borderClass = props.selected
    ? "border-primary ring-2 ring-primary/20 shadow-md"
    : props.active
      ? "border-emerald-500 ring-2 ring-emerald-500/20"
      : "border-outline-variant/30 hover:border-outline-variant/80";

  const actionsBadges = (props.actions || []).map((action) => {
    let icon = "bolt";
    let bg = "bg-surface-container-high text-on-surface-variant";
    if (action.type.includes("cam")) {
      icon = "videocam";
      bg = "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20";
    } else if (action.type.includes("switch") || action.type.includes("atem")) {
      icon = "swap_horiz";
      bg = "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20";
    } else if (action.type.includes("graphic")) {
      icon = "subtitles";
      bg = "bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20";
    } else if (action.type.includes("pipgm")) {
      icon = "menu_book";
      bg = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20";
    } else if (action.type.includes("var")) {
      icon = "data_object";
      bg = "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20";
    }

    return `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${bg}" title="${action.type}">
        ${renderIcon({ name: icon, size: 12 })}
        <span class="font-sans text-[10px] font-medium">${action.summary}</span>
      </span>
    `.trim();
  }).join(" ");

  const triggerHtml = props.cueType
    ? renderCueTriggerBadge({
        type: props.cueType,
        phrase: props.cueDetails?.phrase,
        threshold: props.cueDetails?.threshold,
        event: props.cueDetails?.event,
        pattern: props.cueDetails?.pattern,
      })
    : renderCueTriggerBadge({ type: "manual" });

  const sectionPill = props.section
    ? `<span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant">${props.section}</span>`
    : "";

  return `
    <div class="rundown-card group relative flex flex-col p-3.5 rounded-xl bg-surface-container-low transition-all duration-150 border ${borderClass} ${extraClass}" data-rundown-id="${props.id}" data-id="${props.dataId ?? props.id}">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="flex items-center justify-center w-6 h-6 rounded-md bg-surface-container-highest text-[11px] font-bold text-on-surface-variant font-mono">
            ${props.index + 1}
          </span>
          <span class="font-mono text-xs text-outline font-medium">#${props.id}</span>
          ${sectionPill}
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="btn-move-up p-1 text-outline hover:text-on-surface rounded hover:bg-surface-container-high transition-colors" title="Siirra ylemmäs">
            ${renderIcon({ name: "arrow_upward", size: 16 })}
          </button>
          <button type="button" class="btn-move-down p-1 text-outline hover:text-on-surface rounded hover:bg-surface-container-high transition-colors" title="Siirra alemmas">
            ${renderIcon({ name: "arrow_downward", size: 16 })}
          </button>
        </div>
      </div>

      <div class="flex items-baseline justify-between mb-1">
        <h4 class="font-semibold text-sm text-on-surface">${props.title}</h4>
      </div>

      ${props.notes ? `<p class="text-xs text-outline line-clamp-1 mb-2.5 italic">${props.notes}</p>` : ""}

      <div class="flex flex-wrap items-center justify-between gap-2 mt-auto pt-2 border-t border-outline-variant/15">
        <div class="flex items-center gap-1.5 flex-wrap">
          ${triggerHtml}
        </div>
        <div class="flex items-center gap-1 flex-wrap">
          ${actionsBadges}
        </div>
      </div>
    </div>
  `.trim();
}
