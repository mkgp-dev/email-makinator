import { describe, expect, test } from 'vitest';
import { buildDialogModeOptions, DIALOG_TONE_OPTIONS } from '../src/features/email-generator/config/dialogOptions';
import { TONE_OPTIONS } from '../src/features/email-generator/config/emailOptions';

describe('dialog options config', () => {
  test('dialog tone options are derived from tone options', () => {
    expect(DIALOG_TONE_OPTIONS.map((option) => option.value)).toEqual(
      TONE_OPTIONS.map((option) => option.value),
    );
    expect(DIALOG_TONE_OPTIONS.map((option) => option.label)).toEqual(
      TONE_OPTIONS.map((option) => option.label),
    );
  });

  test('mode options apply disabled flags from params', () => {
    const disabledAll = buildDialogModeOptions({
      canSelectDraft: false,
      canSelectReply: false,
    });
    expect(disabledAll.find((option) => option.value === 'improve_draft')?.disabled).toBe(true);
    expect(disabledAll.find((option) => option.value === 'reply')?.disabled).toBe(true);
    expect(disabledAll.find((option) => option.value === 'generate_email')?.disabled).toBeUndefined();
  });

  test('mode options are not shared mutable instances between calls', () => {
    const first = buildDialogModeOptions({ canSelectDraft: true, canSelectReply: true });
    first[0]!.label = 'Mutated';

    const second = buildDialogModeOptions({ canSelectDraft: true, canSelectReply: true });
    expect(second[0]!.label).toBe('Generate');
  });
});
