import test from "node:test";
import assert from "node:assert/strict";
import { ApiClient, ApiError, CredentialsError } from "./client.js";

test("ApiClient generates correct Base64 Bearer authorization header", async () => {
  const accessKey = "ak_test_user123";
  const secretKey = "sec_test_pass456";
  const expectedAuth = `Bearer ${Buffer.from(`${accessKey}:${secretKey}`).toString("base64")}`;

  let capturedHeaders: Record<string, string> | undefined;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    capturedHeaders = (init?.headers as Record<string, string>) || {};
    return new Response(JSON.stringify({ data: { success: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const client = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey,
      secretKey,
    });
    const res = await client.get("/client/banks/summary");
    assert.deepEqual(res, { success: true });
    assert.equal(capturedHeaders?.["Authorization"], expectedAuth);
    assert.equal(capturedHeaders?.["Accept"], "application/json");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ApiClient unwraps envelope data or passes through bare json", async () => {
  const originalFetch = globalThis.fetch;

  try {
    const client = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test",
      secretKey: "sec_test",
    });

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ data: { count: 42 }, statusCode: 200 }), {
        status: 200,
      });
    const res1 = await client.get("/test1");
    assert.deepEqual(res1, { count: 42 });

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ items: [1, 2, 3] }), {
        status: 200,
      });
    const res2 = await client.get("/test2");
    assert.deepEqual(res2, { items: [1, 2, 3] });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ApiClient does not retry 4xx errors (except 429)", async () => {
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  globalThis.fetch = async () => {
    callCount++;
    return new Response(
      JSON.stringify({ message: "Bad Request", statusCode: 400 }),
      { status: 400 },
    );
  };

  try {
    const client = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test",
      secretKey: "sec_test",
    });

    await assert.rejects(
      async () => {
        await client.get("/client/fail", { retries: 3 });
      },
      (err: any) => {
        assert.equal(err instanceof ApiError, true);
        assert.equal(err.statusCode, 400);
        assert.equal(err.message, "Bad Request");
        return true;
      },
    );

    assert.equal(callCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ApiClient formats query params with repeated keys for arrays", async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = "";

  globalThis.fetch = async (url) => {
    capturedUrl = url.toString();
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  };

  try {
    const client = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
      accessKey: "ak_test",
      secretKey: "sec_test",
    });

    await client.get("/client/payment-requests", {
      query: {
        page: 1,
        status: ["ACTIVE", "EXPIRED"],
        search: "test",
      },
    });

    const parsed = new URL(capturedUrl);
    assert.equal(parsed.pathname, "/v1/client/payment-requests");
    assert.equal(parsed.searchParams.get("page"), "1");
    assert.equal(parsed.searchParams.get("search"), "test");
    assert.deepEqual(parsed.searchParams.getAll("status"), ["ACTIVE", "EXPIRED"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ApiClient fails fast without credentials and does not call fetch", async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response("{}", { status: 200 });
  };

  try {
    const client = new ApiClient({
      baseUrl: "https://app.apipay.vn/v1",
    });
    const started = Date.now();
    await assert.rejects(
      () => client.get("/client/banks", { retries: 3 }),
      (err: unknown) => {
        assert.equal(err instanceof CredentialsError, true);
        assert.match((err as Error).message, /APIPAY_ACCESS_KEY/);
        assert.match((err as Error).message, /APIPAY_SECRET_KEY/);
        assert.match((err as Error).message, /config\.json/);
        return true;
      },
    );
    assert.equal(fetchCalled, false);
    assert.ok(Date.now() - started < 500, "missing credentials must not wait on retries");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
