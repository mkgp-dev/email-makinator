import { useEffect, type PropsWithChildren } from 'react';

export function Dialog({
  children,
  onClose,
  ariaLabel,
  ariaLabelledBy,
}: PropsWithChildren<{
  onClose: () => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}>) {
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('keydown', onKeydown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/32 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? 'Dialog')}
        aria-labelledby={ariaLabelledBy}
        className="h-full max-h-[calc(80vh-2rem)] w-full max-w-5xl overflow-hidden rounded-sm border border-[#dadce0] bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)]"
        style={{
          fontFamily:
            '"Google Sans Flex","Google Sans Text","Google Sans",Roboto,Arial,sans-serif',
        }}
      >
        {children}
      </div>
    </div>
  );
}
