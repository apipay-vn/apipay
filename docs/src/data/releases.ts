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
