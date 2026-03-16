import chalk from "chalk";
import {AuthenticatedCommand} from "../lib/base-command.js";
import {clearApiKey, clearAuth, getAuth} from "../lib/config.js";
import {success} from "../lib/formatters.js";
import {promptConfirm} from "../lib/prompts.js";

export default class Logout extends AuthenticatedCommand {
	static override description =
		"Log out from ApiPay and clear stored credentials";

	static override examples = ["<%= config.bin %> logout"];

	async run(): Promise<void> {
		const auth = getAuth()!;

		const confirmed = await promptConfirm(
			`Log out from ${chalk.bold(auth.email)}? This will clear stored tokens and API keys.`,
		);

		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		this.spinner.start("Logging out...");

		try {
			await this.api.post("/auth/logout", undefined, "jwt");
		} catch {
			// Server logout might fail if token expired — that's fine
		}

		clearAuth();
		clearApiKey();

		this.spinner.succeed("Logged out");
		success("All credentials cleared.");

		if (this.jsonOutput) {
			this.outputJson({success: true});
		}
	}
}
