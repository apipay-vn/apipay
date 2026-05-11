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
    version: '1.8',
    date: '2026-05-11',
    features: [
      'Cổng thanh toán WooCommerce — chấp nhận chuyển khoản ngân hàng VND trên cửa hàng WordPress/WooCommerce với file ZIP plugin tải về có sẵn thông tin API đã được cấu hình. Hỗ trợ cả classic shortcode checkout và WooCommerce Checkout Block. Bao gồm xử lý callback IPN bảo mật với xác minh chữ ký HMAC-SHA256.',
    ],
    fixes: [],
    improvements: [
      'Cải thiện xử lý cấp quyền thông báo trình duyệt và kéo dài thời gian hiển thị thông báo',
      'Đơn giản hóa quản lý kết nối realtime với tự động xử lý subscription cho từng tài khoản ngân hàng đang hoạt động',
      'Thông báo lỗi rõ ràng hơn trên trang thanh toán QR khi có vấn đề hiển thị',
    ],
  },
  {
    version: '1.7.2',
    date: '2026-05-10',
    features: [
      'Thông báo realtime trên dashboard — nhận cảnh báo giao dịch ngân hàng trực tiếp trên bảng điều khiển ngay khi có giao dịch tiền vào hoặc tiền ra mới được xử lý',
    ],
    fixes: [],
    improvements: [
      'Có thể bật thông báo trình duyệt trong phần Cài đặt tài khoản để nhận cảnh báo giao dịch ngay cả khi tab dashboard đang ở nền',
      'Realtime subscription giờ tự động theo dõi từng tài khoản ngân hàng đang hoạt động, cải thiện khả năng bao phủ cho merchant dùng nhiều ngân hàng',
      'Popup trung tâm thông báo giờ hiển thị tối đa 10 mục gần nhất thay vì 5',
    ],
  },
  {
    version: '1.7.1',
    date: '2026-05-09',
    features: [
      'Mẫu tùy chỉnh riêng cho từng kênh — cấu hình mẫu tin nhắn riêng cho từng loại thông báo (ví dụ: đã nhận thanh toán, hoàn tiền) cho từng kênh riêng biệt (Slack, Discord, Lark, Telegram)',
    ],
    fixes: [],
    improvements: [
      'Trình chỉnh sửa mẫu giờ chuyển đổi giữa chế độ chỉnh sửa và xem trước trong một giao diện duy nhất, thay thế layout chia đôi',
      'Kênh Discord được thêm vào bảng tùy chọn thông báo theo loại',
    ],
  },
  {
    version: '1.7',
    date: '2026-05-08',
    features: ['Tích hợp Google Sheets — kết nối Google Sheets để tạo bảng và tự động đồng bộ giao dịch ngân hàng mới'],
    fixes: [],
    improvements: [
      'Thiết kế lại cài đặt ngân hàng trên trang thanh toán — bật/tắt việc khách chọn ngân hàng; khi tắt, mỗi yêu cầu thanh toán dùng ngân hàng đã gán lúc tạo',
      'Quy tắc chọn ngân hàng rõ ràng hơn — yêu cầu ít nhất 2 tài khoản ngân hàng hoạt động mới cho phép khách chọn ngân hàng, tránh nhầm lẫn khi chỉ có một ngân hàng',
      'Cải thiện cảnh báo trên trang tích hợp WHMCS và HostBill — hướng dẫn rõ hơn khi chưa kết nối ngân hàng, kèm liên kết trực tiếp đến trang Ngân hàng',
    ],
  },
  {
    version: '1.6.1',
    date: '2026-05-06',
    features: ['Trình hướng dẫn thiết lập thông báo — hướng dẫn từng bước cho Telegram, Discord, Lark và Slack'],
    fixes: [],
    improvements: [
      'Cập nhật tài liệu tích hợp Telegram với hướng dẫn Chat ID đơn giản qua @apipay_vn_bot',
      'Cải thiện hiển thị định dạng mẫu từ Markdown sang HTML cho mẫu thông báo Telegram',
    ],
  },
  {
    version: '1.6',
    date: '2026-05-05',
    features: ['Xuất dữ liệu giao dịch — tải bản ghi giao dịch dưới dạng CSV với khoảng thời gian và bộ lọc linh hoạt'],
    fixes: [],
    improvements: [
      'Biểu đồ giao dịch theo giờ với cải thiện hiển thị trên di động và công cụ hiển thị thông tin',
      'Giao diện lọc theo ngày được tinh chỉnh cho các trang xem giao dịch và chỉ số',
    ],
  },
  {
    version: '1.5',
    date: '2026-05-04',
    features: [
      'Theo dõi gửi thông báo — theo dõi trạng thái gửi (thành công/thất bại) trên tất cả kênh: Email, Telegram, Slack, Lark, Discord',
      'Chỉ số webhook — theo dõi hiệu suất gửi webhook với số lần thành công và lỗi theo kỳ',
      'Chỉ số thông báo — xem tổng số thông báo đã gửi theo kỳ',
      'Biểu đồ giao dịch theo giờ — biểu đồ cột thể hiện khối lượng và số tiền giao dịch theo giờ trong ngày theo giờ Việt Nam',
    ],
    fixes: [],
    improvements: [
      'Thay biểu đồ tròn phân bổ trạng thái bằng biểu đồ cột giao dịch theo giờ trên trang tổng quan để xem rõ hơn',
      'Cải thiện hiệu suất truy vấn dữ liệu gửi webhook',
      'Theo dõi gửi thông báo đầu cuối tốt hơn từ hàng đợi đến trạng thái cuối cùng',
    ],
  },
  {
    version: '1.4',
    date: '2026-04-28',
    features: [
      'Mẫu thông báo tùy chỉnh — cấu hình mẫu tin nhắn cho từng kênh thông báo (Telegram, Slack, Discord, Lark, Email)',
      'Nhãn thông báo nâng cao — nhãn rõ ràng hơn, mô tả chi tiết hơn cho các loại sự kiện thông báo bổ sung',
    ],
    fixes: [
      'Cải thiện độ tin cậy gửi thông báo trên tất cả các kênh',
      'Sửa lỗi hiển thị ký tự đặc biệt trong dữ liệu giao dịch',
    ],
    improvements: [
      'Tối ưu hàng đợi thông báo giúp xử lý nhanh hơn',
      'Cải thiện hiệu năng render mẫu và sử dụng bộ nhớ',
    ],
  },
  {
    version: '1.3',
    date: '2026-04-23',
    features: [
      'Hỗ trợ nhiều ngân hàng — quản lý và sử dụng nhiều tài khoản ngân hàng để nhận thanh toán',
      'Cập nhật cài đặt trang thanh toán — cải thiện quản lý tài khoản ngân hàng trên bảng điều khiển',
    ],
    fixes: [],
    improvements: [
      'Nâng cao bảo mật và độ tin cậy của chữ ký webhook',
      'Tối ưu quy trình gia hạn gói và thông báo email cho các gói sắp hết hạn',
    ],
  },
  {
    version: '1.2',
    date: '2026-04-19',
    features: [
      'Đăng nhập bằng GitHub OAuth — đăng nhập vào bảng điều khiển bằng tài khoản GitHub',
      'Liên kết tài khoản GitHub — kết nối hồ sơ GitHub với tài khoản ApiPay',
      'Gửi email theo lô cho giao dịch — gom thông báo cho các giao dịch trong cùng khoảng thời gian, giảm spam email',
    ],
    fixes: [
      'Nâng cao độ ổn định kết nối ngân hàng',
      'Sửa lỗi hiển thị giao diện trên một số trình duyệt di động',
      'Khắc phục vấn đề đồng bộ thời gian gửi lại webhook',
    ],
    improvements: [
      'Tinh chỉnh giao diện chọn gói dịch vụ giúp người dùng dễ thao tác',
      'Tối ưu tốc độ tải trang tổng quan cho dữ liệu giao dịch lớn',
      'Cải tiến hiệu năng cho khoảng thời gian giao dịch lớn',
      'Cải thiện định dạng thời gian tiếng Việt trên email và bảng điều khiển',
    ],
  },
  {
    version: '1.1',
    date: '2026-04-14',
    features: [
      'Hệ thống Mã giảm giá (Coupon) mới cho các gói dịch vụ',
      'Áp dụng mã giảm giá trực tiếp khi thanh toán/gia hạn gói',
    ],
    fixes: [
      'Nâng cao độ ổn định kết nối ngân hàng và tự động kết nối lại',
      'Sửa lỗi hiển thị giao diện trên một số trình duyệt di động',
      'Khắc phục vấn đề đồng bộ thời gian gửi lại webhook',
    ],
    improvements: [
      'Tối ưu thông báo giao dịch và xác nhận thanh toán cho ngân hàng ACB',
      'Cải tiến khớp giao dịch với khả năng lọc metadata nâng cao',
      'Tinh chỉnh giao diện chọn gói dịch vụ giúp người dùng dễ thao tác',
      'Tối ưu tốc độ tải trang tổng quan cho dữ liệu giao dịch lớn',
    ],
  },
  {
    version: '1.0',
    date: '2026-03-20',
    features: [
      'Ra mắt cổng thanh toán ApiPay',
      'Bảng điều khiển quản lý giao dịch, ngân hàng, webhook',
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
