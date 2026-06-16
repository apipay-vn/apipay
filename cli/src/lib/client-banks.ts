import {ApiClient} from "./api-client.js";
import {getApiBaseUrl} from "./config.js";

export function getClientBanksApi(): ApiClient {
	return new ApiClient(getApiBaseUrl().replace(/\/v1\/?$/, "/v2"));
}

export function unwrapApiMessage<T = any>(data: any): T {
	return (data?.message ?? data?.data ?? data) as T;
}

export async function fetchClientBanks(): Promise<any[]> {
	const data = await getClientBanksApi().get("/client/banks", "apikey");
	const banks = Array.isArray(data) ? data : unwrapApiMessage(data);
	return Array.isArray(banks) ? banks : [];
}
