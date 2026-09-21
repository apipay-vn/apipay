import {Args, Flags} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {kvLine, success} from "../../lib/formatters.js";
import {promptOptionalWebhookUrl} from "../../lib/prompts.js";
import {validateWebhookHeaderName} from "../../lib/validators.js";

function parseBankPublicIds(value: string): string[] {
	return value
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

export default class WebhooksUpdate extends ApiKeyCommand {
	static override description = "Update a webhook URL or advanced configuration";

	static override args = {
		id: Args.string({description: "Webhook ID", required: true}),
	};

	static override flags = {
		...ApiKeyCommand.baseFlags,
		"webhook-url": Flags.string({
			description: "New HTTPS webhook URL",
		}),
		"bank-public-ids": Flags.string({
			description:
				'Comma-separated bank public IDs to allow. Use "all" to reset to all banks, or an empty value to match no banks',
		}),
		"timeout-seconds": Flags.integer({
			description: "HTTP delivery timeout in seconds (5-10)",
			min: 5,
			max: 10,
		}),
		"reset-timeout": Flags.boolean({
			description: "Reset the delivery timeout to the default of 10s",
			default: false,
		}),
		"extra-header-name": Flags.string({
			description: 'Extra request header name (must start with "X-")',
		}),
		"extra-header-value": Flags.string({
			description: "Extra request header value",
		}),
		"clear-extra-header": Flags.boolean({
			description: "Remove the extra request header",
			default: false,
		}),
	};

	static override examples = [
		"<%= config.bin %> webhooks:update <webhook-id>",
		"<%= config.bin %> webhooks:update <webhook-id> --webhook-url https://example.com/hooks",
		'<%= config.bin %> webhooks:update <webhook-id> --bank-public-ids "bnk_a,bnk_b" --timeout-seconds 8',
		'<%= config.bin %> webhooks:update <webhook-id> --bank-public-ids all --clear-extra-header',
	];

	async run(): Promise<void> {
		const {args, flags} = await this.parse(WebhooksUpdate);

		console.log(`\n  Updating webhook ${chalk.cyan(args.id.slice(0, 8))}...\n`);

		const body: Record<string, any> = {};

		if (flags["webhook-url"]) {
			body.webhookUrl = flags["webhook-url"].trim();
		}

		if (flags["bank-public-ids"] !== undefined) {
			const raw = flags["bank-public-ids"].trim();
			body.bankPublicIds = raw.toLowerCase() === "all" ? null : parseBankPublicIds(raw);
		}

		if (flags["timeout-seconds"] !== undefined) {
			body.timeoutSeconds = flags["timeout-seconds"];
		}
		if (flags["reset-timeout"]) {
			body.timeoutSeconds = null;
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
		if (flags["clear-extra-header"]) {
			body.extraHeader = null;
		}

		// Keep the interactive URL flow when no flags were provided.
		if (Object.keys(body).length === 0) {
			console.log("  Leave blank to keep the current value.\n");
			const webhookUrl = await promptOptionalWebhookUrl();
			if (webhookUrl) body.webhookUrl = webhookUrl;
		}

		this.spinner.start("Updating webhook...");

		try {
			const data = await this.api.patch(
				`/client/webhooks/${args.id}`,
				body,
				"apikey",
			);
			const webhook = data?.data ?? data;

			this.spinner.succeed("Webhook updated!");
			kvLine("URL", webhook?.webhookUrl ?? body.webhookUrl ?? "—");
			if (webhook?.scope) {
				kvLine(
					"Scope",
					webhook.scope === "all"
						? "All banks"
						: webhook.scope === "selected"
							? `${webhook.selectedBanks?.length ?? 0} selected bank(s)`
							: "Single bank",
				);
			}
			if (webhook?.configs?.timeoutSeconds !== undefined) {
				kvLine("Timeout", `${webhook.configs.timeoutSeconds}s`);
			}
			if (webhook?.configs?.extraHeader) {
				kvLine("Extra Header", webhook.configs.extraHeader.name);
			}
			console.log("");

			success("Webhook configuration updated.");

			if (this.jsonOutput) {
				this.outputJson(webhook);
			}
		} catch (error) {
			this.spinner.fail("Failed to update webhook");
			this.handleError(error);
		}
	}
}
