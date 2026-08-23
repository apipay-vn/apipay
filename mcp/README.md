# @apipay/mcp

Model Context Protocol (MCP) server for [ApiPay](https://apipay.vn) — bank-transfer payment gateway in Vietnam.

This server exposes tools for AI assistants (Claude Desktop, Cursor, Command Code, Codex) over stdio to create sandbox payments, list bank accounts and transactions, manage webhooks, and query transaction metrics.

---

## Prerequisites

- Node.js `>=18.0.0`
- An ApiPay account with API Keys (`ak_test_...` for sandbox or `ak_live_...` for production) from the [ApiPay Dashboard](https://my.apipay.vn)

---

## Authentication & Configuration

The MCP server authenticates requests with Base64-encoded `accessKey:secretKey` (`Authorization: Bearer <base64>`).

Configuration is loaded in the following priority:

1. **Environment Variables**:
   - `APIPAY_ACCESS_KEY`: Merchant Access Key (`ak_test_...` or `ak_live_...`)
   - `APIPAY_SECRET_KEY`: Merchant Secret Key
   - `APIPAY_API_URL`: (Optional) Base API URL (defaults to `https://app.apipay.vn/v1`)
2. **CLI Configuration Fallback**:
   - If environment variables are missing, the server reads `~/.config/apipay/config.json` (the configuration file managed by `apipay login` or `apipay keys:create`).

> [!NOTE]
> The server will start even if credentials are not provided initially. Individual tools will return an error message prompting you to set credentials if called while unauthenticated.

---

## Client Setup

### Claude Desktop

Add to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "apipay": {
      "command": "npx",
      "args": ["-y", "@apipay/mcp"],
      "env": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

### Cursor

In Cursor Settings → Features → MCP:

- **Name**: `apipay`
- **Type**: `stdio`
- **Command**: `npx -y @apipay/mcp`
- **Environment Variables**:
  - `APIPAY_ACCESS_KEY`: `ak_test_your_access_key`
  - `APIPAY_SECRET_KEY`: `your_secret_key`

Or in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "apipay": {
      "command": "npx",
      "args": ["-y", "@apipay/mcp"],
      "env": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

### Command Code

Using the CLI:

```bash
grok mcp add apipay -e APIPAY_ACCESS_KEY=ak_test_your_access_key -e APIPAY_SECRET_KEY=your_secret_key -- npx -y @apipay/mcp
```

Or configure via JSON settings:

```json
{
  "mcp": {
    "servers": {
      "apipay": {
        "command": "npx",
        "args": ["-y", "@apipay/mcp"],
        "env": {
          "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
          "APIPAY_SECRET_KEY": "your_secret_key"
        }
      }
    }
  }
}
```

---

## Available Tools

The server registers 15 tools with the `apipay_` prefix:

### Connection & Verification
- `apipay_self_test`: Validates API key configuration and returns connection status, key prefix, and bank summary counts.

### Banks
- `apipay_list_banks`: Lists connected bank accounts for this merchant (returns `bankPublicId` values needed to create payments and webhooks).

### Payment Requests
- `apipay_create_payment`: Creates a payment link (requires `bankPublicId`; optional `amount`, `content`, `title`, `expiresAt`, `redirectUrl`).
- `apipay_list_payments`: Lists payment requests with optional filtering by status, search term, or date range.
- `apipay_cancel_payment`: **(Destructive)** Cancels an `ACTIVE` payment request.
- `apipay_simulate_payment`: Simulates payment for sandbox requests (publicId must start with `test_pr_`; triggers sandbox webhooks).

### Webhooks
- `apipay_list_webhooks`: Lists registered webhook endpoints.
- `apipay_create_webhook`: Registers a webhook URL for a connected bank account.
- `apipay_update_webhook`: Updates destination URL for a webhook.
- `apipay_toggle_webhook`: Toggles a webhook between active and inactive.
- `apipay_remove_webhook`: **(Destructive)** Permanently deletes a webhook.
- `apipay_list_webhook_deliveries`: Lists webhook delivery attempts and status logs.
- `apipay_resend_webhook`: Retries a failed webhook delivery (fires a real HTTP request to destination).

### Metrics & Transactions
- `apipay_get_overview`: Returns transaction totals, averages, success rates, and bank volume distribution.
- `apipay_list_transactions`: Lists recent bank transactions with pagination, date, bank, and search filters.

---

## Typical Sandbox Workflow

1. **Verify Connection**:
   Call `apipay_self_test` to confirm the API key is active.
2. **Find Connected Bank**:
   Call `apipay_list_banks` to get a `bankPublicId`.
3. **Create Payment Request**:
   Call `apipay_create_payment` with `bankPublicId` and `amount` (e.g. `"50000"`). A `publicId` starting with `test_pr_...` is returned.
4. **Simulate Customer Payment**:
   Call `apipay_simulate_payment` with `publicId: "test_pr_..."` to test the settlement and webhook flow.
5. **Check History & Deliveries**:
   Call `apipay_list_webhook_deliveries` and `apipay_list_transactions` to verify the transaction was recorded.

---

## Destructive Tools Notice

The following operations permanently change state or remove resources:
- `apipay_cancel_payment`: Cancels an active payment link.
- `apipay_remove_webhook`: Deletes a registered webhook URL.
- `apipay_resend_webhook`: Dispatches an outbound HTTP request to the merchant webhook URL.

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Build TypeScript to dist/
npm run build

# Start local server over stdio
npm start
```

## License

MIT © [ApiPay](https://apipay.vn)
