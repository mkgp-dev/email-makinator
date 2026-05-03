import { describe, expect, test } from 'vitest';
import { useEmailDialogStore } from '../src/features/email-generator/stores/emailDialogStore';

function resetStore() {
  useEmailDialogStore.getState().open('session', 'new_email');
}

describe('emailDialogStore draft flow', () => {
  test('open with detected draft keeps imported draft empty until import', () => {
    resetStore();

    useEmailDialogStore.getState().setDetectedDraft('Existing draft in gmail');

    expect(useEmailDialogStore.getState().detectedDraft).toBe('Existing draft in gmail');
    expect(useEmailDialogStore.getState().importedDraft).toBe('');
  });

  test('import draft copies detectedDraft and switches action', () => {
    resetStore();

    useEmailDialogStore.getState().setDetectedDraft('Draft body');
    useEmailDialogStore
      .getState()
      .setImportedDraft(useEmailDialogStore.getState().detectedDraft);
    useEmailDialogStore.getState().setAction('improve_draft');

    expect(useEmailDialogStore.getState().importedDraft).toBe('Draft body');
    expect(useEmailDialogStore.getState().action).toBe('improve_draft');
  });

  test('after generation phase becomes revision so import flow is unavailable', () => {
    resetStore();
    useEmailDialogStore.getState().applyResult('Generated email');

    expect(useEmailDialogStore.getState().phase).toBe('revision');
  });

  test('ignores stale generation result after close and reopen', () => {
    resetStore();
    const requestId = useEmailDialogStore.getState().beginGeneration();

    useEmailDialogStore.getState().close();
    useEmailDialogStore.getState().open('session-2', 'new_email');

    const applied = useEmailDialogStore.getState().applyResult('Old result', requestId);

    expect(applied).toBe(false);
    expect(useEmailDialogStore.getState().resultEmail).toBe('');
    expect(useEmailDialogStore.getState().phase).toBe('initial');
  });

  test('rejects empty result body and keeps initial phase', () => {
    resetStore();
    const requestId = useEmailDialogStore.getState().beginGeneration();

    const applied = useEmailDialogStore.getState().applyResult('   ', requestId);

    expect(applied).toBe(false);
    expect(useEmailDialogStore.getState().phase).toBe('initial');
    expect(useEmailDialogStore.getState().resultEmail).toBe('');
  });
});
