import {ApiClient} from "./api-client.js";
import {getApiBaseUrl} from "./config.js";

export function getClientBanksApi(): ApiClient {
	return new ApiClient(getApiBaseUrl().replace(/\/v1\/?$/, "/v2"));
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
