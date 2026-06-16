import {select} from "@inquirer/prompts";
import {Args} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatBankLabel} from "../../lib/banks.js";
import {fetchClientBanks, getClientBanksApi} from "../../lib/client-banks.js";
import {
	info,
	maskAccountNumber,
	maskLongString,
	success,
	warn,
} from "../../lib/formatters.js";
import {promptConfirm, promptOtp} from "../../lib/prompts.js";

export default class BanksRemove extends ApiKeyCommand {
	static override description = "Remove a bank account";

	static override args = {
		id: Args.string({
			description: "Bank public ID",
			required: false,
		}),
	};

	static override examples = [
		"<%= config.bin %> banks:remove",
		"<%= config.bin %> banks:remove <public-id>",
	];

	async run(): Promise<void> {
		const {args} = await this.parse(BanksRemove);
		let id = args.id;

		console.log("");
		console.log(chalk.bold("  Remove Bank Account"));
		console.log(chalk.gray("  ───────────────────"));
		console.log("");

		if (!id) {
			this.spinner.start("Fetching bank accounts...");
			try {
				const banks = await fetchClientBanks();

				this.spinner.stop();

				if (banks.length === 0) {
					console.log(chalk.gray("No bank accounts found. Nothing to remove."));
					return;
				}

				id = await select({
					message: "Select a bank account to remove:",
					choices: banks.map((b: any) => ({
						value: b.publicId,
						name: `${maskLongString(b.publicId)} — ${formatBankLabel(b)} — ${b.accountNumber ? maskAccountNumber(b.accountNumber) : "—"}`,
					})),
				});
			} catch (error: any) {
				this.spinner.fail("Failed to fetch bank accounts.");
				this.handleError(error);
			}
		}

		if (!id) return;

		warn("This will permanently disconnect this bank account from ApiPay.");
		const confirmed = await promptConfirm(
			`Remove bank ${chalk.bold(maskLongString(id))}...?`,
		);
		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		this.spinner.start("Removing bank account...");

		try {
			const bankApi = getClientBanksApi();
			const data = await bankApi.delete(`/client/banks/${id}`, "apikey");
			const result = data?.data ?? data;

			// Some banks require OTP confirmation for deletion
			if (result?.OTP === 1) {
				this.spinner.stop();
				info("OTP required to confirm deletion. Check your phone.");

				const otp = await promptOtp();

				this.spinner.start("Confirming deletion...");
				await bankApi.post(
					`/client/banks/${id}/confirm-delete`,
					{otp},
					"apikey",
				);
				this.spinner.succeed("Bank account removed");
			} else {
				this.spinner.succeed("Bank account removed");
			}

			if (this.jsonOutput) {
				this.outputJson({success: true, id: id});
			} else {
				console.log("");
				success(
					`Bank account ${chalk.cyan(maskLongString(id))} has been disconnected.`,
				);
				console.log("");
			}
		} catch (error) {
			this.spinner.fail("Failed to remove bank account");
			this.handleError(error);
		}
	}
}
