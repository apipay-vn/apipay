import chalk from "chalk";
import {getApiBaseUrl, getApiKey, getAuth, setAuth} from "./config.js";
import {MAX_RETRIES, RETRY_DELAY_MS} from "./constants.js";

/**
 * API response envelope from the backend
 */
interface ApiEnvelope<T = any> {
	data: T;
	statusCode: number;
	timestamp: string;
}

/**
 * API error structure
 */
export class ApiError extends Error {
	constructor(
		public statusCode: number,
		public body: any,
	) {
		const msg =
			typeof body?.message === "string"
				? body.message
				: typeof body?.data?.message === "string"
					? body.data.message
					: `API request failed with status ${statusCode}`;
		super(msg);
		this.name = "ApiError";
	}
}

type AuthMode = "jwt" | "apikey" | "none";

/**
 * API Client
 * Wraps fetch with auth, retry, and token refresh logic.
 */
export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl ?? getApiBaseUrl();
	}

	private getHeaders(
		authMode: AuthMode,
		hasBody = false,
	): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "application/json",
		};

		if (hasBody) {
			headers["Content-Type"] = "application/json";
		}

		if (authMode === "jwt") {
			const auth = getAuth();
			if (auth?.accessToken) {
				headers["Authorization"] = `Bearer ${auth.accessToken}`;
			}
		} else if (authMode === "apikey") {
			const key = getApiKey();
			if (key?.accessKey && key?.secretKey) {
				const encodedCredentials = Buffer.from(
					`${key.accessKey}:${key.secretKey}`,
				).toString("base64");
				headers["Authorization"] = `Bearer ${encodedCredentials}`;
			}
		}

		return headers;
	}

	/**
	 * Try to refresh the JWT access token using the stored refresh token.
	 */
	private async refreshToken(): Promise<boolean> {
		const auth = getAuth();
		if (!auth?.refreshToken) return false;

		try {
			const res = await fetch(`${this.baseUrl}/auth/refresh`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.accessToken}`,
				},
				body: JSON.stringify({refreshToken: auth.refreshToken}),
			});

			if (!res.ok) return false;

			const json = (await res.json()) as ApiEnvelope;
			const tokens = json.data?.data ?? json.data;

			if (tokens?.accessToken) {
				setAuth({
					...auth,
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken ?? auth.refreshToken,
					expiresAt: Date.now() + (tokens.expiresIn ?? 604800) * 1000,
				});
				return true;
			}
		} catch {
			// refresh failed silently
		}

		return false;
	}

	/**
	 * Core request method with retry and auto-refresh.
	 */
	async request<T = any>(
		method: string,
		path: string,
		options: {
			body?: any;
			authMode?: AuthMode;
			retries?: number;
		} = {},
	): Promise<T> {
		const {body, authMode = "none", retries = MAX_RETRIES} = options;
		const url = `${this.baseUrl}${path}`;

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				const res = await fetch(url, {
					method,
					headers: this.getHeaders(authMode, !!body),
					body: body ? JSON.stringify(body) : undefined,
				});

				// Auto-refresh on 401 for JWT
				if (res.status === 401 && authMode === "jwt" && attempt === 0) {
					const refreshed = await this.refreshToken();
					if (refreshed) continue;
				}

				const json = (await res.json()) as any;

				if (!res.ok) {
					throw new ApiError(res.status, json);
				}

				// Unwrap the backend envelope: { data: { ... }, statusCode, timestamp }
				return (json?.data ?? json) as T;
			} catch (error) {
				lastError = error as Error;

				if (error instanceof ApiError) {
					// Don't retry client errors (4xx) except 429
					if (
						error.statusCode >= 400 &&
						error.statusCode < 500 &&
						error.statusCode !== 429
					) {
						throw error;
					}
				}

				if (attempt < retries) {
					const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
					await new Promise((r) => setTimeout(r, delay));
				}
			}
		}

		throw lastError ?? new Error("Request failed");
	}

	/* ===== Convenience methods ===== */

	get<T = any>(path: string, authMode: AuthMode = "none") {
		return this.request<T>("GET", path, {authMode});
	}

	post<T = any>(path: string, body?: any, authMode: AuthMode = "none") {
		return this.request<T>("POST", path, {body, authMode});
	}

	patch<T = any>(path: string, body?: any, authMode: AuthMode = "none") {
		return this.request<T>("PATCH", path, {body, authMode});
	}

	delete<T = any>(path: string, authMode: AuthMode = "none") {
		return this.request<T>("DELETE", path, {authMode});
	}
}

let _client: ApiClient | null = null;

/**
 * Get singleton API client
 */
export function getApiClient(): ApiClient {
	if (!_client) {
		_client = new ApiClient();
	}
	return _client;
}

/**
 * Format API error for display
 */
export function formatApiError(error: unknown): string {
	if (error instanceof ApiError) {
		switch (error.statusCode) {
			case 401:
				return `${chalk.red("Authentication failed.")} Run ${chalk.cyan("apipay login")} to sign in.`;
			case 403:
				return `${chalk.red("Permission denied.")} You don't have access to this resource.`;
			case 404:
				return chalk.red("Resource not found.");
			case 409:
				return chalk.red(error.message);
			case 429:
				return chalk.yellow("Rate limit exceeded. Please wait and try again.");
			default:
				return chalk.red(error.message);
		}
	}

	if (
		error instanceof TypeError &&
		(error as any).cause?.code === "ECONNREFUSED"
	) {
		return `${chalk.red("Cannot reach the API server.")} Check your connection or run ${chalk.cyan("apipay config:set apiBaseUrl <url>")} to update the endpoint.`;
	}

	return chalk.red(String(error));
}
