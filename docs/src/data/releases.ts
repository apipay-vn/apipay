export interface ReleaseNote {
	version: string;
	date: string;
	features: string[];
	fixes: string[];
	improvements: string[];
}

export const enReleases: ReleaseNote[] = [
	{
		version: "1.1",
		date: "2026-04-14",
		features: [
			"New Discount & Coupon system for subscription plans",
			"Direct coupon application during plan checkout and upgrade",
		],
		fixes: [
			"Optimized transaction notifications and payment confirmations for ACB bank",
			"Improved bank connection reliability and auto-reconnection logic",
			"Fixed UI layout issues on specific mobile browser environments",
			"Resolved webhook delivery retry timing synchronization",
		],
		improvements: [
			"Enhanced transaction matching with advanced metadata filtering",
			"Refined plan selection interface for a more streamlined experience",
			"Optimized dashboard rendering for high-volume transaction data",
		],
	},
	{
		version: "1.0",
		date: "2026-03-20",
		features: [
			"Initial release of ApiPay payment gateway",
			"Dashboard with banks/transactions/webhooks management",
			"Notification integration via Email, Telegram, Lark, Slack, Discord",
			"Invoice generation system",
			"API Documentation",
			"Custom domain for payment page",
			"WHMCS integration module",
			"HostBill integration module",
		],
		fixes: [],
		improvements: [],
	},
];

export const viReleases: ReleaseNote[] = [
	{
		version: "1.1",
		date: "2026-04-14",
		features: [
			"Hệ thống Mã giảm giá (Coupon) mới cho các gói dịch vụ",
			"Áp dụng mã giảm giá trực tiếp khi thanh toán/gia hạn gói",
		],
		fixes: [
			"Nâng cao độ ổn định kết nối ngân hàng và tự động kết nối lại",
			"Sửa lỗi hiển thị giao diện trên một số trình duyệt di động",
			"Khắc phục vấn đề đồng bộ thời gian gửi lại webhook",
		],
		improvements: [
			"Tối ưu thông báo giao dịch và xác nhận thanh toán cho ngân hàng ACB",
			"Cải tiến khớp giao dịch với khả năng lọc metadata nâng cao",
			"Tinh chỉnh giao diện chọn gói dịch vụ giúp người dùng dễ thao tác",
			"Tối ưu tốc độ tải trang tổng quan cho dữ liệu giao dịch lớn",
		],
	},
	{
		version: "1.0",
		date: "2026-03-20",
		features: [
			"Ra mắt cổng thanh toán ApiPay",
			"Bảng điều khiển quản lý giao dịch, ngân hàng, webhook",
			"Tích hợp thông báo qua Email, Telegram, Lark, Slack, Discord",
			"Tên miền riêng cho trang thanh toán",
			"Hệ thống tạo hóa đơn",
			"Tài liệu API",
			"Module tích hợp WHMCS",
			"Module tích hợp HostBill",
		],
		fixes: [],
		improvements: [],
	},
];
