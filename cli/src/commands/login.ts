import {Flags} from "@oclif/core";
import chalk from "chalk";
import open from "open";
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
			description: "Print the browser approval URL instead of opening it automatically",
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
		return this.loginWithBrowserApproval(email, flags["no-browser"]);
	}

	private async loginWithBrowserApproval(
		email: string,
		noBrowser: boolean,
	): Promise<void> {
		this.spinner.start("Starting browser approval...");

		let request: any;
		try {
			request = await this.api.post("/auth/cli-login/request", {
				email,
			});
		} catch (error) {
			this.spinner.fail("Failed to start browser approval");
			this.handleError(error);
		}

		const approvalToken = request?.approvalToken;
		const approvalUrl = request?.approvalUrl;
		const expiresAt = request?.expiresAt ? new Date(request.expiresAt) : null;

		if (!approvalToken || !approvalUrl || !expiresAt) {
			this.spinner.fail("Login failed");
			this.error("Unexpected response from server", {exit: 2});
		}

		this.spinner.succeed("Browser approval required");
		info("Approve this terminal login from a browser already logged into the same ApiPay account.");
		kvLine("Approval URL", approvalUrl);

		if (!noBrowser) {
			try {
				await open(approvalUrl);
			} catch {
				warn("Could not open browser automatically. Open the approval URL manually.");
			}
		}

		this.spinner.start("Waiting for browser approval...");

		try {
			const result = await this.pollCliLoginApproval(approvalToken, expiresAt);
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
			this.spinner.fail("Browser approval failed");
			this.handleError(error);
		}
	}

	private async pollCliLoginApproval(
		token: string,
		expiresAt: Date,
	): Promise<any> {
		while (Date.now() < expiresAt.getTime()) {
			const result: any = await this.api.post("/auth/cli-login/exchange", {
				token,
			});

			if (result?.status === "approved") {
				return result;
			}

			if (result?.status === "expired") {
				this.error("CLI login approval expired. Run `apipay login` again.", {
					exit: 2,
				});
			}

			await this.sleep(2000);
		}

		this.error("CLI login approval expired. Run `apipay login` again.", {
			exit: 2,
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
