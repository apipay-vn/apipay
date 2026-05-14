export interface ReleaseNote {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
  improvements: string[];
  anchor: string;
}

export type ReleaseLocale = 'en' | 'vi';

export interface ReleaseMonthGroup {
  anchor: string;
  releases: ReleaseNote[];
}

interface ReleaseSidebarChild {
  label: string;
  href: string;
}

type ReleaseSeed = Omit<ReleaseNote, 'anchor'>;

function getReleaseMonthAnchor(date: string): string {
  return date.slice(0, 7);
}

function withAnchors(releases: ReleaseSeed[]): ReleaseNote[] {
  return releases.map(release => ({
    ...release,
    anchor: getReleaseMonthAnchor(release.date),
  }));
}

export function getReleaseMonthGroups(releases: ReleaseNote[]): ReleaseMonthGroup[] {
  const groups = new Map<string, ReleaseMonthGroup>();

  for (const release of releases) {
    const existing = groups.get(release.anchor);

    if (existing) {
      existing.releases.push(release);
      continue;
    }

    groups.set(release.anchor, {
      anchor: release.anchor,
      releases: [release],
    });
  }

  return Array.from(groups.values());
}

export function formatReleaseMonthLabel(anchor: string, locale: ReleaseLocale): string {
  const [year, month] = anchor.split('-');

  if (!year || !month) {
    return anchor;
  }

  if (locale === 'vi') {
    return `Tháng ${Number(month)}/${year}`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${year}-${month}-01T00:00:00Z`));
}

export function getReleaseSidebarChildren(releases: ReleaseNote[], locale: ReleaseLocale): ReleaseSidebarChild[] {
  return getReleaseMonthGroups(releases).map(({anchor}) => ({
    label: formatReleaseMonthLabel(anchor, locale),
    href: `/${locale}/releases#${anchor}`,
  }));
}

export const enReleases: ReleaseNote[] = withAnchors([
  {
    version: '1.8.1',
    date: '2026-05-14',
    features: [
      'Sandbox environment — simulate bank transactions and test webhook integrations without real money. Create payment requests, trigger synthetic transactions, and inspect full delivery logs including HTTP response codes and response bodies. Supports both IN and OUT transaction directions, single-webhook targeting or broadcast to all matching webhooks, and manual resend for failed deliveries.',
    ],
    fixes: [],
    improvements: [],
  },
  {
    version: '1.8',
    date: '2026-05-11',
    features: [
      'WooCommerce payment gateway — accept VND bank transfers on WordPress/WooCommerce stores with a downloadable plugin ZIP containing pre-configured API credentials. Supports both classic shortcode checkout and the WooCommerce Checkout Block. Includes secured IPN callback handling with HMAC-SHA256 signature verification.',
    ],
    fixes: [],
    improvements: [
      'Improved browser notification permission handling and extended notification display duration for better visibility',
      'Simplified realtime connection management with automatic subscription handling per active bank account',
      'Clearer error messaging on the QR payment page when display issues occur',
    ],
  },
  {
    version: '1.7.2',
    date: '2026-05-10',
    features: [
      'Realtime dashboard notifications — receive live bank transaction alerts in the dashboard as soon as new money-in or money-out events are processed',
    ],
    fixes: [],
    improvements: [
      'Optional browser notifications can now be enabled from Account Settings for transaction alerts even when the dashboard tab is in the background',
      'Realtime subscriptions now follow each active bank account automatically, improving coverage for multi-bank merchants',
      'Notification center popup now shows up to 10 recent items instead of 5',
    ],
  },
  {
    version: '1.7.1',
    date: '2026-05-09',
    features: [
      'Per-channel custom templates — configure custom message templates for each notification type (e.g., payment received, refund) independently per channel (Slack, Discord, Lark, Telegram)',
    ],
    fixes: [],
    improvements: [
      'Template editor now toggles between edit and preview mode in one view, replacing the split-panel layout',
      'Discord channel added to the notification type preferences table',
    ],
  },
  {
    version: '1.7',
    date: '2026-05-08',
    features: [
      'Google Sheets integration — connect Google Sheets to create a spreadsheet and sync new bank transactions automatically',
    ],
    fixes: [],
    improvements: [
      'Redesigned payment page bank settings — turn customer bank selection on or off with a single toggle; when off, each payment uses the bank assigned when created',
      'Clearer bank selection rules — customer bank selection now requires at least 2 active bank accounts, preventing confusion when only one bank is available',
      'Improved warning messages on WHMCS and HostBill integration pages — clearer guidance when no active bank is connected, with a direct link to the Banks page',
    ],
  },
  {
    version: '1.6.1',
    date: '2026-05-06',
    features: ['Notification setup wizard — step-by-step guided setup for Telegram, Discord, Lark, and Slack channels'],
    fixes: [],
    improvements: [
      'Updated Telegram integration documentation with streamlined Chat ID setup using @apipay_vn_bot',
      'Improved template format display from Markdown to HTML for Telegram notification templates',
    ],
  },
  {
    version: '1.6',
    date: '2026-05-05',
    features: [
      'Transaction data export — download transaction records in CSV format with flexible date range and filters',
    ],
    fixes: [],
    improvements: [
      'Hourly transaction chart with improved mobile responsiveness and tooltips',
      'Refined date filtering interface across transaction and metrics views',
    ],
  },
  {
    version: '1.5',
    date: '2026-05-04',
    features: [
      'Delivery tracking — track notification delivery status (sent/failed) across all channels: Email, Telegram, Slack, Lark, Discord',
      'Webhook metrics — monitor webhook delivery performance with success and error counts per period',
      'Notification metrics — view total notifications sent per period',
      'Hourly transaction chart — bar chart showing transaction volume and amount by hour for any selected date in Vietnam time',
    ],
    fixes: [],
    improvements: [
      'Replaced status pie chart with hourly transaction bar chart on overview pages for clearer daily breakdown',
      'Improved query performance for webhook delivery data',
      'Better end-to-end tracking of notification delivery from queue to final status',
    ],
  },
  {
    version: '1.4',
    date: '2026-04-28',
    features: [
      'Customizable notification templates — configure message templates for each notification channel (Telegram, Slack, Discord, Lark, Email)',
      'Enhanced notification key labels — clearer, more descriptive labels for additional notification event types',
    ],
    fixes: [
      'Improved notification delivery reliability across all channels',
      'Fixed notification rendering for special characters in transaction data',
    ],
    improvements: [
      'Optimized notification queue processing for higher throughput',
      'Improved template rendering performance and memory usage',
    ],
  },
  {
    version: '1.3',
    date: '2026-04-23',
    features: [
      'Multi-bank support — manage and use multiple bank accounts for receiving payments',
      'Updated payment page settings — improved bank account management in dashboard',
    ],
    fixes: [],
    improvements: [
      'Enhanced webhook secret signing for improved security and reliability',
      'Optimized plan renewal process and email notifications for expiring plans',
    ],
  },
  {
    version: '1.2',
    date: '2026-04-19',
    features: [
      'GitHub OAuth login — sign in to dashboard with your GitHub account',
      'GitHub account linking — connect your GitHub profile to your ApiPay account',
      'Email batching for transactions — grouped notifications for large transaction windows, reducing email spam',
    ],
    fixes: [
      'Improved bank connection reliability',
      'Fixed UI layout issues on specific mobile browser environments',
      'Resolved webhook delivery retry timing synchronization',
    ],
    improvements: [
      'Refined plan selection interface for a more streamlined experience',
      'Optimized dashboard rendering for high-volume transaction data',
      'Performance improvements for large transaction date ranges',
      'Improve Vietnamese timestamp formatting across email/dashboard',
    ],
  },
  {
    version: '1.1',
    date: '2026-04-14',
    features: [
      'New Discount & Coupon system for subscription plans',
      'Direct coupon application during plan checkout and upgrade',
    ],
    fixes: [
      'Optimized transaction notifications and payment confirmations for ACB bank',
      'Improved bank connection reliability and auto-reconnection logic',
      'Fixed UI layout issues on specific mobile browser environments',
      'Resolved webhook delivery retry timing synchronization',
    ],
    improvements: [
      'Enhanced transaction matching with advanced metadata filtering',
      'Refined plan selection interface for a more streamlined experience',
      'Optimized dashboard rendering for high-volume transaction data',
    ],
  },
  {
    version: '1.0',
    date: '2026-03-20',
    features: [
      'Initial release of ApiPay payment gateway',
      'Dashboard with banks/transactions/webhooks management',
      'Notification integration via Email, Telegram, Lark, Slack, Discord',
      'Invoice generation system',
      'API Documentation',
      'Custom domain for payment page',
      'WHMCS integration module',
      'HostBill integration module',
    ],
    fixes: [],
    improvements: [],
  },
]);

export const viReleases: ReleaseNote[] = withAnchors([
  {
    version: '1.8.1',
    date: '2026-05-14',
    features: [
      'Sandbox — tạo giao dịch ngân hàng thử và kiểm tra webhook mà không cần tiền thật. Bạn có thể tạo payment request, trigger giao dịch thử, xem log gửi với mã phản hồi HTTP và nội dung phản hồi. Hỗ trợ cả IN/OUT, gửi đến một webhook cụ thể hoặc broadcast đến các webhook phù hợp, và gửi lại thủ công khi delivery thất bại.',
    ],
    fixes: [],
    improvements: [],
  },
  {
    version: '1.8',
    date: '2026-05-11',
    features: [
      'Cổng thanh toán WooCommerce — nhận chuyển khoản VND trên WordPress/WooCommerce bằng file ZIP plugin có sẵn API credentials. Hỗ trợ classic shortcode checkout và WooCommerce Checkout Block. Callback IPN được bảo vệ bằng chữ ký HMAC-SHA256.',
    ],
    fixes: [],
    improvements: [
      'Cải thiện cách xin quyền thông báo trình duyệt và tăng thời gian hiển thị thông báo',
      'Đơn giản hóa kết nối realtime, tự theo dõi từng tài khoản ngân hàng đang hoạt động',
      'Thông báo lỗi rõ hơn trên trang thanh toán QR khi có lỗi hiển thị',
    ],
  },
  {
    version: '1.7.2',
    date: '2026-05-10',
    features: [
      'Thông báo realtime trên dashboard — nhận cảnh báo giao dịch ngân hàng ngay khi có tiền vào hoặc tiền ra',
    ],
    fixes: [],
    improvements: [
      'Có thể bật thông báo trình duyệt trong Cài đặt tài khoản để nhận cảnh báo cả khi tab dashboard đang ở nền',
      'Realtime subscription tự theo dõi từng tài khoản ngân hàng đang hoạt động, tốt hơn cho merchant dùng nhiều ngân hàng',
      'Popup trung tâm thông báo hiển thị tối đa 10 mục gần nhất thay vì 5',
    ],
  },
  {
    version: '1.7.1',
    date: '2026-05-09',
    features: [
      'Mẫu tùy chỉnh theo kênh — đặt mẫu tin nhắn riêng cho từng loại thông báo như nhận thanh toán hoặc hoàn tiền trên Slack, Discord, Lark và Telegram',
    ],
    fixes: [],
    improvements: [
      'Trình chỉnh sửa mẫu chuyển giữa chế độ sửa và xem trước trong cùng một màn hình',
      'Thêm Discord vào bảng tùy chọn thông báo theo loại',
    ],
  },
  {
    version: '1.7',
    date: '2026-05-08',
    features: ['Tích hợp Google Sheets — kết nối Google Sheets, tạo bảng và tự đồng bộ giao dịch ngân hàng mới'],
    fixes: [],
    improvements: [
      'Thiết kế lại cài đặt ngân hàng trên trang thanh toán: bật/tắt việc khách chọn ngân hàng bằng một công tắc',
      'Quy tắc chọn ngân hàng rõ hơn: cần ít nhất 2 tài khoản hoạt động mới cho phép khách chọn ngân hàng',
      'Cảnh báo trên trang tích hợp WHMCS và HostBill rõ hơn khi chưa kết nối ngân hàng',
    ],
  },
  {
    version: '1.6.1',
    date: '2026-05-06',
    features: ['Trình hướng dẫn thông báo — thiết lập Telegram, Discord, Lark và Slack từng bước'],
    fixes: [],
    improvements: [
      'Cập nhật tài liệu Telegram với cách lấy Chat ID đơn giản qua @apipay_vn_bot',
      'Hiển thị mẫu Telegram theo HTML thay vì Markdown',
    ],
  },
  {
    version: '1.6',
    date: '2026-05-05',
    features: ['Xuất dữ liệu giao dịch — tải giao dịch dạng CSV theo khoảng thời gian và bộ lọc'],
    fixes: [],
    improvements: [
      'Biểu đồ giao dịch theo giờ hiển thị tốt hơn trên di động, kèm tooltip rõ hơn',
      'Tinh chỉnh bộ lọc ngày ở trang giao dịch và chỉ số',
    ],
  },
  {
    version: '1.5',
    date: '2026-05-04',
    features: [
      'Theo dõi gửi thông báo — xem trạng thái thành công/thất bại trên Email, Telegram, Slack, Lark và Discord',
      'Chỉ số webhook — theo dõi số lần gửi thành công và lỗi theo kỳ',
      'Chỉ số thông báo — xem tổng số thông báo đã gửi theo kỳ',
      'Biểu đồ giao dịch theo giờ — xem số lượng và số tiền giao dịch theo từng giờ Việt Nam',
    ],
    fixes: [],
    improvements: [
      'Thay biểu đồ tròn trạng thái bằng biểu đồ cột giao dịch theo giờ trên trang tổng quan',
      'Tăng tốc truy vấn dữ liệu gửi webhook',
      'Theo dõi thông báo tốt hơn từ hàng đợi đến trạng thái cuối cùng',
    ],
  },
  {
    version: '1.4',
    date: '2026-04-28',
    features: [
      'Mẫu thông báo tùy chỉnh — đặt mẫu tin nhắn cho từng kênh Telegram, Slack, Discord, Lark và Email',
      'Nhãn thông báo rõ hơn cho các loại sự kiện mới',
    ],
    fixes: [
      'Gửi thông báo ổn định hơn trên tất cả kênh',
      'Sửa lỗi hiển thị ký tự đặc biệt trong dữ liệu giao dịch',
    ],
    improvements: [
      'Tối ưu hàng đợi thông báo để xử lý nhanh hơn',
      'Render mẫu nhanh hơn và dùng ít bộ nhớ hơn',
    ],
  },
  {
    version: '1.3',
    date: '2026-04-23',
    features: [
      'Hỗ trợ nhiều ngân hàng — quản lý và dùng nhiều tài khoản ngân hàng để nhận thanh toán',
      'Cập nhật cài đặt trang thanh toán — quản lý tài khoản ngân hàng dễ hơn trên dashboard',
    ],
    fixes: [],
    improvements: [
      'Tăng bảo mật và độ ổn định của chữ ký webhook',
      'Tối ưu luồng gia hạn gói và email nhắc gói sắp hết hạn',
    ],
  },
  {
    version: '1.2',
    date: '2026-04-19',
    features: [
      'Đăng nhập bằng GitHub OAuth — dùng tài khoản GitHub để vào dashboard',
      'Liên kết tài khoản GitHub — kết nối hồ sơ GitHub với tài khoản ApiPay',
      'Gửi email theo lô cho giao dịch — gom thông báo trong cùng khoảng thời gian để giảm spam email',
    ],
    fixes: [
      'Kết nối ngân hàng ổn định hơn',
      'Sửa lỗi hiển thị giao diện trên một số trình duyệt di động',
      'Sửa lỗi đồng bộ thời gian gửi lại webhook',
    ],
    improvements: [
      'Tinh chỉnh giao diện chọn gói để dễ thao tác hơn',
      'Trang tổng quan tải nhanh hơn với dữ liệu giao dịch lớn',
      'Tăng hiệu năng khi xem khoảng thời gian giao dịch lớn',
      'Định dạng thời gian tiếng Việt tốt hơn trên email và dashboard',
    ],
  },
  {
    version: '1.1',
    date: '2026-04-14',
    features: [
      'Hệ thống mã giảm giá (Coupon) mới cho các gói dịch vụ',
      'Áp dụng mã giảm giá trực tiếp khi thanh toán hoặc gia hạn gói',
    ],
    fixes: [
      'Kết nối ngân hàng ổn định hơn và tự kết nối lại',
      'Sửa lỗi hiển thị giao diện trên một số trình duyệt di động',
      'Sửa lỗi đồng bộ thời gian gửi lại webhook',
    ],
    improvements: [
      'Tối ưu thông báo giao dịch và xác nhận thanh toán cho ACB',
      'Khớp giao dịch tốt hơn với bộ lọc metadata nâng cao',
      'Tinh chỉnh giao diện chọn gói để dễ thao tác hơn',
      'Trang tổng quan tải nhanh hơn với dữ liệu giao dịch lớn',
    ],
  },
  {
    version: '1.0',
    date: '2026-03-20',
    features: [
      'Ra mắt cổng thanh toán ApiPay',
      'Dashboard quản lý giao dịch, ngân hàng và webhook',
      'Tích hợp thông báo qua Email, Telegram, Lark, Slack, Discord',
      'Tên miền riêng cho trang thanh toán',
      'Hệ thống tạo hóa đơn',
      'Tài liệu API',
      'Module tích hợp WHMCS',
      'Module tích hợp HostBill',
    ],
    fixes: [],
    improvements: [],
  },
]);
