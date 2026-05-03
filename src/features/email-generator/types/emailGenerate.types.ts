export type EmailAiModel = 'gemini' | 'nova' | 'mistral' | 'openai';

export type EmailDialogPhase = 'initial' | 'revision';
export type EmailDialogAction = 'generate_email' | 'improve_draft' | 'reply';

export type EmailTone = 'formal' | 'casual';

export type EmailPresetId =
  | 'custom'
  | 'introduction'
  | 'follow_up'
  | 'request_information'
  | 'schedule_meeting'
  | 'thank_you'
  | 'job_application'
  | 'collaboration'
  | 'proposal'
  | 'apology'
  | 'confirmation'
  | 'decline_politely';

export type EmailGenerateInput =
  | {
      phase: 'initial';
      action: 'generate_email';
      tone: EmailTone;
      preset: EmailPresetId;
      context: string;
    }
  | {
      phase: 'initial';
      action: 'improve_draft';
      tone: EmailTone;
      preset: EmailPresetId;
      context: string;
      draft: string;
    }
  | {
      phase: 'initial';
      action: 'reply';
      tone: EmailTone;
      context: string;
      replyContext: string;
    }
  | {
      phase: 'revision';
      context: string;
      currentEmail: string;
    };

export type AiGenerateRequest = {
  service: 'email';
  model: EmailAiModel;
  input: EmailGenerateInput;
};

type AiBaseResponse = {
  warnings?: string[];
};

export type AiGenerateResponse =
  | (AiBaseResponse & {
      action: 'generated' | 'revised';
      output: {
        emailBody: string;
      };
    })
  | (AiBaseResponse & {
      action: 'quota_unavailable' | 'error';
      error: {
        message: string;
      };
    });
