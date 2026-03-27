export interface SidebarItem {
	label: string;
	href?: string;
	children?: SidebarItem[];
}

export const viSidebarConfig: SidebarItem[] = [
	{label: "Giới thiệu", href: "/vi"},
	{label: "Quick Start", href: "/vi/quickstart"},
	{label: "Hướng dẫn bắt đầu", href: "/vi/onboarding"},
	{label: "Đăng ký & Thanh toán", href: "/vi/subscription"},
	{label: "Quản lý Ngân hàng", href: "/vi/banking"},
	{label: "Hướng dẫn Dashboard", href: "/vi/dashboard", children: [{label: "Kết nối Ngân hàng", href: "/vi/connect-banks"}, {label: "Tên miền riêng", href: "/vi/custom-domains"}]},
	{
		label: "API Reference",
		children: [
			{label: "Xác thực", href: "/vi/api/authentication"},
			{label: "Payment Requests", href: "/vi/api/payment-requests"},
			{label: "Webhooks", href: "/vi/api/webhooks"},
			{label: "Ngân hàng", href: "/vi/api/banks"},
			{label: "Metrics", href: "/vi/api/metrics"},
		],
	},
];

export const enSidebarConfig: SidebarItem[] = [
	{label: "Introduction", href: "/en"},
	{label: "Quick Start", href: "/en/quickstart"},
	{label: "Onboarding", href: "/en/onboarding"},
	{label: "Subscription & Billing", href: "/en/subscription"},
	{label: "Bank Accounts", href: "/en/banking"},
	{label: "Dashboard Guide", href: "/en/dashboard", children: [{label: "Connect Banks", href: "/en/connect-banks"}, {label: "Custom Domains", href: "/en/custom-domains"}]},
	{
		label: "API Reference",
		children: [
			{label: "Authentication", href: "/en/api/authentication"},
			{label: "Payment Requests", href: "/en/api/payment-requests"},
			{label: "Webhooks", href: "/en/api/webhooks"},
			{label: "Banks", href: "/en/api/banks"},
			{label: "Metrics", href: "/en/api/metrics"},
		],
	},
];

// Legacy export for backward compatibility
export const sidebarConfig = viSidebarConfig;
