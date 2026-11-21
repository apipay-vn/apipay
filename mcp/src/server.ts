import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "./client.js";
import { loadConfig, type Config } from "./config.js";
import { registerBanksTools } from "./tools/banks.js";
import { registerCommerceTools } from "./tools/commerce.js";
import { registerMetricsTools } from "./tools/metrics.js";
import { registerPaymentsTools } from "./tools/payments.js";
import { registerSelfTestTools } from "./tools/self_test.js";
import { registerWebhooksTools } from "./tools/webhooks.js";

const { version } = createRequire(import.meta.url)("../package.json") as { version: string };

export function createServer(configOverride?: Partial<Config>): McpServer {
  const baseConfig = loadConfig();
  const config: Config = {
    ...baseConfig,
    ...configOverride,
  };

  const client = new ApiClient({
    baseUrl: config.baseUrl,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  });

  const server = new McpServer({
    name: "apipay",
    version,
  });

  registerSelfTestTools(server, client);
  registerBanksTools(server, client);
  registerPaymentsTools(server, client);
  registerCommerceTools(server, client);
  registerWebhooksTools(server, client);
  registerMetricsTools(server, client);

  return server;
}
