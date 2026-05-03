import { describe, expect, test } from 'vitest';
import {
  type EmailTone,
} from '../src/features/email-generator/types/emailGenerate.types';
import { MODEL_OPTIONS, PRESET_OPTIONS, TONE_OPTIONS } from '../src/features/email-generator/config/emailOptions';
import { useEmailDialogStore } from '../src/features/email-generator/stores/emailDialogStore';

describe('type/options contract', () => {
  test('tone options only contain formal and casual', () => {
    expect(TONE_OPTIONS.map((option) => option.value)).toEqual(['formal', 'casual']);
  });

  test('tone options align with EmailTone union', () => {
    const toneValues = TONE_OPTIONS.map((option) => option.value);
    const expected: EmailTone[] = ['formal', 'casual'];
    expect(toneValues).toEqual(expected);
  });

  test('preset options contain all backend-supported presets', () => {
    expect(PRESET_OPTIONS.map((option) => option.value)).toEqual([
      'custom',
      'introduction',
      'follow_up',
      'request_information',
      'schedule_meeting',
      'thank_you',
      'job_application',
      'collaboration',
      'proposal',
      'apology',
      'confirmation',
      'decline_politely',
    ]);
  });

  test('model options contain all supported model ids', () => {
    expect(MODEL_OPTIONS.map((option) => option.value)).toEqual([
      'gemini',
      'nova',
      'mistral',
      'openai',
    ]);
  });

  test('default tone is formal', () => {
    useEmailDialogStore.getState().open('s1', 'new_email');
    expect(useEmailDialogStore.getState().tone).toBe('formal');
  });
});
