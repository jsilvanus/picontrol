import type { EffectsPipeline, MultiviewTile } from "./types";
import { absoluteUrl, el } from "./dom";

// One tile of the multiview grid. update() is idempotent: it changes only the
// parts that differ, so a state change does not reload a running preview iframe.

export interface TileCallbacks {
  onCrop(sourceId: string, label: string): void;
}

export class TileView {
  readonly root: HTMLElement;
  readonly sourceId: string;

  private readonly label = el("span", "tile-label");
  private readonly labelText = el("span");
  private readonly idSmall = el("small");
  private readonly replacedSlot = el("small", "replaced-tag");
  private readonly pipgmMeta = el("span", "pipgm-meta");
  private readonly cropBadge = el("span", "crop-badge");
  private readonly status = el("span", "status-badge");
  private readonly content = el("div", "tile-content");
  private readonly ftbBanner = el("div", "ftb-banner");
  private readonly ftbSummary = el("small");
  private iframe: HTMLIFrameElement | null = null;
  private placeholder: HTMLElement | null = null;

  constructor(
    sourceId: string,
    private readonly base: string,
    callbacks: TileCallbacks
  ) {
    this.sourceId = sourceId;
    this.root = el("div", "tile");

    this.label.append(this.labelText, document.createTextNode(" "), this.idSmall, document.createTextNode(" "), this.replacedSlot);

    const cropBtn = el("button", "crop-btn", "✂ Crop");
    cropBtn.type = "button";
    cropBtn.title = "Adjust Crop & Effects";
    cropBtn.addEventListener("click", () => callbacks.onCrop(this.sourceId, this.labelText.textContent ?? this.sourceId));

    const header = el("div", "tile-header");
    const badges = el("div", "tile-badges");
    badges.append(this.pipgmMeta, this.cropBadge, cropBtn, this.status);
    header.append(this.label, badges);

    this.ftbBanner.append(el("span", undefined, "⬛ OUTPUT FADED TO BLACK"), this.ftbSummary);
    this.content.append(this.ftbBanner);

    this.root.append(header, this.content);
  }

  update(tile: MultiviewTile, fx: EffectsPipeline | undefined): void {
    const isLive = tile.state === "live";
    const isFtb = tile.pipgm?.fadeToBlack === true || fx?.fadeToBlack === true;
    const audioOn = tile.pipgm ? tile.pipgm.audioEnabled === true : fx?.muted !== true;

    this.root.className = `tile${isFtb ? " tile-ftb" : ""}`;
    this.labelText.textContent = tile.label;
    this.idSmall.textContent = `(${tile.sourceId})`;
    this.replacedSlot.textContent = tile.replacedSourceId ? `(replaces ${tile.replacedSourceId})` : "";
    this.replacedSlot.hidden = !tile.replacedSourceId;

    this.setPipgmMeta(tile, fx, audioOn);
    this.setCropBadge(fx);

    this.status.textContent = isFtb ? "⬛ FTB" : tile.state.toUpperCase();
    this.status.className = `status-badge ${isFtb ? "ftb" : isLive ? "live" : "offline"}`;

    this.ftbBanner.style.display = isFtb ? "flex" : "none";
    this.ftbSummary.textContent = tile.pipgm?.cuedSummary ?? "";

    const previewUrl = tile.preview.url ? absoluteUrl(this.base, tile.preview.url) : null;
    if (previewUrl && isLive) {
      this.showIframe(previewUrl);
    } else {
      this.showPlaceholder(tile, isFtb);
    }
  }

  private setPipgmMeta(tile: MultiviewTile, fx: EffectsPipeline | undefined, audioOn: boolean): void {
    if (tile.pipgm) {
      this.pipgmMeta.hidden = false;
      this.pipgmMeta.textContent =
        `${audioOn ? "\u{1F50A} ON" : "\u{1F507} MUTED"} • ${tile.pipgm.orientation === "portrait" ? "9:16" : "16:9"}`;
    } else if (fx?.muted) {
      this.pipgmMeta.hidden = false;
      this.pipgmMeta.textContent = "\u{1F507} MUTED";
    } else {
      this.pipgmMeta.hidden = true;
      this.pipgmMeta.textContent = "";
    }
  }

  private setCropBadge(fx: EffectsPipeline | undefined): void {
    if (fx?.crop.enabled) {
      this.cropBadge.hidden = false;
      this.cropBadge.className = "crop-badge active";
      this.cropBadge.textContent = `CROP ${fx.crop.aspectRatio}`;
    } else {
      this.cropBadge.hidden = true;
      this.cropBadge.className = "crop-badge";
      this.cropBadge.textContent = "CROP";
    }
  }

  private showIframe(src: string): void {
    this.placeholder?.remove();
    this.placeholder = null;
    if (!this.iframe) {
      this.iframe = el("iframe");
      this.iframe.setAttribute("allow", "autoplay; fullscreen");
      this.iframe.loading = "lazy";
      this.content.insertBefore(this.iframe, this.ftbBanner);
    }
    if (this.iframe.getAttribute("src") !== src) {
      this.iframe.src = src;
    }
  }

  private showPlaceholder(tile: MultiviewTile, isFtb: boolean): void {
    this.iframe?.remove();
    this.iframe = null;
    if (!this.placeholder) {
      this.placeholder = el("div", "placeholder");
      this.content.insertBefore(this.placeholder, this.ftbBanner);
    }
    this.placeholder.replaceChildren(
      el("div", "icon", isFtb ? "⬛" : "\u{1F4F9}"),
      el("div", "name", tile.label),
      el("div", "kind", isFtb ? "FADED TO BLACK" : tile.kind)
    );
  }
}
