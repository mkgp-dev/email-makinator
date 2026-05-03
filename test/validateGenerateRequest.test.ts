import { describe, expect, test } from 'vitest';
import { getGenerateValidationError } from '../src/features/email-generator/api/validateGenerateRequest';

describe('getGenerateValidationError', () => {
  test('blocks when context is empty', () => {
    expect(
      getGenerateValidationError({
        phase: 'initial',
        action: 'generate_email',
        context: '   ',
        importedDraft: 'x',
        replyContext: 'x',
      }),
    ).toBe('Please provide what you want to write before generating.');
  });

  test('blocks improve_draft when imported draft is empty', () => {
    expect(
      getGenerateValidationError({
        phase: 'initial',
        action: 'improve_draft',
        context: 'write something',
        importedDraft: '   ',
        replyContext: 'x',
      }),
    ).toBe('Import or write a draft first before improving it.');
  });

  test('blocks reply when reply context is empty', () => {
    expect(
      getGenerateValidationError({
        phase: 'initial',
        action: 'reply',
        context: 'reply to this',
        importedDraft: 'x',
        replyContext: ' ',
      }),
    ).toBe(
      'I could not detect the email you are replying to. Please include enough context in your instruction.',
    );
  });

  test('returns null for valid reply', () => {
    expect(
      getGenerateValidationError({
        phase: 'initial',
        action: 'reply',
        context: 'reply to this',
        importedDraft: '',
        replyContext: 'thread text',
      }),
    ).toBeNull();
  });
});
