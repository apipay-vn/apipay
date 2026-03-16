import {Command, Flags} from "@oclif/core";
import chalk from "chalk";
import ora, {type Ora} from "ora";
import {ApiClient, formatApiError, getApiClient} from "./api-client.js";
import {getApiKey, isLoggedIn} from "./config.js";

/**
 * BaseCommand
 * Shared base for all apipay CLI commands.
 * Provides spinner, api client, auth checks, and --json/--quiet flags.
 */
export abstract class BaseCommand extends Command {
	static baseFlags = {
		json: Flags.boolean({
			description: "Output raw JSON (for scripting/CI)",
			default: false,
		}),
		quiet: Flags.boolean({
			char: "q",
			description: "Suppress interactive output",
			default: false,
		}),
	};

	protected api!: ApiClient;
	protected spinner!: Ora;
	protected jsonOutput = false;
	protected quietOutput = false;

	async init(): Promise<void> {
		await super.init();
		const {flags} = await this.parse(this.constructor as any);
		this.jsonOutput = (flags as any).json ?? false;
		this.quietOutput = (flags as any).quiet ?? false;
		this.api = getApiClient();
		this.spinner = ora({isSilent: this.quietOutput || this.jsonOutput});
	}

	/** Require JWT auth — exits with error if not logged in */
	protected requireAuth(): void {
		if (!isLoggedIn()) {
			this.error(
				`${chalk.red("Not logged in.")} Run ${chalk.cyan("apipay login")} first.`,
				{exit: 1},
			);
		}
	}

	/** Require API key — exits with error if not configured */
	protected requireApiKey(): void {
		const key = getApiKey();
		if (!key?.accessKey || !key?.secretKey) {
			this.error(
				`${chalk.red("No API key configured.")} Run ${chalk.cyan("apipay keys:create")} first.`,
				{exit: 1},
			);
		}
	}

	/** Output JSON data or formatted text */
	protected outputJson(data: any): void {
		if (this.jsonOutput) {
			console.log(JSON.stringify(data, null, 2));
		}
	}

	/** Handle API errors with user-friendly messages */
	protected handleError(error: unknown): never {
		const msg = formatApiError(error);
		this.error(msg, {exit: 2});
	}
}

/**
 * AuthenticatedCommand
 * Base for commands that require JWT authentication.
 */
export abstract class AuthenticatedCommand extends BaseCommand {
	async init(): Promise<void> {
		await super.init();
		this.requireAuth();
	}
}

/**
 * ApiKeyCommand
 * Base for commands that require API key authentication (banks, webhooks, metrics).
 */
export abstract class ApiKeyCommand extends BaseCommand {
	async init(): Promise<void> {
		await super.init();
		this.requireAuth();
		this.requireApiKey();
	}
}
