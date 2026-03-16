import {Args} from "@oclif/core";
import chalk from "chalk";
import {AuthenticatedCommand} from "../../lib/base-command.js";
import {clearApiKey, getApiKey} from "../../lib/config.js";
import {maskSecret, success} from "../../lib/formatters.js";
import {promptConfirm} from "../../lib/prompts.js";

export default class KeysRevoke extends AuthenticatedCommand {
	static override description = "Revoke an API key";

	static override args = {
		id: Args.string({
			description: "API key ID to revoke (defaults to current key)",
			required: false,
		}),
	};

	static override examples = [
		"<%= config.bin %> keys:revoke",
		"<%= config.bin %> keys:revoke <key-id>",
	];

	async run(): Promise<void> {
		const {args} = await this.parse(KeysRevoke);

		let keyId = args.id;

		// If no ID provided, use the stored key or list and pick
		if (!keyId) {
			const stored = getApiKey();
			if (stored?.id) {
				keyId = stored.id;
				this.log(`Revoking key: ${chalk.cyan(maskSecret(stored.accessKey))}`);
			} else {
				// Fetch from API
				this.spinner.start("Fetching keys...");
				try {
					const data = await this.api.get("/client-auth/keys", "jwt");
					const keys = data?.data ?? data;
					this.spinner.stop();

					if (!Array.isArray(keys) || keys.length === 0) {
						this.error("No API keys to revoke.", {exit: 1});
					}
					keyId = keys[0].id;
					this.log(
						`Revoking key: ${chalk.cyan(maskSecret(keys[0].accessKey))}`,
					);
				} catch (error) {
					this.spinner.fail();
					this.handleError(error);
				}
			}
		}

		const confirmed = await promptConfirm(
			`${chalk.red("This action is irreversible.")} Revoke this API key?`,
		);
		if (!confirmed) {
			this.log("Cancelled.");
			return;
		}

		this.spinner.start("Revoking API key...");
		try {
			await this.api.delete(`/client-auth/keys/${keyId}`, "jwt");
			clearApiKey();
			this.spinner.succeed("API key revoked");
			success("Key has been permanently revoked.");

			if (this.jsonOutput) {
				this.outputJson({success: true, id: keyId});
			}
		} catch (error) {
			this.spinner.fail("Failed to revoke API key");
			this.handleError(error);
		}
	}
}
