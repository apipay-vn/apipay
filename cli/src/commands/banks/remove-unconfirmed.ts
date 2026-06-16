import {select} from "@inquirer/prompts";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatBankLabel} from "../../lib/banks.js";
import {fetchClientBanks, getClientBanksApi} from "../../lib/client-banks.js";
import {maskAccountNumber, maskLongString, success} from "../../lib/formatters.js";
import {promptConfirm} from "../../lib/prompts.js";

export default class BanksRemoveUnconfirmed extends ApiKeyCommand {
	static override description =
		"Remove a bank account that hasn't confirmed OTP yet";

	static override examples = ["<%= config.bin %> banks:remove-unconfirmed"];

	async run(): Promise<void> {
		console.log("");
		console.log(chalk.bold("  Remove Unconfirmed Bank Account"));
		console.log(chalk.gray("  ────────────────────────────────"));
		console.log("");

		this.spinner.start("Fetching pending bank accounts...");
		let banks: any[] = [];
		try {
			banks = (await fetchClientBanks()).filter(
				(bank) =>
					bank.status === "PENDING" && !bank.manualActivationPending,
			);
			this.spinner.stop();
		} catch (error) {
			this.spinner.fail("Failed to fetch pending bank accounts");
			this.handleError(error);
		}

		if (banks.length === 0) {
			this.log(chalk.gray("No unconfirmed bank accounts found."));
			return;
		}

		const id = await select({
			message: "Select an unconfirmed bank account to remove:",
			choices: banks.map((bank) => ({
				value: bank.publicId,
				name: `${maskLongString(bank.publicId)} — ${formatBankLabel(bank)} — ${
					bank.accountNumber ? maskAccountNumber(bank.accountNumber) : "—"
				}`,
			})),
		});

		const confirmed = await promptConfirm(
			`Remove unconfirmed bank ${chalk.bold(maskLongString(id))}?`,
		);
		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		this.spinner.start("Removing unconfirmed bank account...");

		try {
			const data = await getClientBanksApi().delete(
				`/client/banks/${id}`,
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
