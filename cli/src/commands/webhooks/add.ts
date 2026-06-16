import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {fetchClientBanks} from "../../lib/client-banks.js";
import {markStepComplete} from "../../lib/config.js";
import {kvLine, success, warn} from "../../lib/formatters.js";
import {
	promptBankFromList,
	promptWebhookType,
	promptWebhookUrl,
} from "../../lib/prompts.js";

export default class WebhooksAdd extends ApiKeyCommand {
	static override description =
		"Register a webhook for transaction notifications";

	static override examples = ["<%= config.bin %> webhooks:add"];

	async run(): Promise<void> {
		console.log("");
		console.log(chalk.bold("  Add Webhook"));
		console.log(chalk.gray("  ──────────"));
		console.log("");

		// Step 1: Fetch banks to select from
		this.spinner.start("Loading your bank accounts...");
		let banks: any[];
		try {
			banks = await fetchClientBanks();
			this.spinner.stop();

			if (!Array.isArray(banks) || banks.length === 0) {
				this.error(
					`No bank accounts found. Run ${chalk.cyan("apipay banks:add")} first.`,
					{exit: 1},
				);
			}
		} catch (error) {
			this.spinner.fail("Failed to load banks");
			this.handleError(error);
			return; // unreachable, handleError throws
		}

		// Step 2: Select bank
		const bankPublicId = await promptBankFromList(banks);

		// Step 3: Webhook URL
		const webhookUrl = await promptWebhookUrl();

		// Step 4: Type
		const type = await promptWebhookType();

		// Step 5: Create
		this.spinner.start("Creating webhook...");

		try {
			const data = await this.api.post(
				"/client/webhooks",
				{webhookUrl, bankPublicId, type},
				"apikey",
			);

			const webhook = data?.data ?? data;
			this.spinner.succeed("Webhook created!");

			console.log("");
			kvLine("Webhook URL", webhookUrl);
			kvLine("Type", type);
			kvLine("Bank", bankPublicId.slice(0, 8) + "...");
			if (webhook?.secret) {
				kvLine("HMAC Secret", chalk.yellow(webhook.secret));
				console.log("");
				warn("Save your HMAC secret — use it to verify webhook signatures.");
				console.log(`  Header: ${chalk.cyan("ApiPay-Signature")}`);
			}
			kvLine("Status", chalk.green("ACTIVE"));
			console.log("");

			markStepComplete("webhook");
			success("Webhook registered successfully.");

			if (this.jsonOutput) {
				this.outputJson(webhook);
			}
		} catch (error) {
			this.spinner.fail("Failed to create webhook");
			this.handleError(error);
		}
	}
}
