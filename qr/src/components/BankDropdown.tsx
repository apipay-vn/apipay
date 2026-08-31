import {useVirtualizer} from '@tanstack/react-virtual';
import Fuse from 'fuse.js';
import {useEffect, useMemo, useRef, useState} from 'react';
import {BANKS} from '../lib/banks';
import {cn} from '../lib/utils';
import {LogoIcon} from './LogoIcon';

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, m => (m === 'đ' ? 'd' : 'D'));
}

function BankImage({
  bank,
  className,
  loading,
}: {
  bank: {name: string; image: string};
  className?: string;
  loading?: 'eager' | 'lazy';
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [bank.image]);

  if (error) {
    return (
      <div className={cn('flex items-center justify-center opacity-50', className)}>
        <LogoIcon className="w-5 h-5 text-primary" />
      </div>
    );
  }

  return (
    <img
      src={bank.image}
      alt={bank.name}
      className={cn('object-contain scale-[1.1]', className)}
      onError={() => setError(true)}
      loading={loading}
    />
  );
}

interface BankDropdownProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
}

export function BankDropdown({value, onChange, error}: BankDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedBank = useMemo(() => BANKS.find(b => b.code === value), [value]);

  const fuse = useMemo(
    () =>
      new Fuse(BANKS, {
        keys: [
          {name: 'code', weight: 0.3},
          {name: 'name', weight: 0.4},
          {name: 'fullName', weight: 0.3},
        ],
        threshold: 0.4,
        includeScore: true,
        shouldSort: true,
        // Search against unaccented versions of the data
        getFn: (obj, path) => {
          const val = (obj as unknown as Record<string, string>)[path[0]] ?? '';
          return removeVietnameseTones(val);
        },
      }),
    []
  );

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return BANKS;
    return fuse.search(removeVietnameseTones(searchQuery)).map(r => r.item);
  }, [searchQuery, fuse]);

  const virtualizer = useVirtualizer({
    count: filteredBanks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 68,
    overscan: 3,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium text-foreground">
        Ngân hàng <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div
          className={cn(
            'h-full min-h-12 w-full rounded-lg border bg-background px-4 pr-10 text-sm cursor-pointer flex items-center justify-between transition-colors',
            error ? 'border-red-500' : 'border-border hover:border-primary/50',
            isOpen && 'border-primary ring-2 ring-primary/20'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedBank ? (
            <div className="flex items-center gap-3">
              <BankImage bank={selectedBank} className="w-8 h-8" loading="lazy" />
              <div className="h-fill py-2">
                <div className="font-medium">{selectedBank.name}</div>
                <div className="text-xs text-muted-foreground hidden sm:block">{selectedBank.fullName}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Chọn ngân hàng...</span>
          )}
          <svg
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform absolute right-3',
              isOpen && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg z-50 max-h-80 overflow-hidden">
            <div className="p-2 border-b border-border">
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm ngân hàng..."
                className="w-full h-10 px-3 text-base md:text-sm bg-background border border-border rounded-md outline-none focus:border-primary"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            {filteredBanks.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">Không tìm thấy ngân hàng</div>
            ) : (
              <div ref={scrollRef} className="overflow-y-auto max-h-80">
                <div
                  style={{
                    height: virtualizer.getTotalSize(),
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map(virtualRow => {
                    const bank = filteredBanks[virtualRow.index];
                    return (
                      <div
                        key={bank.code}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className={cn(
                          'flex items-center gap-3 px-4 h-fit  cursor-pointer hover:bg-muted transition-colors',
                          value === bank.code && 'bg-primary/10'
                        )}
                        onClick={() => {
                          onChange(bank.code);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <BankImage bank={bank} className="w-8 h-8" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">{bank.name}</div>
                          <div className="text-xs text-muted-foreground">{bank.fullName}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
