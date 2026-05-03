import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateEmail } from '../src/features/email-generator/api/generateEmail';
import type { AiGenerateRequest } from '../src/features/email-generator/types/emailGenerate.types';

const request: AiGenerateRequest = {
  service: 'email',
  model: 'gemini',
  input: {
    phase: 'initial',
    action: 'generate_email',
    tone: 'formal',
    preset: 'custom',
    context: 'hi',
  },
};

describe('generateEmail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('calls valid /v1/ai/generate URL from default base', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ action: 'generated', output: { emailBody: 'ok' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await generateEmail(request);

    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3000/v1/ai/generate');
  });

  test('omits Authorization header when no pollinationsKey exists', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ action: 'generated', output: { emailBody: 'ok' } }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await generateEmail(request);

    const called = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(called.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  test('includes Authorization header when pollinationsKey exists', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ action: 'generated', output: { emailBody: 'ok' } }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await generateEmail(request, { pollinationsKey: 'abc123' });

    const called = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(called.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer abc123',
    });
  });

  test('maps network failures to a friendly error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    await expect(generateEmail(request)).rejects.toThrow(
      'Could not connect to the email generation server. Please check your API URL or try again.',
    );
  });

  test('throws API error when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'bad request' } }),
      }),
    );

    await expect(generateEmail(request)).rejects.toThrow('bad request');
  });

  test('throws for quota_unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ action: 'quota_unavailable', error: { message: 'quota' } }),
      }),
    );

    await expect(generateEmail(request)).rejects.toThrow('quota');
  });

  test('throws when output.emailBody is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ action: 'generated', output: {} }),
      }),
    );

    await expect(generateEmail(request)).rejects.toThrow('AI did not return an email body.');
  });

  test('handles non-json error responses with fallback error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('invalid json');
        },
      }),
    );

    await expect(generateEmail(request)).rejects.toThrow('AI generation failed.');
  });

  test('uses runtime messaging path when browser.runtime.sendMessage exists', async () => {
    const sendMessage = vi.fn().mockResolvedValue({
      ok: true,
      data: { action: 'generated', output: { emailBody: 'from-bg' } },
    });
    vi.stubGlobal('browser', {
      runtime: {
        sendMessage,
      },
    });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await generateEmail(request, { pollinationsKey: 'token' });

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'email_makinator/generate',
      payload: {
        request,
        pollinationsKey: 'token',
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    if (result.action !== 'generated' && result.action !== 'revised') {
      throw new Error('Expected generated/revised response from background');
    }
    expect(result.output.emailBody).toBe('from-bg');
  });

  test('maps runtime messaging error responses', async () => {
    const sendMessage = vi.fn().mockResolvedValue({
      ok: false,
      error: 'background error',
    });
    vi.stubGlobal('browser', {
      runtime: {
        sendMessage,
      },
    });

    await expect(generateEmail(request)).rejects.toThrow('background error');
  });

  test('maps runtime transport failures to a friendly error', async () => {
    const sendMessage = vi
      .fn()
      .mockRejectedValue(new Error('Could not establish connection. Receiving end does not exist.'));
    vi.stubGlobal('browser', {
      runtime: {
        sendMessage,
      },
    });

    await expect(generateEmail(request)).rejects.toThrow(
      'Could not reach Email Makinator background service. Please reload Gmail and try again.',
    );
  });
});
