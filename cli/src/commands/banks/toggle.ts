import {Args} from "@oclif/core";
import chalk from "chalk";
import {ApiKeyCommand} from "../../lib/base-command.js";
import {getClientBanksApi} from "../../lib/client-banks.js";
import {statusBadge, success} from "../../lib/formatters.js";

export default class BanksToggle extends ApiKeyCommand {
	static override description =
		"Toggle a bank account between ACTIVE and INACTIVE";

	static override args = {
		id: Args.string({description: "Bank public ID", required: true}),
	};

	static override examples = ["<%= config.bin %> banks:toggle <public-id>"];

	async run(): Promise<void> {
		const {args} = await this.parse(BanksToggle);

		this.spinner.start("Toggling bank status...");

		try {
			const data = await getClientBanksApi().patch(
				`/client/banks/${args.id}/status`,
				undefined,
				"apikey",
			);
			const bank = data;
			this.spinner.succeed("Bank status updated");
			success(
				`Bank ${chalk.bold(args.id.slice(0, 8))}... is now ${statusBadge(bank.newStatus === 1 ? "ACTIVE" : "INACTIVE")}`,
			);

			if (this.jsonOutput) {
				this.outputJson(bank);
			}
		} catch (error) {
			this.spinner.fail("Failed to toggle bank status");
			this.handleError(error);
		}
	}
}
