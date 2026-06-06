const BANK_CODE_BY_BIN: Record<string, string> = {
	"970416": "ACB",
	"970418": "BIDV",
	"970422": "MB",
	"970448": "OCB",
};

export function formatBankShortName(value: string | null | undefined): string {
	if (!value) return "";
	const normalized = value.trim().toUpperCase();
	return BANK_CODE_BY_BIN[normalized] ?? normalized;
}

export function formatBankLabel(bank: {
	bankShortName?: string | null;
	bankName?: string | null;
	bankCode?: string | null;
}): string {
	const shortName = formatBankShortName(bank.bankShortName ?? bank.bankCode);
	return shortName || bank.bankName || "—";
}
