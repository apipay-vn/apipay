import {Flags} from "@oclif/core";
import chalk from "chalk";
import {BaseCommand} from "../lib/base-command.js";
import {
	clearApiKey,
	clearAuth,
	getAuth,
	isLoggedIn,
	setAuth,
} from "../lib/config.js";
import {
	info,
	kvLine,
	maskLongString,
	success,
	warn,
} from "../lib/formatters.js";
import {
	promptConfirm,
	promptEmail,
	promptMagicLinkToken,
} from "../lib/prompts.js";

export default class Login extends BaseCommand {
	static override description = "Authenticate with ApiPay";

	static override examples = [
		"<%= config.bin %> login",
		"<%= config.bin %> login --email user@example.com",
		"<%= config.bin %> login --email user@example.com --password mypass",
	];

	static override flags = {
		...BaseCommand.baseFlags,
		email: Flags.string({
			char: "e",
			description: "Email address (skip interactive prompt)",
		}),
		password: Flags.string({
			char: "p",
			description: "Password for email+password login (CI/scripting)",
		}),
		"no-browser": Flags.boolean({
			description: "Accepted for compatibility; browser is not opened during CLI magic-link login",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const {flags} = await this.parse(Login);

		// Already logged in?
		if (isLoggedIn()) {
			const auth = getAuth()!;
			warn(`Already logged in as ${chalk.bold(auth.email)}`);
			const relogin = await promptConfirm(
				"Login again or login with a different account?",
			);
			if (!relogin) return;
		}

		// Clear existing state before starting a new login session
		clearAuth();
		clearApiKey();

		const email = flags.email ?? (await promptEmail());

		// Password flow (for CI/scripting)
		if (flags.password) {
			warn(
				"Passing --password on the command line stores it in shell history and may be visible in process lists.",
			);
			return this.loginWithPassword(email, flags.password);
		}

		// Magic link flow (default — best UX)
		return this.loginWithMagicLink(email);
	}

	private async loginWithMagicLink(email: string): Promise<void> {
		this.spinner.start("Requesting magic link...");

		try {
			await this.api.post("/auth/magic-link/request", {
				email,
			});
		} catch (error) {
			this.spinner.fail("Failed to request magic link");
			this.handleError(error);
		}

		this.spinner.succeed("Magic link sent!");
		info("Check your email and paste the full magic link here. Do not open it first.");

		const token = this.extractMagicLinkToken(await promptMagicLinkToken());
		this.spinner.start("Completing magic-link login...");

		try {
			const authResult = await this.api.post("/auth/magic-link/verify", {
				token,
			});
			const result = authResult?.data ?? authResult;
			const user = result?.user;
			const tokens = result?.tokens;

			if (!tokens?.accessToken) {
				this.spinner.fail("Login failed");
				this.error("Unexpected response from server", {exit: 2});
			}

			setAuth({
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				expiresAt: Date.now() + (tokens.expiresIn ?? 900) * 1000,
				email: user?.email ?? email,
				userId: user?.id ?? "",
			});

			this.spinner.succeed("Authenticated!");
			console.log("");
			success(`Logged in as ${chalk.bold(user?.email ?? email)}`);

			if (this.jsonOutput) {
				this.outputJson({email: user?.email, userId: user?.id});
			}
		} catch (error) {
			this.spinner.fail("Magic-link login failed");
			this.handleError(error);
		}
	}

	private extractMagicLinkToken(value: string): string {
		const trimmed = value.trim();
		try {
			const url = new URL(trimmed);
			return url.searchParams.get("token") ?? trimmed;
		} catch {
			return trimmed;
		}
	}

	private async loginWithPassword(
		email: string,
		password: string,
	): Promise<void> {
		this.spinner.start("Logging in...");

		try {
			const data = await this.api.post("/auth/login", {
				emailOrUsername: email,
				password,
			});
			const result = data?.data ?? data;
			const user = result?.user;
			const tokens = result?.tokens;

			if (!tokens?.accessToken) {
				this.spinner.fail("Login failed");
				this.error("Unexpected response from server", {exit: 2});
			}

			setAuth({
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				expiresAt: Date.now() + (tokens.expiresIn ?? 900) * 1000,
				email: user?.email ?? email,
				userId: user?.id ?? "",
			});

			this.spinner.succeed("Authenticated!");
			console.log("");
			success(`Logged in as ${chalk.bold(user?.email ?? email)}`);
			kvLine("User ID", maskLongString(user?.id) ?? "");

			if (this.jsonOutput) {
				this.outputJson({
					email: user?.email,
					userId: user?.id,
				});
			}
		} catch (error) {
			this.spinner.fail("Login failed");
			this.handleError(error);
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((r) => setTimeout(r, ms));
	}
}
