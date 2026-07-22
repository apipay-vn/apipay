/**
 * CLI Constants
 * Central place for all magic strings, URLs, and configuration values.
 */

export const API_BASE_URL = "https://app.apipay.vn/v1";
export const DASHBOARD_URL = "https://my.apipay.vn";

export const CONFIG_DIR = "apipay";
export const CONFIG_FILE = "config";

export const ACCOUNT_TYPES = [
	{value: "personal-account", name: "Personal account"},
	{value: "business-account", name: "Business account"},
	{value: "business-household-account", name: "Household business account"},
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number]["value"];

export const SUPPORTED_BANKS = [
	{
		value: "ACB",
		shortName: "ACB",
		bankBin: "970416",
		bankName: "ACB",
		name: "ACB — Ngân hàng TMCP Á Châu",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: false,
	},
	{
		value: "MBB",
		shortName: "MBB",
		bankBin: "970422",
		bankName: "MB Bank",
		name: "MB Bank — Ngân hàng TMCP Quân đội",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "BIDV",
		shortName: "BIDV",
		bankBin: "970418",
		bankName: "BIDV",
		name: "BIDV — Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "OCB",
		shortName: "OCB",
		bankBin: "970448",
		bankName: "OCB",
		name: "OCB — Ngân hàng TMCP Phương Đông",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "ICB",
		shortName: "ICB",
		bankBin: "970415",
		bankName: "VietinBank",
		name: "VietinBank — Ngân hàng TMCP Công Thương Việt Nam",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "VIB",
		shortName: "VIB",
		bankBin: "970441",
		bankName: "VIB",
		name: "VIB — Ngân hàng TMCP Quốc tế Việt Nam",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "VPB",
		shortName: "VPB",
		bankBin: "970432",
		bankName: "VPBank",
		name: "VPBank — Ngân hàng TMCP Việt Nam Thịnh Vượng",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "STB",
		shortName: "STB",
		bankBin: "970403",
		bankName: "Sacombank",
		name: "Sacombank — Ngân hàng TMCP Sài Gòn Thương Tín",
		accountTypes: [
			"personal-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "PGB",
		shortName: "PGB",
		bankBin: "970430",
		bankName: "PGBank",
		name: "PGBank — Ngân hàng TMCP Thịnh Vượng và Phát Triển",
		accountTypes: [
			"personal-account",
			"business-account",
			"business-household-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
	{
		value: "SHBVN",
		shortName: "SHBVN",
		bankBin: "970424",
		bankName: "Shinhan Bank",
		name: "Shinhan Bank — Ngân hàng TNHH MTV Shinhan Việt Nam",
		accountTypes: [
			"personal-account",
			"business-account",
		] satisfies AccountType[],
		requiresIdentity: true,
	},
] as const;

export type SupportedBank = (typeof SUPPORTED_BANKS)[number];

export function getSupportedBank(value: string): SupportedBank | undefined {
	return SUPPORTED_BANKS.find((bank) => bank.value === value);
}

export const SETUP_STEPS = ["login", "api-key", "bank", "webhook"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

/** Magic link polling config */
export const MAGIC_LINK_POLL_INTERVAL_MS = 2000;
export const MAGIC_LINK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/** HTTP retry config */
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1000;

/** Exit codes following standard conventions */
export const EXIT_CODES = {
	SUCCESS: 0,
	USER_ERROR: 1,
	API_ERROR: 2,
	SIGINT: 130,
} as const;
