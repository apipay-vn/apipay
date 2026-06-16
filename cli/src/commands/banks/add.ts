import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {getClientBanksApi} from "../../lib/client-banks.js";
import {markStepComplete} from "../../lib/config.js";
import {getSupportedBank} from "../../lib/constants.js";
import {info, kvLine, success} from "../../lib/formatters.js";
import {
	promptAccountType,
	promptAcbUserId,
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
		const supportedBank = getSupportedBank(bankShortName);
		if (!supportedBank) {
			this.error(`Unsupported bank: ${bankShortName}`, {exit: 1});
		}

		// Step 2: Account details
		const accountNumber = await promptAccountNumber(bankShortName);
		const accName = await promptAccountName();
		const accMobile = await promptMobile();
		const accountType = await promptAccountType(supportedBank);
		const api = getClientBanksApi();

		let identity: string | undefined;
		if (supportedBank.requiresIdentity) {
			identity = await promptCccd();
		}

		let acbUserId: string | undefined;
		if (
			supportedBank.value === "ACB" &&
			accountType !== "personal-account"
		) {
			acbUserId = await promptAcbUserId();
		}

		// Step 3: Submit to API
		this.spinner.start("Adding bank account...");

		try {
			const data = await api.post(
				"/client/banks",
				{
					bankBin: supportedBank.bankBin,
					bankName: supportedBank.bankName,
					accountType,
					accountNumber,
					accountName: accName,
					mobile: accMobile,
					...(identity ? {identity} : {}),
					...(acbUserId ? {acbUserId} : {}),
				},
				"apikey",
			);

			const result = data?.data ?? data;
			const createdBank = result?.bank ?? result;
			this.spinner.succeed("Bank account submitted!");

			// Check if OTP is required
			if (result?.OTP === 1) {
				console.log("");
				info(
					`OTP verification required. Check your phone or your bank app for the code.`,
				);
				console.log("");

				const otp = await promptOtp();

				this.spinner.start("Confirming OTP...");
				try {
					const otpResult = await api.post(
						"/client/banks/confirm-otp",
						{
							bankBin: supportedBank.bankBin,
							accountNumber,
							otpNumber: otp,
						},
						"apikey",
					);

					const confirmed = otpResult?.data ?? otpResult;
					this.spinner.succeed("Bank account verified!");
					console.log("");
					kvLine("Bank", bankShortName);
					kvLine("Type", accountType);
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
				kvLine("Type", accountType);
				kvLine("Account", accountNumber);
				kvLine("Name", accName);
				kvLine("Public ID", createdBank?.publicId ?? "—");
				kvLine("Status", chalk.green(createdBank?.status ?? "ACTIVE"));
				console.log("");
			}

			markStepComplete("bank");
			success("Bank account added successfully.");

			if (this.jsonOutput) {
				this.outputJson(createdBank);
			}
		} catch (error: any) {
			this.spinner.fail("Failed to add bank account. " + error?.message);
			this.handleError(error);
		}
	}
}
