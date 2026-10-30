import { renderButton } from "../atoms/button.js";
import { renderSlider } from "../atoms/slider.js";

export interface PtzPadProps {
  cameraId: "cam1" | "cam2" | string;
  speed?: number;
  onDirectionAttr?: (dir: "up" | "down" | "left" | "right" | "home" | "zoom-in" | "zoom-out") => string;
  onSpeedChangeAttr?: string;
  className?: string;
}

export function renderPtzPad(props: PtzPadProps): string {
  const speed = props.speed ?? 12;

  const btnUp = renderButton({
    icon: "arrow_drop_up",
    iconSize: 22,
    variant: "surface-high",
    size: "md",
    className: "w-11 h-11",
    dataAttributes: { cam: props.cameraId, dir: "up" }
  });

  const btnDown = renderButton({
    icon: "arrow_drop_down",
    iconSize: 22,
    variant: "surface-high",
    size: "md",
    className: "w-11 h-11",
    dataAttributes: { cam: props.cameraId, dir: "down" }
  });

  const btnLeft = renderButton({
    icon: "arrow_left",
    iconSize: 22,
    variant: "surface-high",
    size: "md",
    className: "w-11 h-11",
    dataAttributes: { cam: props.cameraId, dir: "left" }
  });

  const btnRight = renderButton({
    icon: "arrow_right",
    iconSize: 22,
    variant: "surface-high",
    size: "md",
    className: "w-11 h-11",
    dataAttributes: { cam: props.cameraId, dir: "right" }
  });

  const btnHome = renderButton({
    icon: "home",
    iconSize: 18,
    variant: "surface",
    size: "sm",
    className: "w-11 h-11",
    dataAttributes: { cam: props.cameraId, dir: "home" },
    title: "Home Position"
  });

  const btnZoomIn = renderButton({
    icon: "zoom_in",
    label: "In",
    variant: "surface-high",
    size: "sm",
    className: "flex-1",
    dataAttributes: { cam: props.cameraId, dir: "zoom-in" }
  });

  const btnZoomOut = renderButton({
    icon: "zoom_out",
    label: "Out",
    variant: "surface-high",
    size: "sm",
    className: "flex-1",
    dataAttributes: { cam: props.cameraId, dir: "zoom-out" }
  });

  const speedSlider = renderSlider({
    id: `ptz-speed-${props.cameraId}`,
    min: 1,
    max: 24,
    value: speed,
    label: "PTZ Speed",
    unit: "",
    onInputAttr: props.onSpeedChangeAttr,
    dataAttributes: { cam: props.cameraId }
  });

  const extraClass = props.className ?? "";

  return `<div class="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col items-center gap-2.5 ${extraClass}">
    <!-- D-Pad Grid -->
    <div class="grid grid-cols-3 gap-1.5 items-center justify-items-center w-36">
      <div></div>
      <div>${btnUp}</div>
      <div></div>
      <div>${btnLeft}</div>
      <div>${btnHome}</div>
      <div>${btnRight}</div>
      <div></div>
      <div>${btnDown}</div>
      <div></div>
    </div>

    <!-- Zoom Controls -->
    <div class="flex items-center gap-1.5 w-full pt-1">
      ${btnZoomIn}
      ${btnZoomOut}
    </div>

    <!-- Speed Slider -->
    <div class="w-full pt-1 border-t border-outline-variant/20">
      ${speedSlider}
    </div>
  </div>`;
}
