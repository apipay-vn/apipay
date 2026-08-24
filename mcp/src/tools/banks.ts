import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiClient, ApiError } from "../client.js";

export function registerBanksTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    "list_banks",
    {
      description:
        "List connected bank accounts for this merchant. Call this to find bankPublicId before creating payments or webhooks.",
      inputSchema: {
        page: z.number().int().min(1).optional().describe("Page number for pagination (starts at 1)"),
        limit: z.number().int().min(1).max(50).optional().describe("Number of bank accounts per page (max 50)"),
      },
    },
    async ({ page, limit }) => {
      try {
        const query: Record<string, any> = {};
        if (page !== undefined) query.page = page;
        if (limit !== undefined) query.limit = limit;

        const data = await client.get("/client/banks", { query });
        const banks = Array.isArray(data)
          ? data
          : (data?.message ?? data?.data ?? data);
        const pagination = Array.isArray(data) ? undefined : data?.pagination;
        const payload =
          pagination === undefined ? { banks } : { banks, pagination };

        return {
          content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
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
