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
    version: '1.12.1',
    date: '2026-06-16',
    features: [
      'Added support for Shinhan and Co-opBank connections, giving merchants more options for receiving and tracking bank-transfer payments.',
    ],
    fixes: [],
    improvements: [],
  },
  {
    version: '1.12.0',
    date: '2026-06-14',
    features: [
      'Added bank connections for VIB, VietinBank, Sacombank, VPBank, and PGBank, expanding the choices available for automated bank-transfer payments.',
      'Expanded connection options for personal, business, and household business accounts, subject to each bank’s supported account types.',
    ],
    fixes: [
      'Improved bank identification consistency so incoming payments are matched to the correct connected bank more reliably.',
    ],
    improvements: [
      'Made bank setup clearer with more specific requirements, verification guidance, and connection status messages for each supported bank.',
      'Updated transaction processing guidance to approximately 1–2 seconds under normal bank and network conditions.',
      'Expanded the bank API and webhook documentation with the current connection flow, supported account types, and integration examples.',
    ],
  },
  {
    version: '1.11.1',
    date: '2026-06-10',
    features: [
      'Added verification for business bank accounts, making it easier for companies to complete bank setup with the right confirmation step.',
    ],
    fixes: [],
    improvements: [
      'Improved bank link and unlink notifications so teams can see clearly when verification is needed or a connection has been removed.',
      'Cleaned up bank connection messages to make them shorter, clearer, and easier to act on.',
    ],
  },
  {
    version: '1.11.0',
    date: '2026-06-09',
    features: [
      'Added support for VietinBank and OCB connections, giving merchants more options for receiving and tracking bank-transfer payments.',
    ],
    fixes: [
      'Fixed bank names appearing inconsistently in payment and account notifications.',
      'Fixed duplicate account information appearing on some bank detail pages.',
    ],
    improvements: [
      'Simplified bank connection requirements and expanded setup guidance across the dashboard, documentation, and command-line tools.',
      'Supported banks are now presented in a clearer order, making the right connection easier to find.',
      'Improved the admin overview with today’s transaction count and payment volume.',
    ],
  },
  {
    version: '1.10.0',
    date: '2026-06-06',
    features: [
      'Expanded bank connection support — improved setup flows for three additional bank connections, making onboarding faster and easier to complete from the dashboard.',
      'Per-bank virtual account improvements — virtual account setup is now clearer for each supported bank, helping merchants configure payment receiving details with fewer manual checks.',
      'Create QR codes for each connected bank, making it easier to present the right payment QR for each receiving account.',
    ],
    fixes: [
      'Fixed an issue where some webhook deliveries could not be sent successfully.',
    ],
    improvements: [
      'Improved connection guidance, status messaging, and setup reliability across supported banks.',
      'Refined bank-specific setup details so merchants can review requirements and complete configuration more confidently.',
      'Bank disconnection is now faster, helping merchants remove unused connections with less waiting time.',
    ],
  },
  {
    version: '1.9.4',
    date: '2026-05-22',
    features: [
      'Affiliate program — share your referral link from the dashboard and earn commission when a referred customer completes their first successful plan payment.',
      'Affiliate dashboard — track clicks, successful referrals, available balance, withdrawn amount, and commission history in one place.',
      'Custom referral code — personalize your referral code before sharing your link with customers or partners.',
    ],
    fixes: [],
    improvements: [
      'Referral links now stay connected from the public website through sign-up, making partner attribution smoother for new customers.',
    ],
  },
  {
    version: '1.9.3',
    date: '2026-05-19',
    features: [
      'Webhook statistics — track delivery volume, success rate, and failed deliveries for your configured webhooks in a clearer performance summary.',
    ],
    fixes: [],
    improvements: [
      'Improved webhook insights with more focused success and error indicators, helping teams review delivery health faster.',
      'Refined responsive layouts across webhook views so key metrics, filters, and delivery details remain easy to review on smaller screens.',
    ],
  },
  {
    version: '1.9.2',
    date: '2026-05-17',
    features: [
      'Delivery Log — a new tab on the Webhooks page that shows every production webhook delivery, filterable by bank, endpoint, status, and date range. Each record displays the HTTP response code, response body, and payload that was sent.',
      'Resend failed webhooks directly from the Delivery Log tab without switching tabs.',
    ],
    fixes: [],
    improvements: [
      'Delivery log data is now accessible via API — `GET /v1/client/webhooks/deliveries` supports the same filters as the dashboard.',
    ],
  },
  {
    version: '1.9.1',
    date: '2026-05-17',
    features: [],
    fixes: [],
    improvements: [
      'Notification preferences are now grouped by Payments, Account & Security, Plans & Billing, and System, making it easier to scan and adjust the channels for each notification type.',
      'The notification filter also follows the same grouping and includes bank unlink notifications.',
    ],
  },
  {
    version: '1.9',
    date: '2026-05-16',
    features: [
      'Passkey sign-in — register a passkey (Face ID, fingerprint, or device passkey) and sign in to the dashboard without typing your password. Each account can register one passkey, which can be renamed or deleted from Account Settings.',
      'Term-based pricing — choose 1, 3, 6, or 12 months at checkout. Longer terms include automatic discounts: 3 months saves 5%, 6 months saves 10%, and 12 months saves 15%. Invoices and renewal flows now display the selected term and effective monthly price.',
    ],
    fixes: [],
    improvements: [
      'Renewal invoices automatically use the same term as your last payment, so you keep your discount without extra steps',
      'Invoice list now shows the billing term for each invoice',
      'Plan checkout dialog shows subtotal, discount, and effective monthly price before you confirm',
    ],
  },
  {
    version: '1.8.2',
    date: '2026-05-15',
    features: [],
    fixes: [
      'Upgraded Next.js to latest — addresses multiple security vulnerabilities of high, moderate, and low severity including one upstream React issue. Upgrade is strongly recommended. See the official Next.js release notes for full details.',
    ],
    improvements: [
      'Browser notification permission prompt now uses a non-blocking toast action instead of a modal, so it no longer interrupts the current workflow',
      'Notification permission state is re-evaluated on each dashboard load, ensuring the prompt reappears correctly after a browser data clear or permission reset',
      'Notification click handler now focuses the existing dashboard tab instead of opening a new window when the dashboard is already open',
    ],
  },
  {
    version: '1.8.1',
    date: '2026-05-14',
    features: [
      'Sandbox environment — simulate incoming bank transactions and test webhook integrations without real money. Create payment requests, trigger synthetic transactions, and inspect full delivery logs including HTTP response codes and response bodies.',
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
      'Realtime dashboard notifications — receive live bank transaction alerts in the dashboard as soon as new incoming payments are processed',
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
      'Improved bank connection reliability and auto-reconnection behavior',
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
    version: '1.12.1',
    date: '2026-06-16',
    features: [
      'Bổ sung kết nối Shinhan và Co-opBank, giúp merchant có thêm lựa chọn nhận và theo dõi thanh toán chuyển khoản.',
    ],
    fixes: [],
    improvements: [],
  },
  {
    version: '1.12.0',
    date: '2026-06-14',
    features: [
      'Bổ sung kết nối VIB, VietinBank, Sacombank, VPBank và PGBank, mở rộng lựa chọn nhận thanh toán chuyển khoản tự động cho doanh nghiệp.',
      'Mở rộng lựa chọn kết nối cho tài khoản cá nhân, doanh nghiệp và hộ kinh doanh, tùy theo loại tài khoản được từng ngân hàng hỗ trợ.',
    ],
    fixes: [
      'Cải thiện độ chính xác khi nhận diện ngân hàng, giúp giao dịch tiền vào được ghi nhận đúng tài khoản đã kết nối ổn định hơn.',
    ],
    improvements: [
      'Làm rõ quy trình kết nối với yêu cầu thông tin, hướng dẫn xác thực và trạng thái riêng cho từng ngân hàng được hỗ trợ.',
      'Cập nhật thời gian xử lý giao dịch dự kiến khoảng 1–2 giây trong điều kiện ngân hàng và đường truyền ổn định.',
      'Mở rộng tài liệu API ngân hàng và webhook với luồng kết nối hiện tại, loại tài khoản được hỗ trợ và ví dụ tích hợp.',
    ],
  },
  {
    version: '1.11.1',
    date: '2026-06-10',
    features: [
      'Bổ sung bước xác thực cho tài khoản ngân hàng doanh nghiệp, giúp công ty hoàn tất kết nối ngân hàng đúng quy trình và dễ theo dõi hơn.',
    ],
    fixes: [],
    improvements: [
      'Cải thiện thông báo khi liên kết và hủy liên kết ngân hàng, giúp người dùng biết rõ khi nào cần nhập mã xác thực hoặc khi kết nối đã được gỡ thành công.',
      'Tinh chỉnh nội dung thông báo kết nối ngân hàng để ngắn gọn, rõ ý và dễ thao tác hơn.',
    ],
  },
  {
    version: '1.11.0',
    date: '2026-06-09',
    features: [
      'Bổ sung kết nối VietinBank và OCB, giúp merchant có thêm lựa chọn nhận và theo dõi thanh toán chuyển khoản.',
    ],
    fixes: [
      'Sửa lỗi tên ngân hàng hiển thị không nhất quán trong thông báo thanh toán và tài khoản.',
      'Sửa lỗi thông tin tài khoản bị hiển thị trùng trên một số trang chi tiết ngân hàng.',
    ],
    improvements: [
      'Đơn giản hóa yêu cầu kết nối ngân hàng và bổ sung hướng dẫn thiết lập trên dashboard, tài liệu và công cụ dòng lệnh.',
      'Danh sách ngân hàng được sắp xếp rõ ràng hơn, giúp tìm kết nối phù hợp nhanh hơn.',
      'Cải thiện trang tổng quan quản trị với số giao dịch và tổng giá trị thanh toán trong ngày.',
    ],
  },
  {
    version: '1.10.0',
    date: '2026-06-06',
    features: [
      'Mở rộng hỗ trợ kết nối ngân hàng — cải thiện luồng thiết lập cho ba kết nối ngân hàng mới, giúp onboarding nhanh hơn và dễ hoàn tất ngay trên dashboard.',
      'Cải thiện tài khoản ảo theo từng ngân hàng — phần thiết lập tài khoản ảo nay rõ ràng hơn cho từng ngân hàng được hỗ trợ, giúp merchant cấu hình thông tin nhận thanh toán với ít bước kiểm tra thủ công hơn.',
      'Tạo mã QR cho từng ngân hàng đã kết nối, giúp hiển thị đúng mã QR thanh toán cho từng tài khoản nhận tiền.',
    ],
    fixes: [
      'Sửa lỗi một số webhook không gửi được thành công.',
    ],
    improvements: [
      'Cải thiện hướng dẫn kết nối, thông báo trạng thái và độ ổn định khi thiết lập trên các ngân hàng được hỗ trợ.',
      'Tinh chỉnh thông tin thiết lập theo từng ngân hàng để merchant dễ xem yêu cầu và hoàn tất cấu hình tự tin hơn.',
      'Ngắt kết nối ngân hàng nhanh hơn, giúp merchant gỡ các kết nối không còn dùng với ít thời gian chờ hơn.',
    ],
  },
  {
    version: '1.9.4',
    date: '2026-05-22',
    features: [
      'Chương trình giới thiệu — chia sẻ link giới thiệu trong dashboard và nhận hoa hồng khi khách được giới thiệu thanh toán gói đầu tiên thành công.',
      'Trang giới thiệu riêng — theo dõi lượt nhấp, số khách giới thiệu thành công, số dư có thể rút, số tiền đã rút và lịch sử hoa hồng ở cùng một nơi.',
      'Mã giới thiệu tùy chỉnh — đổi mã giới thiệu theo tên thương hiệu hoặc tên cá nhân trước khi chia sẻ link.',
    ],
    fixes: [],
    improvements: [
      'Link giới thiệu nay được giữ liền mạch từ website công khai đến bước đăng ký, giúp ghi nhận đối tác giới thiệu rõ ràng hơn.',
      'Cải thiện quy trình theo dõi và hỗ trợ hoa hồng, giúp việc đối soát khi cần rõ ràng hơn.',
    ],
  },
  {
    version: '1.9.3',
    date: '2026-05-19',
    features: [
      'Thống kê webhook — theo dõi tổng lượt gửi, tỷ lệ thành công và các lần gửi thất bại của webhook đã cấu hình trong một phần tổng quan rõ ràng hơn.',
    ],
    fixes: [],
    improvements: [
      'Cải thiện phần phân tích webhook với các chỉ số thành công và lỗi tập trung hơn, giúp đội ngũ đánh giá tình trạng gửi nhanh hơn.',
      'Tinh chỉnh giao diện responsive cho các màn hình webhook, giúp chỉ số, bộ lọc và chi tiết gửi vẫn dễ xem trên thiết bị có màn hình nhỏ.',
    ],
  },
  {
    version: '1.9.2',
    date: '2026-05-17',
    features: [
      'Tab **Lịch sử gửi** trên trang Webhooks — xem lại mọi lần gửi webhook trên production, có thể lọc theo ngân hàng, endpoint, hướng giao dịch, trạng thái và khoảng ngày. Mỗi bản ghi hiển thị mã phản hồi HTTP, nội dung phản hồi và payload đã gửi.',
      'Gửi lại webhook thất bại ngay trong Lịch sử gửi, không cần rời khỏi trang.',
    ],
    fixes: [],
    improvements: [
      'Có thể truy vấn lịch sử gửi webhook qua API — `GET /v1/client/webhooks/deliveries` hỗ trợ cùng các bộ lọc như trên dashboard.',
    ],
  },
  {
    version: '1.9.1',
    date: '2026-05-17',
    features: [],
    fixes: [],
    improvements: [
      'Cài đặt thông báo nay được gom theo nhóm Thanh toán, Tài khoản & bảo mật, Gói dịch vụ & hóa đơn và Hệ thống, dễ nhìn hơn khi chọn kênh nhận cho từng loại thông báo.',
      'Bộ lọc trong trang thông báo cũng dùng cùng cách nhóm và đã bổ sung loại thông báo hủy liên kết ngân hàng.',
    ],
  },
  {
    version: '1.9',
    date: '2026-05-16',
    features: [
      'Đăng nhập bằng passkey — đăng ký passkey (Face ID, vân tay hoặc passkey trên thiết bị) rồi đăng nhập dashboard mà không cần nhập mật khẩu. Mỗi tài khoản đăng ký được 1 passkey, có thể đổi tên hoặc xóa trong Cài đặt tài khoản.',
      'Bảng giá theo kỳ hạn — chọn kỳ hạn 1, 3, 6 hoặc 12 tháng khi thanh toán. Kỳ hạn dài hơn được giảm giá tự động: 3 tháng giảm 5%, 6 tháng giảm 10%, 12 tháng giảm 15%. Hóa đơn và luồng gia hạn nay hiển thị kỳ hạn đã chọn và giá tương đương mỗi tháng.',
    ],
    fixes: [],
    improvements: [
      'Hóa đơn gia hạn tự động dùng kỳ hạn giống lần thanh toán trước, bạn không cần chọn lại để giữ giảm giá',
      'Danh sách hóa đơn nay hiển thị kỳ hạn của từng hóa đơn',
      'Dialog thanh toán gói hiển thị tạm tính, giảm giá và giá tương đương mỗi tháng trước khi xác nhận',
    ],
  },
  {
    version: '1.8.2',
    date: '2026-05-15',
    features: [],
    fixes: [
      'Nâng cấp Next.js lên bản mới nhất — vá nhiều lỗ hổng bảo mật mức cao, trung bình và thấp, bao gồm một lỗi từ React upstream. Khuyến nghị cập nhật ngay. Xem ghi chú phát hành chính thức của Next.js để biết chi tiết đầy đủ.',
    ],
    improvements: [
      'Yêu cầu quyền thông báo trình duyệt nay hiển thị dưới dạng toast action không chặn, không còn làm gián đoạn luồng làm việc hiện tại',
      'Trạng thái quyền thông báo được kiểm tra lại mỗi lần tải dashboard, đảm bảo prompt xuất hiện lại đúng sau khi xóa dữ liệu trình duyệt hoặc đặt lại quyền',
      'Khi nhấn vào thông báo, dashboard đang mở sẽ được focus thay vì mở tab mới',
    ],
  },
  {
    version: '1.8.1',
    date: '2026-05-14',
    features: [
      'Sandbox — tạo giao dịch tiền vào thử và kiểm tra webhook mà không cần tiền thật. Bạn có thể tạo payment request, trigger giao dịch thử, xem log gửi với mã phản hồi HTTP và nội dung phản hồi.',
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
    fixes: ['Gửi thông báo ổn định hơn trên tất cả kênh', 'Sửa lỗi hiển thị ký tự đặc biệt trong dữ liệu giao dịch'],
    improvements: ['Tối ưu hàng đợi thông báo để xử lý nhanh hơn', 'Render mẫu nhanh hơn và dùng ít bộ nhớ hơn'],
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
