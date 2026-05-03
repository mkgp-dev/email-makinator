import { describe, expect, test } from 'vitest';
import { buildGenerateRequest } from '../src/features/email-generator/api/buildGenerateRequest';

const base = {
  model: 'gemini' as const,
  tone: 'formal' as const,
  preset: 'schedule_meeting' as const,
  context: 'Write to client',
  importedDraft: 'old draft',
  replyContext: 'incoming thread',
  resultEmail: 'latest result',
};

describe('buildGenerateRequest', () => {
  test('maps generate_email with tone/preset/context only', () => {
    const req = buildGenerateRequest({ ...base, phase: 'initial', action: 'generate_email' });

    expect(req).toEqual({
      service: 'email',
      model: 'gemini',
      input: {
        phase: 'initial',
        action: 'generate_email',
        tone: 'formal',
        preset: 'schedule_meeting',
        context: 'Write to client',
      },
    });
  });

  test('maps improve_draft and includes draft', () => {
    const req = buildGenerateRequest({ ...base, phase: 'initial', action: 'improve_draft' });

    expect(req.input).toEqual({
      phase: 'initial',
      action: 'improve_draft',
      tone: 'formal',
      preset: 'schedule_meeting',
      context: 'Write to client',
      draft: 'old draft',
    });
  });

  test('maps reply and excludes preset/draft/currentEmail', () => {
    const req = buildGenerateRequest({ ...base, phase: 'initial', action: 'reply' });

    expect(req.input).toEqual({
      phase: 'initial',
      action: 'reply',
      tone: 'formal',
      context: 'Write to client',
      replyContext: 'incoming thread',
    });
    expect('preset' in req.input).toBe(false);
    expect('draft' in req.input).toBe(false);
    expect('currentEmail' in req.input).toBe(false);
  });

  test('maps revision with context and currentEmail only', () => {
    const req = buildGenerateRequest({ ...base, phase: 'revision', action: 'reply' });

    expect(req.input).toEqual({
      phase: 'revision',
      context: 'Write to client',
      currentEmail: 'latest result',
    });
    expect('action' in req.input).toBe(false);
    expect('tone' in req.input).toBe(false);
    expect('preset' in req.input).toBe(false);
    expect('draft' in req.input).toBe(false);
    expect('replyContext' in req.input).toBe(false);
  });
});
