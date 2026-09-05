import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient, ApiError } from "../client.js";

function fail(err: unknown) {
  const message =
    err instanceof ApiError
      ? `${err.statusCode}: ${err.message}`
      : String(err);
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function registerCommerceTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    "list_products",
    {
      description:
        "List Commerce products. Use this to find a product id before creating a price or payment.",
      inputSchema: {
        active: z
          .boolean()
          .optional()
          .describe("Filter by archived/restored. Omit to list all."),
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Page number for pagination (starts at 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Number of items per page (max 100)"),
      },
    },
    async (args) => {
      try {
        const query: Record<string, unknown> = {};
        if (args.active !== undefined) query.active = args.active;
        if (args.page !== undefined) query.page = args.page;
        if (args.limit !== undefined) query.limit = args.limit;
        return ok(await client.get("/client/commerce/products", { query }));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "get_product",
    {
      description: "Get a product with its prices.",
      inputSchema: {
        id: z.string().describe("Product id"),
      },
    },
    async ({ id }) => {
      try {
        return ok(await client.get(`/client/commerce/products/${id}`));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "create_product",
    {
      description:
        "Create a Commerce product. Optionally create the first price with defaultPriceData (that price becomes the default).",
      inputSchema: {
        name: z.string().max(200).describe("Product name"),
        description: z
          .string()
          .max(2000)
          .optional()
          .describe("Optional product description"),
        defaultPriceData: z
          .object({
            unitAmount: z
              .union([z.string(), z.number()])
              .describe("Amount in VND as an integer or integer string (1–300000000)"),
            lookupKey: z
              .string()
              .max(200)
              .optional()
              .describe("Stable key you keep in your app, e.g. pro-monthly"),
            nickname: z
              .string()
              .max(200)
              .optional()
              .describe("Internal label only; customers never see it"),
          })
          .optional()
          .describe("Create the first price and make it the product default"),
      },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = { name: args.name };
        if (args.description !== undefined) body.description = args.description;
        if (args.defaultPriceData !== undefined) {
          body.defaultPriceData = {
            unitAmount: String(args.defaultPriceData.unitAmount),
            ...(args.defaultPriceData.lookupKey !== undefined
              ? { lookupKey: args.defaultPriceData.lookupKey }
              : {}),
            ...(args.defaultPriceData.nickname !== undefined
              ? { nickname: args.defaultPriceData.nickname }
              : {}),
          };
        }
        return ok(await client.post("/client/commerce/products", body));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "update_product",
    {
      description:
        "Update a product name, description, archive/restore, or default price. Does not change amounts on payment links already created.",
      inputSchema: {
        id: z.string().describe("Product id"),
        name: z.string().max(200).optional().describe("Product name"),
        description: z
          .union([z.string().max(2000), z.null()])
          .optional()
          .describe("Product description. Send null to clear."),
        active: z
          .boolean()
          .optional()
          .describe("Archive (false) or restore (true)"),
        defaultPriceId: z
          .union([z.string(), z.null()])
          .optional()
          .describe(
            "Default price id. Must be an active price of this product. Send null to clear.",
          ),
      },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.description !== undefined) body.description = args.description;
        if (args.active !== undefined) body.active = args.active;
        if (args.defaultPriceId !== undefined) body.defaultPriceId = args.defaultPriceId;
        return ok(await client.patch(`/client/commerce/products/${args.id}`, body));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "list_prices",
    {
      description:
        "List Commerce prices. Filter by productId or lookupKey to resolve a price id before creating a payment.",
      inputSchema: {
        productId: z.string().optional().describe("Filter by product id"),
        lookupKey: z
          .string()
          .optional()
          .describe("Filter by the stable lookup key, e.g. pro-monthly"),
        active: z
          .boolean()
          .optional()
          .describe("Filter by archived/restored. Omit to list all."),
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Page number for pagination (starts at 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Number of items per page (max 100)"),
      },
    },
    async (args) => {
      try {
        const query: Record<string, unknown> = {};
        if (args.productId !== undefined) query.productId = args.productId;
        if (args.lookupKey !== undefined) query.lookupKey = args.lookupKey;
        if (args.active !== undefined) query.active = args.active;
        if (args.page !== undefined) query.page = args.page;
        if (args.limit !== undefined) query.limit = args.limit;
        return ok(await client.get("/client/commerce/prices", { query }));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "get_price",
    {
      description: "Get a price by id.",
      inputSchema: {
        id: z.string().describe("Price id"),
      },
    },
    async ({ id }) => {
      try {
        return ok(await client.get(`/client/commerce/prices/${id}`));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "create_price",
    {
      description:
        "Create a price on a product. Amounts cannot be edited later — create a new price to change the amount. The first price on a product with no default becomes the default.",
      inputSchema: {
        productId: z.string().describe("Product this price belongs to"),
        unitAmount: z
          .union([z.string(), z.number()])
          .describe("Amount in VND as an integer or integer string (1–300000000)"),
        lookupKey: z
          .string()
          .max(200)
          .optional()
          .describe("Stable key you keep in your app, e.g. pro-monthly"),
        nickname: z
          .string()
          .max(200)
          .optional()
          .describe("Internal label only; customers never see it"),
        transferLookupKey: z
          .boolean()
          .optional()
          .describe(
            "Move lookupKey off the price that currently holds it instead of failing",
          ),
      },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {
          productId: args.productId,
          unitAmount: String(args.unitAmount),
        };
        if (args.lookupKey !== undefined) body.lookupKey = args.lookupKey;
        if (args.nickname !== undefined) body.nickname = args.nickname;
        if (args.transferLookupKey !== undefined) {
          body.transferLookupKey = args.transferLookupKey;
        }
        return ok(await client.post("/client/commerce/prices", body));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "update_price",
    {
      description:
        "Update a price nickname, lookup key, or archive/restore it. unitAmount cannot be changed.",
      inputSchema: {
        id: z.string().describe("Price id"),
        active: z
          .boolean()
          .optional()
          .describe("Archive (false) or restore (true)"),
        nickname: z
          .union([z.string().max(200), z.null()])
          .optional()
          .describe("Internal label. Send null to clear."),
        lookupKey: z
          .union([z.string().max(200), z.null()])
          .optional()
          .describe("Stable lookup key. Send null to clear."),
        transferLookupKey: z
          .boolean()
          .optional()
          .describe(
            "Move lookupKey off the price that currently holds it instead of failing",
          ),
      },
    },
    async (args) => {
      try {
        const body: Record<string, unknown> = {};
        if (args.active !== undefined) body.active = args.active;
        if (args.nickname !== undefined) body.nickname = args.nickname;
        if (args.lookupKey !== undefined) body.lookupKey = args.lookupKey;
        if (args.transferLookupKey !== undefined) {
          body.transferLookupKey = args.transferLookupKey;
        }
        return ok(await client.patch(`/client/commerce/prices/${args.id}`, body));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "list_commerce_invoices",
    {
      description:
        "List Commerce invoices (paid sales receipts for products sold). Filter by search term across invoice number, buyer, or product name.",
      inputSchema: {
        search: z
          .string()
          .optional()
          .describe("Search term across invoice number, buyer name, buyer email, or product name"),
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Page number for pagination (starts at 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Number of items per page (max 100)"),
      },
    },
    async (args) => {
      try {
        const query: Record<string, unknown> = {};
        if (args.search !== undefined) query.search = args.search;
        if (args.page !== undefined) query.page = args.page;
        if (args.limit !== undefined) query.limit = args.limit;
        return ok(await client.get("/client/commerce/invoices", { query }));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "get_commerce_invoice",
    {
      description:
        "Get a Commerce invoice by id, including seller info, buyer info, totals, and line items.",
      inputSchema: {
        id: z.string().describe("Commerce invoice id"),
      },
    },
    async ({ id }) => {
      try {
        return ok(await client.get(`/client/commerce/invoices/${id}`));
      } catch (err) {
        return fail(err);
      }
    },
  );
}
