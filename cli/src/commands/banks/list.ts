import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatBankLabel} from "../../lib/banks.js";
import {
	createTable,
	maskAccountNumber,
	maskLongString,
	statusBadge,
} from "../../lib/formatters.js";

export default class BanksList extends ApiKeyCommand {
	static override description = "List your bank accounts";

	static override examples = ["<%= config.bin %> banks:list"];

	async run(): Promise<void> {
		this.spinner.start("Fetching bank accounts...");

		try {
			const data = await this.api.get("/client/banks", "apikey");
			const banks = Array.isArray(data)
				? data
				: (data?.message ?? data?.data ?? data);

			this.spinner.stop();

			if (!Array.isArray(banks) || banks.length === 0) {
				this.log(
					`\n  No bank accounts found. Run ${chalk.cyan("apipay banks:add")} to add one.\n`,
				);
				return;
			}

			console.log("");
			const table = createTable(
				["Public ID", "Bank", "Account #", "VA Number", "Status"],
				banks.map((b: any) => [
					b.publicId ? maskLongString(b.publicId) : "—",
					formatBankLabel(b),
					b.accountNumber ? maskAccountNumber(b.accountNumber) : "—",
					b.vaNumber ?? "—",
					statusBadge(b.status ?? "UNKNOWN"),
				]),
			);
			console.log(table);
			console.log(`\n  ${chalk.gray(`${banks.length} bank account(s)`)}\n`);

			if (this.jsonOutput) {
				this.outputJson(banks);
			}
		} catch (error) {
			this.spinner.fail("Failed to fetch bank accounts");
			this.handleError(error);
		}
	}
}
