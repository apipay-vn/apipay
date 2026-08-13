import {enReleases, getReleaseSidebarChildren, viReleases} from '@/data/releases';

export interface SidebarItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: SidebarItem[];
}

export const viSidebarConfig: SidebarItem[] = [
  {label: 'Giới thiệu', href: '/vi'},
  {label: 'Quick Start', href: '/vi/quickstart'},
  {label: 'Hướng dẫn bắt đầu', href: '/vi/onboarding'},
  {label: 'Đăng ký & Thanh toán', href: '/vi/subscription'},
  {label: 'Quản lý ngân hàng', href: '/vi/banking'},
  {label: 'Sandbox', href: '/vi/sandbox'},
  {
    label: 'Hướng dẫn Dashboard',
    href: '/vi/dashboard',
    children: [
      {label: 'Kết nối ngân hàng', href: '/vi/connect-banks'},
      {label: 'Tên miền riêng', href: '/vi/custom-domains'},
      {label: 'Passkey', href: '/vi/passkeys'},
      {label: 'Tiếp thị liên kết', href: '/vi/affiliates'},
      {label: 'Lịch sử gửi webhook', href: '/vi/api/webhooks#delivery-log'},
    ],
  },
  {
    label: 'Tích hợp',
    children: [
      {label: 'Web App', href: '/vi/integrations/webapp'},
      {label: 'WooCommerce', href: '/vi/integrations/woocommerce'},
      {label: 'Vibe Code', href: '/vi/integrations/vibe-code'},
      {label: 'WHMCS', href: '/vi/integrations/whmcs'},
      {label: 'HostBill', href: '/vi/integrations/hostbill'},
    ],
  },
  {
    label: 'API Reference',
    children: [
      {label: 'Xác thực', href: '/vi/api/authentication'},
      {label: 'Payment Requests', href: '/vi/api/payment-requests'},
      {label: 'Webhooks', href: '/vi/api/webhooks'},
      {label: 'Ngân hàng', href: '/vi/api/banks'},
      {label: 'Metrics', href: '/vi/api/metrics'},
    ],
  },
  {
    label: 'Cộng đồng hỗ trợ',
    children: [
      {
        label: 'Cộng đồng Zalo',
        href: 'https://zalo.me/g/qlubbbpczn7dfd1punuw',
        external: true,
      },
      {
        label: 'Cộng đồng Telegram',
        href: 'https://t.me/apipay_vn',
        external: true,
      },
    ],
  },
];

export const enSidebarConfig: SidebarItem[] = [
  {label: 'Introduction', href: '/en'},
  {label: 'Quick Start', href: '/en/quickstart'},
  {label: 'Onboarding', href: '/en/onboarding'},
  {label: 'Subscription & Billing', href: '/en/subscription'},
  {label: 'Bank Accounts', href: '/en/banking'},
  {label: 'Sandbox', href: '/en/sandbox'},
  {
    label: 'Dashboard Guide',
    href: '/en/dashboard',
    children: [
      {label: 'Connect Banks', href: '/en/connect-banks'},
      {label: 'Custom Domains', href: '/en/custom-domains'},
      {label: 'Passkeys', href: '/en/passkeys'},
      {label: 'Affiliates', href: '/en/affiliates'},
      {label: 'Webhook Delivery', href: '/en/api/webhooks#delivery-log'},
    ],
  },
  {
    label: 'Integrations',
    children: [
      {label: 'WooCommerce', href: '/en/integrations/woocommerce'},
      {label: 'WHMCS', href: '/en/integrations/whmcs'},
      {label: 'HostBill', href: '/en/integrations/hostbill'},
      {label: 'Vibe Code', href: '/en/integrations/vibe-code'},
      {label: 'Web App', href: '/en/integrations/webapp'},
    ],
  },
  {
    label: 'API Reference',
    children: [
      {label: 'Authentication', href: '/en/api/authentication'},
      {label: 'Payment Requests', href: '/en/api/payment-requests'},
      {label: 'Webhooks', href: '/en/api/webhooks'},
      {label: 'Banks', href: '/en/api/banks'},
      {label: 'Metrics', href: '/en/api/metrics'},
    ],
  },
  {
    label: 'Community Support',
    children: [
      {
        label: 'Zalo Community',
        href: 'https://zalo.me/g/qlubbbpczn7dfd1punuw',
        external: true,
      },
      {
        label: 'Telegram Community',
        href: 'https://t.me/apipay_vn',
        external: true,
      },
    ],
  },
];

// Legacy export for backward compatibility
export const sidebarConfig = viSidebarConfig;

// Release Notes - appended at bottom
viSidebarConfig.push({
  label: 'Lịch phát hành',
  children: getReleaseSidebarChildren(viReleases, 'vi'),
});
enSidebarConfig.push({
  label: 'Release Notes',
  children: getReleaseSidebarChildren(enReleases, 'en'),
});
