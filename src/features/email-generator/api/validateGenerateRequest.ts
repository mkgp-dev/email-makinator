import type { EmailDialogAction, EmailDialogPhase } from '@/features/email-generator/types/emailGenerate.types';

export function getGenerateValidationError(params: {
  phase: EmailDialogPhase;
  action: EmailDialogAction;
  context: string;
  importedDraft: string;
  replyContext: string;
}): string | null {
  if (!params.context.trim()) return 'Please provide what you want to write before generating.';

  if (params.phase !== 'initial') return null;

  if (params.action === 'improve_draft' && !params.importedDraft.trim()) return 'Import or write a draft first before improving it.';

  if (params.action === 'reply' && !params.replyContext.trim()) return 'I could not detect the email you are replying to. Please include enough context in your instruction.';

  return null;
}
