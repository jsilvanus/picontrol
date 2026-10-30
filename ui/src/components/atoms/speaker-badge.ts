import { renderIcon } from "./icon.js";

export interface SpeakerBadgeProps {
  role: string;
  name?: string;
  title?: string;
  hasName?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Speaker badge supporting the invariant:
 * If a person's name is not provided, the item is marked as role-only.
 */
export function renderSpeakerBadge(props: SpeakerBadgeProps): string {
  const hasName = props.hasName ?? Boolean(props.name && props.name.trim().length > 0);
  const role = props.role.trim() || "Liturgi";
  const name = props.name?.trim() || "";
  const title = props.title?.trim() || "";

  const isSmall = props.size === "sm";
  const paddingClass = isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  const extraClass = props.className ?? "";

  if (!hasName) {
    // Role-only badge
    return `
      <span class="inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 ${paddingClass} ${extraClass}" title="Vain rooli - nimi puuttuu">
        ${renderIcon({ name: "shield_person", size: isSmall ? 14 : 16 })}
        <span class="font-semibold uppercase tracking-wider text-[10px]">${role}</span>
        <span class="text-[9px] px-1 py-0.2 bg-amber-500/20 rounded text-amber-800 dark:text-amber-200">Rooli vain</span>
      </span>
    `.trim();
  }

  // Named speaker badge
  const displayTitle = title ? `${title} ` : "";
  return `
    <span class="inline-flex items-center gap-1.5 rounded-full font-medium bg-primary/10 text-primary dark:text-primary-fixed border border-primary/25 ${paddingClass} ${extraClass}">
      ${renderIcon({ name: "person", size: isSmall ? 14 : 16 })}
      <span class="font-medium">${displayTitle}${name}</span>
      <span class="text-[10px] px-1 py-0.2 rounded bg-primary/20 text-on-primary-container font-semibold uppercase tracking-wider">${role}</span>
    </span>
  `.trim();
}
