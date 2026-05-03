import type {
  AiGenerateRequest,
  AiGenerateResponse,
} from '@/features/email-generator/types/emailGenerate.types';

export const EMAIL_MAKINATOR_GENERATE = 'email_makinator/generate';

export type EmailMakinatorGenerateMessage = {
  type: typeof EMAIL_MAKINATOR_GENERATE;
  payload: {
    request: AiGenerateRequest;
    pollinationsKey?: string;
  };
};

export type EmailMakinatorGenerateSuccess = {
  ok: true;
  data: AiGenerateResponse;
};

export type EmailMakinatorGenerateFailure = {
  ok: false;
  error: string;
};

export type EmailMakinatorGenerateResponse =
  | EmailMakinatorGenerateSuccess
  | EmailMakinatorGenerateFailure;
