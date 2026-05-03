import type { EmailAiModel, EmailPresetId, EmailTone } from '@/features/email-generator/types/emailGenerate.types';

export const MODEL_OPTIONS: ReadonlyArray<{
  value: EmailAiModel;
  label: string;
  description: string;
}> = [
  {
    value: 'gemini',
    label: 'Gemini 2.5 Flash Lite',
    description: 'Default model for most email writing.',
  },
  {
    value: 'nova',
    label: 'Nova Micro',
    description: 'Alternative lightweight model for general writing.',
  },
  {
    value: 'mistral',
    label: 'Mistral Small 3.2',
    description: 'Useful alternative for concise rewriting.',
  },
  {
    value: 'openai',
    label: 'GPT-5.4 Nano',
    description: 'Alternative model option for polished email writing.',
  },
];

export const TONE_OPTIONS: ReadonlyArray<{
  value: EmailTone;
  label: string;
}> = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
];

export const PRESET_OPTIONS: ReadonlyArray<{
  value: EmailPresetId;
  label: string;
  description?: string;
}> = [
  { value: 'custom', label: 'Custom', description: 'General email based on your instruction.' },
  {
    value: 'introduction',
    label: 'Introduction',
    description: 'Introduce yourself, a project, topic, or purpose.',
  },
  {
    value: 'follow_up',
    label: 'Follow up',
    description: 'Follow up after a previous interaction or no response.',
  },
  {
    value: 'request_information',
    label: 'Request information',
    description: 'Ask for information, updates, documents, or clarification.',
  },
  {
    value: 'schedule_meeting',
    label: 'Schedule meeting',
    description: 'Ask to schedule a call, interview, or meeting.',
  },
  { value: 'thank_you', label: 'Thank you', description: 'Express appreciation.' },
  {
    value: 'job_application',
    label: 'Job application',
    description: 'Apply for a job or contact a recruiter/employer.',
  },
  {
    value: 'collaboration',
    label: 'Collaboration',
    description: 'Propose collaboration, partnership, or shared work.',
  },
  {
    value: 'proposal',
    label: 'Proposal',
    description: 'Pitch an idea, service, project, or solution.',
  },
  {
    value: 'apology',
    label: 'Apology',
    description: 'Apologize for a delay, mistake, missed message, or inconvenience.',
  },
  {
    value: 'confirmation',
    label: 'Confirmation',
    description: 'Confirm attendance, receipt, availability, agreement, or completion.',
  },
  {
    value: 'decline_politely',
    label: 'Decline politely',
    description: 'Politely decline a request, invitation, offer, or opportunity.',
  },
];

