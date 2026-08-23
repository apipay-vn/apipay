import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig, normalizeBaseUrl, readCliConfigFile } from "./config.js";

test("normalizeBaseUrl formats URLs correctly", () => {
  assert.equal(normalizeBaseUrl("https://app.apipay.vn"), "https://app.apipay.vn/v1");
  assert.equal(normalizeBaseUrl("https://app.apipay.vn/"), "https://app.apipay.vn/v1");
  assert.equal(normalizeBaseUrl("https://app.apipay.vn/v1"), "https://app.apipay.vn/v1");
  assert.equal(normalizeBaseUrl("https://app.apipay.vn/v1/"), "https://app.apipay.vn/v1");
  assert.equal(normalizeBaseUrl("https://app.apipay.vn/v2"), "https://app.apipay.vn/v1");
  assert.equal(normalizeBaseUrl("http://localhost:3000"), "http://localhost:3000/v1");
});

test("loadConfig reads from environment variables", () => {
  const env = {
    APIPAY_ACCESS_KEY: "ak_test_123",
    APIPAY_SECRET_KEY: "sec_test_456",
    APIPAY_API_URL: "https://custom.api.com",
  };

  const config = loadConfig(env);
  assert.equal(config.accessKey, "ak_test_123");
  assert.equal(config.secretKey, "sec_test_456");
  assert.equal(config.baseUrl, "https://custom.api.com/v1");
});

test("loadConfig falls back to CLI config file if env missing", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "apipay-config-test-"));
  const tmpConfigFile = path.join(tmpDir, "config.json");
  fs.writeFileSync(
    tmpConfigFile,
    JSON.stringify({
      apiKey: {
        accessKey: "ak_test_from_cli",
        secretKey: "sec_test_from_cli",
      },
    }),
  );

  try {
    const config = loadConfig({}, tmpConfigFile);
    assert.equal(config.accessKey, "ak_test_from_cli");
    assert.equal(config.secretKey, "sec_test_from_cli");
    assert.equal(config.baseUrl, "https://app.apipay.vn/v1");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("loadConfig returns undefined credentials when none available without throwing", () => {
  const config = loadConfig({}, "/non/existent/path/config.json");
  assert.equal(config.accessKey, undefined);
  assert.equal(config.secretKey, undefined);
  assert.equal(config.baseUrl, "https://app.apipay.vn/v1");
});
