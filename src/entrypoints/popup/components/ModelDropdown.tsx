import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type EmailAiModel,
} from '@/features/email-generator/types/emailGenerate.types';
import { MODEL_OPTIONS } from '@/features/email-generator/config/emailOptions';
import { cn } from '@/shared/utils/cn';

export function ModelDropdown({
  value,
  onChange,
}: {
  value: EmailAiModel;
  onChange: (value: EmailAiModel) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = 'model-selection-listbox';
  const selected = useMemo(
    () => MODEL_OPTIONS.find((option) => option.value === value) ?? MODEL_OPTIONS[0],
    [value],
  );
  const selectedIndex = useMemo(
    () => MODEL_OPTIONS.findIndex((option) => option.value === value),
    [value],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (!event.composedPath().includes(rootRef.current)) setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  return (
    <div ref={rootRef} className="relative mt-3">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();

            if (!open) setOpen(true);

            const direction = event.key === 'ArrowDown' ? 1 : -1;

            setActiveIndex((index) => {
              const next = index + direction;
              if (next < 0) return MODEL_OPTIONS.length - 1;
              if (next >= MODEL_OPTIONS.length) return 0;
              return next;
            });
          }

          if (event.key === 'Enter' && open) {
            event.preventDefault();

            const option = MODEL_OPTIONS[activeIndex];
            if (option) onChange(option.value);
            setOpen(false);
          }
        }}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `model-option-${activeIndex}` : undefined}
        className={cn(
          'inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left transition',
          'hover:border-slate-600 hover:bg-[#172137]',
        )}
      >
        <div>
          <p className="text-sm font-medium text-slate-100">{selected.label}</p>
          <p className="mt-1 text-xs text-slate-400">{selected.description}</p>
        </div>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-slate-400 transition', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Model options"
          className={cn(
            'absolute bottom-[calc(100%+12px)] left-0 z-20 w-full rounded-xl border border-slate-700 bg-slate-900 p-1',
            'shadow-[0_8px_20px_rgba(2,6,23,0.36)]',
          )}
        >
          <div className="max-h-64 overflow-y-auto">
            {MODEL_OPTIONS.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <button
                  id={`model-option-${index}`}
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={isActive ? 0 : -1}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition',
                    isSelected
                      ? 'bg-[#1e293b]'
                      : isActive
                        ? 'bg-[#172137]'
                        : 'hover:bg-[#172137]',
                  )}
                >
                  <span className={cn('pt-1', isSelected ? 'text-sky-300' : 'text-transparent')}>
                    <Check size={15} />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-100">{option.label}</span>
                    <span className="mt-1 block text-xs text-slate-400">{option.description}</span>
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
