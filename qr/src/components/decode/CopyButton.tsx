import {useState} from 'react';
import {cn} from '../../lib/utils';

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({
  value,
  label,
  className,
  variant = 'ghost',
}: {
  value: string;
  label?: string;
  className?: string;
  variant?: 'ghost' | 'outline';
}) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    if (await copyText(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      data-slot={variant === 'outline' ? 'button' : undefined}
      data-variant={variant === 'outline' ? 'outline' : undefined}
      aria-label={label ? undefined : 'Sao chép'}
      title="Sao chép"
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-muted-foreground transition-colors hover:text-foreground',
        label ? 'h-9 px-3.5 text-sm font-medium border border-border' : 'h-8 w-8 hover:bg-muted',
        className
      )}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
      {label && <span>{copied ? 'Đã chép' : label}</span>}
    </button>
  );
}

export function CopyIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CheckIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
