import type { EffectsPipeline, MultiviewSnapshot } from "./types";
import { TileView, type TileCallbacks } from "./tiles";
import { byId } from "./dom";

// Keeps one TileView per source and lays them out in the snapshot's grid.
// Column/row counts come from the snapshot (landscape or portrait), not from fixed CSS.

const PORTRAIT_QUERY = "(orientation: portrait), (max-aspect-ratio: 1/1)";

export class MultiviewGrid {
  private readonly views = new Map<string, TileView>();
  private readonly grid = byId("grid");
  private readonly modePill = byId("grid-mode");
  private readonly portraitQuery = window.matchMedia(PORTRAIT_QUERY);
  private snapshot: MultiviewSnapshot | null = null;

  constructor(
    private readonly base: string,
    private readonly callbacks: TileCallbacks,
    private readonly effectsFor: (sourceId: string) => EffectsPipeline | undefined
  ) {
    this.portraitQuery.addEventListener("change", () => this.applyLayout());
    window.addEventListener("orientationchange", () => this.applyLayout());
  }

  render(snapshot: MultiviewSnapshot): void {
    this.snapshot = snapshot;
    const wanted = new Set(snapshot.tiles.map((t) => t.sourceId));
    for (const [id, view] of this.views) {
      if (!wanted.has(id)) {
        view.root.remove();
        this.views.delete(id);
      }
    }

    snapshot.tiles.forEach((tile, i) => {
      let view = this.views.get(tile.sourceId);
      if (!view) {
        view = new TileView(tile.sourceId, this.base, this.callbacks);
        this.views.set(tile.sourceId, view);
      }
      view.update(tile, this.effectsFor(tile.sourceId));
      // Move only tiles that are out of place, so untouched iframes are not reloaded.
      const current = this.grid.children[i];
      if (current !== view.root) this.grid.insertBefore(view.root, current ?? null);
    });

    this.applyLayout();
  }

  // Refresh one tile after a state, pipgm or effects change. Returns false if the tile is unknown.
  refreshTile(sourceId: string): boolean {
    const tile = this.snapshot?.tiles.find((t) => t.sourceId === sourceId);
    const view = this.views.get(sourceId);
    if (!tile || !view) return false;
    view.update(tile, this.effectsFor(sourceId));
    return true;
  }

  getTile(sourceId: string) {
    return this.snapshot?.tiles.find((t) => t.sourceId === sourceId);
  }

  private applyLayout(): void {
    const snap = this.snapshot;
    if (!snap) return;
    const portrait = this.portraitQuery.matches;
    const dims = portrait ? snap.portrait : snap.landscape;
    this.grid.style.gridTemplateColumns = `repeat(${dims.columns}, 1fr)`;
    this.grid.style.gridTemplateRows = `repeat(${dims.rows}, 1fr)`;
    this.modePill.textContent = portrait
      ? `Vertical ${dims.columns}x${dims.rows}`
      : `Landscape ${dims.columns}x${dims.rows}`;
  }
}
