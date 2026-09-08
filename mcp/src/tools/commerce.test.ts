import test from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ApiClient } from "../client.js";
import { registerCommerceTools } from "./commerce.js";

async function withCommerceClient(
  fetchImpl: typeof fetch,
  run: (client: Client) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;

  try {
    const server = new McpServer({ name: "test-server", version: "0.1.0" });
    const apiClient = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test_123",
      secretKey: "sec_test_456",
    });
    registerCommerceTools(server, apiClient);

    const client = new Client({ name: "test-client", version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    await run(client);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("list_prices sends productId and lookupKey as query params", async () => {
  let capturedUrl = "";
  await withCommerceClient(async (url) => {
    capturedUrl = url.toString();
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "list_prices",
      arguments: {
        productId: "prod_1",
        lookupKey: "pro-monthly",
      },
    });

    assert.equal(result.isError, undefined);
    const parsed = new URL(capturedUrl);
    assert.equal(parsed.pathname, "/v1/client/commerce/prices");
    assert.equal(parsed.searchParams.get("productId"), "prod_1");
    assert.equal(parsed.searchParams.get("lookupKey"), "pro-monthly");
  });
});

test("create_product posts defaultPriceData with unitAmount as a string", async () => {
  let capturedUrl = "";
  let capturedBody = "";
  await withCommerceClient(async (url, init) => {
    capturedUrl = url.toString();
    capturedBody = String(init?.body ?? "");
    return new Response(JSON.stringify({ data: { id: "prod_1" } }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "create_product",
      arguments: {
        name: "Pro plan",
        defaultPriceData: {
          unitAmount: 99000,
          lookupKey: "pro-monthly",
        },
      },
    });

    assert.equal(result.isError, undefined);
    assert.equal(new URL(capturedUrl).pathname, "/v1/client/commerce/products");
    assert.deepEqual(JSON.parse(capturedBody), {
      name: "Pro plan",
      defaultPriceData: {
        unitAmount: "99000",
        lookupKey: "pro-monthly",
      },
    });
  });
});

test("update_price patches active and does not send unitAmount", async () => {
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedBody = "";
  await withCommerceClient(async (url, init) => {
    capturedUrl = url.toString();
    capturedMethod = init?.method ?? "";
    capturedBody = String(init?.body ?? "");
    return new Response(JSON.stringify({ data: { id: "price_1" } }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "update_price",
      arguments: {
        id: "price_1",
        active: false,
      },
    });

    assert.equal(result.isError, undefined);
    assert.equal(capturedMethod, "PATCH");
    assert.equal(new URL(capturedUrl).pathname, "/v1/client/commerce/prices/price_1");
    assert.deepEqual(JSON.parse(capturedBody), { active: false });
  });
});

test("delete_price sends DELETE to the price id", async () => {
  let capturedUrl = "";
  let capturedMethod = "";
  await withCommerceClient(async (url, init) => {
    capturedUrl = url.toString();
    capturedMethod = init?.method ?? "";
    return new Response(JSON.stringify({ status: true }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "delete_price",
      arguments: { id: "price_1" },
    });

    assert.equal(result.isError, undefined);
    assert.equal(capturedMethod, "DELETE");
    assert.equal(new URL(capturedUrl).pathname, "/v1/client/commerce/prices/price_1");
  });
});

test("list_commerce_invoices sends search and pagination params", async () => {
  let capturedUrl = "";
  await withCommerceClient(async (url) => {
    capturedUrl = url.toString();
    return new Response(JSON.stringify({ data: [], pagination: { page: 1, limit: 10, total: 0 } }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "list_commerce_invoices",
      arguments: {
        search: "CINV-202609",
        page: 2,
        limit: 10,
      },
    });

    assert.equal(result.isError, undefined);
    const parsed = new URL(capturedUrl);
    assert.equal(parsed.pathname, "/v1/client/commerce/invoices");
    assert.equal(parsed.searchParams.get("search"), "CINV-202609");
    assert.equal(parsed.searchParams.get("page"), "2");
    assert.equal(parsed.searchParams.get("limit"), "10");
  });
});

test("get_commerce_invoice calls endpoint with id", async () => {
  let capturedUrl = "";
  await withCommerceClient(async (url) => {
    capturedUrl = url.toString();
    return new Response(JSON.stringify({ data: { id: "cinv_123", invoiceNumber: "CINV-202609-0001" } }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "get_commerce_invoice",
      arguments: {
        id: "cinv_123",
      },
    });

    assert.equal(result.isError, undefined);
    assert.equal(new URL(capturedUrl).pathname, "/v1/client/commerce/invoices/cinv_123");
  });
});

test("list_commerce_customers sends search and pagination params", async () => {
  let capturedUrl = "";
  await withCommerceClient(async (url) => {
    capturedUrl = url.toString();
    return new Response(JSON.stringify({ data: [], pagination: { page: 1, limit: 10, total: 0 } }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "list_commerce_customers",
      arguments: {
        search: "Acme",
        page: 1,
        limit: 10,
      },
    });

    assert.equal(result.isError, undefined);
    const parsed = new URL(capturedUrl);
    assert.equal(parsed.pathname, "/v1/client/commerce/customers");
    assert.equal(parsed.searchParams.get("search"), "Acme");
  });
});

test("create_commerce_customer posts customer data", async () => {
  let capturedUrl = "";
  let capturedBody = "";
  await withCommerceClient(async (url, init) => {
    capturedUrl = url.toString();
    capturedBody = String(init?.body ?? "");
    return new Response(JSON.stringify({ data: { id: "cust_123" } }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "create_commerce_customer",
      arguments: {
        name: "Acme Corp",
        email: "contact@acme.vn",
        taxCode: "0101234567",
      },
    });

    assert.equal(result.isError, undefined);
    assert.equal(new URL(capturedUrl).pathname, "/v1/client/commerce/customers");
    assert.deepEqual(JSON.parse(capturedBody), {
      name: "Acme Corp",
      email: "contact@acme.vn",
      taxCode: "0101234567",
    });
  });
});

test("send_commerce_invoice posts payload to send endpoint", async () => {
  let capturedUrl = "";
  let capturedBody = "";
  await withCommerceClient(async (url, init) => {
    capturedUrl = url.toString();
    capturedBody = String(init?.body ?? "");
    return new Response(JSON.stringify({
      data: {
        customer: { id: "cust_123", name: "Acme Corp", email: "contact@acme.vn" },
        paymentRequest: { publicId: "PR123", payUrl: "https://pay.apipay.vn/p/PR123" },
        emailed: true,
      },
    }), { status: 200 });
  }, async (client) => {
    const result = await client.callTool({
      name: "send_commerce_invoice",
      arguments: {
        customerId: "cust_123",
        priceId: "price_abc",
      },
    });

    assert.equal(result.isError, undefined);
    assert.equal(new URL(capturedUrl).pathname, "/v1/client/commerce/invoices/send");
    assert.deepEqual(JSON.parse(capturedBody), {
      customerId: "cust_123",
      priceId: "price_abc",
    });
  });
});

