import { beforeEach, describe, expect, test, vi } from 'vitest';

const getValue = vi.fn();
const setValue = vi.fn();

vi.mock('#imports', () => ({
  storage: {
    defineItem: () => ({
      getValue,
      setValue,
    }),
  },
}));

const module = await import('../src/shared/storage/settingsStorage');
const {
  DEFAULT_SETTINGS,
  getEmailMakinatorSettings,
  normalizeSettings,
  saveEmailMakinatorSettings,
} = module;

beforeEach(() => {
  getValue.mockReset();
  setValue.mockReset();
});

describe('settingsStorage', () => {
  test('normalizeSettings returns defaults for null/undefined/non-object', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings('bad')).toEqual(DEFAULT_SETTINGS);
  });

  test('normalizeSettings falls back to gemini for invalid preferredModel', () => {
    expect(normalizeSettings({ preferredModel: 'bad-model', pollinationsKey: 'x' })).toEqual({
      preferredModel: 'gemini',
      pollinationsKey: 'x',
    });
  });

  test('normalizeSettings trims pollinationsKey', () => {
    expect(normalizeSettings({ preferredModel: 'nova', pollinationsKey: '  abc  ' })).toEqual({
      preferredModel: 'nova',
      pollinationsKey: 'abc',
    });
  });

  test('getEmailMakinatorSettings returns normalized storage value', async () => {
    getValue.mockResolvedValue({ preferredModel: 'bad-model', pollinationsKey: '  x  ' });

    await expect(getEmailMakinatorSettings()).resolves.toEqual({
      preferredModel: 'gemini',
      pollinationsKey: 'x',
    });
  });

  test('saveEmailMakinatorSettings stores normalized settings', async () => {
    await saveEmailMakinatorSettings({
      preferredModel: 'openai',
      pollinationsKey: '  key  ',
    });

    expect(setValue).toHaveBeenCalledWith({
      preferredModel: 'openai',
      pollinationsKey: 'key',
    });
  });
});
