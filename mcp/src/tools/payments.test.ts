import test from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ApiClient } from "../client.js";
import { registerPaymentsTools } from "./payments.js";

test("simulate_payment returns isError and does not invoke fetch for non-test_pr_ ID", async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response("{}", { status: 200 });
  };

  try {
    const server = new McpServer({ name: "test-server", version: "0.1.0" });
    const apiClient = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test_123",
      secretKey: "sec_test_456",
    });
    registerPaymentsTools(server, apiClient);

    const client = new Client({ name: "test-client", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: "apipay_simulate_payment",
      arguments: {
        publicId: "APIPAYJSCAF9H23M74K",
      },
    });

    assert.equal(fetchCalled, false, "fetch should not be called for non-sandbox ID");
    assert.equal(result.isError, true);
    assert.match(
      (result.content as any)[0].text,
      /starting with 'test_pr_'/i,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("simulate_payment makes POST with no auth header and no body for test_pr_ ID", async () => {
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedHeaders: Record<string, string> = {};
  let capturedBody: any = null;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    capturedUrl = url.toString();
    capturedMethod = init?.method ?? "";
    capturedHeaders = (init?.headers as Record<string, string>) || {};
    capturedBody = init?.body;
    return new Response(JSON.stringify({ data: { status: "PAID" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const server = new McpServer({ name: "test-server", version: "0.1.0" });
    const apiClient = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test_123",
      secretKey: "sec_test_456",
    });
    registerPaymentsTools(server, apiClient);

    const client = new Client({ name: "test-client", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: "apipay_simulate_payment",
      arguments: {
        publicId: "test_pr_abc123",
      },
    });

    assert.equal(result.isError, undefined);
    assert.equal(capturedUrl, "https://app.apipay.vn/v1/payment-requests/test_pr_abc123/pay");
    assert.equal(capturedMethod, "POST");
    assert.equal(capturedHeaders["Authorization"], undefined, "Authorization header must not be set");
    assert.equal(capturedBody, undefined, "Body must be undefined");

    const parsedContent = JSON.parse((result.content as any)[0].text);
    assert.deepEqual(parsedContent, { status: "PAID" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("create_payment sends amount as a string when given a number", async () => {
  let capturedBody: string | undefined;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    capturedBody = init?.body as string | undefined;
    return new Response(JSON.stringify({ data: { publicId: "test_pr_abc" } }), {
      status: 200,
    });
  };

  try {
    const server = new McpServer({ name: "test-server", version: "0.1.0" });
    const apiClient = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test_123",
      secretKey: "sec_test_456",
    });
    registerPaymentsTools(server, apiClient);

    const client = new Client({ name: "test-client", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: "apipay_create_payment",
      arguments: {
        bankPublicId: "bank_abc",
        amount: 50000,
      },
    });

    assert.equal(result.isError, undefined);
    assert.deepEqual(JSON.parse(capturedBody ?? "{}"), {
      bankPublicId: "bank_abc",
      amount: "50000",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
