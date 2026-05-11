import {Args} from "@oclif/core";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {success} from "../../lib/formatters.js";
import {promptConfirm} from "../../lib/prompts.js";

export default class WebhooksResend extends ApiKeyCommand {
	static override description = "Resend a failed webhook delivery";

	static override args = {
		historyId: Args.string({
			description: "Delivery history ID",
			required: true,
		}),
	};

	static override examples = ["<%= config.bin %> webhooks:resend <history-id>"];

	async run(): Promise<void> {
		const {args} = await this.parse(WebhooksResend);

		const confirmed = await promptConfirm(
			`Resend delivery ${args.historyId.slice(0, 8)}...? This will fire a real HTTP request to the webhook endpoint.`,
		);
		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		this.spinner.start("Resending webhook...");

		try {
			const data = await this.api.post(
				`/client/webhooks/history/${args.historyId}/resend`,
				undefined,
				"apikey",
			);
			const result = data?.data ?? data;

			this.spinner.succeed("Webhook resent");
			success("Delivery has been re-queued.");

			if (this.jsonOutput) {
				this.outputJson(result);
			}
		} catch (error) {
			this.spinner.fail("Failed to resend webhook");
			this.handleError(error);
		}
	}
}
