/**
 * CLI Constants
 * Central place for all magic strings, URLs, and configuration values.
 */

export const API_BASE_URL = "https://app.apipay.vn/v1";
export const DASHBOARD_URL = "https://my.apipay.vn";

export const CONFIG_DIR = "apipay";
export const CONFIG_FILE = "config";

export const SUPPORTED_BANKS = [
	{value: "BIDV", name: "BIDV — Ngân hàng TMCP Đầu tư và Phát triển Việt Nam"},
	{value: "ACB", name: "ACB — Ngân hàng TMCP Á Châu"},
	{value: "MBB", name: "MB Bank — Ngân hàng TMCP Quân đội"},
	{value: "OCB", name: "OCB — Ngân hàng TMCP Phương Đông"},
] as const;

export const WEBHOOK_TYPES = [
	{value: "IN", name: "IN — Incoming transactions only"},
	{value: "OUT", name: "OUT — Outgoing transactions only"},
	{value: "ALL", name: "ALL — Both incoming and outgoing"},
] as const;

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
