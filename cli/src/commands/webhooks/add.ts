import {Flags} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {fetchClientBanks} from "../../lib/client-banks.js";
import {markStepComplete} from "../../lib/config.js";
import {kvLine, success, warn} from "../../lib/formatters.js";
import {promptWebhookScope, promptWebhookUrl} from "../../lib/prompts.js";
import {validateWebhookHeaderName} from "../../lib/validators.js";

function parseBankPublicIds(value: string): string[] {
	return value
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

export default class WebhooksAdd extends ApiKeyCommand {
	static override description =
		"Register a webhook for transaction notifications. Defaults to all current and future banks.";

	static override flags = {
		...ApiKeyCommand.baseFlags,
		"bank-public-id": Flags.string({
			description:
				"Legacy: bind the webhook to a single bank account by public ID",
		}),
		"bank-public-ids": Flags.string({
			description:
				"Comma-separated bank public IDs to allow. Pass an empty value to match no banks",
		}),
		"all-banks": Flags.boolean({
			description: "Receive notifications for all current and future banks",
			default: false,
		}),
		"timeout-seconds": Flags.integer({
			description: "HTTP delivery timeout in seconds (5-10, default 10)",
			min: 5,
			max: 10,
		}),
		"extra-header-name": Flags.string({
			description: 'Extra request header name (must start with "X-")',
		}),
		"extra-header-value": Flags.string({
			description: "Extra request header value",
		}),
	};

	static override examples = [
		"<%= config.bin %> webhooks:add",
		"<%= config.bin %> webhooks:add --all-banks",
		"<%= config.bin %> webhooks:add --bank-public-id bnk_abc123 --timeout-seconds 8",
		'<%= config.bin %> webhooks:add --bank-public-ids "bnk_a,bnk_b" --extra-header-name X-Api-Key --extra-header-value secret',
	];

	async run(): Promise<void> {
		const {flags} = await this.parse(WebhooksAdd);

		console.log("");
		console.log(chalk.bold("  Add Webhook"));
		console.log(chalk.gray("  ──────────"));
		console.log("");

		const scopeFlags = [
			flags["bank-public-id"] !== undefined,
			flags["bank-public-ids"] !== undefined,
			flags["all-banks"],
		].filter(Boolean).length;

		if (scopeFlags > 1) {
			this.error(
				"Use only one of --bank-public-id, --bank-public-ids, or --all-banks.",
				{exit: 1},
			);
		}

		// Step 1: Fetch banks to select from (only needed for interactive scope)
		const needsBankList =
			flags["bank-public-id"] === undefined &&
			flags["bank-public-ids"] === undefined &&
			!flags["all-banks"];

		let banks: any[] = [];
		if (needsBankList) {
			this.spinner.start("Loading your bank accounts...");
			try {
				banks = await fetchClientBanks();
				this.spinner.stop();
			} catch (error) {
				this.spinner.fail("Failed to load banks");
				this.handleError(error);
				return; // unreachable, handleError throws
			}

			if (!Array.isArray(banks) || banks.length === 0) {
				this.error(
					`No bank accounts found. Run ${chalk.cyan("apipay banks:add")} first or use ${chalk.cyan("--all-banks")}.`,
					{exit: 1},
				);
			}
		}

		// Step 2: Resolve the bank scope
		let bankPublicId: string | undefined;
		let bankPublicIds: string[] | undefined;

		if (flags["bank-public-id"] !== undefined) {
			const trimmed = flags["bank-public-id"].trim();
			if (!trimmed) {
				this.error("--bank-public-id must not be empty.", {exit: 1});
			}
			bankPublicId = trimmed;
		} else if (flags["bank-public-ids"] !== undefined) {
			bankPublicIds = parseBankPublicIds(flags["bank-public-ids"]);
		} else if (flags["all-banks"]) {
			// all banks — omit both fields
		} else {
			const scope = await promptWebhookScope(banks);
			if (scope) {
				if ("bankPublicId" in scope) {
					bankPublicId = scope.bankPublicId;
				} else {
					bankPublicIds = scope.bankPublicIds;
				}
			}
		}

		// Step 3: Webhook URL
		const webhookUrl = await promptWebhookUrl();

		// Step 4: Assemble the payload
		const body: Record<string, any> = {webhookUrl};
		if (bankPublicId !== undefined) body.bankPublicId = bankPublicId;
		if (bankPublicIds !== undefined) body.bankPublicIds = bankPublicIds;
		if (flags["timeout-seconds"] !== undefined) {
			body.timeoutSeconds = flags["timeout-seconds"];
		}

		const headerName = flags["extra-header-name"];
		const headerValue = flags["extra-header-value"];
		if (headerName !== undefined || headerValue !== undefined) {
			if (!headerName || !headerValue) {
				this.error(
					"Provide both --extra-header-name and --extra-header-value.",
					{exit: 1},
				);
			}
			const nameCheck = validateWebhookHeaderName(headerName);
			if (nameCheck !== true) this.error(nameCheck, {exit: 1});
			if (!headerValue.trim()) {
				this.error("Extra header value must not be empty.", {exit: 1});
			}
			body.extraHeader = {name: headerName.trim(), value: headerValue.trim()};
		}

		// Step 5: Create
		this.spinner.start("Creating webhook...");

		try {
			const data = await this.api.post("/client/webhooks", body, "apikey");

			const webhook = data?.data ?? data;
			this.spinner.succeed("Webhook created!");

			const scopeLabel =
				bankPublicId !== undefined
					? bankPublicId.slice(0, 8) + "..."
					: bankPublicIds !== undefined
						? bankPublicIds.length > 0
							? `${bankPublicIds.length} selected bank(s)`
							: "No banks (matches nothing)"
						: "All banks (current and future)";

			console.log("");
			kvLine("Webhook URL", webhookUrl);
			kvLine("Scope", scopeLabel);
			if (body.timeoutSeconds !== undefined) {
				kvLine("Timeout", `${body.timeoutSeconds}s`);
			}
			if (body.extraHeader) {
				kvLine("Extra Header", body.extraHeader.name);
			}
			if (webhook?.secret) {
				kvLine("HMAC Secret", chalk.yellow(webhook.secret));
				console.log("");
				warn(
					"Save your HMAC secret — use it to verify webhook signatures.",
				);
				console.log(`  Header: ${chalk.cyan("ApiPay-Signature")}`);
			}
			kvLine("Status", chalk.green("ACTIVE"));
			console.log("");

			markStepComplete("webhook");
			success("Webhook registered successfully.");

			if (this.jsonOutput) {
				this.outputJson(webhook);
			}
		} catch (error) {
			this.spinner.fail("Failed to create webhook");
			this.handleError(error);
		}
	}
}
