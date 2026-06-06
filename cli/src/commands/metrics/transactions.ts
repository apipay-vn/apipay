import {Flags} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatBankLabel} from "../../lib/banks.js";
import {createTable, formatDate} from "../../lib/formatters.js";

export default class MetricsTransactions extends ApiKeyCommand {
	static override description = "List recent transactions";

	static override flags = {
		...ApiKeyCommand.baseFlags,
		page: Flags.integer({description: "Page number", default: 1}),
		limit: Flags.integer({
			description: "Items per page (max 100)",
			default: 20,
		}),
	};

	static override examples = [
		"<%= config.bin %> metrics:transactions",
		"<%= config.bin %> metrics:transactions --page 2 --limit 50",
	];

	async run(): Promise<void> {
		const {flags} = await this.parse(MetricsTransactions);

		this.spinner.start("Fetching transactions...");

		try {
			const data = await this.api.get(
				`/client/metrics/transactions?page=${flags.page}&limit=${flags.limit}`,
				"apikey",
			);
			const result = data?.data ?? data;
			const transactions = result?.transactions ?? result;

			this.spinner.stop();

			if (!Array.isArray(transactions) || transactions.length === 0) {
				this.log("\n  No transactions found.\n");
				return;
			}

			console.log("");
			const table = createTable(
				["Ref Code", "Amount", "Type", "Bank", "Date", "Status"],
				transactions.map((t: any) => [
					t.referenceCode ? t.referenceCode.slice(0, 12) + "..." : "—",
					t.type === "IN"
						? chalk.green(`+${t.amount}`)
						: chalk.red(`-${t.amount}`),
					t.type ?? "—",
					t.bankAccount ? formatBankLabel(t.bankAccount) : "—",
					formatDate(t.transactionDate ?? t.createdAt),
					t.status ?? "—",
				]),
			);
			console.log(table);
			console.log(
				`\n  ${chalk.gray(`Page ${flags.page} • ${transactions.length} result(s)`)}\n`,
			);

			if (this.jsonOutput) {
				this.outputJson(result);
			}
		} catch (error) {
			this.spinner.fail("Failed to fetch transactions");
			this.handleError(error);
		}
	}
}
