export type AccountType = 'personal' | 'household' | 'business';
export type LinkMode = 'otp' | 'redirect' | 'manual';
export type Locale = 'vi' | 'en';

export const ACCOUNT_TYPES: Record<AccountType, {short: string; vi: string; en: string; glossary: string}> = {
	personal: {short: 'CN', vi: 'Cá Nhân', en: 'Personal', glossary: 'TKCN'},
	household: {short: 'HKD', vi: 'Hộ Kinh Doanh', en: 'Household', glossary: 'HKD'},
	business: {short: 'DN', vi: 'Doanh Nghiệp', en: 'Business', glossary: 'TKDN'},
};

export const ACCOUNT_TYPE_KEYS: AccountType[] = ['personal', 'household', 'business'];

export const MODE_TAGS: Record<LinkMode, {vi: string; en: string; slug: string}> = {
	otp: {vi: 'Tự thao tác', en: 'Self-serve', slug: 'self-serve'},
	manual: {vi: 'Kích hoạt thủ công', en: 'Manual activation', slug: 'manual'},
	redirect: {vi: 'Qua app ngân hàng', en: 'Bank app', slug: 'bank-app'},
};

export interface FlowStep {
	title: string;
	body?: string;
}

export interface AttachmentInfo {
	title: string;
	kind: 'pdf' | 'doc';
}

export interface AccountFlow {
	steps: FlowStep[];
	notes?: string[];
	attachments?: AttachmentInfo[];
}

export interface Bank {
	slug: string;
	code: string;
	bin: string;
	name: string;
	fullName: string;
	searchNames: string[];
	accountTypes: AccountType[];
	modes: Partial<Record<AccountType, LinkMode>>;
}

/**
 * Banks where ApiPay issues a virtual account (VA) on link.
 * Mirrors the bank policy used by the ApiPay dashboard: only these BINs get a
 * provider-generated VA. Every other bank settles to the origin account number.
 */
export const VA_BANK_BINS = [
	'970422', // MB Bank
	'970418', // BIDV
	'970448', // OCB
	'970441', // VIB
	'970432', // VPBank
	'970403', // Sacombank
	'970424', // Shinhan
	'970446', // Co-opBank
];

export function generatesVa(bankBin: string): boolean {
	return VA_BANK_BINS.includes(bankBin);
}

export const BANKS: Bank[] = [
	{
		slug: 'acb',
		code: 'ACB',
		bin: '970416',
		name: 'ACB',
		fullName: 'Ngân hàng TMCP Á Châu',
		searchNames: ['acb', 'á châu'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'otp', business: 'otp'},
	},
	{
		slug: 'bidv',
		code: 'BIDV',
		bin: '970418',
		name: 'BIDV',
		fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
		searchNames: ['bidv', 'đầu tư phát triển'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'otp', business: 'manual'},
	},
	{
		slug: 'coopbank',
		code: 'COOPBANK',
		bin: '970446',
		name: 'Co-opBank',
		fullName: 'Ngân hàng Hợp tác xã Việt Nam',
		searchNames: ['coopbank', 'hợp tác xã', 'co-opbank'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'otp', business: 'otp'},
	},
	{
		slug: 'ocb',
		code: 'OCB',
		bin: '970448',
		name: 'OCB',
		fullName: 'Ngân hàng TMCP Phương Đông',
		searchNames: ['ocb', 'phương đông'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'manual', business: 'manual'},
	},
	{
		slug: 'pgbank',
		code: 'PGB',
		bin: '970430',
		name: 'PGBank',
		fullName: 'Ngân hàng TMCP Thương mại Cổ phần Petrolimex',
		searchNames: ['pgbank', 'petrolimex'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'otp', business: 'otp'},
	},
	{
		slug: 'sacombank',
		code: 'STB',
		bin: '970403',
		name: 'Sacombank',
		fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín',
		searchNames: ['sacombank', 'sài gòn thương tín'],
		accountTypes: ['personal', 'household'],
		modes: {personal: 'otp', household: 'otp'},
	},
	{
		slug: 'shinhan',
		code: 'SHBVN',
		bin: '970424',
		name: 'Shinhan',
		fullName: 'Ngân hàng TMCP Shinhan Việt Nam',
		searchNames: ['shinhan', 'shbvn'],
		accountTypes: ['personal', 'business'],
		modes: {personal: 'otp', business: 'manual'},
	},
	{
		slug: 'vietcombank',
		code: 'VCB',
		bin: '970436',
		name: 'Vietcombank',
		fullName: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
		searchNames: ['vietcombank', 'vcb', 'ngoại thương'],
		accountTypes: ['household', 'business'],
		modes: {household: 'manual', business: 'manual'},
	},
	{
		slug: 'vietinbank',
		code: 'ICB',
		bin: '970415',
		name: 'VietinBank',
		fullName: 'Ngân hàng TMCP Công thương Việt Nam',
		searchNames: ['vietinbank', 'vtb', 'icb', 'công thương việt nam'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'otp', business: 'manual'},
	},
	{
		slug: 'vpbank',
		code: 'VPB',
		bin: '970432',
		name: 'VPBank',
		fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
		searchNames: ['vpbank', 'thịnh vượng'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'otp', business: 'manual'},
	},
	{
		slug: 'mb',
		code: 'MB',
		bin: '970422',
		name: 'MB Bank',
		fullName: 'Ngân hàng TMCP Quân đội',
		searchNames: ['mb', 'mb bank', 'mbbank', 'quân đội'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'otp', business: 'manual'},
	},
	{
		slug: 'msb',
		code: 'MSB',
		bin: '970426',
		name: 'MSB',
		fullName: 'Ngân hàng TMCP Hàng Hải Việt Nam',
		searchNames: ['msb', 'hàng hải', 'msb merchant', 'merchant app'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'redirect', household: 'redirect', business: 'redirect'},
	},
	{
		slug: 'tpbank',
		code: 'TPB',
		bin: '970423',
		name: 'TPBank',
		fullName: 'Ngân hàng TMCP Tiên Phong',
		searchNames: ['tpbank', 'tiên phong', 'tpbank connect', 'connect'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'redirect', household: 'redirect', business: 'redirect'},
	},
	{
		slug: 'vib',
		code: 'VIB',
		bin: '970441',
		name: 'VIB',
		fullName: 'Ngân hàng TMCP Quốc tế Việt Nam',
		searchNames: ['vib', 'quốc tế việt nam'],
		accountTypes: ['personal', 'household', 'business'],
		modes: {personal: 'otp', household: 'manual', business: 'manual'},
	},
];

export const LOGO_BASE_URL = 'https://api.vietqr.io/img';

export function getLogoUrl(bank: Bank): string {
	return `${LOGO_BASE_URL}/${bank.code}.png`;
}

export function findBankBySlug(slug: string | undefined): Bank | undefined {
	if (!slug) return undefined;
	return BANKS.find(b => b.slug === slug);
}

function removeVietnameseTones(str: string): string {
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[đĐ]/g, d => (d === 'đ' ? 'd' : 'D'));
}

export function findBankBySearchTerm(term: string | undefined): Bank | undefined {
	if (!term) return undefined;
	const compact = removeVietnameseTones(term).toLowerCase();
	return BANKS.find(b => b.slug === compact || b.code.toLowerCase() === compact || b.bin === term);
}
