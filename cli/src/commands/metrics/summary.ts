import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {createTable, formatCurrency} from "../../lib/formatters.js";

export default class MetricsSummary extends ApiKeyCommand {
	static override description = "View incoming transaction totals";

	static override examples = ["<%= config.bin %> metrics:summary"];

	async run(): Promise<void> {
		this.spinner.start("Fetching transaction summary...");

		try {
			const data = await this.api.get("/client/metrics/overview", "apikey");
			const summary = data?.data ?? data;

			this.spinner.stop();

			if (this.jsonOutput) {
				this.outputJson(summary);
				return;
			}

			if (!summary?.totalTransactions) {
				this.log("\n  No transactions yet.\n");
				return;
			}

			console.log("");
			const table = createTable(
				["Total In", "Transactions", "Average", "Success Rate"],
				[
					[
						chalk.green(formatCurrency(summary.totalIn ?? 0)),
						String(summary.totalTransactions),
						formatCurrency(summary.averageAmount ?? 0),
						`${Number(summary.successRate ?? 0).toFixed(1)}%`,
					],
				],
			);
			console.log(table);
			console.log("");
		} catch (error) {
			this.spinner.fail("Failed to fetch summary");
			this.handleError(error);
		}
	}
}
