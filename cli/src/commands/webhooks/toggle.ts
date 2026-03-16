import {Args} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {statusBadge, success} from "../../lib/formatters.js";

export default class WebhooksToggle extends ApiKeyCommand {
	static override description = "Toggle a webhook between active and inactive";

	static override args = {
		id: Args.string({description: "Webhook ID", required: true}),
	};

	static override examples = ["<%= config.bin %> webhooks:toggle <webhook-id>"];

	async run(): Promise<void> {
		const {args} = await this.parse(WebhooksToggle);

		this.spinner.start("Toggling webhook...");

		try {
			const data = await this.api.patch(
				`/client/webhooks/${args.id}/toggle`,
				undefined,
				"apikey",
			);
			const webhook = data?.data ?? data;

			this.spinner.succeed("Webhook toggled");
			success(
				`Webhook ${chalk.bold(args.id.slice(0, 8))}... is now ${statusBadge(webhook?.isActive ? "ACTIVE" : "INACTIVE")}`,
			);

			if (this.jsonOutput) {
				this.outputJson(webhook);
			}
		} catch (error) {
			this.spinner.fail("Failed to toggle webhook");
			this.handleError(error);
		}
	}
}
