import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = join(__dirname, "..", "bin", "picontrol.mjs");

function runCli(args = []) {
  const res = spawnSync(process.execPath, [bin, ...args], {
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  return res;
}

describe("picontrol CLI", () => {
  it("shows usage with --help", () => {
    const res = runCli(["--help"]);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /picontrol CLI/);
    assert.match(res.stdout, /status/);
    assert.match(res.stdout, /youtube/);
    assert.match(res.stdout, /tally/);
    assert.match(res.stdout, /voice/);
    assert.match(res.stdout, /radio/);
    assert.match(res.stdout, /atem/);
    assert.match(res.stdout, /encoder/);
  });

  it("handles unknown commands gracefully", () => {
    const res = runCli(["nonexistent-command"]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /Unknown command: nonexistent-command/);
  });

  it("fails informatively when connection is refused", () => {
    const res = runCli(["--gateway", "http://127.0.0.1:59999", "status"]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /Failed to request http:\/\/127\.0\.0\.1:59999/);
  });

  it("outputs JSON error when --json is provided", () => {
    const res = runCli(["--gateway", "http://127.0.0.1:59999", "--json", "status"]);
    assert.equal(res.status, 1);
    const parsed = JSON.parse(res.stderr);
    assert.ok(parsed.error);
  });
});
