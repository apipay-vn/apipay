# ApiPay — Cổng Thanh Toán Qua Chuyển Khoản Ngân Hàng

ApiPay là giải pháp thanh toán API giúp doanh nghiệp dễ dàng nhận thanh toán qua chuyển khoản ngân hàng tại Việt Nam. Tích hợp ApiPay vào hệ thống của bạn để tự động hóa quy trình thu tiền mà không cần tích hợp phức tạp với các cổng thanh toán quốc tế.

## Tính năng chính

- **Tạo liên kết thanh toán nhanh chóng** — Sinh QR Code hoặc thông tin chuyển khoản chỉ với một API call
- **Xác nhận thanh toán tự động** — Hệ thống tự nhận biết khi khách hàng chuyển khoản thành công
- **Webhook thời gian thực** — Nhận thông báo ngay lập tức khi có giao dịch mới
- **Đa ngân hàng** — Hỗ trợ BIDV, ACB, MBBank và nhiều ngân hàng khác
- **Miễn phí giao dịch** — Không phí transaction, chỉ trả phí dịch vụ theo gói đăng ký

## Cách hoạt động

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  1. Tạo Link    │ -> │  2. Khách TT    │ -> │ 3. Xác nhận     │
│  thanh toán     │    │  qua QR/Chuyển  │    │ tự động         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                              │
        v                                              v
┌─────────────────┐                           ┌─────────────────┐
│   API Request   │                           │  Webhook gửi    │
│   (POST /pay)   │                           │  về server của  │
└─────────────────┘                           │  bạn            │
                                              └─────────────────┘
```

1. **Tạo payment link** — Gọi API để sinh liên kết thanh toán với số tiền và nội dung chuyển khoản
2. **Khách hàng thanh toán** — Khách quét QR Code hoặc chuyển khoản theo thông tin được cung cấp
3. **Hệ thống tự động xác nhận** — ApiPay nhận diện giao dịch thông qua bank webhook
4. **Nhận webhook notification** — Server của bạn nhận thông báo giao dịch thành công

## Bắt đầu nhanh

### Yêu cầu

- Tài khoản ApiPay đã được kích hoạt
- API Key để xác thực

### Cài đặt CLI (tuỳ chọn)

```bash
npm install -g apipay
apipay login
```

### Tạo payment link

```bash
apipay pay create \
  --amount 100000 \
  --description "DON HANG 12345"
```

### API Example

```javascript
// Tạo payment request
const response = await fetch("https://app.apipay.vn/v1/pay", {
	method: "POST",
	headers: {
		Authorization: "Bearer YOUR_API_KEY",
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		amount: 100000,
		description: "DON HANG 12345",
		callback_url: "https://your-site.com/webhook",
	}),
});

const data = await response.json();
// {
//   "id": "pay_xxx",
//   "amount": 100000,
//   "qr_code": "...",
//   "bank_account": {
//     "bank": "BIDV",
//     "account_number": "1234567890",
//     "account_name": "CONG TY ABC"
//   },
//   "status": "pending"
// }
```

## Cấu trúc dự án

```
apipay-transfer/
├── cli/                    # ApiPay CLI - Command-line tool
│   ├── src/
│   │   ├── commands/       # Các lệnh CLI (pay, banks, webhooks, keys...)
│   │   └── lib/            # API client, config, validators
│   └── bin/                # Entry point
│
└── docs/                   # Tài liệu hướng dẫn
    ├── src/
    │   ├── content/        # Nội dung docs (vi/, en/)
    │   └── components/     # React components
    └── dist/               # Built static files
```

## Tài liệu chi tiết

| Chủ đề                                                        | Mô tả                        |
| ------------------------------------------------------------- | ---------------------------- |
| [Hướng dẫn bắt đầu](docs/src/content/vi/onboarding.mdx)       | Thiết lập tài khoản merchant |
| [Quick Start](docs/src/content/vi/quickstart.mdx)             | Tích hợp API trong 5 phút    |
| [Quản lý ngân hàng](docs/src/content/vi/banking.mdx)          | Kết nối tài khoản ngân hàng  |
| [API Reference](docs/src/content/vi/api/payment-requests.mdx) | Tạo và quản lý thanh toán    |
| [Webhooks](docs/src/content/vi/api/webhooks.mdx)              | Nhận thông báo giao dịch     |

## Liên kết hữu ích

- **Dashboard**: https://my.apipay.vn
- **API Base**: https://app.apipay.vn/v1
- **Tài liệu**: Xem thêm trong thư mục `docs/`

## Giấy phép

MIT License — © 2024 ApiPay
