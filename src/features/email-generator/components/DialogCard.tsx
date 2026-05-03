import { LoaderCircle, Mail } from 'lucide-react';

export function DialogCard({
  resultEmail,
  importedDraft,
  isLoading,
  loadingLabel,
}: {
  resultEmail: string;
  importedDraft: string;
  isLoading: boolean;
  loadingLabel?: string;
}) {
  const content = resultEmail || importedDraft;

  if (isLoading) {
    return (
      <div
        className="h-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 transition-[opacity,transform] duration-250 ease-out"
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-zinc-500">
          <LoaderCircle size={34} strokeWidth={1.8} className="animate-spin" aria-hidden />
          <p className="max-w-sm text-sm">{loadingLabel ?? 'Please wait while we load the content.'}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 transition-[opacity,transform] duration-250 ease-out">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-zinc-400">
          <Mail size={40} strokeWidth={1.75} aria-hidden />
          <p className="max-w-sm text-sm">
            Start generating your email with AI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-800 transition-[opacity,transform] duration-250 ease-out">
      {content}
    </div>
  );
}
