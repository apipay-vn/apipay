import {Args} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {createTable, formatDate, statusBadge} from "../../lib/formatters.js";

export default class WebhooksHistory extends ApiKeyCommand {
	static override description = "View delivery history for a webhook";

	static override args = {
		id: Args.string({description: "Webhook ID", required: true}),
	};

	static override examples = [
		"<%= config.bin %> webhooks:history <webhook-id>",
	];

	async run(): Promise<void> {
		const {args} = await this.parse(WebhooksHistory);

		this.spinner.start("Fetching delivery history...");

		try {
			const data = await this.api.get(
				`/client/webhooks/${args.id}/history`,
				"apikey",
			);
			const deliveries = data?.data ?? data;

			this.spinner.stop();

			if (!Array.isArray(deliveries) || deliveries.length === 0) {
				this.log("\n  No delivery history yet.\n");
				return;
			}

			console.log("");
			const table = createTable(
				["ID", "Status", "HTTP Code", "Retries", "Created"],
				deliveries.map((d: any) => [
					d.id ? d.id.slice(0, 8) + "..." : "—",
					statusBadge(d.status ?? "UNKNOWN"),
					d.responseCode?.toString() ?? "—",
					d.retryCount?.toString() ?? "0",
					formatDate(d.createdAt),
				]),
			);
			console.log(table);
			console.log(`\n  ${chalk.gray(`${deliveries.length} delivery(ies)`)}\n`);

			if (this.jsonOutput) {
				this.outputJson(deliveries);
			}
		} catch (error) {
			this.spinner.fail("Failed to fetch history");
			this.handleError(error);
		}
	}
}
