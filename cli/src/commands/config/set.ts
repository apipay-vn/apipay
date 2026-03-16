import {Args} from "@oclif/core";
import chalk from "chalk";
import {BaseCommand} from "../../lib/base-command.js";
import {getStore} from "../../lib/config.js";
import {success} from "../../lib/formatters.js";

export default class ConfigSet extends BaseCommand {
	static override description = "Set a CLI configuration value";

	static override args = {
		key: Args.string({
			description: "Config key (e.g., apiBaseUrl, dashboardUrl)",
			required: true,
		}),
		value: Args.string({description: "Config value", required: true}),
	};

	static override examples = [];

	async run(): Promise<void> {
		const {args} = await this.parse(ConfigSet);

		const allowedKeys = ["apiBaseUrl", "dashboardUrl"];
		if (!allowedKeys.includes(args.key)) {
			this.error(
				`Unknown config key: ${chalk.bold(args.key)}. Allowed keys: ${allowedKeys.join(", ")}`,
				{exit: 1},
			);
		}

		getStore().set(args.key as any, args.value);
		success(`${args.key} = ${chalk.cyan(args.value)}`);
	}
}
