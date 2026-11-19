// The /run/<id> page: shows an action list from the Canva "Go live" button and runs it (see run-logic.ts for the rules).
import { blockedOnRelay, describeStep, runIdFromPath, shouldAutoRun, whyNotRunnable, type ActionListSummary } from "./run-logic";

interface RunResult { ok: boolean; run?: { steps: Array<{ action: string; ok: boolean; error?: string }> }; error?: { message?: string }; list?: ActionListSummary }

export function currentRunId(): string | null {
  return runIdFromPath(window.location.pathname);
}

/** Shows the page over the app. `onOpenFeed` is called when the user wants to leave the page for the program tab. */
export async function openRunPage(id: string, outsideLan: boolean, onOpenFeed: () => void): Promise<void> {
  const overlay = document.createElement("div");
  overlay.id = "run-page";
  overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif";
  const card = document.createElement("div");
  card.style.cssText = "background:#fff;color:#111;border-radius:12px;max-width:420px;width:100%;padding:20px;box-sizing:border-box;max-height:90vh;overflow:auto";
  overlay.append(card);
  document.body.append(overlay);

  const close = () => {
    overlay.remove();
    window.history.replaceState(null, "", window.location.pathname.replace(/\/run\/[^/]+\/?$/, "/") || "/");
  };
  const el = (tag: string, text: string, css = "") => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (css) node.style.cssText = css;
    return node;
  };
  const button = (label: string, onClick: () => void, primary = true) => {
    const b = el("button", label, `display:block;width:100%;margin-top:12px;padding:12px;border-radius:8px;border:1px solid #333;font-size:16px;${primary ? "background:#111;color:#fff" : "background:#fff;color:#111"}`);
    b.addEventListener("click", onClick);
    return b;
  };
  const steps = (list: ActionListSummary, results?: Array<{ ok: boolean; error?: string }>) => {
    const ul = document.createElement("ul");
    ul.style.cssText = "padding-left:18px;margin:12px 0";
    list.steps.forEach((s, i) => {
      const r = results?.[i];
      ul.append(el("li", `${r ? (r.ok ? "✓ " : "✗ ") : ""}${describeStep(s)}${r?.error ? ` (${r.error})` : ""}`, r && !r.ok ? "color:#b00020" : ""));
    });
    return ul;
  };
  const render = (...nodes: Node[]) => card.replaceChildren(...nodes);

  const showList = (list: ActionListSummary, message?: string) => {
    const nodes: Node[] = [el("h2", list.name, "margin:0 0 4px;font-size:18px"), steps(list)];
    if (message) nodes.push(el("p", message, "color:#b00020"));
    const why = whyNotRunnable(list);
    const blocked = blockedOnRelay(list, outsideLan);
    if (blocked) nodes.push(el("p", "This list sends a picture to a projector. It can only be run on the church network.", "color:#b00020"));
    else if (why) nodes.push(el("p", why, "color:#b00020"));
    else nodes.push(button("Run", () => void run(list)));
    nodes.push(button("Close", close, false));
    render(...nodes);
  };

  const run = async (list: ActionListSummary) => {
    render(el("h2", list.name, "margin:0 0 4px;font-size:18px"), steps(list), el("p", "Putting the slides on the displays…"));
    let result: RunResult;
    try {
      const res = await fetch(`/api/v1/action-lists/${encodeURIComponent(list.id)}/run`, { method: "POST" });
      result = (await res.json().catch(() => ({}))) as RunResult;
      if (!res.ok && !result.error) result.error = { message: `HTTP ${res.status}` };
    } catch {
      result = { ok: false, error: { message: "The gateway did not answer." } };
    }
    if (result.ok && result.run) {
      render(el("h2", "Live", "margin:0 0 4px;font-size:18px"), steps(list, result.run.steps), button("Open the feed", () => { close(); onOpenFeed(); }), button("Close", close, false));
      return;
    }
    const failed = result.run?.steps ?? [];
    render(el("h2", list.name, "margin:0 0 4px;font-size:18px"), steps(list, failed), el("p", result.error?.message ?? "The list could not be run.", "color:#b00020"), button("Try again", () => void run(result.list ?? list)), button("Close", close, false));
  };

  render(el("p", "Loading…"));
  try {
    const res = await fetch(`/api/v1/action-lists/${encodeURIComponent(id)}`);
    if (res.status === 404) return render(el("p", "This link is not known any more. Press Go live in Canva again."), button("Close", close, false));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = (await res.json()) as ActionListSummary;
    if (shouldAutoRun(list, outsideLan)) await run(list);
    else showList(list);
  } catch {
    render(el("p", "Could not read the list from the gateway.", "color:#b00020"), button("Close", close, false));
  }
}
