import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {success} from "../../lib/formatters.js";
import {
	promptAccountNumber,
	promptBankSelection,
	promptConfirm,
} from "../../lib/prompts.js";

export default class BanksRemoveUnconfirmed extends ApiKeyCommand {
	static override description =
		"Remove a bank account that hasn't confirmed OTP yet";

	static override examples = ["<%= config.bin %> banks:remove-unconfirmed"];

	async run(): Promise<void> {
		console.log("");
		console.log(chalk.bold("  Remove Unconfirmed Bank Account"));
		console.log(chalk.gray("  ────────────────────────────────"));
		console.log("");

		// Step 1: Select bank
		const bankShortName = await promptBankSelection();

		// Step 2: Account details
		const accountNumber = await promptAccountNumber(bankShortName);

		const confirmed = await promptConfirm(
			`Remove unconfirmed ${chalk.bold(bankShortName)} account ${chalk.bold(accountNumber)}?`,
		);
		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		this.spinner.start("Removing unconfirmed bank account...");

		try {
			const data = await this.api.post(
				"/client/banks/remove-unconfirmed",
				{
					bankShortName,
					accountNumber,
				},
				"apikey",
			);

			const result = data?.data ?? data;
			this.spinner.succeed("Unconfirmed bank account removed!");
			success("Bank account has been removed.");

			if (this.jsonOutput) {
				this.outputJson(result);
			}
		} catch (error) {
			this.spinner.fail("Failed to remove unconfirmed bank account");
			this.handleError(error);
		}
	}
}
