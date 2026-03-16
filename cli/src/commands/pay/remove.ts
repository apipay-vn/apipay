import {select} from "@inquirer/prompts";
import {Args} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {formatCurrency, maskLongString, success} from "../../lib/formatters.js";

export default class PayRemove extends ApiKeyCommand {
	static override description = "Remove a payment link (payment request)";

	static override examples = [
		"<%= config.bin %> pay:remove",
		"<%= config.bin %> pay:remove ckabcdef1234567890",
	];

	static override args = {
		cuid: Args.string({
			description: "CUID of the payment link to remove",
			required: false,
		}),
	};

	async run(): Promise<void> {
		const {args} = await this.parse(PayRemove);
		let cuid = args.cuid;

		console.log("");
		console.log(chalk.bold("  Remove Payment Link"));
		console.log(chalk.gray("  ───────────────────"));
		console.log("");

		if (!cuid) {
			this.spinner.start("Fetching payment links...");
			try {
				const result = await this.api.get("/client/payment-requests", "apikey");
				let prs = Array.isArray(result)
					? result
					: (result?.data ?? result ?? []);

				if (!Array.isArray(prs)) prs = [];

				this.spinner.stop();

				if (prs.length === 0) {
					console.log(chalk.gray("No payment links found. Nothing to remove."));
					return;
				}

				cuid = await select({
					message: "Select a payment link to remove:",
					choices: prs.map((pr: any) => ({
						value: maskLongString(pr.publicId),
						name: `${maskLongString(pr.publicId)} — ${pr.amount ? formatCurrency(pr.amount) : "Flexible"} — ${pr.content ?? pr.title ?? "No Note"}`,
					})),
				});
			} catch (error: any) {
				this.spinner.fail("Failed to fetch payment links.");
				this.handleError(error);
			}
		}

		if (!cuid) return;

		this.spinner.start(`Removing payment link ${cuid.substring(0, 8)}...`);

		try {
			await this.api.delete(`/client/payment-requests/${cuid}`, "apikey");
			this.spinner.succeed("Payment link removed successfully!");

			if (this.jsonOutput) {
				this.outputJson({success: true, removedId: cuid});
			} else {
				console.log("");
				success(`Removed payment link ${chalk.cyan(cuid)}`);
				console.log("");
			}
		} catch (error: any) {
			this.spinner.fail("Failed to remove payment link.");
			this.handleError(error);
		}
	}
}
