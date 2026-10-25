import type { EffectsPipeline } from "./types";
import type { PiMatrixApi } from "./api";
import { byId } from "./dom";

// Crop & effects dialog: the same controls as the server-rendered page, as client code.
// It owns no state of its own beyond the source it is showing; the effects themselves
// live in the shared store, which the caller passes in through CropContext.

export interface CropContext {
  api: PiMatrixApi;
  getEffects(sourceId: string): EffectsPipeline | undefined;
  setEffects(fx: EffectsPipeline): void;
}

const LOCK_ON = "\u{1F512} Lock Aspect: ON";
const LOCK_OFF = "\u{1F513} Lock Aspect: OFF";

export class CropModal {
  private activeSourceId: string | null = null;
  private dragging = false;
  private dragStart = { clientX: 0, clientY: 0, cropX: 0, cropY: 0 };

  private readonly overlay = byId("crop-modal");
  private readonly title = byId("modal-source-title");
  private readonly zoomedBox = byId("crop-zoomed-box");
  private readonly zoomedInner = byId("crop-zoomed-inner");
  private readonly previewBox = byId("preview-box");
  private readonly previewBg = byId("preview-box-bg");
  private readonly cropRect = byId("crop-rect");
  private readonly cropRectLabel = byId("crop-rect-label");
  private readonly coords = byId("crop-coords");
  private readonly lockBtn = byId("btn-lock-aspect");

  constructor(private readonly ctx: CropContext) {
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
    byId("crop-close").addEventListener("click", () => this.close());

    document.querySelectorAll<HTMLButtonElement>("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => this.post(`crop/preset`, { preset: btn.dataset.preset }, "Failed to apply crop preset"));
    });
    document.querySelectorAll<HTMLButtonElement>("[data-move]").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.post(`crop/move`, { direction: btn.dataset.move, delta: 32 }, "Failed to move crop")
      );
    });
    document.querySelectorAll<HTMLButtonElement>("[data-resize]").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.post(`crop/resize`, { action: btn.dataset.resize, factor: 0.1 }, "Failed to resize crop")
      );
    });
    this.lockBtn.addEventListener("click", () => this.toggleLock());
    this.bindPreviewDrag();
  }

  get openSourceId(): string | null {
    return this.activeSourceId;
  }

  async open(sourceId: string, label: string): Promise<void> {
    this.activeSourceId = sourceId;
    this.title.textContent = `Crop & Effects: ${label} (${sourceId})`;
    this.overlay.classList.add("open");
    if (!this.ctx.getEffects(sourceId)) {
      try {
        const fx = await this.ctx.api.get<EffectsPipeline>(`/api/v1/sources/${encodeURIComponent(sourceId)}/effects`);
        if (this.activeSourceId === sourceId) this.ctx.setEffects(fx);
      } catch (err) {
        console.error("Failed to load effects", err);
      }
    }
    this.refresh();
  }

  close(): void {
    this.overlay.classList.remove("open");
    this.activeSourceId = null;
    this.dragging = false;
  }

  // Redraw from the shared store (called after any effects change).
  refresh(): void {
    const id = this.activeSourceId;
    if (!id) return;
    const fx = this.ctx.getEffects(id);
    if (!fx) return;
    this.draw(fx);
  }

  private draw(fx: EffectsPipeline): void {
    const id = fx.sourceId;
    const crop = fx.crop;
    const sw = crop.sourceWidth || 1920;
    const sh = crop.sourceHeight || 1080;

    this.lockBtn.textContent = crop.lockedAspectRatio ? LOCK_ON : LOCK_OFF;

    this.cropRect.style.left = `${(crop.x / sw) * 100}%`;
    this.cropRect.style.top = `${(crop.y / sh) * 100}%`;
    this.cropRect.style.width = `${(crop.width / sw) * 100}%`;
    this.cropRect.style.height = `${(crop.height / sh) * 100}%`;

    this.cropRectLabel.textContent = `${crop.aspectRatio}${crop.enabled ? " [ACTIVE]" : " [OFF]"}`;
    this.coords.textContent = `x: ${crop.x}, y: ${crop.y}, w: ${crop.width}, h: ${crop.height} | FFmpeg: ${fx.ffmpegFilter}`;

    // Upper duplicated view: the cropped region scaled into a small box.
    const cw = Math.max(32, crop.width || sw);
    const ch = Math.max(32, crop.height || sh);
    const maxH = 102;
    const maxW = 460;
    let boxH = maxH;
    let boxW = Math.round((cw / ch) * boxH);
    if (boxW > maxW) {
      boxW = maxW;
      boxH = Math.round((ch / cw) * boxW);
    }
    this.zoomedBox.style.width = `${boxW}px`;
    this.zoomedBox.style.height = `${boxH}px`;
    this.zoomedInner.style.width = `${sw}px`;
    this.zoomedInner.style.height = `${sh}px`;
    this.zoomedInner.style.transform =
      `scale(${boxW / cw}, ${boxH / ch}) translate(${-crop.x}px, ${-crop.y}px)`;
    this.zoomedInner.replaceChildren(stub(id, "crop-stub-large"));

    this.previewBg.replaceChildren(stub(id, "crop-stub-small"));
  }

  private async post(action: string, body: unknown, errorMessage: string): Promise<void> {
    const id = this.activeSourceId;
    if (!id) return;
    try {
      const fx = await this.ctx.api.post<EffectsPipeline>(`/api/v1/sources/${encodeURIComponent(id)}/effects/${action}`, body);
      this.ctx.setEffects(fx);
    } catch (err) {
      console.error(errorMessage, err);
    }
  }

  private async toggleLock(): Promise<void> {
    const id = this.activeSourceId;
    if (!id) return;
    const current = this.ctx.getEffects(id);
    const lockedAspectRatio = !(current && current.crop.lockedAspectRatio);
    try {
      const fx = await this.ctx.api.put<EffectsPipeline>(`/api/v1/sources/${encodeURIComponent(id)}/effects/crop`, {
        lockedAspectRatio
      });
      this.ctx.setEffects(fx);
    } catch (err) {
      console.error("Failed to change aspect lock", err);
    }
  }

  // Dragging on the full-frame box moves the crop; the upper view stays unobstructed.
  private bindPreviewDrag(): void {
    const box = this.previewBox;

    box.addEventListener("pointerdown", (e) => {
      const id = this.activeSourceId;
      const fx = id ? this.ctx.getEffects(id) : undefined;
      if (!fx) return;
      this.dragging = true;
      this.dragStart = { clientX: e.clientX, clientY: e.clientY, cropX: fx.crop.x, cropY: fx.crop.y };
      box.setPointerCapture?.(e.pointerId);
    });

    box.addEventListener("pointermove", (e) => {
      const id = this.activeSourceId;
      const fx = id ? this.ctx.getEffects(id) : undefined;
      if (!this.dragging || !fx) return;
      const rect = box.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const sw = fx.crop.sourceWidth || 1920;
      const sh = fx.crop.sourceHeight || 1080;
      const dx = Math.round(((e.clientX - this.dragStart.clientX) / rect.width) * sw);
      const dy = Math.round(((e.clientY - this.dragStart.clientY) / rect.height) * sh);
      fx.crop.x = clamp(Math.round((this.dragStart.cropX + dx) / 2) * 2, 0, sw - fx.crop.width);
      fx.crop.y = clamp(Math.round((this.dragStart.cropY + dy) / 2) * 2, 0, sh - fx.crop.height);
      fx.crop.enabled = true;
      this.refresh();
    });

    const finish = async () => {
      const id = this.activeSourceId;
      const fx = id ? this.ctx.getEffects(id) : undefined;
      if (!this.dragging || !id || !fx) {
        this.dragging = false;
        return;
      }
      this.dragging = false;
      try {
        const saved = await this.ctx.api.put<EffectsPipeline>(
          `/api/v1/sources/${encodeURIComponent(id)}/effects/crop`,
          { enabled: true, x: fx.crop.x, y: fx.crop.y }
        );
        this.ctx.setEffects(saved);
      } catch (err) {
        console.error("Failed to save crop position", err);
      }
    };
    box.addEventListener("pointerup", finish);
    box.addEventListener("pointercancel", finish);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Placeholder picture until real frames are wired in (the reference page did the same).
function stub(sourceId: string, className: string): HTMLElement {
  const div = document.createElement("div");
  div.className = `crop-stub ${className}`;
  div.textContent = `${sourceId.toUpperCase()}${className === "crop-stub-large" ? " LIVE" : ""}`;
  return div;
}
