import chalk from "chalk";
import Table from "cli-table3";

/**
 * Formatters for consistent CLI output.
 */

/** Format a date string or Date to a human-readable local string */
export function formatDate(date: string | Date): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleString();
}

/** Mask a secret key: show first 8 and last 4 chars */
export function maskSecret(secret: string): string {
	if (secret.length <= 16) return "****";
	return `${secret.slice(0, 8)}...${secret.slice(-4)}`;
}

/** Format amount as Vietnamese Dong (VND) - consistent format: 16.559.393 ₫ */
export function formatCurrency(amount: string | number): string {
	const num = typeof amount === "string" ? parseFloat(amount) : amount;
	if (isNaN(num)) return String(amount);
	return `${num.toLocaleString("vi-VN")} ₫`;
}

/** Mask a bank account number: show •••• and last 4 digits */
export function maskAccountNumber(accountNumber: string): string {
	if (accountNumber.length <= 4) return "••••";
	return `••••${accountNumber.slice(-4)}`;
}

/** Mask a long string: show first 16 and last 8 chars */
export function maskLongString(secret: string): string {
	if (secret.length <= 24) return "••••";
	return `${secret.slice(0, 16)}...${secret.slice(-8)}`;
}

/** Status badge with color */
export function statusBadge(status: string): string {
	const s = status.toUpperCase();
	switch (s) {
		case "ACTIVE":
		case "SUCCESS":
		case "VERIFIED":
			return chalk.green(`● ${s}`);
		case "PENDING":
			return chalk.yellow(`◐ ${s}`);
		case "INACTIVE":
		case "FAILED":
		case "EXPIRED":
			return chalk.red(`○ ${s}`);
		default:
			return chalk.gray(`○ ${s}`);
	}
}

/** Create a table with consistent styling */
export function createTable(head: string[], rows: string[][]): string {
	const table = new Table({
		head: head.map((h) => chalk.cyan.bold(h)),
		style: {head: [], border: ["gray"]},
		chars: {
			top: "─",
			"top-mid": "┬",
			"top-left": "┌",
			"top-right": "┐",
			bottom: "─",
			"bottom-mid": "┴",
			"bottom-left": "└",
			"bottom-right": "┘",
			left: "│",
			"left-mid": "├",
			mid: "─",
			"mid-mid": "┼",
			right: "│",
			"right-mid": "┤",
			middle: "│",
		},
	});
	for (const row of rows) {
		table.push(row);
	}
	return table.toString();
}

/** Print a success message */
export function success(msg: string): void {
	console.log(`${chalk.green("✓")} ${msg}`);
}

/** Print a warning message */
export function warn(msg: string): void {
	console.log(`${chalk.yellow("⚠")} ${msg}`);
}

/** Print an error message */
export function error(msg: string): void {
	console.error(`${chalk.red("✗")} ${msg}`);
}

/** Print an info message */
export function info(msg: string): void {
	console.log(`${chalk.cyan("ℹ")} ${msg}`);
}

/** Print a key-value pair */
export function kvLine(key: string, value: string): void {
	console.log(`  ${chalk.gray(key.padEnd(16))} ${value}`);
}

/** Step indicator for wizard: [1/4] */
export function stepLabel(
	current: number,
	total: number,
	title: string,
): string {
	return `${chalk.cyan(`[${current}/${total}]`)} ${chalk.bold(title)}`;
}

/** Big header banner */
export function banner(): void {
	console.log("");
	console.log(chalk.cyan.bold("  ╔══════════════════════════════════╗"));
	console.log(chalk.cyan.bold("  ║         🚀  ApiPay CLI          ║"));
	console.log(chalk.cyan.bold("  ║   Payment Gateway Setup Wizard  ║"));
	console.log(chalk.cyan.bold("  ╚══════════════════════════════════╝"));
	console.log("");
}
