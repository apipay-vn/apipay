import {type ClassValue, clsx} from 'clsx';
import {useCallback, useRef} from 'react';
import {twMerge} from 'tailwind-merge';

export const API_URL = import.meta.env.VITE_API_URL || 'https://app.apipay.vn';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return `${num.toLocaleString('vi-VN')} ₫`;
}

export function useDebounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}
