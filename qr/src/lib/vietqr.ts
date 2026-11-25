export const NAPAS_GUID = 'A000000727';
export const SERVICE_ACCOUNT = 'QRIBFTTA';
export const SERVICE_CARD = 'QRIBFTTC';

export interface TlvNode {
  tag: string;
  length: number;
  value: string;
  /** Character offsets of the whole tag-length-value segment in the payload. */
  start: number;
  end: number;
  path: string;
  name: string;
  children?: TlvNode[];
}

export type IssueLevel = 'error' | 'warn' | 'info';
export interface Issue {
  level: IssueLevel;
  message: string;
  path?: string;
}

export interface DecodedQr {
  raw: string;
  isEmv: boolean;
  isVietQr: boolean;
  nodes: TlvNode[];
  byteLengths: boolean;
  bin?: string;
  accountNumber?: string;
  service?: string;
  serviceLabel?: string;
  guid?: string;
  initiation?: 'static' | 'dynamic';
  amount?: string;
  content?: string;
  receiverName?: string;
  city?: string;
  postalCode?: string;
  currency?: string;
  country?: string;
  mcc?: string;
  billNumber?: string;
  referenceLabel?: string;
  terminalLabel?: string;
  storeLabel?: string;
  crc: {found?: string; expected?: string; valid: boolean};
  issues: Issue[];
}

const TOP_NAMES: Record<string, string> = {
  '00': 'Phiên bản dữ liệu',
  '01': 'Phương thức khởi tạo',
  '38': 'Thông tin người thụ hưởng (NAPAS)',
  '52': 'Mã danh mục người bán (MCC)',
  '53': 'Mã tiền tệ',
  '54': 'Số tiền',
  '55': 'Chỉ báo tiền tip',
  '56': 'Phí cố định',
  '57': 'Phí theo phần trăm',
  '58': 'Mã quốc gia',
  '59': 'Tên người nhận',
  '60': 'Thành phố',
  '61': 'Mã bưu chính',
  '62': 'Thông tin bổ sung',
  '63': 'Mã kiểm tra CRC',
  '64': 'Thông tin ngôn ngữ khác',
};

const CHILD_NAMES: Record<string, Record<string, string>> = {
  '38': {'00': 'Định danh toàn cầu (GUID)', '01': 'Tổ chức & tài khoản thụ hưởng', '02': 'Mã dịch vụ'},
  '38.01': {'00': 'Mã BIN ngân hàng', '01': 'Số tài khoản / số thẻ'},
  '62': {
    '01': 'Số hoá đơn',
    '02': 'Số điện thoại',
    '03': 'Mã cửa hàng',
    '04': 'Mã khách hàng thân thiết',
    '05': 'Mã tham chiếu',
    '06': 'Mã khách hàng',
    '07': 'Mã điểm bán',
    '08': 'Nội dung chuyển khoản',
    '09': 'Yêu cầu dữ liệu khách hàng',
    '10': 'Mã số thuế người bán',
    '11': 'Kênh người bán',
  },
  '64': {'00': 'Ngôn ngữ', '01': 'Tên người nhận (ngôn ngữ khác)', '02': 'Thành phố (ngôn ngữ khác)'},
};

function nameFor(path: string, tag: string): string {
  const dot = path.lastIndexOf('.');
  if (dot === -1) {
    if (TOP_NAMES[tag]) return TOP_NAMES[tag];
    const n = Number(tag);
    if (n >= 2 && n <= 25) return 'Thông tin thẻ quốc tế';
    if (n >= 26 && n <= 51) return 'Thông tin tài khoản người bán';
    if (n >= 65 && n <= 79) return 'Dành riêng cho EMVCo';
    if (n >= 80) return 'Mẫu dữ liệu riêng';
    return 'Không xác định';
  }
  const parent = path.slice(0, dot);
  if (CHILD_NAMES[parent]?.[tag]) return CHILD_NAMES[parent][tag];
  if (tag === '00') return 'Định danh toàn cầu (GUID)';
  return 'Dữ liệu con';
}

function isTemplate(path: string): boolean {
  if (path === '38.01' || path === '62' || path === '64') return true;
  if (path.includes('.')) return false;
  const n = Number(path);
  return (n >= 26 && n <= 51) || n >= 80;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class TlvError extends Error {
  offset: number;
  constructor(message: string, offset: number) {
    super(message);
    this.offset = offset;
  }
}

// EMVCo counts length in characters; some generators count UTF-8 bytes (differs only for non-ASCII).
function parseLevel(input: string, base: number, prefix: string, byteLengths: boolean): TlvNode[] {
  const nodes: TlvNode[] = [];
  const bytes = byteLengths ? encoder.encode(input) : null;
  let pos = 0;
  const total = bytes ? bytes.length : input.length;
  const charOffset = (bytePos: number) => (bytes ? decoder.decode(bytes.subarray(0, bytePos)).length : bytePos);

  while (pos < total) {
    const at = base + charOffset(pos);
    if (total - pos < 4) throw new TlvError('Dữ liệu bị cắt cụt', at);
    const header = bytes ? decoder.decode(bytes.subarray(pos, pos + 4)) : input.slice(pos, pos + 4);
    if (!/^\d{4}$/.test(header)) throw new TlvError(`Thẻ hoặc độ dài không hợp lệ: "${header}"`, at);
    const tag = header.slice(0, 2);
    const length = Number(header.slice(2));
    if (pos + 4 + length > total) throw new TlvError(`Thẻ ${tag} khai báo dài ${length} nhưng dữ liệu không đủ`, at);
    const value = bytes ? decoder.decode(bytes.subarray(pos + 4, pos + 4 + length)) : input.slice(pos + 4, pos + 4 + length);
    const path = prefix ? `${prefix}.${tag}` : tag;
    const valueStart = at + 4;
    const node: TlvNode = {
      tag,
      length,
      value,
      start: at,
      end: valueStart + value.length,
      path,
      name: nameFor(path, tag),
    };
    if (isTemplate(path) && value.length >= 4) {
      try {
        node.children = parseLevel(value, valueStart, path, byteLengths);
      } catch {
        // Not a nested template after all; keep it as a plain value.
      }
    }
    nodes.push(node);
    pos += 4 + length;
  }
  return nodes;
}

export function parseTlv(input: string): {nodes: TlvNode[]; byteLengths: boolean} {
  try {
    return {nodes: parseLevel(input, 0, '', false), byteLengths: false};
  } catch (charError) {
    if (encoder.encode(input).length === input.length) throw charError;
    try {
      return {nodes: parseLevel(input, 0, '', true), byteLengths: true};
    } catch {
      throw charError;
    }
  }
}

export function crc16(input: string): string {
  let crc = 0xffff;
  for (const byte of encoder.encode(input)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function find(nodes: TlvNode[] | undefined, path: string): TlvNode | undefined {
  const [head, ...rest] = path.split('.');
  const node = nodes?.find(n => n.tag === head);
  return rest.length ? find(node?.children, rest.join('.')) : node;
}

/** Payload with a freshly computed CRC, replacing tag 63 when it is the last tag. */
export function fixCrc(raw: string, nodes: TlvNode[]): string {
  const last = nodes[nodes.length - 1];
  const body = last?.tag === '63' ? raw.slice(0, last.start) : raw;
  const withTag = `${body}6304`;
  return withTag + crc16(withTag);
}

export function looksLikeEmv(raw: string): boolean {
  return /^000201/.test(raw.trim());
}

export function decodeQr(input: string, knownBins?: Set<string>): DecodedQr {
  const raw = input.replace(/[\r\n]+/g, '').trim();
  const issues: Issue[] = [];
  const base: DecodedQr = {raw, isEmv: false, isVietQr: false, nodes: [], byteLengths: false, crc: {valid: false}, issues};

  if (!looksLikeEmv(raw)) {
    issues.push({level: 'error', message: 'Đây không phải mã QR thanh toán chuẩn EMVCo/VietQR (phải bắt đầu bằng 000201).'});
    return base;
  }

  let parsed: {nodes: TlvNode[]; byteLengths: boolean};
  try {
    parsed = parseTlv(raw);
  } catch (error) {
    const offset = error instanceof TlvError ? error.offset : 0;
    issues.push({level: 'error', message: `Cấu trúc dữ liệu bị lỗi tại ký tự ${offset + 1}: ${(error as Error).message}.`});
    return {...base, isEmv: true};
  }

  const {nodes, byteLengths} = parsed;
  const value = (path: string) => find(nodes, path)?.value;
  const result: DecodedQr = {...base, isEmv: true, nodes, byteLengths};

  if (byteLengths) {
    issues.push({level: 'warn', message: 'Độ dài các trường được tính theo byte thay vì ký tự do có chữ có dấu. Một số app ngân hàng có thể từ chối.'});
  }

  const crcNode = nodes.find(n => n.tag === '63');
  if (!crcNode) {
    issues.push({level: 'error', message: 'Thiếu mã kiểm tra CRC (thẻ 63). App ngân hàng sẽ từ chối mã này.', path: '63'});
  } else {
    const expected = crc16(raw.slice(0, crcNode.start + 4));
    result.crc = {found: crcNode.value.toUpperCase(), expected, valid: crcNode.value.toUpperCase() === expected};
    if (!result.crc.valid) {
      issues.push({
        level: 'error',
        message: `CRC sai: mã ghi ${crcNode.value || '(trống)'}, đúng phải là ${expected}. Dữ liệu đã bị sửa hoặc tạo sai.`,
        path: '63',
      });
    }
    if (nodes[nodes.length - 1] !== crcNode) {
      issues.push({level: 'warn', message: 'Thẻ CRC (63) phải nằm cuối chuỗi.', path: '63'});
    }
  }

  if (value('00') !== '01') issues.push({level: 'warn', message: 'Phiên bản dữ liệu (thẻ 00) phải là 01.', path: '00'});

  const initiation = value('01');
  if (initiation === '11') result.initiation = 'static';
  else if (initiation === '12') result.initiation = 'dynamic';
  else issues.push({level: 'warn', message: 'Phương thức khởi tạo (thẻ 01) phải là 11 (tĩnh) hoặc 12 (động).', path: '01'});

  result.guid = value('38.00');
  result.isVietQr = result.guid?.toUpperCase() === NAPAS_GUID;
  result.bin = value('38.01.00');
  result.accountNumber = value('38.01.01');
  result.service = value('38.02');
  result.serviceLabel =
    result.service === SERVICE_ACCOUNT
      ? 'Chuyển nhanh đến tài khoản'
      : result.service === SERVICE_CARD
        ? 'Chuyển nhanh đến thẻ'
        : result.service;

  if (!find(nodes, '38')) {
    const other = nodes.find(n => Number(n.tag) >= 2 && Number(n.tag) <= 51);
    issues.push({
      level: 'warn',
      message: other
        ? `Không có thông tin NAPAS (thẻ 38). Đây là mã QR của một ví/cổng thanh toán khác (thẻ ${other.tag}), không phải VietQR chuyển khoản.`
        : 'Không có thông tin người thụ hưởng NAPAS (thẻ 38).',
    });
  } else {
    if (!result.isVietQr) issues.push({level: 'warn', message: `GUID ${result.guid ?? '(trống)'} không phải của NAPAS (${NAPAS_GUID}).`, path: '38.00'});
    if (!result.bin) issues.push({level: 'error', message: 'Thiếu mã BIN ngân hàng (38.01.00).', path: '38.01'});
    else if (knownBins && !knownBins.has(result.bin)) issues.push({level: 'warn', message: `Mã BIN ${result.bin} không có trong danh sách ngân hàng đã biết.`, path: '38.01.00'});
    if (!result.accountNumber) issues.push({level: 'error', message: 'Thiếu số tài khoản/số thẻ (38.01.01).', path: '38.01'});
    if (result.service && result.service !== SERVICE_ACCOUNT && result.service !== SERVICE_CARD) {
      issues.push({level: 'warn', message: `Mã dịch vụ ${result.service} lạ (thường là ${SERVICE_ACCOUNT} hoặc ${SERVICE_CARD}).`, path: '38.02'});
    }
  }

  result.currency = value('53');
  if (!result.currency) issues.push({level: 'warn', message: 'Thiếu mã tiền tệ (thẻ 53).', path: '53'});
  else if (result.currency !== '704') issues.push({level: 'warn', message: `Mã tiền tệ ${result.currency} không phải VND (704).`, path: '53'});

  result.country = value('58');
  if (!result.country) issues.push({level: 'warn', message: 'Thiếu mã quốc gia (thẻ 58).', path: '58'});
  else if (result.country !== 'VN') issues.push({level: 'warn', message: `Mã quốc gia ${result.country} không phải VN.`, path: '58'});

  result.amount = value('54');
  if (result.amount !== undefined) {
    if (!/^\d+(\.\d{1,2})?$/.test(result.amount) || Number(result.amount) <= 0) {
      issues.push({level: 'error', message: `Số tiền "${result.amount}" không hợp lệ.`, path: '54'});
    } else if (result.amount.includes('.')) {
      issues.push({level: 'warn', message: 'Số tiền có phần thập phân; VND thường chỉ dùng số nguyên.', path: '54'});
    }
    if (result.initiation === 'static') issues.push({level: 'info', message: 'Mã tĩnh (11) nhưng có số tiền; thường mã có số tiền dùng 12.', path: '01'});
  } else if (result.initiation === 'dynamic') {
    issues.push({level: 'info', message: 'Mã động (12) nhưng không có số tiền; người chuyển sẽ tự nhập.', path: '01'});
  }

  result.content = value('62.08');
  result.billNumber = value('62.01');
  result.storeLabel = value('62.03');
  result.referenceLabel = value('62.05');
  result.terminalLabel = value('62.07');
  if (result.content && result.content.length > 25) {
    issues.push({level: 'info', message: `Nội dung dài ${result.content.length} ký tự; một số ngân hàng cắt bớt sau 25 ký tự.`, path: '62.08'});
  }

  result.receiverName = value('59');
  result.city = value('60');
  result.postalCode = value('61');
  result.mcc = value('52');

  // eslint-disable-next-line no-control-regex
  if (/[^\x00-\x7F]/.test(raw)) {
    issues.push({level: 'warn', message: 'Chuỗi có ký tự có dấu hoặc ký tự đặc biệt. Chuẩn EMVCo chỉ cho phép ASCII; app ngân hàng có thể từ chối.'});
  }

  return result;
}

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readTriple(n: number, full: boolean): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const out: string[] = [];
  if (full || h > 0) out.push(DIGITS[h], 'trăm');
  if (t === 0) {
    if (u > 0 && (full || h > 0)) out.push('linh');
  } else if (t === 1) out.push('mười');
  else out.push(DIGITS[t], 'mươi');
  if (u === 1 && t >= 2) out.push('mốt');
  else if (u === 4 && t >= 2) out.push('tư');
  else if (u === 5 && t >= 1) out.push('lăm');
  else if (u > 0) out.push(DIGITS[u]);
  return out.join(' ');
}

function readBelowBillion(n: number, full: boolean): string {
  const groups = [Math.floor(n / 1e6), Math.floor((n % 1e6) / 1e3), n % 1e3];
  const units = ['triệu', 'nghìn', ''];
  const out: string[] = [];
  let started = full;
  groups.forEach((g, i) => {
    if (g === 0) return;
    out.push(readTriple(g, started), units[i]);
    started = true;
  });
  return out.filter(Boolean).join(' ');
}

/** Vietnamese words for a whole VND amount, e.g. 1500000 -> "Một triệu năm trăm nghìn đồng". */
export function amountInWords(amount: string | number): string {
  let n = Math.floor(Number(amount));
  if (!Number.isFinite(n) || n < 0) return '';
  if (n === 0) return 'Không đồng';
  const parts: string[] = [];
  const billions: number[] = [];
  while (n >= 1e9) {
    billions.unshift(n % 1e9);
    n = Math.floor(n / 1e9);
  }
  parts.push(readBelowBillion(n, false));
  for (const chunk of billions) {
    parts.push('tỷ');
    if (chunk > 0) parts.push(readBelowBillion(chunk, true));
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} đồng`;
}
