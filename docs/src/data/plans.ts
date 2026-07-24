export interface DocsPlan {
  name: string;
  price: number;
  banks: number;
}

export const DOCS_PLANS: DocsPlan[] = [
  { name: 'BASIC', price: 150000, banks: 1 },
  { name: 'STARTER', price: 250000, banks: 3 },
  { name: 'PRO', price: 450000, banks: 5 },
  { name: 'TEAM', price: 750000, banks: 10 },
  { name: 'BUSINESS', price: 1750000, banks: 25 },
  { name: 'ELITE', price: 3250000, banks: 50 },
  { name: 'TITAN', price: 6000000, banks: 100 },
  { name: 'INFINITY', price: 11800000, banks: 200 },
];
