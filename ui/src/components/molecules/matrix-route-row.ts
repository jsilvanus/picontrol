import { renderBadge } from "../atoms/badge.js";
import { renderButton } from "../atoms/button.js";

export interface MatrixInputItem {
  id: number;
  label: string;
}

export interface MatrixRouteRowProps {
  destinationId: number;
  destinationName: string;
  destinationSubtitle?: string;
  activeInputId: number | null;
  locked?: boolean;
  inputs?: MatrixInputItem[];
  onSelectRouteAttr?: (destId: number, inputId: number) => string;
  className?: string;
}

export function renderMatrixRouteRow(props: MatrixRouteRowProps): string {
  const inputs: MatrixInputItem[] = props.inputs ?? [
    { id: 1, label: "LUKUPULPETTI" },
    { id: 2, label: "RÄKKI" },
    { id: 3, label: "PI 1" },
    { id: 4, label: "PI 2" }
  ];

  const lockBadge = props.locked
    ? renderBadge({
        label: "LOCKED",
        variant: "warning",
        icon: "lock",
        size: "xs"
      })
    : "";

  const inputBtns = inputs.map(inp => {
    const isRouted = props.activeInputId === inp.id;
    return renderButton({
      label: `${inp.id}: ${inp.label}`,
      variant: isRouted ? "primary" : "surface-high",
      active: isRouted,
      disabled: props.locked,
      size: "sm",
      className: "flex-1 text-[11px]",
      dataAttributes: { dest: props.destinationId, input: inp.id },
      onClickAttr: props.onSelectRouteAttr ? props.onSelectRouteAttr(props.destinationId, inp.id) : undefined
    });
  }).join("");

  const extraClass = props.className ?? "";

  return `<div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2 ${extraClass}">
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0">
        <h4 class="font-headline-sm text-[14px] font-bold text-on-surface truncate leading-tight">${props.destinationName}</h4>
        ${props.destinationSubtitle ? `<span class="text-[9px] font-label-sm text-on-surface-variant block truncate">${props.destinationSubtitle}</span>` : ""}
      </div>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        ${lockBadge}
        ${renderBadge({ label: `Dest ${props.destinationId}`, variant: "outline", size: "xs" })}
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
      ${inputBtns}
    </div>
  </div>`;
}
