# ApiPay — Cổng Thanh Toán Qua Chuyển Khoản Ngân Hàng

ApiPay là giải pháp thanh toán API giúp doanh nghiệp dễ dàng nhận thanh toán qua chuyển khoản ngân hàng tại Việt Nam. Tích hợp ApiPay vào hệ thống của bạn để tự động hóa quy trình thu tiền mà không cần tích hợp phức tạp với các cổng thanh toán quốc tế.

## Tính năng chính

- **Tạo liên kết thanh toán nhanh chóng** — Sinh QR Code hoặc thông tin chuyển khoản chỉ với một API call
- **Xác nhận thanh toán tự động** — Hệ thống tự nhận biết khi khách hàng chuyển khoản thành công
- **Webhook thời gian thực** — Nhận thông báo ngay lập tức khi có giao dịch mới
- **Đa ngân hàng** — Hỗ trợ BIDV, ACB, MBBank, OCB và nhiều ngân hàng khác
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
apipay pay:create
```

### API Example

```curl
// Tạo payment request
curl -X POST https://app.apipay.vn/v1/client/payment-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Auth>" \
  -d '{
    "bankPublicId": "bank_abc123",
    "amount": "500000",
    "content": "THANHTOAN-001",
    "title": "DON HANG 12345",
    "redirectUrl": "https://yoursite.com/payment/result"
  }'
```

### Response

```json
{
	"data": {
		"publicId": "APIPAYJSCAF9H23M74K",
		"payUrl": "https://pay.apipay.vn/APIPAYJSCAF9H23M74K",
		"qrUrl": "https://api.qrserver.com/v1/create-qr-code?...",
		"bankCode": "MB",
		"accountNumber": "0123456789",
		"accountName": "NGUYEN VAN A",
		"amount": "100000",
		"content": "ORDER-12345",
		"expiresAt": "2026-12-31T23:59:59Z",
		"createdAt": "2026-03-06T10:00:00Z",
		"redirectSecret": "a1b2c3d4e5f6..."
	}
}
```

## Cấu trúc dự án

```
apipay/
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

- **Homepage**: https://apipay.vn
- **Dashboard**: https://my.apipay.vn
- **Docs**: https://docs.apipay.vn

## Giấy phép

© 2026 ApiPay
