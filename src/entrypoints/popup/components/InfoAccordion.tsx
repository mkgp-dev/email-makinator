import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export function InfoAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = `popup-accordion-panel-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section className="rounded-lg border border-slate-800 bg-[#0f172a]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-[#142038]"
      >
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        <ChevronDown
          size={16}
          className={cn(
            'text-slate-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        id={panelId}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-800 px-3 pb-3 pt-2 text-xs leading-5 text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
