interface SearchItem {
	title: string;
	description: string;
	href: string;
	section?: string;
}

// Build search index from all pages - both Vietnamese and English
export const searchItems: SearchItem[] = [
	// Vietnamese
	{
		title: "Giới thiệu",
		description: "Tổng quan về nền tảng thanh toán ApiPay",
		href: "/vi",
		section: "Tổng quan",
	},
	{
		title: "Quick Start",
		description: "Bắt đầu nhanh với ApiPay trong 5 phút",
		href: "/vi/quickstart",
		section: "Hướng dẫn",
	},
	{
		title: "Hướng dẫn bắt đầu",
		description: "Hướng dẫn toàn diện để bắt đầu với ApiPay",
		href: "/vi/onboarding",
		section: "Hướng dẫn",
	},
	{
		title: "Đăng ký & Thanh toán",
		description: "Quản lý đăng ký và thanh toán ApiPay",
		href: "/vi/subscription",
		section: "Hướng dẫn",
	},
	{
		title: "Quản lý Ngân hàng",
		description: "Kết nối và quản lý tài khoản ngân hàng",
		href: "/vi/banking",
		section: "Hướng dẫn",
	},
	{
		title: "Tên miền riêng",
		description: "Sử dụng tên miền riêng của bạn cho trang thanh toán ApiPay",
		href: "/vi/custom-domains",
		section: "Hướng dẫn",
	},
	{
		title: "Payment Requests API",
		description: "API tạo và quản lý liên kết thanh toán",
		href: "/vi/api/payment-requests",
		section: "API Reference",
	},
	{
		title: "Webhooks",
		description: "Nhận thông báo thanh toán theo thời gian thực",
		href: "/vi/api/webhooks",
		section: "API Reference",
	},
	{
		title: "Ngân hàng hỗ trợ",
		description: "Danh sách các ngân hàng được hỗ trợ",
		href: "/vi/api/banks",
		section: "API Reference",
	},

	// English
	{
		title: "Introduction",
		description: "Overview of the ApiPay payment platform",
		href: "/en",
		section: "Overview",
	},
	{
		title: "Quick Start",
		description: "Get started with ApiPay in 5 minutes",
		href: "/en/quickstart",
		section: "Guides",
	},
	{
		title: "Onboarding Guide",
		description: "Complete guide to getting started with ApiPay",
		href: "/en/onboarding",
		section: "Guides",
	},
	{
		title: "Subscription & Billing",
		description: "Manage your ApiPay subscription and billing",
		href: "/en/subscription",
		section: "Guides",
	},
	{
		title: "Bank Accounts",
		description: "Connect and manage your bank accounts",
		href: "/en/banking",
		section: "Guides",
	},
	{
		title: "Custom Domains",
		description: "Use your own domain for the ApiPay payment page",
		href: "/en/custom-domains",
		section: "Guides",
	},
	{
		title: "Payment Requests API",
		description: "API for creating and managing payment links",
		href: "/en/api/payment-requests",
		section: "API Reference",
	},
	{
		title: "Webhooks",
		description: "Receive real-time payment notifications",
		href: "/en/api/webhooks",
		section: "API Reference",
	},
	{
		title: "Supported Banks",
		description: "List of supported banks",
		href: "/en/api/banks",
		section: "API Reference",
	},
];
