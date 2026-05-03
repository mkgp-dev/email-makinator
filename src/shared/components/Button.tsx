import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/shared/utils/cn';

export function Button({
  className,
  children,
  type = 'button',
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        'rounded-md border border-zinc-300 bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {children}
    </button>
  );
}
