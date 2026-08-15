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
    title: 'Giới thiệu',
    description: 'Tổng quan về nền tảng thanh toán ApiPay',
    href: '/vi',
    section: 'Tổng quan',
  },
  {
    title: 'Quick Start',
    description: 'Bắt đầu nhanh với ApiPay trong 5 phút',
    href: '/vi/quickstart',
    section: 'Hướng dẫn',
  },
  {
    title: 'Hướng dẫn bắt đầu',
    description: 'Hướng dẫn toàn diện để bắt đầu với ApiPay',
    href: '/vi/onboarding',
    section: 'Hướng dẫn',
  },
  {
    title: 'Đăng ký & Thanh toán',
    description: 'Quản lý đăng ký và thanh toán ApiPay',
    href: '/vi/subscription',
    section: 'Hướng dẫn',
  },
  {
    title: 'Quản lý Ngân hàng',
    description: 'Kết nối và quản lý tài khoản ngân hàng',
    href: '/vi/banking',
    section: 'Hướng dẫn',
  },
  {
    title: 'Tên miền riêng',
    description: 'Sử dụng tên miền riêng của bạn cho trang thanh toán ApiPay',
    href: '/vi/custom-domains',
    section: 'Hướng dẫn',
  },
  {
    title: 'Sandbox & Live Test',
    description: 'Kiểm thử thanh toán và webhook an toàn — không có giao dịch tiền thật',
    href: '/vi/sandbox',
    section: 'Hướng dẫn',
  },
  {
    title: 'WooCommerce',
    description: 'Cài đặt plugin thanh toán ApiPay cho WooCommerce',
    href: '/vi/integrations/woocommerce',
    section: 'Tích hợp',
  },
  {
    title: 'WHMCS',
    description: 'Cài đặt module thanh toán ApiPay cho WHMCS',
    href: '/vi/integrations/whmcs',
    section: 'Tích hợp',
  },
  {
    title: 'HostBill',
    description: 'Cài đặt module thanh toán ApiPay cho HostBill',
    href: '/vi/integrations/hostbill',
    section: 'Tích hợp',
  },
  {
    title: 'Vibe Code',
    description: 'Tạo prompt tích hợp ApiPay cho AI coding assistant',
    href: '/vi/integrations/vibe-code',
    section: 'Tích hợp',
  },
  {
    title: 'Web App',
    description: 'Tích hợp ApiPay vào web app với helper JavaScript và Python',
    href: '/vi/integrations/webapp',
    section: 'Tích hợp',
  },
  {
    title: 'Payment Requests API',
    description: 'API tạo và quản lý liên kết thanh toán',
    href: '/vi/api/payment-requests',
    section: 'API Reference',
  },
  {
    title: 'Webhooks',
    description: 'Nhận thông báo thanh toán theo thời gian thực qua webhook/IPN',
    href: '/vi/api/webhooks',
    section: 'API Reference',
  },
  {
    title: 'Ngân hàng hỗ trợ',
    description: 'Danh sách các ngân hàng được hỗ trợ',
    href: '/vi/api/banks',
    section: 'API Reference',
  },
  {
    title: 'Lịch phát hành',
    description: 'Cập nhật và cải tiến mới nhất của ApiPay',
    href: '/vi/releases',
    section: 'Hướng dẫn',
  },

  // English
  {
    title: 'Introduction',
    description: 'Overview of the ApiPay payment platform',
    href: '/en',
    section: 'Overview',
  },
  {
    title: 'Quick Start',
    description: 'Get started with ApiPay in 5 minutes',
    href: '/en/quickstart',
    section: 'Guides',
  },
  {
    title: 'Onboarding Guide',
    description: 'Complete guide to getting started with ApiPay',
    href: '/en/onboarding',
    section: 'Guides',
  },
  {
    title: 'Subscription & Billing',
    description: 'Manage your ApiPay subscription and billing',
    href: '/en/subscription',
    section: 'Guides',
  },
  {
    title: 'Bank Accounts',
    description: 'Connect and manage your bank accounts',
    href: '/en/banking',
    section: 'Guides',
  },
  {
    title: 'Custom Domains',
    description: 'Use your own domain for the ApiPay payment page',
    href: '/en/custom-domains',
    section: 'Guides',
  },
  {
    title: 'Sandbox & Live Test',
    description: 'Test payments and webhooks safely — no real money moves',
    href: '/en/sandbox',
    section: 'Guides',
  },
  {
    title: 'WooCommerce',
    description: 'Install the ApiPay WooCommerce payment gateway plugin',
    href: '/en/integrations/woocommerce',
    section: 'Integrations',
  },
  {
    title: 'WHMCS',
    description: 'Install the ApiPay WHMCS payment gateway module',
    href: '/en/integrations/whmcs',
    section: 'Integrations',
  },
  {
    title: 'HostBill',
    description: 'Install the ApiPay HostBill payment gateway module',
    href: '/en/integrations/hostbill',
    section: 'Integrations',
  },
  {
    title: 'Vibe Code',
    description: 'Generate an ApiPay integration prompt for AI coding assistants',
    href: '/en/integrations/vibe-code',
    section: 'Integrations',
  },
  {
    title: 'Web App',
    description: 'Integrate ApiPay into a web app with JavaScript and Python helpers',
    href: '/en/integrations/webapp',
    section: 'Integrations',
  },
  {
    title: 'Payment Requests API',
    description: 'API for creating and managing payment links',
    href: '/en/api/payment-requests',
    section: 'API Reference',
  },
  {
    title: 'Webhooks',
    description: 'Receive real-time payment notifications via webhook/IPN',
    href: '/en/api/webhooks',
    section: 'API Reference',
  },
  {
    title: 'Supported Banks',
    description: 'List of supported banks',
    href: '/en/api/banks',
    section: 'API Reference',
  },
  {
    title: 'Release Notes',
    description: 'Latest updates and improvements to ApiPay',
    href: '/en/releases',
    section: 'Guides',
  },
];
