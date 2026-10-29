import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
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

function runCliAsync(args = []) {
  return new Promise((resolve) => {
    const cp = spawn(process.execPath, [bin, ...args], {
      env: { ...process.env, NO_COLOR: "1" },
    });
    let stdout = "";
    let stderr = "";
    cp.stdout.on("data", (d) => (stdout += d.toString()));
    cp.stderr.on("data", (d) => (stderr += d.toString()));
    cp.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

describe("picontrol CLI", () => {
  it("shows usage with --help", () => {
    const res = runCli(["--help"]);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /picontrol CLI/);
    assert.match(res.stdout, /status/);
    assert.match(res.stdout, /ecosystem/);
    assert.match(res.stdout, /sound/);
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

  it("handles ecosystem commands via gateway", async () => {
    const http = await import("node:http");
    const server = http.createServer((req, res) => {
      if (req.url === "/api/v1/ecosystem") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          service: "pigateway",
          updatedAt: new Date().toISOString(),
          inUseTabs: ["outputs", "sound"],
          activePlugins: ["pisound"],
          components: {
            pisound: {
              id: "pisound",
              tab: "sound",
              name: "PiSound Audio DSP",
              description: "BSS Soundweb London",
              active: true,
              inUse: true,
              available: true,
              configured: true,
              connecting: false,
              lastSeenAt: null,
            }
          }
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;

    try {
      const res = await runCliAsync(["--gateway", `http://127.0.0.1:${port}`, "ecosystem"]);
      assert.equal(res.status, 0);
      assert.match(res.stdout, /Pi Ecosystem Control Plane/);
      assert.match(res.stdout, /pisound/);
      assert.match(res.stdout, /IN USE/);

      const jsonRes = await runCliAsync(["--gateway", `http://127.0.0.1:${port}`, "--json", "ecosystem"]);
      assert.equal(jsonRes.status, 0);
      const data = JSON.parse(jsonRes.stdout);
      assert.equal(data.service, "pigateway");
      assert.deepEqual(data.inUseTabs, ["outputs", "sound"]);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
