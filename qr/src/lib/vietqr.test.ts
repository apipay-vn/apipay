// Run: node --experimental-strip-types src/lib/vietqr.test.ts
import assert from 'node:assert/strict';
import {amountInWords, crc16, decodeQr, fixCrc} from './vietqr.ts';

const tlv = (tag: string, value: string) => `${tag}${String(value.length).padStart(2, '0')}${value}`;
const withCrc = (body: string) => `${body}6304${crc16(`${body}6304`)}`;

assert.equal(crc16('123456789'), '29B1');

const account = tlv('00', '970422') + tlv('01', '0123456789');
const merchant = tlv('00', 'A000000727') + tlv('01', account) + tlv('02', 'QRIBFTTA');
const dynamic = withCrc(
  tlv('00', '01') + tlv('01', '12') + tlv('38', merchant) + tlv('53', '704') + tlv('54', '150000') + tlv('58', 'VN') + tlv('62', tlv('08', 'THANH TOAN DON 123'))
);

const ok = decodeQr(dynamic, new Set(['970422']));
assert.equal(ok.isVietQr, true);
assert.equal(ok.crc.valid, true);
assert.equal(ok.bin, '970422');
assert.equal(ok.accountNumber, '0123456789');
assert.equal(ok.amount, '150000');
assert.equal(ok.content, 'THANH TOAN DON 123');
assert.equal(ok.initiation, 'dynamic');
assert.equal(ok.issues.filter(i => i.level !== 'info').length, 0, JSON.stringify(ok.issues));
assert.equal(ok.nodes.find(n => n.tag === '38')?.children?.[1].children?.[1].value, '0123456789');
assert.equal(dynamic.slice(ok.nodes[2].start, ok.nodes[2].end), tlv('38', merchant));

const broken = dynamic.slice(0, -4) + 'FFFF';
const bad = decodeQr(broken);
assert.equal(bad.crc.valid, false);
assert.ok(bad.issues.some(i => i.level === 'error' && i.path === '63'));
assert.equal(fixCrc(broken, bad.nodes), dynamic);

const accented = withCrc(tlv('00', '01') + tlv('01', '11') + tlv('38', merchant) + tlv('53', '704') + tlv('58', 'VN') + tlv('59', 'NGUYỄN VĂN A'));
const acc = decodeQr(accented);
assert.equal(acc.crc.valid, true);
assert.equal(acc.receiverName, 'NGUYỄN VĂN A');
assert.ok(acc.issues.some(i => i.message.includes('ASCII')));

assert.equal(decodeQr('https://apipay.vn').isEmv, false);
assert.equal(decodeQr('000201010212389').issues[0].level, 'error');

assert.equal(amountInWords(150000), 'Một trăm năm mươi nghìn đồng');
assert.equal(amountInWords(1005000), 'Một triệu không trăm linh năm nghìn đồng');
assert.equal(amountInWords(21), 'Hai mươi mốt đồng');
assert.equal(amountInWords(2000000000), 'Hai tỷ đồng');
assert.equal(amountInWords(115), 'Một trăm mười lăm đồng');

console.log('vietqr: all checks passed');
