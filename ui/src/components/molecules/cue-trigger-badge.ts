import { renderIcon } from "../atoms/icon.js";

export interface CueTriggerBadgeProps {
  type: "fuzzy" | "phrase" | "regex" | "sound" | "manual" | "all" | "any";
  phrase?: string;
  threshold?: number;
  event?: string;
  pattern?: string;
  className?: string;
}

export function renderCueTriggerBadge(props: CueTriggerBadgeProps): string {
  const extraClass = props.className ?? "";

  switch (props.type) {
    case "fuzzy": {
      const pct = props.threshold !== undefined ? `${Math.round(props.threshold * 100)}%` : "80%";
      const phraseText = props.phrase ? `"${props.phrase}"` : "puhetta";
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30 ${extraClass}" title="Fuzzy speech matching (${pct})">
          ${renderIcon({ name: "record_voice_over", size: 14 })}
          <span class="font-sans font-medium text-[11px] truncate max-w-[200px]">${phraseText}</span>
          <span class="text-[10px] bg-violet-500/20 px-1 py-0.2 rounded font-semibold">${pct}</span>
        </span>
      `.trim();
    }
    case "phrase": {
      const phraseText = props.phrase ? `"${props.phrase}"` : "tarkka lause";
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 ${extraClass}" title="Tarkka puhelauseke">
          ${renderIcon({ name: "mic", size: 14 })}
          <span class="font-sans font-medium text-[11px] truncate max-w-[200px]">${phraseText}</span>
        </span>
      `.trim();
    }
    case "sound": {
      const eventName = props.event || "music_stop";
      const iconName = eventName.includes("music") ? "music_note" : eventName.includes("speech") ? "voice_chat" : "volume_off";
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 ${extraClass}" title="Aani/akustinen herate">
          ${renderIcon({ name: iconName, size: 14 })}
          <span class="font-sans font-medium text-[11px]">${eventName}</span>
        </span>
      `.trim();
    }
    case "regex": {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 ${extraClass}" title="Regex-herate">
          ${renderIcon({ name: "regular_expression", size: 14 })}
          <span class="font-mono text-[11px] truncate max-w-[180px]">/${props.pattern || ".*"}/i</span>
        </span>
      `.trim();
    }
    case "manual":
    default: {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-surface-container-high text-on-surface-variant border border-outline-variant/30 ${extraClass}" title="Manuaalinen herate / Odota operaattoria">
          ${renderIcon({ name: "touch_app", size: 14 })}
          <span class="font-sans text-[11px]">Manuaali</span>
        </span>
      `.trim();
    }
  }
}
