import {Args} from "@oclif/core";
import chalk from "chalk";
import {BaseCommand} from "../../lib/base-command.js";
import {getStore} from "../../lib/config.js";

export default class ConfigGet extends BaseCommand {
	static override description = "Get a CLI configuration value";

	static override args = {
		key: Args.string({
			description: "Config key (e.g., apiBaseUrl, dashboardUrl)",
			required: false,
		}),
	};

	static override examples = [
		"<%= config.bin %> config:get apiBaseUrl",
		"<%= config.bin %> config:get",
	];

	async run(): Promise<void> {
		const {args} = await this.parse(ConfigGet);
		const store = getStore();

		if (args.key) {
			const value = store.get(args.key as any);
			if (value === undefined) {
				this.error(`Key ${chalk.bold(args.key)} is not set.`, {exit: 1});
			}

			if (typeof value === "object") {
				console.log(JSON.stringify(value, null, 2));
			} else {
				console.log(String(value));
			}
		} else {
			// Print all config (mask sensitive values)
			const all = store.store;
			const safe = {...all} as any;

			if (safe.auth?.accessToken) {
				safe.auth = {
					...safe.auth,
					accessToken: safe.auth.accessToken.slice(0, 20) + "...",
					refreshToken: safe.auth.refreshToken?.slice(0, 20) + "...",
				};
			}
			if (safe.apiKey?.secretKey) {
				safe.apiKey = {
					...safe.apiKey,
					secretKey: "****",
				};
			}

			console.log(JSON.stringify(safe, null, 2));
		}
	}
}
