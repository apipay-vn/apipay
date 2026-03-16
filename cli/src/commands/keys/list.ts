import chalk from "chalk";
import {AuthenticatedCommand} from "../../lib/base-command.js";
import {
	createTable,
	formatDate,
	maskSecret,
	statusBadge,
} from "../../lib/formatters.js";

export default class KeysList extends AuthenticatedCommand {
	static override description = "List your API keys";

	static override examples = ["<%= config.bin %> keys:list"];

	async run(): Promise<void> {
		this.spinner.start("Fetching API keys...");

		try {
			const data = await this.api.get("/client-auth/keys", "jwt");
			const keys = data?.data ?? data;

			this.spinner.stop();

			if (!Array.isArray(keys) || keys.length === 0) {
				this.log(
					`\n  No API keys found. Run ${chalk.cyan("apipay keys:create")} to generate one.\n`,
				);
				return;
			}

			console.log("");
			const table = createTable(
				["Name", "Access Key", "Status", "Created"],
				keys.map((k: any) => [
					k.name || "—",
					k.accessKey ? maskSecret(k.accessKey) : "—",
					statusBadge(k.isActive ? "ACTIVE" : "INACTIVE"),
					formatDate(k.createdAt),
				]),
			);
			console.log(table);
			console.log("");

			if (this.jsonOutput) {
				this.outputJson(keys);
			}
		} catch (error) {
			this.spinner.fail("Failed to fetch API keys");
			this.handleError(error);
		}
	}
}
