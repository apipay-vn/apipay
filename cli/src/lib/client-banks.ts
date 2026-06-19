import {ApiClient} from "./api-client.js";
import {getApiBaseUrl} from "./config.js";

function getClientBanksBaseUrl(): string {
	const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
	if (/\/v[12]$/.test(baseUrl)) {
		return baseUrl.replace(/\/v[12]$/, "/v2");
	}
	return `${baseUrl}/v2`;
}

export function getClientBanksApi(): ApiClient {
	return new ApiClient(getClientBanksBaseUrl());
}

export function unwrapApiMessage<T = any>(data: any): T {
	return (data?.message ?? data?.data ?? data) as T;
}

type BanksResponse = {
	status?: boolean;
	message?: any[];
	data?: any[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

const BANKS_PAGE_SIZE = 50;

export async function fetchClientBanks(): Promise<any[]> {
	const api = getClientBanksApi();
	const banks: any[] = [];
	let page = 1;
	let totalPages = 1;

	do {
		const data = await api.get<BanksResponse>(
			`/client/banks?page=${page}&limit=${BANKS_PAGE_SIZE}`,
			"apikey",
		);
		const pageBanks = Array.isArray(data) ? data : unwrapApiMessage<any[]>(data);
		if (Array.isArray(pageBanks)) {
			banks.push(...pageBanks);
		}

		totalPages =
			data?.pagination?.totalPages ??
			(Array.isArray(pageBanks) && pageBanks.length >= BANKS_PAGE_SIZE
				? page + 1
				: page);
		page += 1;
	} while (page <= totalPages);

	return banks;
}
