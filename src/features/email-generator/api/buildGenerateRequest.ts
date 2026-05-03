import type {
  AiGenerateRequest,
  EmailAiModel,
  EmailDialogAction,
  EmailDialogPhase,
  EmailPresetId,
  EmailTone,
} from '@/features/email-generator/types/emailGenerate.types';

type BuildRequestParams = {
  model: EmailAiModel;
  phase: EmailDialogPhase;
  action: EmailDialogAction;
  tone: EmailTone;
  preset: EmailPresetId;
  context: string;
  importedDraft: string;
  replyContext: string;
  resultEmail: string;
};

export function buildGenerateRequest(params: BuildRequestParams): AiGenerateRequest {
  const base = { service: 'email' as const, model: params.model };

  if (params.phase === 'revision') {
    return {
      ...base,
      input: {
        phase: 'revision',
        context: params.context,
        currentEmail: params.resultEmail,
      },
    };
  }

  if (params.action === 'generate_email') {
    return {
      ...base,
      input: {
        phase: 'initial',
        action: 'generate_email',
        tone: params.tone,
        preset: params.preset,
        context: params.context,
      },
    };
  }

  if (params.action === 'improve_draft') {
    return {
      ...base,
      input: {
        phase: 'initial',
        action: 'improve_draft',
        tone: params.tone,
        preset: params.preset,
        context: params.context,
        draft: params.importedDraft,
      },
    };
  }

  return {
    ...base,
    input: {
      phase: 'initial',
      action: 'reply',
      tone: params.tone,
      context: params.context,
      replyContext: params.replyContext,
    },
  };
}
