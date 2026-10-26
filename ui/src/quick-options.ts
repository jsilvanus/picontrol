// Quick options card on the Outputs tab: named snapshots of the outputs state kept by
// pimatrix (/api/v1/quick-options). Tap applies one, "Save as quick" asks for a name and
// stores the current state, long-press renames or deletes.

interface QuickOption {
  id: string;
  name: string;
  createdAt: string;
}

const PATH = "/api/v1/quick-options";
const MAX_NAME = 40;

let toast: (message: string) => void = () => undefined;
let refreshOutputs: () => Promise<void> = async () => undefined;
let items: QuickOption[] = [];
let loadError = false;
let editing: QuickOption | null = null;
let appliedId: string | null = null;

function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

async function load(): Promise<void> {
  try {
    const res = await fetch(PATH);
    if (!res.ok) throw new Error(String(res.status));
    items = ((await res.json()) as { items: QuickOption[] }).items;
    loadError = false;
  } catch {
    loadError = true;
  }
  render();
}

function render(): void {
  const grid = byId("quick-grid");
  if (!grid) return;
  if (loadError) {
    grid.innerHTML = `<span class="col-span-3 font-label-sm text-[10px] text-on-surface-variant uppercase">Quick options unavailable</span>`;
    return;
  }
  if (items.length === 0) {
    grid.innerHTML = `<span class="col-span-3 font-label-sm text-[10px] text-on-surface-variant uppercase">None saved yet. Set up the outputs, then press Save as quick.</span>`;
    return;
  }
  grid.innerHTML = items
    .map((q) => {
      const active = q.id === appliedId;
      const cls = active
        ? "bg-primary text-on-primary shadow-sm"
        : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface";
      return `<button type="button" data-quick-id="${escapeHtml(q.id)}" onclick="quickApply('${escapeHtml(q.id)}')" oncontextmenu="event.preventDefault(); quickEdit('${escapeHtml(q.id)}')" title="Tap to apply • Hold to rename or delete" class="h-12 rounded-lg ${cls} p-space-xs flex items-center justify-center active:scale-95 transition-all">
        <span class="font-body-md text-xs font-semibold truncate w-full text-center">${escapeHtml(q.name)}</span>
      </button>`;
    })
    .join("");
}

function openDialog(option: QuickOption | null): void {
  editing = option;
  const dialog = byId<HTMLDialogElement>("quick-modal");
  const input = byId<HTMLInputElement>("quick-name-input");
  if (!dialog || !input) return;
  input.value = option?.name ?? "";
  byId("quick-modal-title")!.textContent = option ? "Edit quick option" : "Save as quick";
  byId("quick-delete-btn")?.classList.toggle("hidden", !option);
  byId("quick-error")?.classList.add("hidden");
  if (!dialog.open) dialog.showModal();
  input.focus();
}

function dialogError(message: string): void {
  const el = byId("quick-error");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

async function save(): Promise<void> {
  const input = byId<HTMLInputElement>("quick-name-input");
  const name = input?.value.trim() ?? "";
  if (!name) return dialogError("Enter a name");
  if (name.length > MAX_NAME) return dialogError(`At most ${MAX_NAME} characters`);
  try {
    const res = await fetch(editing ? `${PATH}/${encodeURIComponent(editing.id)}` : PATH, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (!res.ok) return dialogError(await errorMessage(res));
    byId<HTMLDialogElement>("quick-modal")?.close();
    toast(editing ? `Renamed to ${name}` : `Saved quick option ${name}`);
    await load();
  } catch {
    dialogError("Request failed");
  }
}

async function remove(): Promise<void> {
  if (!editing) return;
  try {
    const res = await fetch(`${PATH}/${encodeURIComponent(editing.id)}`, { method: "DELETE" });
    if (!res.ok) return dialogError(await errorMessage(res));
    byId<HTMLDialogElement>("quick-modal")?.close();
    toast(`Deleted ${editing.name}`);
    if (appliedId === editing.id) appliedId = null;
    await load();
  } catch {
    dialogError("Request failed");
  }
}

async function apply(id: string): Promise<void> {
  const option = items.find((q) => q.id === id);
  try {
    const res = await fetch(`${PATH}/${encodeURIComponent(id)}/apply`, { method: "POST" });
    if (!res.ok) {
      toast(`Quick option: ${await errorMessage(res)}`);
      return;
    }
    appliedId = id;
    render();
    toast(`Applied ${option?.name ?? "quick option"}`);
    await refreshOutputs();
  } catch {
    toast("Quick option request failed");
  }
}

export function initQuickOptions(showToast: (message: string) => void, refresh: () => Promise<void>): void {
  toast = showToast;
  refreshOutputs = refresh;
  window.quickSaveOpen = () => openDialog(null);
  window.quickEdit = (id) => openDialog(items.find((q) => q.id === id) ?? null);
  window.quickApply = (id) => apply(id);
  window.quickSubmit = () => save();
  window.quickDelete = () => remove();
  byId("quick-modal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) (e.currentTarget as HTMLDialogElement).close();
  });
  void load();
}
