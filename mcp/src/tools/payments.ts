import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient, ApiError } from "../client.js";

export function registerPaymentsTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    "create_payment",
    {
      description:
        "Create a payment link (payment request). Call list_banks first if bankPublicId is unknown. Send amount or priceId, not both.",
      inputSchema: {
        bankPublicId: z
          .string()
          .describe(
            "Public ID of the connected bank account. Call list_banks first if bankPublicId is unknown.",
          ),
        amount: z
          .union([z.string(), z.number()])
          .optional()
          .describe(
            "Amount in VND as an integer or integer string (1–300000000). Omit to let the payer enter the amount. Do not send together with priceId.",
          ),
        priceId: z
          .string()
          .optional()
          .describe(
            "Commerce price id. Copies the price amount onto this payment link. Do not send together with amount. Resolve lookup keys with list_prices first.",
          ),
        content: z
          .string()
          .max(140)
          .optional()
          .describe("Transfer memo / content (max 140 chars)"),
        title: z
          .string()
          .max(200)
          .optional()
          .describe("Title displayed on payment page (max 200 chars)"),
        expiresAt: z
          .string()
          .optional()
          .describe("Expiration ISO 8601 date-time string. Omit for no expiry."),
        redirectUrl: z
          .string()
          .optional()
          .describe("HTTPS URL to redirect after payment completion"),
      },
    },
    async (args) => {
      if (args.amount !== undefined && args.priceId !== undefined) {
        return {
          content: [
            {
              type: "text",
              text: "amount and priceId are mutually exclusive — send one or the other",
            },
          ],
          isError: true,
        };
      }

      try {
        const body: Record<string, any> = {
          bankPublicId: args.bankPublicId,
        };
        if (args.amount !== undefined) body.amount = String(args.amount);
        if (args.priceId !== undefined) body.priceId = args.priceId;
        if (args.content !== undefined) body.content = args.content;
        if (args.title !== undefined) body.title = args.title;
        if (args.expiresAt !== undefined) body.expiresAt = args.expiresAt;
        if (args.redirectUrl !== undefined) body.redirectUrl = args.redirectUrl;

        const data = await client.post("/client/payment-requests", body);
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
    "list_payments",
    {
      description:
        "List payment requests with optional filtering by status, date range, or search keyword.",
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
        search: z
          .string()
          .optional()
          .describe("Search by public ID, content, title, or account number"),
        status: z
          .union([
            z.enum(["ACTIVE", "EXPIRED", "COMPLETED", "CANCELLED"]),
            z.array(z.enum(["ACTIVE", "EXPIRED", "COMPLETED", "CANCELLED"])),
          ])
          .optional()
          .describe("Filter by payment request status"),
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
        if (args.search !== undefined) query.search = args.search;
        if (args.status !== undefined) query.status = args.status;
        if (args.dateFrom !== undefined) query.dateFrom = args.dateFrom;
        if (args.dateTo !== undefined) query.dateTo = args.dateTo;

        const data = await client.get("/client/payment-requests", { query });
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
    "cancel_payment",
    {
      description:
        "Cancel an ACTIVE payment request (destructive, only ACTIVE requests can be cancelled).",
      inputSchema: {
        publicId: z
          .string()
          .describe("Public ID of the payment request to cancel"),
      },
    },
    async ({ publicId }) => {
      try {
        const data = await client.delete(`/client/payment-requests/${publicId}`);
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
    "simulate_payment",
    {
      description:
        "Simulate a payment for sandbox testing (sandbox only; publicId must start with test_pr_; creates webhook with sandbox: true).",
      inputSchema: {
        publicId: z
          .string()
          .describe("Sandbox payment request public ID (must start with test_pr_)"),
      },
    },
    async ({ publicId }) => {
      if (!publicId.startsWith("test_pr_")) {
        return {
          content: [
            {
              type: "text",
              text: "Invalid payment request ID: simulate_payment is only available for sandbox requests starting with 'test_pr_'.",
            },
          ],
          isError: true,
        };
      }

      try {
        const data = await client.post(
          `/payment-requests/${publicId}/pay`,
          undefined,
          { auth: false },
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
