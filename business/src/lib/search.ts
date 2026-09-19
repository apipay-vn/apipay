import Fuse from 'fuse.js';
import {ACCOUNT_TYPES, BANKS, MODE_TAGS, generatesVa, type Bank} from '../data/banks';
import {removeVietnameseTones, escapeRegExp} from './utils';

function buildSearchText(bank: Bank): string {
	const accountWords = bank.accountTypes.flatMap(type => {
		const meta = ACCOUNT_TYPES[type];
		return [meta.short, meta.vi, meta.en, meta.glossary, type];
	});
	const modeWords = Object.entries(bank.modes).flatMap(([type, mode]) => {
		if (!mode) return [];
		const tag = MODE_TAGS[mode];
		return [mode, tag.vi, tag.en, tag.slug, type];
	});
	const settlementWords = generatesVa(bank.bin)
		? ['va', 'virtual account', 'tài khoản ảo']
		: ['origin', 'tài khoản gốc'];
	const parts = [
		bank.name,
		bank.fullName,
		bank.code,
		bank.bin,
		...bank.searchNames,
		...accountWords,
		...modeWords,
		...settlementWords,
	];
	return removeVietnameseTones(parts.join(' ')).toLowerCase();
}

const SEARCH_TEXT = new Map<string, string>(BANKS.map(bank => [bank.slug, buildSearchText(bank)]));

let fuseInstance: Fuse<Bank> | null = null;

function getFuse(): Fuse<Bank> {
	if (!fuseInstance) {
		fuseInstance = new Fuse(BANKS, {
			keys: [
				{name: 'name', weight: 0.5},
				{name: 'fullName', weight: 0.3},
				{name: 'code', weight: 0.2},
				{name: 'bin', weight: 0.2},
				{name: 'searchNames', weight: 0.2},
			],
			threshold: 0.3,
			ignoreLocation: true,
			includeScore: true,
			minMatchCharLength: 2,
			getFn: (bank, path) => {
				const key = path[0];
				const value =
					key === 'searchNames'
						? (bank as Bank).searchNames.join(' ')
						: (bank as unknown as Record<string, unknown>)[key];
				return typeof value === 'string' ? removeVietnameseTones(value).toLowerCase() : '';
			},
		});
	}
	return fuseInstance;
}

export function searchBanks(query: string): Bank[] {
	const normalized = removeVietnameseTones(query).toLowerCase().trim();
	if (!normalized) return BANKS;

	const tokens = normalized.split(/\s+/).filter(Boolean);
	const matchers = tokens.map(token => new RegExp(`\\b${escapeRegExp(token)}`));

	const exact = BANKS.filter(bank => {
		const text = SEARCH_TEXT.get(bank.slug) ?? '';
		return matchers.every(matcher => matcher.test(text));
	});
	if (exact.length > 0) return exact;

	return getFuse()
		.search(normalized)
		.map(result => result.item);
}
