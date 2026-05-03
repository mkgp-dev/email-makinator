import { storage } from '#imports';
import type { EmailAiModel } from '@/features/email-generator/types/emailGenerate.types';

export type EmailMakinatorSettings = {
  pollinationsKey?: string;
  preferredModel: EmailAiModel;
};

export const DEFAULT_SETTINGS: EmailMakinatorSettings = {
  preferredModel: 'gemini',
};

const VALID_MODELS = new Set<EmailAiModel>(['gemini', 'nova', 'mistral', 'openai']);

export const emailMakinatorSettingsItem =
  storage.defineItem<EmailMakinatorSettings>('local:email-makinator-settings', {
    fallback: DEFAULT_SETTINGS,
  });

export function isEmailAiModel(value: unknown): value is EmailAiModel {
  return typeof value === 'string' && VALID_MODELS.has(value as EmailAiModel);
}

export function normalizeSettings(value: unknown): EmailMakinatorSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS;
  }

  const record = value as Partial<EmailMakinatorSettings>;

  return {
    preferredModel: isEmailAiModel(record.preferredModel)
      ? record.preferredModel
      : DEFAULT_SETTINGS.preferredModel,
    pollinationsKey:
      typeof record.pollinationsKey === 'string' && record.pollinationsKey.trim()
        ? record.pollinationsKey.trim()
        : undefined,
  };
}

export async function getEmailMakinatorSettings(): Promise<EmailMakinatorSettings> {
  const stored = await emailMakinatorSettingsItem.getValue();
  return normalizeSettings(stored);
}

export async function saveEmailMakinatorSettings(
  settings: EmailMakinatorSettings,
): Promise<void> {
  await emailMakinatorSettingsItem.setValue(normalizeSettings(settings));
}
