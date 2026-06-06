import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatBankLabel} from "../../lib/banks.js";
import {
	createTable,
	maskLongString,
	statusBadge,
} from "../../lib/formatters.js";

export default class WebhooksList extends ApiKeyCommand {
	static override description = "List your registered webhooks";

	static override examples = ["<%= config.bin %> webhooks:list"];

	async run(): Promise<void> {
		this.spinner.start("Fetching webhooks...");

		try {
			const data = await this.api.get("/client/webhooks", "apikey");
			const webhooks = data?.data ?? data;

			this.spinner.stop();

			if (!Array.isArray(webhooks) || webhooks.length === 0) {
				this.log(
					`\n  No webhooks found. Run ${chalk.cyan("apipay webhooks:add")} to register one.\n`,
				);
				return;
			}

			console.log("");
			const table = createTable(
				["ID", "URL", "Type", "Status", "Bank"],
				webhooks.map((w: any) => [
					w.id ? String(w.id) : "—",
					w.webhookUrl ? maskLongString(w.webhookUrl) : "—",
					w.type ?? "—",
					statusBadge(w.isActive ? "ACTIVE" : "INACTIVE"),
					w.bankAccount ? formatBankLabel(w.bankAccount) : (w.bankAccountId?.toString() ?? "—"),
				]),
			);
			console.log(table);
			console.log(`\n  ${chalk.gray(`${webhooks.length} webhook(s)`)}\n`);

			if (this.jsonOutput) {
				this.outputJson(webhooks);
			}
		} catch (error) {
			this.spinner.fail("Failed to fetch webhooks");
			this.handleError(error);
		}
	}
}
