/**
 * Input validators for CLI prompts.
 * Each returns true if valid, or an error message string if invalid.
 */

/**
 * Mirrors the backend cleanPaymentContent() in core/src/common/utils/content.util.ts.
 * Must be kept in sync with the backend implementation.
 *
 * Steps:
 *  1. Normalize Vietnamese diacritics.
 *  2. Replace đ/Đ → d/D.
 *  3. Strip everything except: a-z A-Z 0-9 . , - + and spaces.
 *  4. Trim leading/trailing whitespace.
 */
export function cleanPaymentContent(content: string): string {
	if (!content) return "";
	return content
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.replace(/[^a-zA-Z0-9.,\-+ ]/g, "")
		.trim();
}

export function validatePaymentContent(val: string): string | true {
	if (!val) return true; // optional field
	const cleaned = cleanPaymentContent(val);
	if (!cleaned)
		return "Note contains only invalid characters. Only alphanumeric and '.,-+' are allowed.";
	if (cleaned.length > 40)
		return `Warning: Note is too long. Keep it short so the bank doesn't truncate it and break auto-matching.`;
	return true;
}

export function validateEmail(input: string): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "Email is required";
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
	return true;
}

export function validateAccountNumber(
	input: string,
	bankShortName?: string,
): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "Account number is required";
	if (!/^\d+$/.test(trimmed)) return "Account number must contain only digits";

	// Bank-specific length validation
	// if (bankShortName === "BIDV" && trimmed.length !== 14) {
	// 	return "BIDV account numbers must be 14 digits";
	// }
	// if (bankShortName === "MBB" && trimmed.length !== 13) {
	// 	return "MB Bank account numbers must be 13 digits";
	// }
	if (trimmed.length < 6 || trimmed.length > 20) {
		return "Account number must be between 6 and 20 digits";
	}

	return true;
}

export function validateOtp(input: string): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "OTP is required";
	if (!/^\d{4,8}$/.test(trimmed)) return "OTP must be 4-8 digits";
	return true;
}

export function validateWebhookUrl(input: string): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "Webhook URL is required";

	try {
		const url = new URL(trimmed);
		const hostname = url.hostname.toLowerCase();
		const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

		if (url.protocol === "http:") {
			if (!isLocalhost) {
				// HTTP is only safe for local dev — block for any real host
				return "Webhook URL must use HTTPS to protect transaction data in transit. Use https:// (http:// is only allowed for localhost).";
			}
			// http://localhost is fine for local testing — allow through
		} else if (url.protocol !== "https:") {
			return "URL must use https:// (or http://localhost for local testing).";
		}

		// Block dangerous/internal addresses for non-localhost
		if (!isLocalhost) {
			const blocked = [
				"0.0.0.0",
				"169.254.169.254",
				"metadata.google.internal",
			];
			if (blocked.includes(hostname)) {
				return `${hostname} is not a valid webhook endpoint.`;
			}

			// Block private IP ranges
			if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) {
				return "Private IP addresses are not reachable as webhook endpoints. Use a publicly reachable HTTPS URL.";
			}
		}
	} catch {
		return "Please enter a valid URL (e.g., https://example.com/webhook).";
	}

	return true;
}

export function validatePhoneNumber(input: string): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "Phone number is required";
	// Vietnamese phone: 0xxx or +84xxx, 9-11 digits
	if (!/^(\+84|0)\d{8,10}$/.test(trimmed)) {
		return "Please enter a valid Vietnamese phone number (e.g., 0912345678)";
	}
	return true;
}

export function validateRequired(fieldName: string) {
	return (input: string): string | true => {
		if (!input.trim()) return `${fieldName} is required`;
		return true;
	};
}

export function validateApiKeyName(input: string): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "API key name is required";
	if (trimmed.length > 50) return "Name must be 50 characters or less";
	return true;
}

export function validateAccountName(input: string): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "Account holder name is required";
	if (trimmed.length > 100)
		return "Account holder name must be 100 characters or less";
	return true;
}

export function validateCccd(input: string): string | true {
	const trimmed = input.trim();
	if (!trimmed) return "CCCD/Identity card is required";
	if (trimmed.length < 9 || trimmed.length > 12)
		return "CCCD/Identity card must be between 9 and 12 characters";
	return true;
}
