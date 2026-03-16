import {Args} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {success} from "../../lib/formatters.js";
import {promptConfirm} from "../../lib/prompts.js";

export default class WebhooksRemove extends ApiKeyCommand {
	static override description = "Remove a webhook";

	static override args = {
		id: Args.string({description: "Webhook ID", required: true}),
	};

	static override examples = ["<%= config.bin %> webhooks:remove <webhook-id>"];

	async run(): Promise<void> {
		const {args} = await this.parse(WebhooksRemove);

		const confirmed = await promptConfirm(
			`Remove webhook ${chalk.bold(args.id.slice(0, 8))}...? This cannot be undone.`,
		);
		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		this.spinner.start("Removing webhook...");

		try {
			await this.api.delete(`/client/webhooks/${args.id}`, "apikey");
			this.spinner.succeed("Webhook removed");
			success("Webhook has been permanently deleted.");

			if (this.jsonOutput) {
				this.outputJson({success: true, id: args.id});
			}
		} catch (error) {
			this.spinner.fail("Failed to remove webhook");
			this.handleError(error);
		}
	}
}
