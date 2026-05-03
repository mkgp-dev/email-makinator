import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function DialogAlert({
  variant,
  children,
  onDismiss,
  dismissLabel,
}: {
  variant: 'error' | 'info';
  children: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
  const palette =
    variant === 'error'
      ? 'border-[#f6c7c7] bg-[#fdecec] text-[#b3261e]'
      : 'border-emerald-200 bg-emerald-50 text-emerald-900';

  return (
    <div className={`flex items-start justify-between gap-3 rounded-md border p-3 text-sm ${palette}`} role="alert">
      <div className="leading-6">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel ?? 'Dismiss alert'}
          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
