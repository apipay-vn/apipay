import chalk from "chalk";
import {BaseCommand} from "../../lib/base-command.js";
import {resetAll} from "../../lib/config.js";
import {success, warn} from "../../lib/formatters.js";
import {promptConfirm} from "../../lib/prompts.js";

export default class ConfigReset extends BaseCommand {
	static override description =
		"Reset all CLI configuration and stored credentials";

	static override examples = ["<%= config.bin %> config:reset"];

	async run(): Promise<void> {
		warn("This will clear ALL stored data: tokens, API keys, and settings.");

		const confirmed = await promptConfirm(
			`${chalk.red("Are you sure?")} Reset all ApiPay CLI configuration?`,
		);

		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		resetAll();
		success("All configuration has been reset.");
		this.log(`\n  Run ${chalk.cyan("apipay setup")} to start fresh.\n`);
	}
}
