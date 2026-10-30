export interface IconProps {
  name: string;
  size?: number | "xs" | "sm" | "md" | "lg" | "xl";
  filled?: boolean;
  color?: string;
  className?: string;
  id?: string;
}

export function renderIcon(props: IconProps): string {
  const sizeClass = typeof props.size === "number"
    ? `text-[${props.size}px]`
    : props.size === "xs"
      ? "text-[14px]"
      : props.size === "sm"
        ? "text-[16px]"
        : props.size === "md"
          ? "text-[20px]"
          : props.size === "lg"
            ? "text-[24px]"
            : props.size === "xl"
              ? "text-[32px]"
              : "text-[18px]";

  const fontClass = props.filled ? "material-symbols-filled" : "material-symbols-outlined";
  const idAttr = props.id ? ` id="${props.id}"` : "";
  const colorClass = props.color ?? "";
  const extraClass = props.className ?? "";

  return `<span${idAttr} class="${fontClass} ${sizeClass} ${colorClass} ${extraClass}" aria-hidden="true">${props.name}</span>`;
}
