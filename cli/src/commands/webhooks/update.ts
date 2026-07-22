import {Args} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {kvLine, success} from "../../lib/formatters.js";
import {promptOptionalWebhookUrl} from "../../lib/prompts.js";

export default class WebhooksUpdate extends ApiKeyCommand {
	static override description = "Update a webhook URL";

	static override args = {
		id: Args.string({description: "Webhook ID", required: true}),
	};

	static override examples = ["<%= config.bin %> webhooks:update <webhook-id>"];

	async run(): Promise<void> {
		const {args} = await this.parse(WebhooksUpdate);

		console.log(`\n  Updating webhook ${chalk.cyan(args.id.slice(0, 8))}...\n`);
		console.log("  Leave blank to keep the current value.\n");

		const webhookUrl = await promptOptionalWebhookUrl();

		this.spinner.start("Updating webhook...");

		try {
			const body: Record<string, string> = {};
			if (webhookUrl) body.webhookUrl = webhookUrl;

			const data = await this.api.patch(
				`/client/webhooks/${args.id}`,
				body,
				"apikey",
			);
			const webhook = data?.data ?? data;

			this.spinner.succeed("Webhook updated!");
			kvLine("URL", webhook?.webhookUrl ?? webhookUrl);
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
