const STEPS = [
  {title: 'Đưa mã QR vào', text: 'Kéo thả ảnh, dán ảnh chụp màn hình, quét bằng camera hoặc dán chuỗi ký tự.'},
  {title: 'Đọc ngay trên máy', text: 'Mã được giải trong trình duyệt của bạn. Không ảnh nào được tải lên máy chủ.'},
  {title: 'Xem và kiểm tra', text: 'Thấy ngân hàng, số tài khoản, số tiền, nội dung và biết mã có đúng chuẩn hay không.'},
];

const FIELDS: [string, string, string][] = [
  ['00', 'Phiên bản dữ liệu', 'Luôn là 01'],
  ['01', 'Phương thức khởi tạo', '11 = mã tĩnh, 12 = mã động (dùng một lần, thường có số tiền)'],
  ['38', 'Thông tin người thụ hưởng', 'GUID NAPAS A000000727, mã BIN ngân hàng, số tài khoản/thẻ, mã dịch vụ'],
  ['53', 'Mã tiền tệ', '704 = VND'],
  ['54', 'Số tiền', 'Không bắt buộc. Có thì người chuyển không phải tự nhập'],
  ['58', 'Mã quốc gia', 'VN'],
  ['59', 'Tên người nhận', 'Không bắt buộc, không dấu'],
  ['62', 'Thông tin bổ sung', 'Trường con 08 là nội dung chuyển khoản'],
  ['63', 'Mã kiểm tra CRC', '4 ký tự cuối, tính từ toàn bộ phần phía trước'],
];

const FAQ = [
  {
    q: 'Vì sao app ngân hàng báo mã QR không hợp lệ?',
    a: 'Thường do mã CRC sai: ai đó sửa số tiền hoặc nội dung trong chuỗi mà không tính lại CRC. Lỗi thứ hai hay gặp là nội dung hoặc tên có dấu tiếng Việt, vì chuẩn chỉ cho phép chữ không dấu. Công cụ này chỉ ra chính xác trường nào sai và cho bạn chuỗi đã sửa CRC.',
  },
  {
    q: 'CRC là gì?',
    a: 'CRC là 4 ký tự cuối của mã (sau 6304), giống như chữ ký kiểm tra. Chỉ cần đổi một ký tự trong mã, CRC sẽ không còn khớp và app ngân hàng sẽ từ chối.',
  },
  {
    q: 'Ảnh mã QR của tôi có bị lưu lại không?',
    a: 'Không. Ảnh và chuỗi được giải mã ngay trong trình duyệt. Lịch sử gần đây chỉ nằm trên máy bạn và bạn có thể xoá bất cứ lúc nào.',
  },
  {
    q: 'Có xem được tên chủ tài khoản không?',
    a: 'Phần lớn mã VietQR không chứa tên chủ tài khoản. Để tra tên chính xác từ số tài khoản, dùng API tra cứu tài khoản của ApiPay.',
  },
  {
    q: 'Mã QR thẻ và mã QR tài khoản khác nhau thế nào?',
    a: 'Mã dịch vụ QRIBFTTA là chuyển tiền đến số tài khoản, QRIBFTTC là chuyển đến số thẻ. Cả hai đều đi qua hệ thống chuyển nhanh NAPAS 24/7.',
  },
  {
    q: 'Đọc được mã của ví điện tử hay cửa hàng không?',
    a: 'Được. Mọi mã theo chuẩn EMVCo đều được tách trường. Nếu mã không phải VietQR chuyển khoản, công cụ sẽ cho biết và vẫn hiện toàn bộ dữ liệu bên trong.',
  },
  {
    q: 'Tôi là lập trình viên, có tích hợp được không?',
    a: 'Có. Tab JSON cho bạn toàn bộ kết quả để đối chiếu. Để tự động đối soát chuyển khoản và nhận webhook khi có tiền vào, hãy dùng API của ApiPay.',
  },
];

export function DecodeFaq() {
  return (
    <div className="space-y-14">
      <section>
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Cách dùng</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} data-slot="card" className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-mono text-sm font-bold text-background">{i + 1}</span>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight">Bên trong một mã VietQR</h2>
        <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-muted-foreground">
          Mỗi trường gồm 2 số thẻ, 2 số độ dài, rồi đến giá trị. Ví dụ <code className="font-mono">5303704</code> là thẻ 53, dài 03, giá trị 704 (VND).
        </p>
        <div data-slot="card" className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Thẻ</th>
                <th className="px-4 py-3 font-medium">Trường</th>
                <th className="px-4 py-3 font-medium">Ý nghĩa</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map(([tag, name, note]) => (
                <tr key={tag} className="border-t border-border/60">
                  <td className="px-4 py-2.5 font-mono font-bold">{tag}</td>
                  <td className="px-4 py-2.5 font-medium">{name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Câu hỏi thường gặp</h2>
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ.map(f => (
            <details key={f.q} data-slot="card" className="group rounded-lg border border-border bg-card px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section data-slot="card" className="rounded-lg border border-border bg-card p-6 text-center md:p-10">
        <h2 className="text-2xl font-bold tracking-tight">Tự động hoá chuyển khoản với ApiPay</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Tạo mã VietQR cho từng đơn hàng, nhận webhook ngay khi tiền về, tra tên chủ tài khoản từ số tài khoản. Bắt đầu miễn phí.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="https://my.apipay.vn/vi/sign-up"
            data-slot="button"
            data-variant="default"
            className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold !text-primary-foreground"
          >
            Dùng thử miễn phí
          </a>
          <a
            href="https://docs.apipay.vn"
            target="_blank"
            rel="noopener noreferrer"
            data-slot="button"
            data-variant="outline"
            className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold"
          >
            Xem tài liệu API
          </a>
        </div>
      </section>
    </div>
  );
}
