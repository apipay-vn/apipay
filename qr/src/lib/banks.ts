export interface Bank {
  code: string;
  name: string;
  fullName: string;
  bin: string;
  image: string;
}

export const BANKS: Bank[] = [
  {code: 'ABB', name: 'ABBANK', fullName: 'Ngân hàng TMCP An Bình', bin: '970425', image: '/banks/ABB.png'},
  {code: 'ACB', name: 'ACB', fullName: 'Ngân hàng TMCP Á Châu', bin: '970416', image: '/banks/ACB.png'},
  {code: 'BAB', name: 'BAB', fullName: 'Ngân hàng TMCP Bắc Á', bin: '970409', image: '/banks/BAB.png'},
  {
    code: 'BIDV',
    name: 'BIDV',
    fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    bin: '970418',
    image: '/banks/BIDV.png',
  },
  {code: 'BVB', name: 'BVB', fullName: 'Ngân hàng TMCP Bảo Việt', bin: '970438', image: '/banks/BVB.png'},
  {code: 'CAKE', name: 'CAKE', fullName: 'CAKE by VPBank', bin: '546034', image: '/banks/CAKE.png'},
  {code: 'CBB', name: 'CBB', fullName: 'Ngân hàng TMCP Xuất Nhập Khẩu Trung Quốc', bin: '970444', image: '/banks/CBB.png'},
  {code: 'CITIBANK', name: 'Citibank', fullName: 'Citibank', bin: '533948', image: '/banks/CITIBANK.png'},
  {code: 'CIMB', name: 'CIMB', fullName: 'Ngân hàng TMCP Xuất Nhập Khẩu Malaysia', bin: '422589', image: '/banks/CIMB.png'},
  {
    code: 'COOPBANK',
    name: 'Co-opBank',
    fullName: 'Ngân hàng Hợp tác xã Việt Nam',
    bin: '970446',
    image: '/banks/COOPBANK.png',
  },
  {code: 'DBS', name: 'DBS', fullName: 'Ngân hàng DBS Bank', bin: '796500', image: '/banks/DBS.png'},
  {code: 'EIB', name: 'Eximbank', fullName: 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam', bin: '970431', image: '/banks/EIB.png'},
  {code: 'GPB', name: 'GPB', fullName: 'Ngân hàng TMCP Dầu khí toàn cầu', bin: '970408', image: '/banks/GPB.png'},
  {code: 'HDB', name: 'HDBank', fullName: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', bin: '970437', image: '/banks/HDB.png'},
  {code: 'HLBVN', name: 'HLBVN', fullName: 'Ngân hàng Hong Leong Việt Nam', bin: '970442', image: '/banks/HLBVN.png'},
  {code: 'HSBC', name: 'HSBC', fullName: 'Ngân hàng HSBC Việt Nam', bin: '458761', image: '/banks/HSBC.png'},
  {code: 'IBKHN', name: 'IBKHN', fullName: 'Ngân hàng IBK - Chi nhánh Hà Nội', bin: '970455', image: '/banks/IBKHN.png'},
  {code: 'IBKHCM', name: 'IBKHCM', fullName: 'Ngân hàng IBK - Chi nhánh Hồ Chí Minh', bin: '970456', image: '/banks/IBKHCM.png'},
  {code: 'ICB', name: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam', bin: '970415', image: '/banks/ICB.png'},
  {code: 'IVB', name: 'IVB', fullName: 'Ngân hàng TNHH Indovina', bin: '970434', image: '/banks/IVB.png'},
  {code: 'KBHCM', name: 'KBHCM', fullName: 'Ngân hàng TMCP Kookmin (CN TP.HCM)', bin: '970463', image: '/banks/KBHCM.png'},
  {code: 'KBHN', name: 'KBHN', fullName: 'Ngân hàng TMCP Kookmin (CN Hà Nội)', bin: '970462', image: '/banks/KBHN.png'},
  {code: 'KEBHANAHCM', name: 'KEBHANAHCM', fullName: 'Ngân hàng TMCP KEB Hana (CN Hồ Chí Minh)', bin: '970466', image: '/banks/KEBHANAHCM.png'},
  {code: 'KEBHANAHN', name: 'KEBHANAHN', fullName: 'Ngân hàng TMCP KEB Hana (CN Hà Nội)', bin: '970467', image: '/banks/KEBHANAHN.png'},
  {code: 'KBank', name: 'KBank', fullName: 'Ngân hàng KBank', bin: '668888', image: '/banks/KBank.png'},
  {code: 'KLB', name: 'Kienlongbank', fullName: 'Ngân hàng TMCP Kiên Long', bin: '970452', image: '/banks/KLB.png'},
  {code: 'LPB', name: 'LPB', fullName: 'Ngân hàng TMCP Bưu điện Liên Việt', bin: '970449', image: '/banks/LPB.png'},
  {code: 'MAFC', name: 'MAFC', fullName: 'MAFC', bin: '977777', image: '/banks/MAFC.png'},
  {code: 'MB', name: 'MB Bank', fullName: 'Ngân hàng TMCP Quân đội', bin: '970422', image: '/banks/MB.png'},
  {code: 'MBV', name: 'MBV', fullName: 'MBV', bin: '970414', image: '/banks/MBV.png'},
  {code: 'momo', name: 'MoMo', fullName: 'Ví điện tử MoMo', bin: '971025', image: '/banks/momo.png'},
  {code: 'MSB', name: 'MSB', fullName: 'Ngân hàng TMCP Hàng Hải Việt Nam', bin: '970426', image: '/banks/MSB.png'},
  {code: 'NAB', name: 'NAB', fullName: 'Ngân hàng TMCP Nam Á', bin: '970428', image: '/banks/NAB.png'},
  {code: 'NCB', name: 'NCB', fullName: 'Ngân hàng TMCP Quốc Dân', bin: '970419', image: '/banks/NCB.png'},
  {code: 'NHBHN', name: 'Agribank', fullName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', bin: '970405', image: '/banks/NHBHN.png'},
  {code: 'NHB HN', name: 'Nonghyup', fullName: 'Ngân hàng Nonghyup - Chi nhánh Hà Nội', bin: '801011', image: '/banks/NHBHN.png'},
  {code: 'OCB', name: 'OCB', fullName: 'Ngân hàng TMCP Phương Đông', bin: '970448', image: '/banks/OCB.png'},
  {code: 'PBVN', name: 'PBVN', fullName: 'Ngân hàng TMCP Đại Phát', bin: '970439', image: '/banks/PBVN.png'},
  {
    code: 'PGB',
    name: 'PGBank',
    fullName: 'Ngân hàng TMCP Thương mại Cổ phần Petrolimex',
    bin: '970430',
    image: '/banks/PGB.png',
  },
  {code: 'PVDB', name: 'PVcomBank Pay', fullName: 'PVcomBank Pay', bin: '971133', image: '/banks/PVDB.png'},
  {code: 'PVCB', name: 'PVCB', fullName: 'Ngân hàng TMCP Đại Chủ', bin: '970412', image: '/banks/PVCB.png'},
  {code: 'SCB', name: 'SCB', fullName: 'Ngân hàng TMCP Sài Gòn', bin: '970429', image: '/banks/SCB.png'},
  {code: 'SCVN', name: 'SCVN', fullName: 'Ngân hàng TMCP Standard Chartered', bin: '970410', image: '/banks/SCVN.png'},
  {code: 'SEAB', name: 'SeABank', fullName: 'Ngân hàng TMCP Đông Nam Á', bin: '970440', image: '/banks/SEAB.png'},
  {code: 'SGICB', name: 'SGICB', fullName: 'Ngân hàng TMCP Sài Gòn Công thương', bin: '970400', image: '/banks/SGICB.png'},
  {code: 'SHB', name: 'SHB', fullName: 'Ngân hàng TMCP Sài Gòn - Hà Nội', bin: '970443', image: '/banks/SHB.png'},
  {code: 'SHBVN', name: 'SHBVN', fullName: 'ShinhanBank', bin: '970424', image: '/banks/SHBVN.png'},
  {code: 'STB', name: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín', bin: '970403', image: '/banks/STB.png'},
  {code: 'TCB', name: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam', bin: '970407', image: '/banks/TCB.png'},
  {code: 'TIMO', name: 'TIMO', fullName: 'Timo', bin: '963388', image: '/banks/TIMO.png'},
  {code: 'TPB', name: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong', bin: '970423', image: '/banks/TPB.png'},
  {code: 'Ubank', name: 'Ubank', fullName: 'Ubank', bin: '546035', image: '/banks/Ubank.png'},
  {code: 'UOB', name: 'UOB', fullName: 'Ngân hàng United Overseas Bank', bin: '970458', image: '/banks/UOB.png'},
  {code: 'VAB', name: 'VAB', fullName: 'Ngân hàng TMCP Việt Á', bin: '970427', image: '/banks/VAB.png'},
  {code: 'VBA', name: 'Agribank', fullName: 'Ngân hàng Nông nghiệp Việt Nam', bin: '970405', image: '/banks/VBA.png'},
  {code: 'VCCB', name: 'VCCB', fullName: 'Ngân hàng TMCP Chính Sách Việt Nam', bin: '970454', image: '/banks/VCCB.png'},
  {code: 'VCB', name: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại Thương Việt Nam', bin: '970436', image: '/banks/VCB.png'},
  {code: 'VIB', name: 'VIB', fullName: 'Ngân hàng TMCP Quốc tế Việt Nam', bin: '970441', image: '/banks/VIB.png'},
  {code: 'VIETBANK', name: 'VietBank', fullName: 'Ngân hàng TMCP Việt Nam Thương Tín', bin: '970433', image: '/banks/VIETBANK.png'},
  {code: 'VNPTMONEY', name: 'VNPTMoney', fullName: 'VNPTMoney', bin: '971011', image: '/banks/VNPTMONEY.png'},
  {code: 'VPB', name: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', bin: '970432', image: '/banks/VPB.png'},
  {code: 'VRB', name: 'VRB', fullName: 'Ngân hàng TMCP Việt Nga', bin: '970421', image: '/banks/VRB.png'},
  {code: 'VTLMONEY', name: 'ViettelMoney', fullName: 'ViettelMoney', bin: '971005', image: '/banks/VTLMONEY.png'},
  {code: 'Vikki', name: 'Vikki', fullName: 'Vikki', bin: '970406', image: '/banks/Vikki.png'},
  {code: 'VBSP', name: 'VBSP', fullName: 'Ngân hàng Chính sách xã hội', bin: '999888', image: '/banks/VBSP.png'},
  {code: 'WVN', name: 'WVN', fullName: 'Ngân hàng TMCP Woori Việt Nam', bin: '970457', image: '/banks/WVN.png'},
];

function compactBankToken(value: string) {
  return value
    .normalize('NFD')
    .replace(/[Đđ]/g, 'D')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export const BANK_BIN_MAP: Record<string, string> = BANKS.reduce(
  (acc, bank) => {
    if (!bank.bin) return acc;
    acc[bank.code] = bank.bin;
    acc[bank.code.toUpperCase()] = bank.bin;
    acc[compactBankToken(bank.code)] = bank.bin;
    acc[compactBankToken(bank.name)] = bank.bin;
    return acc;
  },
  {
    MBB: '970422',
    MBBANK: '970422',
    VIETCOMBANK: '970436',
    VIETINBANK: '970415',
    VPBANK: '970432',
    SACOMBANK: '970403',
  } as Record<string, string>
);

export function resolveQrBankBin(bankCode: string | null | undefined): string | null {
  const raw = bankCode?.trim();
  if (!raw) return null;
  return BANK_BIN_MAP[raw] || BANK_BIN_MAP[raw.toUpperCase()] || BANK_BIN_MAP[compactBankToken(raw)] || null;
}

export function findBankBySlug(slug: string | null | undefined) {
  const compact = slug ? compactBankToken(slug) : '';
  if (!compact) return undefined;
  const byCodeOrName = BANKS.find(
    bank => compactBankToken(bank.code) === compact || compactBankToken(bank.name) === compact
  );
  if (byCodeOrName) return byCodeOrName;
  const bin = resolveQrBankBin(slug);
  if (!bin) return undefined;
  return BANKS.find(bank => bank.bin === bin);
}
