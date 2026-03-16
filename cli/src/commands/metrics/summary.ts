import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {createTable, formatCurrency} from "../../lib/formatters.js";

export default class MetricsSummary extends ApiKeyCommand {
	static override description = "View transaction summary grouped by bank";

	static override examples = ["<%= config.bin %> metrics:summary"];

	async run(): Promise<void> {
		this.spinner.start("Fetching transaction summary...");

		try {
			const data = await this.api.get("/client/metrics/summary", "apikey");
			const summary = data?.data ?? data;

			this.spinner.stop();

			if (!summary || (Array.isArray(summary) && summary.length === 0)) {
				this.log("\n  No transactions yet.\n");
				return;
			}

			const items = Array.isArray(summary) ? summary : [summary];

			console.log("");
			const table = createTable(
				["Bank", "Total In", "Total Out", "Count In", "Count Out"],
				items.map((s: any) => [
					s.bankName ?? s.bankShortName ?? "—",
					chalk.green(formatCurrency(s.totalIn ?? 0)),
					chalk.red(formatCurrency(s.totalOut ?? 0)),
					s.countIn?.toString() ?? "0",
					s.countOut?.toString() ?? "0",
				]),
			);
			console.log(table);
			console.log("");

			if (this.jsonOutput) {
				this.outputJson(summary);
			}
		} catch (error) {
			this.spinner.fail("Failed to fetch summary");
			this.handleError(error);
		}
	}
}
