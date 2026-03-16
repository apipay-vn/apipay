import {Flags} from "@oclif/core";
import chalk from "chalk";
import open from "open";
import {BaseCommand} from "../lib/base-command.js";
import {
	clearApiKey,
	clearAuth,
	getAuth,
	getDashboardUrl,
	isLoggedIn,
	setAuth,
} from "../lib/config.js";
import {
	MAGIC_LINK_POLL_INTERVAL_MS,
	MAGIC_LINK_TIMEOUT_MS,
} from "../lib/constants.js";
import {
	info,
	kvLine,
	maskLongString,
	success,
	warn,
} from "../lib/formatters.js";
import {promptConfirm, promptEmail} from "../lib/prompts.js";

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
			description: "Don't open the browser for magic link",
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
				"Passing --password on the command line stores it in shell history and may be visible in process lists. Prefer the magic-link flow for interactive sessions.",
			);
			return this.loginWithPassword(email, flags.password);
		}

		// Magic link flow (default — best UX)
		return this.loginWithMagicLink(email, flags["no-browser"]);
	}

	private async loginWithMagicLink(
		email: string,
		noBrowser: boolean,
	): Promise<void> {
		this.spinner.start("Requesting magic link...");

		let data: any;
		try {
			data = await this.api.post("/auth/magic-link/request", {email});
		} catch (error) {
			this.spinner.fail("Failed to request magic link");
			this.handleError(error);
		}

		const token = data?.data?.token ?? data?.token;
		if (!token) {
			this.spinner.fail("Failed to get magic link token");
			this.error("Unexpected response from server", {exit: 2});
		}
		this.spinner.succeed("Magic link requested!");

		// Open browser
		const verifyUrl = `${getDashboardUrl()}/verify?token=${token}`;
		console.log("");
		info(`Open this URL to authenticate:`);
		console.log(`  ${chalk.underline.cyan(verifyUrl)}`);
		console.log("");

		if (!noBrowser) {
			try {
				await open(verifyUrl);
				info("Browser opened automatically.");
			} catch {
				warn("Could not open browser. Please open the URL manually.");
			}
		}

		// Poll for verification
		this.spinner.start("Waiting for authentication...");
		const startTime = Date.now();

		while (Date.now() - startTime < MAGIC_LINK_TIMEOUT_MS) {
			await this.sleep(MAGIC_LINK_POLL_INTERVAL_MS);

			try {
				const status = await this.api.get(
					`/auth/magic-link/status?token=${token}`,
				);
				const st = status?.data?.status ?? status?.status;

				if (st === "verified") {
					// Token has been consumed — now exchange for auth tokens
					// The verify endpoint was already called by the browser;
					// we need to call it ourselves too to get the tokens for CLI
					try {
						const authResult = await this.api.post("/auth/magic-link/verify", {
							token,
						});
						const result = authResult?.data ?? authResult;
						const user = result?.user;
						const tokens = result?.tokens;

						if (tokens?.accessToken) {
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
							return;
						}
					} catch {
						// Token already consumed by browser — that's expected.
						// In this case, the CLI should have its own token.
						// We'll try the password fallback or re-request.
						this.spinner.fail(
							"Magic link was verified in browser but could not retrieve tokens for CLI.",
						);
						info(
							`Please run ${chalk.cyan("apipay login --email " + email + " --password <password>")} instead.`,
						);
						return;
					}
				}

				if (st === "expired") {
					this.spinner.fail("Magic link expired");
					this.error("The magic link has expired. Please try again.", {
						exit: 1,
					});
				}
			} catch {
				// Network error during poll — continue
			}
		}

		this.spinner.fail("Authentication timed out");
		this.error("Timed out waiting for authentication. Please try again.", {
			exit: 1,
		});
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
