import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';
import {
  type EmailDialogAction,
  type EmailPresetId,
  type EmailTone,
} from '@/features/email-generator/types/emailGenerate.types';
import { PRESET_OPTIONS } from '@/features/email-generator/config/emailOptions';
import { DialogDropdown } from '@/features/email-generator/components/DialogDropdown';
import type { DialogOption } from '@/features/email-generator/types/dialog.types';
import {
  buildDialogModeOptions,
  DIALOG_TONE_OPTIONS,
} from '@/features/email-generator/config/dialogOptions';

export function DialogFooter({
  phase,
  canSelectReply,
  canSelectDraft,
  action,
  tone,
  preset,
  isGenerating,
  onActionChange,
  onToneChange,
  onPresetChange,
  onSubmit,
  canSubmit,
  canUseEmail,
  onUseEmail,
}: {
  phase: 'initial' | 'revision';
  canSelectReply: boolean;
  canSelectDraft: boolean;
  action: EmailDialogAction;
  tone: EmailTone;
  preset: EmailPresetId;
  isGenerating: boolean;
  onActionChange: (action: EmailDialogAction) => void;
  onToneChange: (tone: EmailTone) => void;
  onPresetChange: (preset: EmailPresetId) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  canUseEmail: boolean;
  onUseEmail: () => void;
}) {
  const showPreset = phase === 'initial' && action !== 'reply';

  const mainLabel =
    phase === 'revision'
      ? 'Revise'
      : action === 'generate_email'
        ? 'Generate email'
        : action === 'improve_draft'
          ? 'Improve draft'
          : 'Reply';

  const toneMenuOptions = DIALOG_TONE_OPTIONS;

  const presetMenuOptions = useMemo<DialogOption<EmailPresetId>[]>(
    () =>
      PRESET_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        description: option.description,
      })),
    [],
  );

  const actionMenuOptions: DialogOption<EmailDialogAction>[] = useMemo(
    () =>
      buildDialogModeOptions({
        canSelectDraft,
        canSelectReply,
      }),
    [canSelectDraft, canSelectReply],
  );

  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      {phase === 'initial' ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <DialogDropdown label="Tone" value={tone} options={toneMenuOptions} onChange={onToneChange} />
          {showPreset ? (
            <DialogDropdown
              label="Preset"
              value={preset}
              options={presetMenuOptions}
              onChange={onPresetChange}
              minWidthClass="min-w-40"
            />
          ) : null}
          <DialogDropdown
            label="Mode"
            value={action}
            options={actionMenuOptions}
            onChange={onActionChange}
            minWidthClass="min-w-36"
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center gap-2">
        {canUseEmail ? (
          <button
            type="button"
            onClick={onUseEmail}
            className="inline-flex h-10 items-center rounded-full bg-[#0b57d0] px-4 text-sm font-medium text-white transition hover:bg-[#1a73e8]"
          >
            Use this email
          </button>
        ) : null}
        <button
          type="button"
          disabled={isGenerating || !canSubmit}
          onClick={onSubmit}
          aria-label={isGenerating ? `${mainLabel} in progress` : mainLabel}
          title={mainLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b57d0] text-white transition hover:bg-[#1a73e8] disabled:cursor-not-allowed disabled:bg-[#9aa0a6]"
        >
          {isGenerating ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
