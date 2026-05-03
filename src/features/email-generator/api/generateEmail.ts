import type {
  AiGenerateRequest,
  AiGenerateResponse,
} from '@/features/email-generator/types/emailGenerate.types';
import { requestEmailGeneration } from '@/features/email-generator/api/requestEmailGeneration';
import {
  EMAIL_MAKINATOR_GENERATE,
  type EmailMakinatorGenerateMessage,
  type EmailMakinatorGenerateResponse,
} from '@/shared/runtime/messages';

const RUNTIME_TRANSPORT_ERROR_PATTERNS = [
  'receiving end does not exist',
  'message port closed',
  'the message port closed before a response was received',
  'extension context invalidated',
];

function mapRuntimeError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('AI generation failed.');
  }

  const message = error.message.toLowerCase();
  const isRuntimeTransportError = RUNTIME_TRANSPORT_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );

  if (isRuntimeTransportError) {
    return new Error('Could not reach Email Makinator background service. Please reload Gmail and try again.');
  }

  return error;
}

export async function generateEmail(
  request: AiGenerateRequest,
  options?: { pollinationsKey?: string },
): Promise<AiGenerateResponse> {
  if (typeof browser === 'undefined' || !browser?.runtime?.sendMessage) return requestEmailGeneration(request, options);

  const message: EmailMakinatorGenerateMessage = {
    type: EMAIL_MAKINATOR_GENERATE,
    payload: {
      request,
      pollinationsKey: options?.pollinationsKey,
    },
  };

  try {
    const response = (await browser.runtime.sendMessage(message)) as
      | EmailMakinatorGenerateResponse
      | undefined;

    if (!response) throw new Error('No response from background service.');

    if (!response.ok) throw new Error(response.error || 'AI generation failed.');

    return response.data;
  } catch (error) {
    throw mapRuntimeError(error);
  }
}
