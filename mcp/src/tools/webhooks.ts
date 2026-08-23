import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient, ApiError } from "../client.js";

export function registerWebhooksTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    "apipay_list_webhooks",
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
    "apipay_create_webhook",
    {
      description:
        "Register a new webhook endpoint for transaction notifications on a connected bank account.",
      inputSchema: {
        webhookUrl: z
          .string()
          .describe("HTTPS URL to receive webhook notifications"),
        bankPublicId: z
          .string()
          .describe("Public ID of the connected bank account"),
      },
    },
    async ({ webhookUrl, bankPublicId }) => {
      try {
        const data = await client.post("/client/webhooks", {
          webhookUrl,
          bankPublicId,
        });
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
    "apipay_update_webhook",
    {
      description: "Update the destination URL of an existing webhook.",
      inputSchema: {
        id: z.string().describe("Webhook ID to update"),
        webhookUrl: z.string().describe("New HTTPS webhook URL"),
      },
    },
    async ({ id, webhookUrl }) => {
      try {
        const data = await client.patch(`/client/webhooks/${id}`, {
          webhookUrl,
        });
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
    "apipay_toggle_webhook",
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
    "apipay_remove_webhook",
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
    "apipay_list_webhook_deliveries",
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
          .describe("Filter by start date (YYYY-MM-DD or ISO 8601)"),
        dateTo: z
          .string()
          .optional()
          .describe("Filter by end date (YYYY-MM-DD or ISO 8601)"),
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
    "apipay_resend_webhook",
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
