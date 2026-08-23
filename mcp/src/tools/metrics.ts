import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient, ApiError } from "../client.js";

const PERIOD_ENUM = [
  "today",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "last_3_months",
  "last_6_months",
  "this_year",
  "custom",
] as const;

export function registerMetricsTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    "apipay_get_overview",
    {
      description:
        "Get transaction metrics overview (totals, averages, success rates, volume by bank).",
      inputSchema: {
        period: z
          .enum(PERIOD_ENUM)
          .optional()
          .describe("Time period for metrics"),
        dateFrom: z
          .string()
          .optional()
          .describe("Start date for custom period (YYYY-MM-DD or ISO 8601)"),
        dateTo: z
          .string()
          .optional()
          .describe("End date for custom period (YYYY-MM-DD or ISO 8601)"),
      },
    },
    async (args) => {
      try {
        const query: Record<string, any> = {};
        if (args.period !== undefined) query.period = args.period;
        if (args.dateFrom !== undefined) query.dateFrom = args.dateFrom;
        if (args.dateTo !== undefined) query.dateTo = args.dateTo;

        const data = await client.get("/client/metrics/overview", { query });
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
    "apipay_list_transactions",
    {
      description:
        "List recent bank transactions with filtering by date, bank, account, or search keyword.",
      inputSchema: {
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .default(1)
          .describe("Page number (default 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .default(20)
          .describe("Items per page (default 20, max 100)"),
        period: z
          .enum(PERIOD_ENUM)
          .optional()
          .describe("Time period filter"),
        dateFrom: z
          .string()
          .optional()
          .describe("Start date (YYYY-MM-DD or ISO 8601)"),
        dateTo: z
          .string()
          .optional()
          .describe("End date (YYYY-MM-DD or ISO 8601)"),
        search: z
          .string()
          .optional()
          .describe("Search transactions by keyword"),
        accountNumber: z
          .string()
          .optional()
          .describe("Filter by bank account number"),
        bankPublicId: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Filter by bank public ID(s)"),
        sortBy: z
          .enum(["transactionDate", "amount", "createdAt"])
          .optional()
          .describe("Sort field"),
        sortOrder: z
          .enum(["asc", "desc"])
          .optional()
          .describe("Sort direction (asc or desc)"),
      },
    },
    async (args) => {
      try {
        const query: Record<string, any> = {};
        if (args.page !== undefined) query.page = args.page;
        if (args.limit !== undefined) query.limit = args.limit;
        if (args.period !== undefined) query.period = args.period;
        if (args.dateFrom !== undefined) query.dateFrom = args.dateFrom;
        if (args.dateTo !== undefined) query.dateTo = args.dateTo;
        if (args.search !== undefined) query.search = args.search;
        if (args.accountNumber !== undefined) query.accountNumber = args.accountNumber;
        if (args.bankPublicId !== undefined) query.bankPublicId = args.bankPublicId;
        if (args.sortBy !== undefined) query.sortBy = args.sortBy;
        if (args.sortOrder !== undefined) query.sortOrder = args.sortOrder;

        const data = await client.get("/client/metrics/transactions", { query });
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
