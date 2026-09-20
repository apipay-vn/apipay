import type {AccountFlow, AccountType, AttachmentInfo, Bank, FlowStep, LinkMode} from '../../data/banks';

export const banks = {
	title: 'Liên kết ngân hàng',
	subtitle: 'Chọn ngân hàng để xem quy trình liên kết theo từng loại tài khoản.',
	search: {
		placeholder: 'Tìm ngân hàng, mã BIN hoặc từ khoá...',
		empty: 'Không tìm thấy ngân hàng phù hợp.',
	},
	glossary: {
		title: 'Thuật ngữ',
		subtitle: 'Các từ viết tắt dùng xuyên suốt hướng dẫn.',
	},
	list: {
		title: 'Danh sách ngân hàng',
		searchPlaceholder: 'Tìm nhanh ngân hàng...',
		switchLabel: 'Chọn ngân hàng khác',
	},
	card: {
		cta: 'Xem hướng dẫn',
	},
	detail: {
		back: 'Tất cả ngân hàng',
		bin: 'Mã BIN',
		filter: 'Loại tài khoản',
		settlementTitle: 'Phương thức nhận tiền',
		settlementSubtitle:
			'ApiPay cấp tài khoản ảo (VA) cho một số ngân hàng; các ngân hàng còn lại nhận tiền qua số tài khoản gốc.',
		settlementMethod: 'Nhận tiền qua',
		settlementVa: 'Tài khoản ảo (VA)',
		settlementOrigin: 'Tài khoản gốc',
		flowsTitle: 'Quy trình liên kết',
		flowsSubtitle: 'Các bước ở mức tổng quan. Thao tác thực tế thực hiện trên dashboard ApiPay.',
		notesTitle: 'Lưu ý',
		attachmentsTitle: 'Tài liệu đính kèm',
		attachmentsSubtitle: 'Tiêu đề tài liệu tham khảo theo ngân hàng. Bản tải xuống sẽ mở sau.',
		attachmentsDisabled: 'Tải xuống tạm đóng',
		notSupported: 'Không hỗ trợ loại tài khoản này',
		linkCta: 'Thêm ngân hàng',
		linkHint: 'Mở my.apipay.vn → Ngân hàng → Thêm ngân hàng',
	},
};

const DASHBOARD_STEP: FlowStep = {
	title: 'Mở Dashboard ApiPay',
	body: 'Đăng nhập my.apipay.vn, vào mục Ngân hàng → Thêm ngân hàng.',
};

const OTP_STEPS: FlowStep[] = [
	DASHBOARD_STEP,
	{
		title: 'Chọn ngân hàng và loại tài khoản',
		body: 'Chọn ngân hàng, sau đó chọn loại tài khoản bạn muốn liên kết (CN / HKD / DN).',
	},
	{
		title: 'Nhập thông tin tài khoản',
		body: 'Điền số tài khoản (STK) và các thông tin liên quan theo hướng dẫn trên màn hình.',
	},
	{
		title: 'Xác nhận OTP',
		body: 'Nhập mã OTP do ngân hàng gửi đến thiết bị của bạn để xác nhận liên kết.',
	},
	{
		title: 'Hoàn tất',
		body: 'Tài khoản chuyển sang trạng thái Active và sẵn sàng nhận tiền.',
	},
];

const REDIRECT_STEPS: FlowStep[] = [
	DASHBOARD_STEP,
	{
		title: 'Chọn ngân hàng và loại tài khoản',
		body: 'Chọn ngân hàng và loại tài khoản bạn muốn liên kết.',
	},
	{
		title: 'Chuyển sang app ngân hàng',
		body: 'Hệ thống chuyển hướng bạn đến ứng dụng ngân hàng để xác nhận.',
	},
	{
		title: 'Cho phép và chọn tài khoản',
		body: 'Xác nhận “Cho phép” và chọn tài khoản hoặc VA nhận tiền trong app ngân hàng.',
	},
	{
		title: 'Hoàn tất',
		body: 'Tài khoản được liên kết sau khi bạn xác nhận trong app ngân hàng.',
	},
];

const MANUAL_STEPS: FlowStep[] = [
	DASHBOARD_STEP,
	{
		title: 'Chọn ngân hàng và loại tài khoản',
		body: 'Chọn ngân hàng và loại tài khoản bạn muốn liên kết.',
	},
	{
		title: 'Gửi yêu cầu kích hoạt',
		body: 'Dashboard hiển thị trạng thái “Yêu cầu kích hoạt”. ApiPay tiếp nhận và xử lý yêu cầu.',
	},
	{
		title: 'ApiPay kích hoạt',
		body: 'ApiPay hoàn tất kích hoạt sau khi nhận yêu cầu. Liên hệ support@apipay.vn nếu còn chờ lâu.',
	},
	{
		title: 'Hoàn tất',
		body: 'Tài khoản chuyển sang trạng thái Active và sẵn sàng nhận tiền.',
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
			'Không chỉnh sửa mã giới thiệu khi liên kết.',
			'Mỗi tài khoản chỉ liên kết một lần; nếu đã liên kết ở nơi khác, quá trình sẽ thất bại.',
		],
		household: [
			'Không chỉnh sửa mã giới thiệu khi liên kết.',
			'Mỗi tài khoản chỉ liên kết một lần; nếu đã liên kết ở nơi khác, quá trình sẽ thất bại.',
		],
		business: [
			'Doanh nghiệp cần bật dịch vụ MSB Merchant tại chi nhánh ngân hàng trước khi liên kết.',
			'Không chỉnh sửa mã giới thiệu khi liên kết.',
			'Sau khi gửi yêu cầu, dashboard có thể hiển thị trạng thái chờ kích hoạt trong lúc ApiPay xử lý.',
		],
	},
	tpbank: {
		personal: ['Tài khoản ảo (VA) hiển thị dưới dạng tài khoản phụ của tài khoản gốc.'],
		household: ['Tài khoản ảo (VA) hiển thị dưới dạng tài khoản phụ của tài khoản gốc.'],
		business: ['Tài khoản ảo (VA) hiển thị dưới dạng tài khoản phụ của tài khoản gốc.'],
	},
	vpbank: {
		business: ['Doanh nghiệp có thể liên kết qua NeoBiz hoặc VA tuỳ theo cấu hình tài khoản.'],
	},
	sacombank: {
		household: ['Liên kết HKD dùng chung luồng tự thao tác với tài khoản cá nhân.'],
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

export const DEFAULT_ATTACHMENTS: AttachmentInfo[] = [{title: 'Tài liệu đính kèm — sẽ cập nhật', kind: 'doc'}];

export function getNotes(bank: Bank, accountType: AccountType): string[] {
	return BANK_NOTES[bank.slug]?.[accountType] ?? [];
}

export function getAttachments(bank: Bank): AttachmentInfo[] {
	return BANK_ATTACHMENTS[bank.slug] ?? DEFAULT_ATTACHMENTS;
}
