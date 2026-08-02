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
    version: '1.15.0',
    date: '2026-08-02',
    features: [
      'VAT on plans & invoices — VAT is now calculated and displayed during plan checkout, on invoices, and in the purchase confirmation. Invoices show the original amount with a strikethrough when VAT applies, and the tax note adapts based on your billing profile.',
      'Support ticketing — submit support tickets directly from the dashboard, track their status, and reply to ongoing conversations. Accessible from the sidebar, Help page, and the floating help button.',
      'Account deletion — delete your ApiPay account directly from Account Settings. The system validates eligibility and guides you through confirmation steps.',
      'New plans: TITAN & INFINITY — two new top-tier plans for high-volume businesses. All existing plans (PRO, TEAM, BUSINESS, ELITE) have updated pricing. A promotional BASIC plan is also available for qualifying new customers.',
      'Early plan renewal — renew your plan before the official renewal window. A dashboard banner clearly shows when early renewal is available.',
    ],
    fixes: [
      'Clearer support reply notifications — ticket reply messages are now more direct in both English and Vietnamese.',
    ],
    improvements: [
      'Smarter plan changes — credits now account for multiple invoices and prorated usage when switching plans, with a clear note about what happens to unused time when downgrading.',
      'Dashboard typography refresh — switched from IBM Plex Mono to IBM Plex Sans for better readability. Space Grotesk is available as an optional heading font.',
      'Clearer checkout — the purchase modal shows original pricing with strikethrough when discounts or VAT adjustments apply, and the tax note only appears when relevant.',
      'Bank slot enforcement — paid plans now consistently enforce their bank connection limits, with clearer messaging when you reach your plan\'s cap.',
      'More reliable webhook delivery — webhook payloads handle a wider range of data types, and notification previews are trimmed to a more readable length.',
    ],
  },
  {
    version: '1.14.0',
    date: '2026-07-21',
    features: [
      'Payment Speaker (Ting) — hear real-time voice announcements the moment a customer completes a payment. Stay on top of every transaction without watching the screen — ideal for busy store counters and shared workspaces.',
      'Multi-language voice support — the Payment Speaker speaks Vietnamese with clear, natural-sounding voices optimized for payment amounts, bank names, and transaction content.',
    ],
    fixes: [],
    improvements: [
      'Smarter plan changes — when you switch plans mid-cycle, the remaining time on your current plan is credited toward your new plan, so you only pay for what you use.',
      'Faster and more reliable transaction processing — payments and webhooks now run through a dedicated queue, improving delivery speed and reducing the chance of missed events during high-traffic periods.',
      'More responsive webhook retries — failed webhook deliveries retry more quickly, helping your integrations stay in sync with less waiting.',
    ],
  },
  {
    version: '1.13.0',
    date: '2026-07-10',
    features: [
      'Public system status page — check live availability of ApiPay services at any time, including the API, documentation, website, dashboard, payment page, and VietQR gateway.',
      'Service reliability overview — review uptime for the last 1, 30, and 365 days, plus a 24-hour activity timeline for each service.',
      'Maintenance calendar — see active and upcoming maintenance windows, with a published history of past maintenance events.',
    ],
    fixes: [],
    improvements: [
      'Status page is linked from the public website footer for quick access during support or integration planning.',
      'Clearer virtual account guidance when a bank issues a virtual account number for receiving transfers and payment notifications.',
      'More reliable webhook delivery with stronger protection against duplicate payment events for the same transaction.',
      'Smoother free-trial bank connection experience with clearer next-step messaging when a bank needs attention.',
      'Stronger account security with email verification during sign-up and account recovery flows.',
      'Clearer bank-slot messaging when upgrading or changing plans, so teams know how many bank connections their plan supports.',
      'Website contact, newsletter, and feedback forms hardened against automated abuse while staying simple for real customers.',
      'Richer blog reading experience with full-size image viewing on article pages.',
    ],
  },
  {
    version: '1.12.3',
    date: '2026-06-29',
    features: [
      'Free 72-hour trial — eligible new customers can activate a free trial directly from the Pricing page to explore ApiPay before choosing a paid plan. Each account may use the trial once.',
      'Trial terms acceptance — review and accept the trial policy before activation.',
      'Trial bank connection scope — during the trial, connect one personal bank account from MB, BIDV, or VPBank.',
    ],
    fixes: [],
    improvements: [
      'Redesigned Pricing page with a dedicated trial option displayed alongside paid plans.',
      'Dashboard alert and status badge when a bank needs to be reconnected after upgrading from trial — delete the bank and add it again to resume full use.',
      'Banks requiring reconnection are excluded from payment requests, webhooks, and integration setup until refreshed.',
      'Email notification when the free trial ends, with guidance on next steps.',
      'Sidebar navigation label updated from "Plan & Billing" to "Pricing" for clearer access to plans and checkout.',
      'Improved address validation when completing your billing profile before checkout or trial activation.',
    ],
  },
  {
    version: '1.12.2',
    date: '2026-06-24',
    features: [
      'Added direct Telegram and Zalo support options in the Help page and application sidebar for seamless customer support access.',
      'Introduced comprehensive bank branding across the dashboard — displaying clean, high-resolution bank logos and names in transaction lists, admin tables, and payment request overviews.',
    ],
    fixes: [],
    improvements: [
      'Refined the bank connection onboarding workflow with a cleaner layout and updated status styling for a faster bank linking experience.',
    ],
  },
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
    fixes: ['Fixed an issue where some webhook deliveries could not be sent successfully.'],
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
      'Term-based pricing — choose 1, 3, 6, or 12 months at checkout. Automatic discounts apply to 6-month terms at 5% and 12-month terms at 10%. Invoices and renewal flows now display the selected term and effective monthly price.',
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
    version: '1.15.0',
    date: '2026-08-02',
    features: [
      'VAT trên gói dịch vụ & hóa đơn — VAT được tính và hiển thị khi thanh toán gói, trên hóa đơn và trong xác nhận mua. Hóa đơn hiển thị giá gốc kèm gạch ngang khi có VAT áp dụng, và ghi chú thuế thay đổi theo hồ sơ thanh toán của bạn.',
      'Hệ thống phiếu hỗ trợ — gửi phiếu hỗ trợ trực tiếp từ dashboard, theo dõi trạng thái và trả lời các cuộc hội thoại đang diễn ra. Có thể truy cập từ thanh menu, trang Trợ giúp và nút hỗ trợ nổi.',
      'Xóa tài khoản — xóa tài khoản ApiPay trực tiếp từ phần Cài đặt tài khoản. Hệ thống kiểm tra điều kiện và hướng dẫn bạn qua các bước xác nhận.',
      'Gói mới: TITAN & INFINITY — hai gói cao cấp nhất dành cho doanh nghiệp có nhu cầu giao dịch lớn. Tất cả các gói hiện có (PRO, TEAM, BUSINESS, ELITE) đã được cập nhật giá mới. Gói BASIC khuyến mãi cũng có sẵn cho khách hàng mới đủ điều kiện.',
      'Gia hạn sớm — gia hạn gói trước khi đến kỳ gia hạn chính thức. Banner trên dashboard hiển thị rõ ràng khi có thể gia hạn sớm.',
    ],
    fixes: [
      'Thông báo trả lời hỗ trợ rõ ràng hơn — tin nhắn trả lời trong phiếu hỗ trợ nay trực tiếp và dễ hiểu hơn ở cả tiếng Anh và tiếng Việt.',
    ],
    improvements: [
      'Đổi gói thông minh hơn — khoản tín dụng nay tính đến nhiều hóa đơn và mức sử dụng theo tỷ lệ khi đổi gói, kèm ghi chú rõ về điều gì xảy ra với thời gian chưa dùng khi hạ cấp gói.',
      'Làm mới phông chữ dashboard — chuyển từ IBM Plex Mono sang IBM Plex Sans để dễ đọc hơn. Space Grotesk có sẵn làm phông chữ tiêu đề tùy chọn.',
      'Thanh toán rõ ràng hơn — modal mua gói nay hiển thị giá gốc kèm gạch ngang khi có giảm giá hoặc VAT, và ghi chú thuế chỉ xuất hiện khi phù hợp.',
      'Giới hạn kết nối ngân hàng — các gói trả phí nay áp dụng giới hạn kết nối ngân hàng nhất quán, với thông báo rõ ràng khi bạn đạt đến giới hạn của gói.',
      'Gửi webhook ổn định hơn — payload webhook xử lý được nhiều kiểu dữ liệu hơn, và bản xem trước thông báo được rút gọn ở độ dài dễ đọc hơn.',
    ],
  },
  {
    version: '1.14.0',
    date: '2026-07-21',
    features: [
      'Loa Thanh Toán (Ting) — nghe thông báo bằng giọng nói theo thời gian thực ngay khi khách hàng hoàn tất thanh toán. Nắm bắt mọi giao dịch mà không cần nhìn màn hình — lý tưởng cho quầy bán hàng và không gian làm việc chung.',
      'Hỗ trợ giọng đọc đa dạng — Loa Thanh Toán phát âm tiếng Việt với các giọng đọc rõ ràng, tự nhiên, được tối ưu cho số tiền, tên ngân hàng và nội dung giao dịch.',
    ],
    fixes: [],
    improvements: [
      'Đổi gói thông minh hơn — khi đổi gói giữa chu kỳ, thời gian còn lại của gói hiện tại được tính vào gói mới, bạn chỉ trả tiền cho những gì đã sử dụng.',
      'Xử lý giao dịch nhanh và ổn định hơn — thanh toán và webhook nay chạy qua hàng đợi riêng, tăng tốc độ gửi và giảm nguy cơ bỏ lỡ sự kiện trong thời điểm giao dịch cao.',
      'Gửi lại webhook phản hồi nhanh hơn — các lần gửi webhook thất bại được thử lại nhanh chóng, giúp tích hợp của bạn luôn đồng bộ với ít thời gian chờ hơn.',
    ],
  },
  {
    version: '1.13.0',
    date: '2026-07-10',
    features: [
      'Trang trạng thái hệ thống công khai — xem tình trạng hoạt động realtime của các dịch vụ ApiPay bất cứ lúc nào, gồm API, tài liệu, website, dashboard, trang thanh toán và cổng VietQR.',
      'Tổng quan độ ổn định dịch vụ — theo dõi uptime trong 1, 30 và 365 ngày gần nhất, kèm timeline hoạt động 24 giờ cho từng dịch vụ.',
      'Lịch bảo trì — xem bảo trì đang diễn ra và sắp tới, cùng lịch sử các đợt bảo trì đã công bố.',
    ],
    fixes: [],
    improvements: [
      'Trang trạng thái được gắn trong footer website công khai, giúp truy cập nhanh khi cần hỗ trợ hoặc lập kế hoạch tích hợp.',
      'Hướng dẫn tài khoản ảo (VA) rõ hơn khi ngân hàng cấp số VA để nhận chuyển khoản và thông báo thanh toán.',
      'Gửi webhook ổn định hơn, giảm nguy cơ nhận trùng sự kiện thanh toán cho cùng một giao dịch.',
      'Trải nghiệm kết nối ngân hàng trong gói dùng thử mượt hơn, với thông báo bước tiếp theo rõ ràng hơn khi ngân hàng cần xử lý.',
      'Bảo mật tài khoản tốt hơn với xác minh email trong luồng đăng ký và khôi phục tài khoản.',
      'Thông báo về số lượng ngân hàng được kết nối rõ hơn khi nâng cấp hoặc đổi gói, giúp đội ngũ biết gói của mình hỗ trợ bao nhiêu kết nối.',
      'Biểu mẫu liên hệ, đăng ký nhận tin và góp ý trên website được bảo vệ tốt hơn trước spam tự động, vẫn dễ dùng cho khách hàng thật.',
      'Trải nghiệm đọc blog tốt hơn với xem ảnh phóng to trên trang bài viết.',
    ],
  },
  {
    version: '1.12.3',
    date: '2026-06-29',
    features: [
      'Dùng thử miễn phí 72 giờ — khách hàng mới đủ điều kiện có thể kích hoạt gói dùng thử trực tiếp từ trang Bảng giá để trải nghiệm ApiPay trước khi chọn gói trả phí. Mỗi tài khoản được dùng thử một lần.',
      'Xác nhận điều khoản dùng thử — đọc và đồng ý với chính sách dùng thử trước khi kích hoạt.',
      'Phạm vi kết nối ngân hàng khi dùng thử — trong thời gian dùng thử, kết nối một tài khoản cá nhân tại MB, BIDV hoặc VPBank.',
    ],
    fixes: [],
    improvements: [
      'Thiết kế lại trang Bảng giá với mục dùng thử riêng, hiển thị cùng các gói trả phí.',
      'Cảnh báo trên dashboard và nhãn trạng thái khi ngân hàng cần kết nối lại sau khi nâng cấp từ gói dùng thử — xóa ngân hàng và thêm lại để sử dụng đầy đủ.',
      'Ngân hàng cần kết nối lại sẽ không xuất hiện trong yêu cầu thanh toán, webhook và thiết lập tích hợp cho đến khi được kết nối lại.',
      'Email thông báo khi gói dùng thử kết thúc, kèm hướng dẫn các bước tiếp theo.',
      'Đổi tên mục điều hướng từ "Gói dịch vụ" thành "Bảng giá" để truy cập gói và thanh toán rõ ràng hơn.',
      'Cải thiện kiểm tra địa chỉ khi hoàn tất hồ sơ thanh toán trước khi mua gói hoặc kích hoạt dùng thử.',
    ],
  },
  {
    version: '1.12.2',
    date: '2026-06-24',
    features: [
      'Tích hợp kênh hỗ trợ trực tuyến qua Telegram và Zalo ngay tại trang Trợ giúp và thanh menu điều hướng, giúp khách hàng liên hệ nhanh chóng khi cần hỗ trợ.',
      'Đồng bộ nhận diện thương hiệu ngân hàng trên toàn bộ trang quản trị — hiển thị logo vuông sắc nét kèm tên viết tắt ngân hàng trong danh sách giao dịch, bảng quản trị và chi tiết yêu cầu thanh toán.',
    ],
    fixes: [],
    improvements: [
      'Tối ưu hóa giao diện kết nối ngân hàng với bố cục tinh gọn và hiển thị trạng thái trực quan hơn, mang lại trải nghiệm liên kết tài khoản mượt mà.',
    ],
  },
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
    fixes: ['Sửa lỗi một số webhook không gửi được thành công.'],
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
      'Bảng giá theo kỳ hạn — chọn kỳ hạn 1, 3, 6 hoặc 12 tháng khi thanh toán. Giảm giá tự động áp dụng cho kỳ hạn 6 tháng ở mức 5% và 12 tháng ở mức 10%. Hóa đơn và luồng gia hạn nay hiển thị kỳ hạn đã chọn và giá tương đương mỗi tháng.',
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
