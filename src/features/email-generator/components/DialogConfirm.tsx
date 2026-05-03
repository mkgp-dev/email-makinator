import { useEffect } from 'react';

export function DialogConfirm({
  onReplace,
  onAppend,
  onCancel,
}: {
  onReplace: () => void;
  onAppend: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onEscape);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/45 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#dadce0] bg-white px-6 py-5 shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)]"
        role="dialog"
        aria-modal="true"
        aria-label="Choose how to insert generated email"
        onClick={(event) => event.stopPropagation()}
        style={{
          fontFamily:
            '"Google Sans Flex","Google Sans Text","Google Sans",Roboto,Arial,sans-serif',
        }}
      >
        <h3 className="text-lg font-normal text-[#202124]">Existing draft detected</h3>
        <p className="mt-2 text-sm leading-6 text-[#5f6368]">
          Your email composer already has content. Choose how you want to add the generated email.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-[#1a73e8] hover:bg-[#f1f3f4]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAppend}
            className="inline-flex h-9 items-center rounded-md border border-[#dadce0] bg-white px-4 text-sm font-medium text-[#1f1f1f] hover:bg-[#f8f9fa]"
          >
            Insert below
          </button>
          <button
            type="button"
            onClick={onReplace}
            className="inline-flex h-9 items-center rounded-md bg-[#1a73e8] px-4 text-sm font-medium text-white hover:bg-[#1765cc]"
          >
            Replace draft
          </button>
        </div>
      </div>
    </div>
  );
}
