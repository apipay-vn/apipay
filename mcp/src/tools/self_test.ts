import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient, ApiError } from "../client.js";

export function registerSelfTestTools(server: McpServer, client: ApiClient): void {
  server.registerTool(
    "self_test",
    {
      description:
        "Verify ApiPay connection and API key configuration. Returns connection status, key prefix, and bank summary counts.",
    },
    async () => {
      if (!client.hasCredentials()) {
        return {
          content: [
            {
              type: "text",
              text: "Missing credentials. Please set APIPAY_ACCESS_KEY and APIPAY_SECRET_KEY environment variables or configure via ~/.config/apipay/config.json.",
            },
          ],
          isError: true,
        };
      }

      try {
        const summary = await client.get("/client/banks/summary");
        const result = {
          ok: true,
          baseUrl: client.getBaseUrl(),
          keyPrefix: client.getAccessKeyPrefix(),
          summary,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
