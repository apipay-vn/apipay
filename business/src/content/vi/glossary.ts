import type {GlossaryTerm} from '../types';

export const glossary: GlossaryTerm[] = [
	{
		term: 'VA',
		label: 'Virtual Account',
		description: 'Tài khoản ảo VietQR — dùng để nhận tiền mà không cần công bố số tài khoản thật.',
	},
	{
		term: 'TKCN',
		label: 'Tài khoản Cá Nhân',
		description: 'Tài khoản ngân hàng do cá nhân đứng tên.',
	},
	{
		term: 'TKDN',
		label: 'Tài khoản Doanh Nghiệp',
		description: 'Tài khoản ngân hàng do doanh nghiệp đứng tên.',
	},
	{
		term: 'HKD',
		label: 'Hộ Kinh Doanh',
		description: 'Tài khoản cho hộ kinh doanh hoặc cá nhân kinh doanh.',
	},
	{
		term: 'STK',
		label: 'Số tài khoản',
		description: 'Số tài khoản ngân hàng dùng để liên kết nhận tiền trên ApiPay.',
	},
];
