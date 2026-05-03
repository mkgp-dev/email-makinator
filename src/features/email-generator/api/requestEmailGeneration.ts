import { API_BASE_URL } from '@/shared/config/env';
import { joinUrl } from '@/shared/utils/url';
import type {
  AiGenerateRequest,
  AiGenerateResponse,
} from '@/features/email-generator/types/emailGenerate.types';

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const maybeError = (payload as { error?: unknown }).error;
  if (!maybeError || typeof maybeError !== 'object') {
    return undefined;
  }
  const maybeMessage = (maybeError as { message?: unknown }).message;
  return typeof maybeMessage === 'string' ? maybeMessage : undefined;
}

export async function requestEmailGeneration(
  request: AiGenerateRequest,
  options?: { pollinationsKey?: string },
): Promise<AiGenerateResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.pollinationsKey) {
    headers.Authorization = `Bearer ${options.pollinationsKey}`;
  }

  const endpoint = joinUrl(API_BASE_URL, '/v1/ai/generate');

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error(
      'Could not connect to the email generation server. Please check your API URL or try again.',
    );
  }

  let data: AiGenerateResponse | null = null;
  let rawData: unknown = null;
  try {
    rawData = await response.json();
    data = rawData as AiGenerateResponse;
  } catch {
    data = null;
    rawData = null;
  }

  if (!response.ok) {
    if (data?.action === 'error' || data?.action === 'quota_unavailable') {
      throw new Error(data.error.message);
    }
    throw new Error(extractErrorMessage(rawData) ?? 'AI generation failed.');
  }

  if (!data) throw new Error('AI generation failed.');

  if (data.action === 'quota_unavailable' || data.action === 'error') {
    throw new Error(data.error.message ?? 'AI generation is temporarily unavailable.');
  }

  if (data.action !== 'generated' && data.action !== 'revised') {
    throw new Error('AI generation failed.');
  }

  if (!data.output.emailBody) throw new Error('AI did not return an email body.');

  return data;
}
