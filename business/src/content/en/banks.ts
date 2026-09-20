import type {AccountFlow, AccountType, AttachmentInfo, Bank, FlowStep, LinkMode} from '../../data/banks';

export const banks = {
	title: 'Bank linking',
	subtitle: 'Pick a bank to see the linking flow for each account type.',
	search: {
		placeholder: 'Search bank, BIN, or keyword...',
		empty: 'No matching bank found.',
	},
	glossary: {
		title: 'Glossary',
		subtitle: 'Abbreviations used throughout these guides.',
	},
	list: {
		title: 'Banks',
		searchPlaceholder: 'Quick find a bank...',
		switchLabel: 'Switch bank',
	},
	card: {
		cta: 'View guide',
	},
	detail: {
		back: 'All banks',
		bin: 'BIN',
		filter: 'Account type',
		settlementTitle: 'Settlement',
		settlementSubtitle:
			'ApiPay issues a virtual account (VA) for some banks; the rest settle to the origin account number.',
		settlementMethod: 'Settles via',
		settlementVa: 'Virtual Account (VA)',
		settlementOrigin: 'Origin account',
		flowsTitle: 'Linking flow',
		flowsSubtitle: 'High-level steps. Actual actions happen in the ApiPay dashboard.',
		notesTitle: 'Notes',
		attachmentsTitle: 'Attachments',
		attachmentsSubtitle: 'Reference document titles per bank. Downloads open later.',
		attachmentsDisabled: 'Downloads disabled',
		notSupported: 'This account type is not supported',
		linkCta: 'Add bank',
		linkHint: 'Open my.apipay.vn → Ngân hàng → Thêm ngân hàng',
	},
};

const DASHBOARD_STEP: FlowStep = {
	title: 'Open the ApiPay Dashboard',
	body: 'Sign in at my.apipay.vn, then go to Ngân hàng (Banks) → Thêm ngân hàng (Add bank).',
};

const OTP_STEPS: FlowStep[] = [
	DASHBOARD_STEP,
	{
		title: 'Select bank and account type',
		body: 'Choose the bank, then the account type you want to link (Personal / Household / Business).',
	},
	{
		title: 'Enter account details',
		body: 'Fill in your account number and the related details shown on screen.',
	},
	{
		title: 'Confirm OTP',
		body: 'Enter the OTP your bank sends to your device to confirm the link.',
	},
	{
		title: 'Done',
		body: 'The account becomes Active and is ready to receive funds.',
	},
];

const REDIRECT_STEPS: FlowStep[] = [
	DASHBOARD_STEP,
	{
		title: 'Select bank and account type',
		body: 'Choose the bank and the account type you want to link.',
	},
	{
		title: 'Continue to the bank app',
		body: 'You are redirected to your bank’s mobile app to confirm.',
	},
	{
		title: 'Allow and pick an account',
		body: 'Tap “Allow” and choose the account or VA to receive funds in the bank app.',
	},
	{
		title: 'Done',
		body: 'The account is linked once you confirm in the bank app.',
	},
];

const MANUAL_STEPS: FlowStep[] = [
	DASHBOARD_STEP,
	{
		title: 'Select bank and account type',
		body: 'Choose the bank and the account type you want to link.',
	},
	{
		title: 'Submit an activation request',
		body: 'The dashboard shows “Yêu cầu kích hoạt” (Activation requested). ApiPay picks it up and processes it.',
	},
	{
		title: 'ApiPay activates',
		body: 'ApiPay completes activation once the request is received. Contact support@apipay.vn if it stays pending.',
	},
	{
		title: 'Done',
		body: 'The account becomes Active and is ready to receive funds.',
	},
];

const FLOWS: Record<LinkMode, AccountFlow> = {
	otp: {steps: OTP_STEPS},
	redirect: {steps: REDIRECT_STEPS},
	manual: {steps: MANUAL_STEPS},
};

export function getFlow(mode: LinkMode): AccountFlow {
	return FLOWS[mode];
}

export const BANK_NOTES: Record<string, Partial<Record<AccountType, string[]>>> = {
	msb: {
		personal: [
			'Do not edit the referral code when linking.',
			'Each account can only be linked once; linking fails if it is already linked elsewhere.',
		],
		household: [
			'Do not edit the referral code when linking.',
			'Each account can only be linked once; linking fails if it is already linked elsewhere.',
		],
		business: [
			'Businesses must enable MSB Merchant at a bank branch before linking.',
			'Do not edit the referral code when linking.',
			'After submitting, the dashboard may show a pending activation state while ApiPay processes it.',
		],
	},
	tpbank: {
		personal: ['Virtual accounts (VA) appear as sub-accounts of the origin account.'],
		household: ['Virtual accounts (VA) appear as sub-accounts of the origin account.'],
		business: ['Virtual accounts (VA) appear as sub-accounts of the origin account.'],
	},
	vpbank: {
		business: ['Business accounts can link via NeoBiz or VA depending on the account configuration.'],
	},
	sacombank: {
		household: ['Household linking uses the same self-serve flow as a personal account.'],
	},
};

export const BANK_ATTACHMENTS: Record<string, AttachmentInfo[]> = {
	bidv: [
		{title: 'Công văn 14521', kind: 'pdf'},
		{title: 'BM đăng ký thu hộ qua TK định danh', kind: 'doc'},
		{title: 'BM giấy đăng ký kiêm hợp đồng thu hộ', kind: 'doc'},
	],
	vietinbank: [
		{title: 'BM01a', kind: 'doc'},
		{title: 'BM01b', kind: 'doc'},
		{title: 'BM01 + BM02', kind: 'doc'},
	],
	acb: [
		{title: 'Phiếu đăng ký dịch vụ thu hộ qua TK định danh', kind: 'pdf'},
		{title: 'Điều kiện điều khoản dịch vụ thu hộ', kind: 'doc'},
	],
	vpbank: [{title: 'Hướng dẫn đăng ký kết nối đối tác', kind: 'pdf'}],
};

export const DEFAULT_ATTACHMENTS: AttachmentInfo[] = [{title: 'Attachment — to be updated', kind: 'doc'}];

export function getNotes(bank: Bank, accountType: AccountType): string[] {
	return BANK_NOTES[bank.slug]?.[accountType] ?? [];
}

export function getAttachments(bank: Bank): AttachmentInfo[] {
	return BANK_ATTACHMENTS[bank.slug] ?? DEFAULT_ATTACHMENTS;
}
