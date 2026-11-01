import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const bin = join(dirname(fileURLToPath(import.meta.url)), "..", "bin", "picontrol.mjs");

function runCli(args, env) {
  return new Promise((resolve) => {
    const cp = spawn(process.execPath, [bin, ...args], { env: { ...process.env, NO_COLOR: "1", ...env } });
    let stdout = "";
    let stderr = "";
    cp.stdout.on("data", (d) => (stdout += d));
    cp.stderr.on("data", (d) => (stderr += d));
    cp.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

function fakePitube({ hasRequestRoute }) {
  const calls = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      calls.push({ url: req.url, body: body ? JSON.parse(body) : null });
      const json = (code, v) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(v)); };
      if (req.url === "/api/v1/broadcasts/stop/request" && hasRequestRoute) return json(200, { confirmToken: "tok123" });
      if (req.url === "/api/v1/broadcasts/stop") return json(200, { id: "bc1", status: "complete" });
      json(404, { message: "Route not found", error: "Not Found" });
    });
  });
  return { server, calls };
}

for (const hasRequestRoute of [true, false]) {
  describe(`picontrol youtube stop (pitube ${hasRequestRoute ? "with" : "without"} the request route)`, () => {
    const { server, calls } = fakePitube({ hasRequestRoute });
    let port;
    before(() => new Promise((r) => server.listen(0, "127.0.0.1", () => { port = server.address().port; r(); })));
    after(() => server.close());

    it("sends the confirmToken when pitube hands one out", async () => {
      const res = await runCli(["youtube", "stop"], { PITUBE_URL: `http://127.0.0.1:${port}` });
      assert.equal(res.status, 0, res.stderr);
      const stop = calls.find((c) => c.url === "/api/v1/broadcasts/stop");
      assert.ok(stop);
      assert.deepEqual(stop.body, hasRequestRoute ? { confirmToken: "tok123" } : null);
    });
  });
}
