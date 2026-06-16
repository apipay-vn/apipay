import chalk from "chalk";
import {BaseCommand} from "../lib/base-command.js";
import {fetchClientBanks} from "../lib/client-banks.js";
import {
	getApiKey,
	getAuth,
	getCompletedSteps,
	isLoggedIn,
} from "../lib/config.js";
import {SETUP_STEPS, type SetupStep} from "../lib/constants.js";
import {info, kvLine, maskSecret} from "../lib/formatters.js";

export default class Status extends BaseCommand {
	static override description = "Show current setup status and configuration";

	static override examples = ["<%= config.bin %> status"];

	async run(): Promise<void> {
		const auth = getAuth();
		const apiKey = getApiKey();
		const completed = getCompletedSteps();
		const allDone = SETUP_STEPS.every((s) => completed.includes(s));

		console.log("");
		console.log(chalk.bold("  ApiPay CLI Status"));
		console.log(chalk.gray("  ─────────────────"));
		console.log("");

		// Auth
		if (isLoggedIn() && auth) {
			kvLine("Login", `${chalk.green("●")} ${auth.email}`);
		} else {
			kvLine("Login", `${chalk.red("○")} Not logged in`);
		}

		// API Key
		if (apiKey?.accessKey) {
			kvLine("API Key", `${chalk.green("●")} ${maskSecret(apiKey.accessKey)}`);
		} else {
			kvLine("API Key", `${chalk.red("○")} Not configured`);
		}

		// Banks & Webhooks — fetch from API if authenticated
		if (apiKey?.accessKey && apiKey?.secretKey) {
			try {
				const banks = await fetchClientBanks();
				if (Array.isArray(banks)) {
					const active = banks.filter((b: any) => b.status === "ACTIVE").length;
					const pending = banks.filter(
						(b: any) => b.status === "PENDING",
					).length;
					kvLine(
						"Banks",
						`${chalk.green("●")} ${active} active${pending ? `, ${pending} pending` : ""}`,
					);
				} else {
					kvLine("Banks", `${chalk.gray("○")} 0`);
				}
			} catch {
				kvLine("Banks", chalk.gray("Unable to fetch"));
			}

			try {
				const whData = await this.api.get("/client/webhooks", "apikey");
				const webhooks = whData?.data ?? whData;
				if (Array.isArray(webhooks)) {
					const active = webhooks.filter((w: any) => w.isActive).length;
					kvLine("Webhooks", `${chalk.green("●")} ${active} active`);
				} else {
					kvLine("Webhooks", `${chalk.gray("○")} 0`);
				}
			} catch {
				kvLine("Webhooks", chalk.gray("Unable to fetch"));
			}
		} else {
			kvLine("Banks", `${chalk.gray("○")} Requires API key`);
			kvLine("Webhooks", `${chalk.gray("○")} Requires API key`);
		}

		console.log("");

		// Setup progress
		kvLine(
			"Setup",
			allDone
				? chalk.green("Complete")
				: `${completed.length}/${SETUP_STEPS.length} steps`,
		);

		const next = SETUP_STEPS.find((s) => !completed.includes(s));
		const hints: Record<SetupStep, string> = {
			login: "apipay login",
			"api-key": "apipay keys:create",
			bank: "apipay banks:add",
			webhook: "apipay webhooks:add",
		};
		if (next) {
			info(`Next step: ${chalk.cyan(hints[next])}`);
		}
		info(`Or run ${chalk.cyan("apipay setup")} to continue the guided setup.`);
		console.log("");

		if (this.jsonOutput) {
			this.outputJson({
				loggedIn: isLoggedIn(),
				email: auth?.email,
				apiKey: apiKey?.accessKey,
				completedSteps: completed,
				setupComplete: allDone,
			});
		}
	}
}
