import test from "node:test";
import assert from "node:assert/strict";
import {
  groupSteps, comingUp, pollIntervalMs, armSecondsLeft, formatCountdown, moveEntry, removeAt, addUnique,
  parsePlaylistDocument, describeLoadReport, filterLibrary, useAtMatchesDay, adviceFor, toDocument
} from "../ui/src/pipgm/logic.ts";
import { createPipgmClient, createPoller, PipgmError } from "../ui/src/pipgm/api.ts";

const row = (itemId, itemIndex, stepIndex, isActive = false) => ({
  itemId, itemIndex, itemTitle: itemId, itemKind: "pptx", stepIndex, label: `s${stepIndex}`, thumbnailUrl: null, isActive
});

test("groupSteps keeps item boundaries", () => {
  const groups = groupSteps([row("a", 0, 0), row("a", 0, 1), row("b", 1, 0)]);
  assert.deepEqual(groups.map((g) => [g.itemId, g.steps.length]), [["a", 2], ["b", 1]]);
});

test("comingUp starts at the active step", () => {
  const rows = [row("a", 0, 0), row("a", 0, 1, true), row("b", 1, 0)];
  assert.equal(comingUp(rows).length, 2);
  assert.equal(comingUp([row("a", 0, 0)]).length, 1);
});

test("pollIntervalMs is fast on air and slow idle", () => {
  assert.equal(pollIntervalMs([{ state: "live", playbackState: "stopped" }]), 1000);
  assert.equal(pollIntervalMs([{ state: "idle", playbackState: "stopped" }]), 10000);
  assert.equal(pollIntervalMs([{ state: "live", playbackState: "playing" }], true), 15000);
});

test("arm countdown", () => {
  const now = Date.parse("2026-11-18T10:00:00Z");
  assert.equal(armSecondsLeft({ audioEnabled: true, audioArmedUntil: "2026-11-18T10:01:30Z" }, now), 90);
  assert.equal(armSecondsLeft({ audioEnabled: false, audioArmedUntil: "2026-11-18T10:01:30Z" }, now), 0);
  assert.equal(armSecondsLeft({ audioEnabled: true, audioArmedUntil: "2026-11-18T09:00:00Z" }, now), 0);
  assert.equal(formatCountdown(90), "1:30");
});

test("draft edits", () => {
  assert.deepEqual(moveEntry(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveEntry(["a", "b"], 5, 0), ["a", "b"]);
  assert.deepEqual(removeAt(["a", "b", "c"], 1), ["a", "c"]);
  assert.deepEqual(addUnique(["a"], "a"), ["a"]);
  assert.deepEqual(addUnique(["a"], "b"), ["a", "b"]);
});

test("playlist document import is validated", () => {
  assert.equal(parsePlaylistDocument("nope").ok, false);
  assert.equal(parsePlaylistDocument(JSON.stringify({ schema: "x/2", name: "n", items: [] })).ok, false);
  assert.equal(parsePlaylistDocument(JSON.stringify({ name: "", items: [] })).ok, false);
  assert.equal(parsePlaylistDocument(JSON.stringify({ name: "n", items: [{ itemId: "a", pause: true }] })).ok, false);
  const ok = parsePlaylistDocument(JSON.stringify({ name: " Sunday ", orientation: "portrait", items: [{ itemId: "a" }, { pause: true }] }));
  assert.equal(ok.ok, true);
  assert.equal(ok.doc.name, "Sunday");
  assert.equal(ok.doc.schema, "piprogram.playlist/1");
});

test("toDocument keeps hymn numbers", () => {
  const doc = toDocument("x", { orientation: "landscape" }, [{ id: "h", kind: "hymn", title: "Virsi 336", hymn: { hymnNumber: "336", title: "t" } }]);
  assert.deepEqual(doc.items[0].hymn, { number: "336" });
});

test("load report lines", () => {
  const lines = describeLoadReport({
    mode: "replace", resolved: [], missing: [{ index: 1, itemId: "x", title: "Kuulutukset" }], duplicates: [],
    skipped: [{ index: 2, reason: "pause-not-supported" }], keptActiveItemId: null, carriedActiveItem: true
  });
  assert.equal(lines.length, 3);
  assert.match(lines[0], /Kuulutukset/);
});

test("library filter by day, kind and text", () => {
  const items = [
    { id: "1", title: "Virsi 336", kind: "hymn", useAt: ["2026-11-22"] },
    { id: "2", title: "Kuulutukset", kind: "pptx", useAt: ["2026-11-20/2026-11-23"] },
    { id: "3", title: "Muu", kind: "pptx" }
  ];
  assert.equal(useAtMatchesDay(["2026-11-22T10:30"], "2026-11-22"), true);
  assert.deepEqual(filterLibrary(items, { day: "2026-11-22" }).map((i) => i.id), ["1", "2"]);
  assert.deepEqual(filterLibrary(items, { kind: "pptx", day: "2026-11-22" }).map((i) => i.id), ["2"]);
  assert.deepEqual(filterLibrary(items, { text: "virsi" }).map((i) => i.id), ["1"]);
});

test("error advice", () => {
  assert.match(adviceFor(409, "AUDIO_NOT_ARMED", "").title, /not armed/);
  assert.match(adviceFor(503, "STORE_UNAVAILABLE", "").title, /store/);
  assert.match(adviceFor(0, "NETWORK", "").title, /Cannot reach/);
});

function fakeFetch(handler) {
  const calls = [];
  const f = async (url, init) => {
    calls.push({ url, init });
    const r = handler(url, init);
    return new Response(r.body === undefined ? null : JSON.stringify(r.body), { status: r.status ?? 200 });
  };
  return { f, calls };
}

test("client sends control with credentials and parses errors", async () => {
  const { f, calls } = fakeFetch((url) => (url.endsWith("/audio/kill") ? { status: 200, body: { items: [] } } : { status: 409, body: { error: { code: "AUDIO_NOT_ARMED", message: "arm first" } } }));
  const client = createPipgmClient({ resolve: (p) => p, fetch: f });
  await assert.rejects(client.control("PiPGM1", { action: "next" }), (e) => e instanceof PipgmError && e.status === 409 && e.code === "AUDIO_NOT_ARMED");
  assert.equal(calls[0].url, "/api/v1/pipgm/pipelines/PiPGM1/control");
  assert.equal(calls[0].init.credentials, "include");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(await client.audioKill(), []);
  assert.equal(calls[1].url, "/api/v1/pipgm/audio/kill");
});

test("getPipelines hides hidden feeds; order puts ids in the body", async () => {
  const { f, calls } = fakeFetch((url) => (url.endsWith("/pipelines") ? { body: { items: [{ id: "PiPGM1" }, { id: "PiPGM3", hidden: true }] } } : { body: {} }));
  const client = createPipgmClient({ resolve: (p) => p, fetch: f });
  assert.deepEqual((await client.getPipelines()).map((p) => p.id), ["PiPGM1"]);
  await client.setOrder("PiPGM2", ["a", "b"]);
  assert.deepEqual(JSON.parse(calls[1].init.body), { itemIds: ["a", "b"] });
  assert.equal(calls[1].init.method, "PUT");
});

test("network failure becomes status 0", async () => {
  const client = createPipgmClient({ resolve: (p) => p, fetch: async () => { throw new Error("down"); } });
  await assert.rejects(client.getItems(), (e) => e.status === 0);
});

test("poller uses the interval from the data and backs off on error", async () => {
  const delays = [];
  const timers = { set: (fn, ms) => { delays.push(ms); return 1; }, clear: () => {} };
  let fail = false;
  const seen = [];
  const poller = createPoller(
    { getPipelines: async () => { if (fail) throw new PipgmError(0, "NETWORK", "x"); return [{ id: "PiPGM1", state: "live", playbackState: "playing" }]; } },
    { onData: (p) => seen.push(p.length), onError: () => seen.push("err") },
    pollIntervalMs,
    timers
  );
  poller.start();
  await new Promise((r) => setImmediate(r));
  fail = true;
  poller.refresh();
  await new Promise((r) => setImmediate(r));
  poller.stop();
  assert.deepEqual(seen, [1, "err"]);
  assert.deepEqual(delays, [1000, 5000]);
});

import { runIdFromPath, shouldAutoRun, blockedOnRelay, describeStep, whyNotRunnable } from "../ui/src/run-logic.ts";

test("run page: id from the path, auto-run only on the LAN for a fresh single-use list", () => {
  const id = "11111111-2222-3333-4444-555555555555";
  assert.equal(runIdFromPath(`/run/${id}`), id);
  assert.equal(runIdFromPath(`/picontrol/run/${id}/`), id);
  assert.equal(runIdFromPath("/run/nope"), null);
  assert.equal(runIdFromPath("/"), null);
  assert.equal(shouldAutoRun({ state: "ready", singleUse: true }, false), true);
  assert.equal(shouldAutoRun({ state: "ready", singleUse: true }, true), false);
  assert.equal(shouldAutoRun({ state: "ready", singleUse: false }, false), false);
  assert.equal(shouldAutoRun({ state: "used", singleUse: true }, false), false);
  assert.equal(shouldAutoRun({ state: "expired", singleUse: true }, false), false);
  assert.equal(blockedOnRelay({ routesProjector: true }, true), true);
  assert.equal(blockedOnRelay({ routesProjector: true }, false), false);
  assert.equal(blockedOnRelay({ routesProjector: false }, true), false);
  assert.equal(whyNotRunnable({ state: "ready" }), null);
  assert.match(whyNotRunnable({ state: "expired" }), /expired/);
  assert.match(whyNotRunnable({ state: "used" }), /already/);
  assert.equal(describeStep({ action: "matrix:route", params: { input: 3, output: 2 } }), "Send Pi input 3 to the right projector");
  assert.equal(describeStep({ action: "pipgm:ftb", params: { feed: "PiPGM1", on: false } }), "Show the picture of PiPGM1");
});
