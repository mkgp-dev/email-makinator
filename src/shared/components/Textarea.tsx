import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900',
        props.className,
      )}
    />
  );
}
