import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatBankLabel} from "../../lib/banks.js";
import {
	createTable,
	maskLongString,
	statusBadge,
} from "../../lib/formatters.js";

/** Render the webhook audience from the new `scope`/`selectedBanks` fields, with legacy fallback. */
function formatWebhookScope(w: any): string {
	if (w.scope === "all") return "All banks";
	if (w.scope === "selected") {
		const banks = Array.isArray(w.selectedBanks) ? w.selectedBanks : [];
		if (banks.length === 0) return "No banks";
		return banks.map((b: any) => formatBankLabel(b)).join(", ");
	}
	if (w.bankAccount) return formatBankLabel(w.bankAccount);
	if (w.bankAccountId !== undefined && w.bankAccountId !== null) {
		return String(w.bankAccountId);
	}
	return "—";
}

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
				["ID", "URL", "Scope", "Timeout", "Header", "Status"],
				webhooks.map((w: any) => [
					w.id ? String(w.id) : "—",
					w.webhookUrl ? maskLongString(w.webhookUrl) : "—",
					formatWebhookScope(w),
					w.configs?.timeoutSeconds !== undefined
						? `${w.configs.timeoutSeconds}s`
						: "—",
					w.configs?.extraHeader?.name ?? "—",
					statusBadge(w.isActive ? "ACTIVE" : "INACTIVE"),
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
