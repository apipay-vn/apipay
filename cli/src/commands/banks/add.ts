import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {ApiClient} from "../../lib/api-client.js";
import {getApiBaseUrl, markStepComplete} from "../../lib/config.js";
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
		const usesV2Api = bankShortName === "ICB";
		const api = usesV2Api
			? new ApiClient(getApiBaseUrl().replace(/\/v1\/?$/, "/v2"))
			: this.api;

		let cccd = undefined;
		if (bankShortName === "MBB" || bankShortName === "ICB") {
			cccd = await promptCccd();
		}

		// Step 3: Submit to API
		this.spinner.start("Adding bank account...");

		try {
			const data = await api.post(
				"/client/banks",
				usesV2Api
					? {
							bankBin: "970415",
							bankName: "VietinBank",
							accountType: "personal-account",
							accountNumber,
							accountName: accName,
							mobile: accMobile,
							identity: cccd,
						}
					: {
							type: "openapi",
							bankShortName,
							accountNumber,
							accName,
							accMobile,
							...(cccd ? {cccd} : {}),
						},
				"apikey",
			);

			const result = data?.data ?? data;
			const bank = result?.bank ?? result;
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
						usesV2Api
							? {
									bankBin: "970415",
									accountNumber,
									otpNumber: otp,
								}
							: {
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
