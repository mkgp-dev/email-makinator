import type { ChangeEvent } from 'react';
import { Textarea } from '@/shared/components/Textarea';

export function DialogTextarea({
  value,
  onChange,
  placeholder,
  compact,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  compact: boolean;
  disabled: boolean;
}) {
  return (
    <div>
      <Textarea
        disabled={disabled}
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`min-h-0 resize-none overflow-y-auto border-0 bg-transparent px-1 py-0 text-[18px] leading-7 text-[#202124] transition-[height,opacity] duration-300 ease-out placeholder:text-[#80868b] focus:border-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 ${
          compact ? 'h-14' : 'h-48'
        }`}
      />
      <div className="mt-3 border-b border-[#dadce0]" />
    </div>
  );
}
