import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {markStepComplete} from "../../lib/config.js";
import {info, kvLine, success} from "../../lib/formatters.js";
import {
	promptAccountName,
	promptAccountNumber,
	promptBankSelection,
	promptCccd,
	promptMobile,
	promptOtp,
} from "../../lib/prompts.js";

export default class BanksAdd extends ApiKeyCommand {
	static override description = "Add a bank account to your ApiPay integration";

	static override examples = ["<%= config.bin %> banks:add"];

	async run(): Promise<void> {
		console.log("");
		console.log(chalk.bold("  Add Bank Account"));
		console.log(chalk.gray("  ────────────────"));
		console.log("");

		// Step 1: Select bank
		const bankShortName = await promptBankSelection();

		// Step 2: Account details
		const accountNumber = await promptAccountNumber(bankShortName);
		const accName = await promptAccountName();
		const accMobile = await promptMobile();

		let cccd = undefined;
		if (bankShortName === "MBB") {
			cccd = await promptCccd();
		}

		// Step 3: Submit to API
		this.spinner.start("Adding bank account...");

		try {
			const data = await this.api.post(
				"/client/banks",
				{
					type: "openapi",
					bankShortName,
					accountNumber,
					accName,
					accMobile,
					...(cccd ? {cccd} : {}),
				},
				"apikey",
			);

			const bank = data?.data ?? data;
			this.spinner.succeed("Bank account submitted!");

			// Check if OTP is required
			if (bank?.OTP === 1) {
				console.log("");
				info(
					`OTP verification required. Check your phone or your bank app for the code.`,
				);
				console.log("");

				const otp = await promptOtp();

				this.spinner.start("Confirming OTP...");
				try {
					const otpResult = await this.api.post(
						"/client/banks/confirm-otp",
						{
							type: "openapi",
							bankShortName,
							accountNumber,
							accountName: accName,
							otp,
						},
						"apikey",
					);

					const confirmed = otpResult?.data ?? otpResult;
					this.spinner.succeed("Bank account verified!");
					console.log("");
					kvLine("Bank", bankShortName);
					kvLine("Account", accountNumber);
					kvLine("Name", accName);
					if (confirmed?.vaNumber) {
						kvLine("VA Number", chalk.cyan(confirmed.vaNumber));
					}
					kvLine("Status", chalk.green("ACTIVE"));
					console.log("");
				} catch (error) {
					this.spinner.fail("OTP verification failed");
					this.handleError(error);
				}
			} else {
				console.log("");
				kvLine("Bank", bankShortName);
				kvLine("Account", accountNumber);
				kvLine("Name", accName);
				kvLine("Public ID", bank?.publicId ?? "—");
				kvLine("Status", chalk.green(bank?.status ?? "ACTIVE"));
				console.log("");
			}

			markStepComplete("bank");
			success("Bank account added successfully.");

			if (this.jsonOutput) {
				this.outputJson(bank);
			}
		} catch (error: any) {
			this.spinner.fail("Failed to add bank account. " + error?.message);
			this.handleError(error);
		}
	}
}
