import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {fetchClientBanks} from "../../lib/client-banks.js";
import {formatCurrency, kvLine, success} from "../../lib/formatters.js";
import {
	promptAmount,
	promptBankFromList,
	promptNote,
} from "../../lib/prompts.js";

export default class PayCreate extends ApiKeyCommand {
	static override description =
		"Generate a one-shot payment request. Reusable Commerce links are created in the dashboard (https://apipay.vn/commerce).";

	static override examples = ["<%= config.bin %> pay:create"];

	async run(): Promise<void> {
		console.log("");
		console.log(chalk.bold("  Generate Payment Link"));
		console.log(chalk.gray("  ─────────────────────"));
		console.log("");

		// Fetch existing banks
		this.spinner.start("Fetching your bank accounts...");
		let banks: any[] = [];
		try {
			banks = await fetchClientBanks();
			this.spinner.stop();
		} catch (error: any) {
			this.spinner.fail("Failed to fetch bank accounts.");
			this.handleError(error);
		}

		if (banks.length === 0) {
			this.error(
				"No bank accounts found. Please run `apipay banks:add` first to connect a bank account.",
				{exit: 1},
			);
		}

		// Prompt for input
		const bankPublicId = await promptBankFromList(banks);
		const amount = await promptAmount();
		const note = await promptNote();

		const payload: Record<string, any> = {
			bankPublicId,
		};

		if (amount.trim() !== "") {
			payload.amount = amount.trim();
		}

		if (note.trim() !== "") {
			payload.content = note.trim();
		}

		this.spinner.start("Generating payment link...");

		try {
			const result = await this.api.post(
				"/client/payment-requests",
				payload,
				"apikey",
			);
			const pr = result?.data ?? result;

			this.spinner.succeed("Payment link generated successfully!");
			console.log("");

			kvLine("ID", pr.publicId ?? "—");
			kvLine(
				"Amount",
				pr.amount ? formatCurrency(pr.amount) : amount ? formatCurrency(amount) : "Flexible",
			);
			kvLine("Content", pr.content ?? pr.title ?? note ?? "—");
			kvLine("Payment URL", chalk.cyan.underline(pr.payUrl ?? "—"));
			// if (pr.qrUrl) {
			// 	kvLine("QR Image URL", chalk.cyan.underline(pr.qrUrl));
			// }
			console.log("");
			success(
				`Link is ready! You can send this immediately to your customers.`,
			);

			if (this.jsonOutput) {
				this.outputJson(pr);
			}
		} catch (error: any) {
			this.spinner.fail("Failed to generate payment link: " + error?.message);
			this.handleError(error);
		}
	}
}
