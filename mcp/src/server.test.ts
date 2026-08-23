import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "./server.js";

const EXPECTED_TOOLS = [
  "apipay_self_test",
  "apipay_list_banks",
  "apipay_create_payment",
  "apipay_list_payments",
  "apipay_cancel_payment",
  "apipay_simulate_payment",
  "apipay_list_webhooks",
  "apipay_create_webhook",
  "apipay_update_webhook",
  "apipay_toggle_webhook",
  "apipay_remove_webhook",
  "apipay_list_webhook_deliveries",
  "apipay_resend_webhook",
  "apipay_get_overview",
  "apipay_list_transactions",
];

test("server registers exactly the 15 expected tools", async () => {
  const server = createServer({
    accessKey: "ak_test_123",
    secretKey: "sec_test_456",
  });

  const client = new Client({ name: "test-client", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  const { tools } = await client.listTools();
  const toolNames = tools.map((t) => t.name);

  assert.equal(toolNames.length, 15, `Expected 15 tools, received: ${toolNames.length}`);
  assert.deepEqual(toolNames.sort(), [...EXPECTED_TOOLS].sort());
});

test("authenticated tools fail fast when credentials are missing", async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response("{}", { status: 200 });
  };

  try {
    const server = createServer({
      accessKey: undefined,
      secretKey: undefined,
    });

    const client = new Client({ name: "test-client", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const started = Date.now();
    const result = await client.callTool({
      name: "apipay_list_banks",
      arguments: {},
    });

    assert.equal(result.isError, true);
    assert.equal(fetchCalled, false);
    assert.ok(Date.now() - started < 500, "missing credentials must not wait on retries");
    const text = (result.content as any)[0].text;
    assert.match(text, /APIPAY_ACCESS_KEY/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("apipay_self_test returns isError and mentions environment variables when credentials are missing", async () => {
  const server = createServer({
    accessKey: undefined,
    secretKey: undefined,
  });

  const client = new Client({ name: "test-client", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  const result = await client.callTool({
    name: "apipay_self_test",
    arguments: {},
  });

  assert.equal(result.isError, true);
  const text = (result.content as any)[0].text;
  assert.match(text, /APIPAY_ACCESS_KEY/);
  assert.match(text, /APIPAY_SECRET_KEY/);
  assert.match(text, /config\.json/);
});

test("apipay_self_test succeeds when credentials are valid", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: {
          total: 2,
          active: 2,
          inactive: 0,
          pending: 0,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

  try {
    const server = createServer({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test_samplekey123",
      secretKey: "sec_test_samplekey456",
    });

    const client = new Client({ name: "test-client", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: "apipay_self_test",
      arguments: {},
    });

    assert.equal(result.isError, undefined);
    const parsed = JSON.parse((result.content as any)[0].text);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.baseUrl, "https://app.apipay.vn/v1");
    assert.equal(parsed.keyPrefix, "ak_test_");
    assert.deepEqual(parsed.summary, {
      total: 2,
      active: 2,
      inactive: 0,
      pending: 0,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
