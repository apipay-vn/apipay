# @apipay.vn/mcp

Model Context Protocol (MCP) server for [ApiPay](https://apipay.vn) — bank-transfer payment gateway in Vietnam.

This server exposes tools for AI assistants (Claude, Cursor, Codex, Command Code, Grok Build, Gemini, Copilot, OpenCode, and more) over stdio to create sandbox payments, list bank accounts and transactions, manage webhooks, and query transaction metrics.

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

All examples use the same stdio server: `npx -y @apipay.vn/mcp`, with `APIPAY_ACCESS_KEY` and `APIPAY_SECRET_KEY` passed as environment variables.

<details>
  <summary>Amp</summary>

Use the Amp CLI:

```bash
amp mcp add apipay -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Claude Code</summary>

Use the Claude Code CLI to add the ApiPay MCP server:

```bash
claude mcp add apipay --scope user \
  --env APIPAY_ACCESS_KEY=ak_test_your_access_key \
  --env APIPAY_SECRET_KEY=your_secret_key \
  -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Claude Desktop</summary>

Add to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "apipay": {
      "command": "npx",
      "args": ["-y", "@apipay.vn/mcp"],
      "env": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

</details>

<details>
  <summary>Cline</summary>

Add to `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "apipay": {
      "command": "npx",
      "args": ["-y", "@apipay.vn/mcp"],
      "env": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

</details>

<details>
  <summary>Codex</summary>

Use the Codex CLI:

```bash
codex mcp add apipay \
  --env APIPAY_ACCESS_KEY=ak_test_your_access_key \
  --env APIPAY_SECRET_KEY=your_secret_key \
  -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Command Code</summary>

Command Code uses the `cmd` CLI. Use the `--env` flag to pass the API keys:

```bash
cmd mcp add --transport stdio \
  --env APIPAY_ACCESS_KEY=ak_test_your_access_key \
  --env APIPAY_SECRET_KEY=your_secret_key \
  apipay -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Copilot CLI</summary>

Use the Copilot CLI (`--env` is repeatable):

```bash
copilot mcp add apipay \
  --env APIPAY_ACCESS_KEY=ak_test_your_access_key \
  --env APIPAY_SECRET_KEY=your_secret_key \
  -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Copilot / VS Code</summary>

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "apipay": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@apipay.vn/mcp"],
      "env": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

</details>

<details>
  <summary>Cursor</summary>

In Cursor Settings → Features → MCP, or in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "apipay": {
      "command": "npx",
      "args": ["-y", "@apipay.vn/mcp"],
      "env": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

</details>

<details>
  <summary>Devin CLI</summary>

```bash
devin mcp add apipay -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Factory CLI</summary>

```bash
droid mcp add apipay "npx -y @apipay.vn/mcp"
```

</details>

<details>
  <summary>Gemini CLI</summary>

Project-wide:

```bash
gemini mcp add apipay \
  -e APIPAY_ACCESS_KEY=ak_test_your_access_key \
  -e APIPAY_SECRET_KEY=your_secret_key \
  -- npx -y @apipay.vn/mcp
```

Globally (user scope):

```bash
gemini mcp add -s user apipay \
  -e APIPAY_ACCESS_KEY=ak_test_your_access_key \
  -e APIPAY_SECRET_KEY=your_secret_key \
  -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Grok Build</summary>

Grok Build uses the `grok` CLI. Use the `-e` flag to pass the API keys:

```bash
grok mcp add apipay \
  -e APIPAY_ACCESS_KEY=ak_test_your_access_key \
  -e APIPAY_SECRET_KEY=your_secret_key \
  -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>JetBrains AI Assistant</summary>

Go to `Settings | Tools | AI Assistant | Model Context Protocol (MCP)` → `Add`, using the standard config above (server name `apipay`, command `npx -y @apipay.vn/mcp`, env vars `APIPAY_ACCESS_KEY` / `APIPAY_SECRET_KEY`).

</details>

<details>
  <summary>OpenCode</summary>

Add to `opencode.json` (project) or `~/.config/opencode/opencode.json` (global):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "apipay": {
      "type": "local",
      "command": ["npx", "-y", "@apipay.vn/mcp"],
      "environment": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

</details>

<details>
  <summary>Qoder CLI</summary>

```bash
qodercli mcp add apipay -- npx -y @apipay.vn/mcp
```

</details>

<details>
  <summary>Warp</summary>

Go to `Settings | AI | Manage MCP Servers` → `+ Add`, using the standard config above (server name `apipay`, command `npx -y @apipay.vn/mcp`, env vars `APIPAY_ACCESS_KEY` / `APIPAY_SECRET_KEY`).

</details>

<details>
  <summary>Windsurf</summary>

Follow the Windsurf MCP configuration guide and add the server to `.windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "apipay": {
      "command": "npx",
      "args": ["-y", "@apipay.vn/mcp"],
      "env": {
        "APIPAY_ACCESS_KEY": "ak_test_your_access_key",
        "APIPAY_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

</details>

---

## Available Tools

The server registers 15 tools. MCP clients automatically prefix tool names with the server key `apipay` (e.g. `apipay_list_banks` in OpenCode, `mcp__apipay__list_banks` in Claude Code).

### Connection & Verification
- `self_test`: Validates API key configuration and returns connection status, key prefix, and bank summary counts.

### Banks
- `list_banks`: Lists connected bank accounts for this merchant (returns `bankPublicId` values needed to create payments and webhooks).

### Payment Requests
- `create_payment`: Creates a payment link (requires `bankPublicId`; optional `amount`, `content`, `title`, `expiresAt`, `redirectUrl`).
- `list_payments`: Lists payment requests with optional filtering by status, search term, or date range.
- `cancel_payment`: **(Destructive)** Cancels an `ACTIVE` payment request.
- `simulate_payment`: Simulates payment for sandbox requests (publicId must start with `test_pr_`; triggers sandbox webhooks).

### Webhooks
- `list_webhooks`: Lists registered webhook endpoints.
- `create_webhook`: Registers a webhook URL for a connected bank account.
- `update_webhook`: Updates destination URL for a webhook.
- `toggle_webhook`: Toggles a webhook between active and inactive.
- `remove_webhook`: **(Destructive)** Permanently deletes a webhook.
- `list_webhook_deliveries`: Lists webhook delivery attempts and status logs.
- `resend_webhook`: Retries a failed webhook delivery (fires a real HTTP request to destination).

### Metrics & Transactions
- `get_overview`: Returns transaction totals, averages, success rates, and bank volume distribution.
- `list_transactions`: Lists recent bank transactions with pagination, date, bank, and search filters.

---

## Typical Sandbox Workflow

1. **Verify Connection**:
   Call `self_test` to confirm the API key is active.
2. **Find Connected Bank**:
   Call `list_banks` to get a `bankPublicId`.
3. **Create Payment Request**:
   Call `create_payment` with `bankPublicId` and `amount` (e.g. `"50000"`). A `publicId` starting with `test_pr_...` is returned.
4. **Simulate Customer Payment**:
   Call `simulate_payment` with `publicId: "test_pr_..."` to test the settlement and webhook flow.
5. **Check History & Deliveries**:
   Call `list_webhook_deliveries` and `list_transactions` to verify the transaction was recorded.

---

## Destructive Tools Notice

The following operations permanently change state or remove resources:
- `cancel_payment`: Cancels an active payment link.
- `remove_webhook`: Deletes a registered webhook URL.
- `resend_webhook`: Dispatches an outbound HTTP request to the merchant webhook URL.

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
