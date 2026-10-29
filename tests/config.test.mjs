import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeBaseUrl, resolveGatewayBaseUrl, resolveApiUrl } from "../ui/src/config.ts";

describe("Gateway URL Configuration & Same-Host Support", () => {
  it("normalizes empty strings and special same-origin tokens to empty string", () => {
    assert.equal(normalizeBaseUrl(""), "");
    assert.equal(normalizeBaseUrl(null), "");
    assert.equal(normalizeBaseUrl(undefined), "");
    assert.equal(normalizeBaseUrl("   "), "");
    assert.equal(normalizeBaseUrl("same-origin"), "");
    assert.equal(normalizeBaseUrl("origin"), "");
    assert.equal(normalizeBaseUrl("/"), "");
  });

  it("strips trailing slashes from valid URLs", () => {
    assert.equal(normalizeBaseUrl("http://127.0.0.1:3100/"), "http://127.0.0.1:3100");
    assert.equal(normalizeBaseUrl("https://keskuskirkko.fi///"), "https://keskuskirkko.fi");
    assert.equal(normalizeBaseUrl("http://localhost:3100"), "http://localhost:3100");
  });

  it("resolves from query parameter ?gateway= and ?api=", () => {
    assert.equal(resolveGatewayBaseUrl("?gateway=http://192.168.1.50:3100"), "http://192.168.1.50:3100");
    assert.equal(resolveGatewayBaseUrl("?api=http://gateway.local:3100/"), "http://gateway.local:3100");
    assert.equal(resolveGatewayBaseUrl("?other=val"), "");
  });

  it("resolves relative path directly when gateway is unset (same-host)", () => {
    // When no gateway query param or env is present, resolveApiUrl returns relative path
    const path = "/api/v1/status";
    assert.equal(resolveApiUrl(path), "/api/v1/status");
    assert.equal(resolveApiUrl("api/v1/status"), "/api/v1/status");
    assert.equal(resolveApiUrl("/api/v1/events?client=picontrol"), "/api/v1/events?client=picontrol");
  });

  it("prefixes target with gateway URL when configured", () => {
    assert.equal(
      resolveApiUrl("/api/v1/status", "?gateway=http://192.168.1.50:3100"),
      "http://192.168.1.50:3100/api/v1/status"
    );
    assert.equal(
      resolveApiUrl("/api/v1/events?client=picontrol", "?gateway=http://192.168.1.50:3100/"),
      "http://192.168.1.50:3100/api/v1/events?client=picontrol"
    );
  });
});
