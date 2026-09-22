import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient, ApiError } from "../client.js";

export function registerWebhooksTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    "list_webhooks",
    {
      description: "List registered webhook endpoints.",
      inputSchema: {
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
    async ({ page, limit }) => {
      try {
        const query: Record<string, any> = {};
        if (page !== undefined) query.page = page;
        if (limit !== undefined) query.limit = limit;

        const data = await client.get("/client/webhooks", { query });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.statusCode}: ${err.message}`
            : String(err);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_webhook",
    {
      description:
        "Register a new webhook endpoint for transaction notifications. By default the webhook fires for ALL current and future bank accounts. Optionally bind it to a legacy single bank with bankPublicId, or to an explicit allowlist with bankPublicIds ([] matches no banks). Delivery timeout defaults to 10s and an optional extra X-* request header can be attached. HMAC (ApiPay-Signature) is always sent and unchanged.",
      inputSchema: {
        webhookUrl: z
          .string()
          .describe("HTTPS URL to receive webhook notifications"),
        isActive: z
          .boolean()
          .optional()
          .describe("Whether the webhook is active on creation (default true)"),
        bankPublicId: z
          .string()
          .optional()
          .describe(
            "Legacy: bind the webhook to a single bank account by its public ID. Omit (with bankPublicIds) to cover all current and future banks.",
          ),
        bankPublicIds: z
          .array(z.string())
          .optional()
          .describe(
            "Selected bank allowlist. Omit (with no bankPublicId) to cover all current and future banks; [] matches no banks; future banks are not auto-added.",
          ),
        timeoutSeconds: z
          .number()
          .int()
          .min(5)
          .max(10)
          .optional()
          .describe("HTTP delivery timeout in seconds (5-10, default 10)"),
        extraHeader: z
          .object({
            name: z
              .string()
              .describe('Custom header name; must start with "X-"'),
            value: z.string().describe("Custom header value (non-empty)"),
          })
          .optional()
          .describe(
            "Optional extra request header sent with every delivery (X-* only).",
          ),
      },
    },
    async ({
      webhookUrl,
      isActive,
      bankPublicId,
      bankPublicIds,
      timeoutSeconds,
      extraHeader,
    }) => {
      try {
        const body: Record<string, any> = { webhookUrl };
        if (isActive !== undefined) body.isActive = isActive;
        if (bankPublicId !== undefined) body.bankPublicId = bankPublicId;
        if (bankPublicIds !== undefined) body.bankPublicIds = bankPublicIds;
        if (timeoutSeconds !== undefined) body.timeoutSeconds = timeoutSeconds;
        if (extraHeader !== undefined) body.extraHeader = extraHeader;

        const data = await client.post("/client/webhooks", body);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.statusCode}: ${err.message}`
            : String(err);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "update_webhook",
    {
      description:
        "Update an existing webhook's destination URL, active state, bank scope, delivery timeout, or extra header. Omit a field to leave it unchanged; pass null to reset it (bankPublicIds: null => all banks, timeoutSeconds: null => 10, extraHeader: null => off). HMAC (ApiPay-Signature) is always sent and unchanged.",
      inputSchema: {
        id: z.string().describe("Webhook ID to update"),
        webhookUrl: z
          .string()
          .optional()
          .describe("New HTTPS webhook URL"),
        isActive: z
          .boolean()
          .optional()
          .describe("Enable or disable the webhook"),
        bankPublicIds: z
          .array(z.string())
          .nullable()
          .optional()
          .describe(
            "Selected bank allowlist. Pass [] to match no banks, or null to cover all current and future banks.",
          ),
        timeoutSeconds: z
          .number()
          .int()
          .min(5)
          .max(10)
          .nullable()
          .optional()
          .describe(
            "HTTP delivery timeout in seconds (5-10). Pass null to reset to the default of 10.",
          ),
        extraHeader: z
          .object({
            name: z
              .string()
              .describe('Custom header name; must start with "X-"'),
            value: z.string().describe("Custom header value (non-empty)"),
          })
          .nullable()
          .optional()
          .describe(
            "Optional extra request header sent with every delivery (X-* only). Pass null to remove it.",
          ),
      },
    },
    async ({
      id,
      webhookUrl,
      isActive,
      bankPublicIds,
      timeoutSeconds,
      extraHeader,
    }) => {
      try {
        const body: Record<string, any> = {};
        if (webhookUrl !== undefined) body.webhookUrl = webhookUrl;
        if (isActive !== undefined) body.isActive = isActive;
        if (bankPublicIds !== undefined) body.bankPublicIds = bankPublicIds;
        if (timeoutSeconds !== undefined) body.timeoutSeconds = timeoutSeconds;
        if (extraHeader !== undefined) body.extraHeader = extraHeader;

        const data = await client.patch(`/client/webhooks/${id}`, body);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.statusCode}: ${err.message}`
            : String(err);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "toggle_webhook",
    {
      description: "Toggle a webhook between active and inactive states.",
      inputSchema: {
        id: z.string().describe("Webhook ID to toggle"),
      },
    },
    async ({ id }) => {
      try {
        const data = await client.patch(`/client/webhooks/${id}/toggle`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.statusCode}: ${err.message}`
            : String(err);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "remove_webhook",
    {
      description: "Permanently delete a registered webhook (destructive).",
      inputSchema: {
        id: z.string().describe("Webhook ID to delete"),
      },
    },
    async ({ id }) => {
      try {
        const data = await client.delete(`/client/webhooks/${id}`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.statusCode}: ${err.message}`
            : String(err);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "list_webhook_deliveries",
    {
      description: "List webhook delivery logs and attempt statuses.",
      inputSchema: {
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
        webhookId: z
          .string()
          .optional()
          .describe("Filter by specific webhook ID"),
        status: z
          .enum(["SUCCESS", "FAILED"])
          .optional()
          .describe("Filter by delivery status"),
        dateFrom: z
          .string()
          .optional()
          .describe("Filter by start date, interpreted as a Vietnam (UTC+7) calendar day (YYYY-MM-DD or ISO 8601)"),
        dateTo: z
          .string()
          .optional()
          .describe("Filter by end date, inclusive, Vietnam (UTC+7) calendar day (YYYY-MM-DD or ISO 8601)"),
      },
    },
    async (args) => {
      try {
        const query: Record<string, any> = {};
        if (args.page !== undefined) query.page = args.page;
        if (args.limit !== undefined) query.limit = args.limit;
        if (args.webhookId !== undefined) query.webhookId = args.webhookId;
        if (args.status !== undefined) query.status = args.status;
        if (args.dateFrom !== undefined) query.dateFrom = args.dateFrom;
        if (args.dateTo !== undefined) query.dateTo = args.dateTo;

        const data = await client.get("/client/webhooks/deliveries", { query });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.statusCode}: ${err.message}`
            : String(err);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "resend_webhook",
    {
      description:
        "Resend a failed webhook delivery (fires a real HTTP request to the merchant URL).",
      inputSchema: {
        historyId: z
          .string()
          .describe("Webhook delivery history ID to resend"),
      },
    },
    async ({ historyId }) => {
      try {
        const data = await client.post(
          `/client/webhooks/history/${historyId}/resend`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.statusCode}: ${err.message}`
            : String(err);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );
}
