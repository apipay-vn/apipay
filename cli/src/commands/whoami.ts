import chalk from "chalk";
import {AuthenticatedCommand} from "../lib/base-command.js";
import {getAuth} from "../lib/config.js";
import {kvLine} from "../lib/formatters.js";

export default class Whoami extends AuthenticatedCommand {
	static override description = "Display the currently authenticated user";

	static override examples = ["<%= config.bin %> whoami"];

	async run(): Promise<void> {
		this.spinner.start("Fetching profile...");

		try {
			const data = await this.api.post("/auth/me", undefined, "jwt");
			const user = data?.data ?? data;

			this.spinner.stop();

			console.log("");
			console.log(chalk.bold("  Current User"));
			console.log(chalk.gray("  ────────────"));
			kvLine("Email", user?.email ?? getAuth()?.email ?? "unknown");
			kvLine("Name", user?.name ?? "—");
			kvLine("Role", user?.role ?? "USER");
			kvLine("Active", user?.isActive ? chalk.green("Yes") : chalk.red("No"));
			kvLine("User ID", user?.id ?? "");
			console.log("");

			if (this.jsonOutput) {
				this.outputJson(user);
			}
		} catch (error) {
			this.spinner.fail("Failed to fetch profile");
			this.handleError(error);
		}
	}
}
