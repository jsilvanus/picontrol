import { renderIcon } from "./icon.js";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "surface"
  | "surface-high"
  | "atem-pgm"
  | "atem-pvw"
  | "atem-tie";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps {
  label?: string;
  icon?: string;
  iconSize?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  id?: string;
  className?: string;
  title?: string;
  onClickAttr?: string;
  dataAttributes?: Record<string, string | number | boolean>;
  badge?: string;
}

export function renderButton(props: ButtonProps): string {
  const type = props.type ?? "button";

  const sizeClass = props.size === "xs"
    ? "h-7 px-2 text-[10px] gap-1"
    : props.size === "sm"
      ? "h-8 px-2.5 text-[11px] gap-1.5"
      : props.size === "lg"
        ? "h-11 px-4 text-[13px] gap-2"
        : "h-9 px-3 text-[12px] gap-1.5";

  let variantClass = "bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30";

  switch (props.variant) {
    case "primary":
      variantClass = props.active
        ? "bg-primary-container text-on-primary shadow-sm"
        : "bg-primary text-on-primary hover:bg-primary/90 shadow-sm";
      break;
    case "secondary":
      variantClass = "bg-secondary-container text-on-secondary-container hover:bg-secondary";
      break;
    case "danger":
      variantClass = "bg-error text-on-error hover:bg-error/90";
      break;
    case "ghost":
      variantClass = "bg-transparent text-on-surface hover:bg-surface-container-high";
      break;
    case "surface-high":
      variantClass = "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40";
      break;
    case "atem-pgm":
      variantClass = "bg-red-600 text-white font-bold";
      break;
    case "atem-pvw":
      variantClass = "bg-green-600 text-white font-bold";
      break;
    case "atem-tie":
      variantClass = "bg-amber-500 text-on-surface font-bold";
      break;
    case "surface":
    default:
      variantClass = props.active
        ? "bg-primary text-on-primary shadow-sm"
        : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30";
      break;
  }

  const disabledAttr = props.disabled ? " disabled" : "";
  const idAttr = props.id ? ` id="${props.id}"` : "";
  const titleAttr = props.title ? ` title="${props.title}"` : "";
  const onclickAttr = props.onClickAttr ? ` onclick="${props.onClickAttr}"` : "";
  const extraClass = props.className ?? "";

  let dataAttrs = "";
  if (props.dataAttributes) {
    for (const [key, val] of Object.entries(props.dataAttributes)) {
      dataAttrs += ` data-${key}="${val}"`;
    }
  }

  const iconHtml = props.icon ? renderIcon({ name: props.icon, size: props.iconSize ?? (props.size === "xs" ? 14 : 16) }) : "";
  const labelHtml = props.label ? `<span>${props.label}</span>` : "";
  const badgeHtml = props.badge ? `<span class="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-black/20">${props.badge}</span>` : "";

  return `<button type="${type}"${idAttr}${titleAttr}${disabledAttr}${onclickAttr}${dataAttrs} class="inline-flex items-center justify-center rounded-lg font-label-sm font-bold uppercase transition-all select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${sizeClass} ${variantClass} ${extraClass}">
    ${iconHtml}
    ${labelHtml}
    ${badgeHtml}
  </button>`;
}
