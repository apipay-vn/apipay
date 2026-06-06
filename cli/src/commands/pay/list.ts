import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatBankShortName} from "../../lib/banks.js";
import {
	createTable,
	formatCurrency,
	maskLongString,
	statusBadge,
} from "../../lib/formatters.js";

export default class PayList extends ApiKeyCommand {
	static override description = "List all payment links (payment requests)";

	static override examples = ["<%= config.bin %> pay:list"];

	async run(): Promise<void> {
		this.spinner.start("Fetching payment links...");

		try {
			const result = await this.api.get("/client/payment-requests", "apikey");
			let prs = Array.isArray(result) ? result : (result?.data ?? result ?? []);

			if (!Array.isArray(prs)) prs = [];

			this.spinner.stop();

			if (prs.length === 0) {
				console.log(
					chalk.gray(
						"No payment links found. Run `apipay pay:create` to generate one.",
					),
				);
				return;
			}

			console.log("");
			console.log(chalk.bold(`  Payment Links (${prs.length})`));
			console.log(chalk.gray("  ─────────────"));
			console.log("");

			const table = createTable(
				["UUID", "Amount", "Content", "Status", "Bank", "URL"],
				prs.map((pr: any) => [
					maskLongString(pr.publicId) ?? "—",
					pr.amount ? formatCurrency(pr.amount) : "-",
					pr.content ?? pr.title ?? "—",
					statusBadge(pr.status ?? "PENDING"),
					formatBankShortName(pr.bankCode) || "—",
					pr.payUrl ?? "—",
				]),
			);

			console.log(table);
			console.log("");

			if (this.jsonOutput) {
				this.outputJson(prs);
			}
		} catch (error: any) {
			this.spinner.fail("Failed to fetch payment links.");
			this.handleError(error);
		}
	}
}
