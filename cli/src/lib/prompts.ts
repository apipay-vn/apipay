import {confirm, input, password, select} from "@inquirer/prompts";
import {formatBankLabel} from "./banks.js";
import {
	ACCOUNT_TYPES,
	type AccountType,
	SUPPORTED_BANKS,
	type SupportedBank,
	WEBHOOK_TYPES,
} from "./constants.js";
import {
	validateAccountName,
	validateAccountNumber,
	validateApiKeyName,
	validateCccd,
	validateEmail,
	validateOtp,
	validatePaymentContent,
	validatePhoneNumber,
	validateRequired,
	validateWebhookUrl,
} from "./validators.js";

/**
 * Reusable prompt functions for consistent UX across commands.
 */

export async function promptEmail(message = "Email address:"): Promise<string> {
	return input({
		message,
		validate: validateEmail,
	});
}

export async function promptPassword(message = "Password:"): Promise<string> {
	return password({
		message,
		validate: validateRequired("Password"),
	});
}

export async function promptApiKeyName(): Promise<string> {
	return input({
		message: "API key name (for your reference):",
		default: "cli-key",
		validate: validateApiKeyName,
	});
}

export async function promptSecretKey(accessKey: string): Promise<string> {
	return password({
		message: `Please enter the secret key for ${accessKey}:`,
		validate: validateRequired("Secret key"),
	});
}

export async function promptBankSelection(): Promise<string> {
	return select({
		message: "Select your bank:",
		choices: SUPPORTED_BANKS.map((b) => ({
			value: b.value,
			name: b.name,
		})),
	});
}

export async function promptAccountType(
	bank: SupportedBank,
): Promise<AccountType> {
	return select({
		message: "Account type:",
		choices: ACCOUNT_TYPES.filter((type) =>
			(bank.accountTypes as readonly string[]).includes(type.value),
		).map((type) => ({
			value: type.value,
			name: type.name,
		})),
	});
}

export async function promptAccountNumber(
	bankShortName?: string,
): Promise<string> {
	return input({
		message: "Bank account number:",
		validate: (val) => validateAccountNumber(val, bankShortName),
	});
}

export async function promptAccountName(): Promise<string> {
	return input({
		message: "Account holder name:",
		validate: validateAccountName,
	});
}

export async function promptMobile(): Promise<string> {
	return input({
		message: "Mobile number (linked to bank):",
		validate: validatePhoneNumber,
	});
}

export async function promptOtp(): Promise<string> {
	return input({
		message: "Enter OTP code:",
		validate: validateOtp,
	});
}

export async function promptCccd(): Promise<string> {
	return input({
		message: "CCCD / tax code (linked to bank):",
		validate: validateCccd,
	});
}

export async function promptAcbUserId(): Promise<string> {
	return input({
		message: "ACB OneBiz username:",
		validate: validateRequired("ACB OneBiz username"),
	});
}

export async function promptWebhookUrl(): Promise<string> {
	return input({
		message: "Webhook URL (HTTPS):",
		validate: validateWebhookUrl,
	});
}

export async function promptWebhookType(): Promise<string> {
	return select({
		message: "Transaction type to listen for:",
		choices: WEBHOOK_TYPES.map((t) => ({
			value: t.value,
			name: t.name,
		})),
	});
}

export async function promptExistingKeyAction(): Promise<"keep" | "revoke"> {
	return select({
		message: "What would you like to do with your existing key?",
		choices: [
			{
				value: "keep" as const,
				name: "Keep existing key and continue",
			},
			{
				value: "revoke" as const,
				name: "Revoke and generate a new key",
			},
		],
	});
}

export async function promptConfirm(
	message: string,
	defaultValue = false,
): Promise<boolean> {
	return confirm({
		message,
		default: defaultValue,
	});
}

export async function promptBankFromList(
	banks: Array<{
		publicId: string;
		bankName: string;
		accountNumber: string;
		status: string;
	}>,
): Promise<string> {
	if (banks.length === 0) {
		throw new Error("No banks available. Run `apipay banks:add` first.");
	}

	return select({
		message: "Select a bank account:",
		choices: banks.map((b) => ({
			value: b.publicId,
			name: `${formatBankLabel(b)} — ${b.accountNumber} (${b.status})`,
		})),
	});
}

export async function promptAmount(): Promise<string> {
	return input({
		message: "Amount (optional, leave empty for flexible amount):",
		validate: (val) => {
			if (!val.trim()) return true;
			if (!/^\d+$/.test(val.trim())) return "Amount must contain only digits";
			return true;
		},
	});
}

export async function promptNote(): Promise<string> {
	return input({
		message: "Note / Content (optional):",
		validate: validatePaymentContent,
	});
}
