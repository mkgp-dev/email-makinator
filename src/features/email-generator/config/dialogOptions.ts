import {
  type EmailDialogAction,
  type EmailTone,
} from '@/features/email-generator/types/emailGenerate.types';
import { TONE_OPTIONS } from '@/features/email-generator/config/emailOptions';
import type { DialogOption } from '@/features/email-generator/types/dialog.types';

const TONE_DESCRIPTIONS: Record<EmailTone, string> = {
  formal: 'Professional and polished language for business communication.',
  casual: 'Friendly and relaxed tone for everyday conversations.',
};

export const DIALOG_TONE_OPTIONS: readonly DialogOption<EmailTone>[] = TONE_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
    description: TONE_DESCRIPTIONS[option.value],
  }),
);

const DIALOG_MODE_OPTIONS_BASE: readonly DialogOption<EmailDialogAction>[] = [
  {
    value: 'generate_email',
    label: 'Generate',
    description: 'Create a fresh email from your prompt.',
  },
  {
    value: 'improve_draft',
    label: 'Improve',
    description: 'Refine your imported draft tone and clarity.',
  },
  {
    value: 'reply',
    label: 'Reply',
    description: 'Draft a response using reply context.',
  },
];

export function buildDialogModeOptions(params: {
  canSelectDraft: boolean;
  canSelectReply: boolean;
}): DialogOption<EmailDialogAction>[] {
  return DIALOG_MODE_OPTIONS_BASE.map((option) => {
    if (option.value === 'improve_draft') {
      return { ...option, disabled: !params.canSelectDraft };
    }
    if (option.value === 'reply') {
      return { ...option, disabled: !params.canSelectReply };
    }
    return { ...option };
  });
}
