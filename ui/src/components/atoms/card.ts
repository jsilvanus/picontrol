import { renderIcon } from "./icon.js";

export type CardVariant = "default" | "low" | "high" | "highest" | "outlined" | "interactive";

export interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  badgeHtml?: string;
  headerActionHtml?: string;
  content: string;
  footerHtml?: string;
  variant?: CardVariant;
  id?: string;
  className?: string;
  onClickAttr?: string;
}

export function renderCard(props: CardProps): string {
  let bgClass = "bg-surface-container-low border border-outline-variant/30";

  switch (props.variant) {
    case "high":
      bgClass = "bg-surface-container-high border border-outline-variant/40";
      break;
    case "highest":
      bgClass = "bg-surface-container-highest border border-outline-variant/50";
      break;
    case "outlined":
      bgClass = "bg-surface border border-outline-variant/50";
      break;
    case "interactive":
      bgClass = "bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 cursor-pointer transition-all";
      break;
    case "default":
    case "low":
    default:
      bgClass = "bg-surface-container-low border border-outline-variant/30";
      break;
  }

  const idAttr = props.id ? ` id="${props.id}"` : "";
  const onclickAttr = props.onClickAttr ? ` onclick="${props.onClickAttr}"` : "";
  const extraClass = props.className ?? "";

  const hasHeader = props.title || props.icon || props.badgeHtml || props.headerActionHtml;

  const headerHtml = hasHeader
    ? `<div class="flex items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
        <div class="flex items-center gap-2 min-w-0">
          ${props.icon ? `<div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">${renderIcon({ name: props.icon, size: 18 })}</div>` : ""}
          <div class="min-w-0">
            ${props.title ? `<h3 class="font-headline-sm text-[15px] font-bold text-on-surface leading-tight truncate">${props.title}</h3>` : ""}
            ${props.subtitle ? `<span class="font-label-sm text-[10px] text-on-surface-variant block truncate">${props.subtitle}</span>` : ""}
          </div>
          ${props.badgeHtml ?? ""}
        </div>
        ${props.headerActionHtml ? `<div class="flex items-center gap-1.5 flex-shrink-0">${props.headerActionHtml}</div>` : ""}
      </div>`
    : "";

  const footerHtml = props.footerHtml
    ? `<div class="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-body-sm">
        ${props.footerHtml}
      </div>`
    : "";

  return `<div${idAttr}${onclickAttr} class="rounded-xl p-3.5 shadow-sm space-y-2.5 ${bgClass} ${extraClass}">
    ${headerHtml}
    <div class="card-body">
      ${props.content}
    </div>
    ${footerHtml}
  </div>`;
}
