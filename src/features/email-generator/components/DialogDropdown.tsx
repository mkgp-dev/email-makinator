import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DialogOption } from '@/features/email-generator/types/dialog.types';

export function DialogDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  minWidthClass = 'min-w-28',
}: {
  label: string;
  value: T;
  options: readonly DialogOption<T>[];
  onChange: (next: T) => void;
  minWidthClass?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onDocumentPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) {
        return;
      }
      const path = event.composedPath();
      if (!path.includes(rootRef.current)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', onDocumentPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onDocumentPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`relative ${minWidthClass}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#dadce0] bg-white px-3 py-2 text-left transition hover:border-[#c3c7d0] hover:bg-[#f1f3f4] focus:border-[#8ab4f8] focus:outline-none"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6368]">{label}</p>
          <p className="truncate text-sm font-medium text-[#202124]" title={selected?.label}>
            {selected?.label ?? ''}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#5f6368] transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-80 rounded-xl border border-[#bcc3cd] bg-white p-1 text-[#202124]"
          style={{
            boxShadow:
              '0 0 0 1px rgba(32,33,36,0.08), 0 2px 8px rgba(60,64,67,0.18), 0 10px 20px rgba(60,64,67,0.16)',
          }}
        >
          <div className="max-h-[320px] overflow-y-auto" role="listbox" aria-label={label}>
            {options.map((option) => {
              const selectedState = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  aria-disabled={option.disabled}
                  aria-selected={selectedState}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition ${
                    option.disabled
                      ? 'cursor-not-allowed opacity-45'
                      : selectedState
                        ? 'cursor-pointer bg-[#e8f0fe]'
                        : 'cursor-pointer hover:bg-[#f1f3f4]'
                  }`}
                >
                  <span className={`pt-1 ${selectedState ? 'text-[#1a73e8]' : 'text-transparent'}`}>
                    <Check size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium leading-5 text-[#202124]">{option.label}</span>
                    {option.description ? (
                      <span className="mt-1 block text-sm leading-5 text-[#5f6368]">{option.description}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
