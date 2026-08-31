import {useRef, useState} from 'react';
import {cn, formatVND} from '../lib/utils';
import {BankDropdown} from './BankDropdown';

export type QrTemplate = 'compact' | 'qr_only' | 'trademark';

interface QrFormProps {
  bankCode: string;
  accountNumber: string;
  amount: string;
  content: string;
  accountName: string;
  template: QrTemplate;
  onBankChange: (code: string) => void;
  onAccountChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onAccountNameChange: (value: string) => void;
  onTemplateChange: (value: QrTemplate) => void;
  onSubmit: () => void;
  errors: {
    bank?: string;
    account?: string;
  };
}

const TEMPLATES = [
  {value: 'trademark', label: 'Full', description: 'Mẫu hiển thị đầy đủ thông tin thụ hưởng'},
  {value: 'qr_only', label: 'QR Only', description: 'Chỉ mã QR'},
  // compact is deprecated (img.vietqr.io) and intentionally not listed in UI
];

export function QrForm({
  bankCode,
  accountNumber,
  amount,
  content,
  accountName,
  template,
  onBankChange,
  onAccountChange,
  onAmountChange,
  onContentChange,
  onAccountNameChange,
  onTemplateChange,
  onSubmit,
  errors,
}: QrFormProps) {
  const [localErrors, setLocalErrors] = useState<{bank?: string; account?: string}>({});
  const amountInputRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const newValue = input.value;
    const cursorPosition = input.selectionStart || 0;
    const previousValue = amount ? formatVND(amount) : '';

    let numbersBeforeCursor = newValue.substring(0, cursorPosition).replace(/\D/g, '').length;
    let newAmount = newValue.replace(/\D/g, '');

    // Handle deleting non-digits by removing the digit prior to the cursor
    if (newValue.length < previousValue.length && newAmount === amount) {
      const before = newAmount.substring(0, numbersBeforeCursor > 0 ? numbersBeforeCursor - 1 : 0);
      const after = newAmount.substring(numbersBeforeCursor);
      newAmount = before + after;
      if (numbersBeforeCursor > 0) numbersBeforeCursor--;
    }

    // Handle leading zeros divergence to prevent cursor jumps
    const leadingZerosMatch = newAmount.match(/^0+/);
    if (leadingZerosMatch && newAmount !== '0') {
      const numLeadingZeros =
        leadingZerosMatch[0].length === newAmount.length
          ? leadingZerosMatch[0].length - 1
          : leadingZerosMatch[0].length;

      newAmount = newAmount.substring(numLeadingZeros);
      numbersBeforeCursor = Math.max(0, numbersBeforeCursor - numLeadingZeros);
    }

    onAmountChange(newAmount);

    window.requestAnimationFrame(() => {
      if (!amountInputRef.current) return;
      const formatted = amountInputRef.current.value;
      let digitsSeen = 0;
      let newCursorPos = 0;

      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitsSeen++;
        }
        if (digitsSeen === numbersBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }

      if (numbersBeforeCursor === 0) {
        newCursorPos = 0;
      }

      amountInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const newErrors: {bank?: string; account?: string} = {};

    if (!bankCode) {
      newErrors.bank = 'Vui lòng chọn ngân hàng';
      hasError = true;
    }
    if (!accountNumber.trim()) {
      newErrors.account = 'Vui lòng nhập số tài khoản';
      hasError = true;
    }

    setLocalErrors(newErrors);
    if (!hasError) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <BankDropdown value={bankCode} onChange={onBankChange} error={localErrors.bank || errors.bank} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Số tài khoản <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Nhập số tài khoản"
          className={cn(
            'h-12 w-full rounded-lg border bg-background px-4 text-base md:text-sm placeholder:text-muted-foreground outline-none focus:border-primary',
            localErrors.account || errors.account ? 'border-red-500' : 'border-border'
          )}
          value={accountNumber}
          onChange={e => onAccountChange(e.target.value.trimStart())}
        />
        <p className="text-xs text-muted-foreground">Chỉ nhập chữ, số</p>
        {localErrors.account && <p className="text-xs text-red-500">{localErrors.account}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Tên chủ TK <span className="text-muted-foreground">(Tùy chọn)</span>
        </label>
        <input
          type="text"
          placeholder="Nguyễn Văn A"
          className="h-12 w-full rounded-lg border border-border bg-background px-4 text-base md:text-sm placeholder:text-muted-foreground outline-none focus:border-primary"
          value={accountName}
          onChange={e => onAccountNameChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Tên chủ tài khoản (in hoa tự động trong ảnh)</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Số tiền <span className="text-muted-foreground">(Tùy chọn)</span>
        </label>
        <input
          ref={amountInputRef}
          type="text"
          placeholder="Nhập số tiền"
          className="h-12 w-full rounded-lg border border-border bg-background px-4 text-base md:text-sm placeholder:text-muted-foreground outline-none focus:border-primary"
          value={amount ? formatVND(amount) : ''}
          onChange={handleAmountChange}
        />
        <p className="text-xs text-muted-foreground">Chỉ nhập số (VND)</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Nội dung thanh toán <span className="text-muted-foreground">(Tùy chọn)</span>
        </label>
        <input
          type="text"
          placeholder="Nhập nội dung chuyển khoản"
          className="h-12 w-full rounded-lg border border-border bg-background px-4 text-base md:text-sm placeholder:text-muted-foreground outline-none focus:border-primary"
          value={content}
          onChange={e => onContentChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Chỉ nhập chữ, số, không dấu</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mẫu QR</label>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.value}
              type="button"
              className={cn(
                'p-3 rounded-lg border text-center transition-all',
                template === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              )}
              onClick={() => onTemplateChange(t.value as QrTemplate)}
            >
              <div className="font-medium text-sm">{t.label}</div>
              <div className="text-xs mt-0.5 opacity-70">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Tạo QR Code
      </button>
    </form>
  );
}
