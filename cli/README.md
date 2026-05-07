# ApiPay CLI

The official command-line tool for [ApiPay](https://apipay.vn) — a payment gateway platform for Vietnamese banks.

## Installation

### Via npm (recommended)

```bash
npm install -g apipay
```

### Via curl (macOS / Linux)

```bash
curl -fsSL https://apipay.vn/install | bash
```

## Quick Start

```bash
# Interactive setup wizard — walks you through everything
apipay setup

# Or step-by-step:
apipay login                  # Authenticate (magic link or email/password)
apipay keys:create            # Generate your API key
apipay banks:add              # Connect a bank account
apipay webhooks:add           # Register a webhook for notifications
```

## Commands

### Authentication

| Command | Description |
|---------|-------------|
| `apipay login` | Sign in via magic link or email/password |
| `apipay logout` | Sign out and clear stored credentials |
| `apipay whoami` | Show current authenticated user |

### API Keys

| Command | Description |
|---------|-------------|
| `apipay keys:create` | Generate a new API key |
| `apipay keys:list` | List your API keys |
| `apipay keys:revoke [ID]` | Revoke an API key |

### Bank Accounts

| Command | Description |
|---------|-------------|
| `apipay banks:add` | Add a bank account (BIDV, ACB, MB Bank, OCB) |
| `apipay banks:list` | List connected bank accounts |
| `apipay banks:toggle <ID>` | Toggle bank active/inactive |
| `apipay banks:remove <ID>` | Remove a bank account |

### Webhooks

| Command | Description |
|---------|-------------|
| `apipay webhooks:add` | Register a webhook endpoint |
| `apipay webhooks:list` | List registered webhooks |
| `apipay webhooks:update <ID>` | Update webhook URL or type |
| `apipay webhooks:toggle <ID>` | Toggle webhook active/inactive |
| `apipay webhooks:remove <ID>` | Remove a webhook |
| `apipay webhooks:history <ID>` | View delivery history |
| `apipay webhooks:resend <ID>` | Resend a failed delivery |

### Metrics

| Command | Description |
|---------|-------------|
| `apipay metrics:summary` | Transaction summary by bank |
| `apipay metrics:transactions` | List recent transactions |

### Configuration

| Command | Description |
|---------|-------------|
| `apipay status` | Show setup status and configuration |
| `apipay config:get [KEY]` | Show configuration values |
| `apipay config:set KEY VALUE` | Set a configuration value |
| `apipay config:reset` | Clear all stored data |

## Global Flags

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON (for scripting/CI) |
| `--quiet` / `-q` | Suppress interactive output |
| `--help` / `-h` | Show command help |
| `--version` / `-v` | Show CLI version |

## Configuration


Credentials and settings are stored in `~/.config/apipay/config.json`.

## Autocomplete

```bash
apipay autocomplete bash   # or zsh/fish
```

## For CI/CD Pipelines

Use non-interactive flags for automation:

```bash
apipay login --email user@example.com --password "$APIPAY_PASSWORD"
apipay banks:list --json
apipay metrics:transactions --json --page 1 --limit 100
```

## Supported Banks

- **BIDV** — Ngân hàng TMCP Đầu tư và Phát triển Việt Nam
- **ACB** — Ngân hàng TMCP Á Châu
- **MB Bank** — Ngân hàng TMCP Quân đội
- **OCB** — Ngân hàng TMCP Phương Đông

## Development

```bash
# From the monorepo root
cd cli
npm install
npm run dev -- login          # Run a command in dev mode
npm run build                 # Compile TypeScript
npm link                      # Install locally for testing
```

## License

MIT
