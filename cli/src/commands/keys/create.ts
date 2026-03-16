import chalk from "chalk";
import {AuthenticatedCommand} from "../../lib/base-command.js";
import {getApiKey, setApiKey} from "../../lib/config.js";
import {info, kvLine, maskSecret, success, warn} from "../../lib/formatters.js";
import {
	promptApiKeyName,
	promptExistingKeyAction,
	promptSecretKey,
} from "../../lib/prompts.js";

export default class KeysCreate extends AuthenticatedCommand {
	static override description =
		"Generate a new API key for client integrations";

	static override examples = ["<%= config.bin %> keys:create"];

	async run(): Promise<void> {
		// Check if user already has keys
		this.spinner.start("Checking existing keys...");
		try {
			const existing = await this.api.get("/client-auth/keys", "jwt");
			const keys = existing?.data ?? existing;

			if (Array.isArray(keys) && keys.length > 0) {
				this.spinner.stop();
				warn("You already have an API key. Only 1 key is allowed per account.");
				console.log(
					`  Current key: ${chalk.cyan(maskSecret(keys[0].accessKey))}`,
				);
				console.log("");
				const action = await promptExistingKeyAction();
				if (action === "keep") {
					const localKey = getApiKey();
					let savedSecret = keys[0].secretKey ?? "";
					if (!savedSecret && localKey?.accessKey === keys[0].accessKey) {
						savedSecret = localKey?.secretKey ?? "";
					}

					if (!savedSecret) {
						warn("The secret key is missing from your local configuration.");
						savedSecret = await promptSecretKey(keys[0].accessKey);
					}

					setApiKey({
						id: keys[0].id,
						accessKey: keys[0].accessKey,
						secretKey: savedSecret.trim(),
						name: keys[0].name ?? "",
					});
					info("Continuing with existing API key.");
					return;
				}

				this.spinner.start("Revoking existing key...");
				await this.api.delete(`/client-auth/keys/${keys[0].id}`, "jwt");
				this.spinner.succeed("Existing key revoked");
			} else {
				this.spinner.stop();
			}
		} catch (error) {
			this.spinner.fail("Failed to check existing keys");
			this.handleError(error);
		}

		const name = await promptApiKeyName();

		this.spinner.start("Generating API key...");
		try {
			const data = await this.api.post("/client-auth/keys", {name}, "jwt");
			const key = data?.data ?? data;

			this.spinner.succeed("API key created!");
			console.log("");
			console.log(chalk.bold("  Your API Key"));
			console.log(chalk.gray("  ────────────"));
			kvLine("Name", key.name ?? name);
			kvLine("Access Key", chalk.cyan(key.accessKey));
			kvLine("Secret Key", chalk.yellow(key.secretKey));
			console.log("");

			// Store in config for CLI use
			setApiKey({
				id: key.id,
				accessKey: key.accessKey,
				secretKey: key.secretKey,
				name: key.name ?? name,
			});

			success(
				"API key saved to CLI config. Save the secret key in a secure location. It will not be shown again.",
			);

			if (this.jsonOutput) {
				this.outputJson(key);
			}
		} catch (error) {
			this.spinner.fail("Failed to create API key");
			this.handleError(error);
		}
	}
}
