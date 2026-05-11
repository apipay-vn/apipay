import Conf from "conf";
import path from "node:path";
import os from "node:os";
import {API_BASE_URL, DASHBOARD_URL, type SetupStep} from "./constants.js";

/**
 * Auth state stored in config
 */
export interface AuthConfig {
	accessToken: string;
	refreshToken: string;
	expiresAt: number; // Unix timestamp ms
	email: string;
	userId: string;
}

/**
 * API key state stored in config
 */
export interface ApiKeyConfig {
	id: string;
	accessKey: string;
	secretKey: string;
	name: string;
}

/**
 * Full config schema
 */
export interface CliConfig {
	apiBaseUrl: string;
	dashboardUrl: string;
	auth?: AuthConfig;
	apiKey?: ApiKeyConfig;
	setup: {
		completedSteps: SetupStep[];
	};
}

const schema = {
	apiBaseUrl: {
		type: "string" as const,
		default: API_BASE_URL,
	},
	dashboardUrl: {
		type: "string" as const,
		default: DASHBOARD_URL,
	},
	auth: {
		type: "object" as const,
		properties: {
			accessToken: {type: "string" as const},
			refreshToken: {type: "string" as const},
			expiresAt: {type: "number" as const},
			email: {type: "string" as const},
			userId: {type: "string" as const},
		},
	},
	apiKey: {
		type: "object" as const,
		properties: {
			id: {type: "string" as const},
			accessKey: {type: "string" as const},
			secretKey: {type: "string" as const},
			name: {type: "string" as const},
		},
	},
	setup: {
		type: "object" as const,
		default: {completedSteps: []},
		properties: {
			completedSteps: {
				type: "array" as const,
				items: {type: "string" as const},
				default: [],
			},
		},
	},
};

let _store: Conf<CliConfig> | null = null;

/**
 * Get the singleton config store.
 * Persists to ~/.config/apipay/config.json
 */
export function getStore(): Conf<CliConfig> {
	if (!_store) {
		_store = new Conf<CliConfig>({
			projectName: "apipay",
			cwd: path.join(os.homedir(), ".config", "apipay"),
			schema,
		} as any);
	}
	return _store;
}

/* ===== Auth helpers ===== */

export function getAuth(): AuthConfig | undefined {
	return getStore().get("auth") as AuthConfig | undefined;
}

export function setAuth(auth: AuthConfig): void {
	getStore().set("auth", auth);
	markStepComplete("login");
}

export function clearAuth(): void {
	getStore().delete("auth" as any);
	getStore().set("setup.completedSteps", []);
}

export function isLoggedIn(): boolean {
	const auth = getAuth();
	return !!auth?.accessToken;
}

/* ===== API Key helpers ===== */

export function getApiKey(): ApiKeyConfig | undefined {
	return getStore().get("apiKey") as ApiKeyConfig | undefined;
}

export function setApiKey(key: ApiKeyConfig): void {
	getStore().set("apiKey", key);
	markStepComplete("api-key");
}

export function clearApiKey(): void {
	getStore().delete("apiKey" as any);
	const steps = getCompletedSteps().filter((s) => s !== "api-key");
	getStore().set("setup.completedSteps", steps);
}

/* ===== Setup tracking ===== */

export function getCompletedSteps(): SetupStep[] {
	const setup = getStore().get("setup") as
		| {completedSteps: SetupStep[]}
		| undefined;
	return setup?.completedSteps ?? [];
}

export function markStepComplete(step: SetupStep): void {
	const steps = getCompletedSteps();
	if (!steps.includes(step)) {
		steps.push(step);
		getStore().set("setup.completedSteps", steps);
	}
}

export function getNextIncompleteStep(): SetupStep | null {
	const completed = getCompletedSteps();
	const allSteps: SetupStep[] = ["login", "api-key", "bank", "webhook"];
	return allSteps.find((s) => !completed.includes(s)) ?? null;
}

export function getApiBaseUrl(): string {
	return (
		process.env.APIPAY_API_URL ||
		(getStore().get("apiBaseUrl") as string) ||
		API_BASE_URL
	);
}

export function getDashboardUrl(): string {
	return (
		process.env.APIPAY_DASHBOARD_URL ||
		(getStore().get("dashboardUrl") as string) ||
		DASHBOARD_URL
	);
}

export function resetAll(): void {
	getStore().clear();
}
