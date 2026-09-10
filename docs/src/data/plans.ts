export interface DocsPlan {
  name: string;
  displayName: string;
  includedTx: number;
  unitPrice: number;
  price: number;
  maxBanks: number;
}

export const PLAN_DISPLAY_NAME_MAP: Record<string, string> = {
  QUOTA_60: 'FREE',
  QUOTA_200: 'QUOTA 200',
  QUOTA_400: 'QUOTA 400',
  QUOTA_600: 'QUOTA 600',
  QUOTA_800: 'QUOTA 800',
  QUOTA_1200: 'QUOTA 1200',
  QUOTA_1800: 'QUOTA 1800',
  QUOTA_2500: 'QUOTA 2500',
  QUOTA_3500: 'QUOTA 3500',
  QUOTA_5000: 'QUOTA 5000',
  QUOTA_7500: 'QUOTA 7500',
  QUOTA_10000: 'QUOTA 10000',
  QUOTA_15000: 'QUOTA 15000',
  QUOTA_20000: 'QUOTA 20000',
  QUOTA_30000: 'QUOTA 30000',
  QUOTA_40000: 'QUOTA 40000',
  QUOTA_50000: 'QUOTA 50000',
  QUOTA_75000: 'QUOTA 75000',
  QUOTA_100000: 'QUOTA 100000',
  QUOTA_150000: 'QUOTA 150000',
  QUOTA_200000: 'QUOTA 200000',
  QUOTA_300000: 'QUOTA 300000',
  QUOTA_400000: 'QUOTA 400000',
  QUOTA_500000: 'QUOTA 500000',
};

export function formatPlanDisplayName(planName?: string | null): string {
  if (!planName) return '';
  const key = planName.trim().toUpperCase();
  if (PLAN_DISPLAY_NAME_MAP[key]) {
    return PLAN_DISPLAY_NAME_MAP[key];
  }
  return key.replace(/_/g, ' ');
}

function docPlan(
  name: string,
  includedTx: number,
  unitPrice: number,
  price: number,
  maxBanks = 20
): DocsPlan {
  return {
    name,
    displayName: formatPlanDisplayName(name),
    includedTx,
    unitPrice,
    price,
    maxBanks,
  };
}

export const DOCS_PLANS: DocsPlan[] = [
  docPlan('QUOTA_60', 60, 350, 0),
  docPlan('QUOTA_200', 200, 350, 70000),
  docPlan('QUOTA_400', 400, 320, 128000),
  docPlan('QUOTA_600', 600, 300, 180000),
  docPlan('QUOTA_1200', 1200, 290, 348000),
  docPlan('QUOTA_2500', 2500, 280, 700000),
  docPlan('QUOTA_5000', 5000, 270, 1350000),
  docPlan('QUOTA_10000', 10000, 250, 2500000),
  docPlan('QUOTA_20000', 20000, 230, 4600000),
  docPlan('QUOTA_50000', 50000, 210, 10500000),
  docPlan('QUOTA_100000', 100000, 200, 20000000),
  docPlan('QUOTA_500000', 500000, 150, 75000000),
];

export function formatDocsBankLimit(_plan: DocsPlan, locale: 'en' | 'vi'): string {
  return locale === 'vi' ? 'Không giới hạn' : 'Unlimited';
}
