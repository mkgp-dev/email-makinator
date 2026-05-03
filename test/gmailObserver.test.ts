// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { GmailComposer } from '../src/features/gmail/gmailTypes';

const injectButton = vi.fn();
const clearComposers = vi.fn();
const removeDisconnectedComposers = vi.fn();

const container = document.createElement('div');
const editor = document.createElement('div');
editor.setAttribute('role', 'textbox');
const toolbar = document.createElement('div');

const composer: GmailComposer = {
  sessionId: 's1',
  mode: 'new_email',
  container,
  editor,
  toolbar,
};

vi.mock('../src/features/gmail/gmailComposer', () => ({
  findComposeContainers: () => [container],
  resolveGmailComposer: () => composer,
  resolveGmailComposerFromContainer: () => composer,
}));

vi.mock('../src/features/gmail/composerRegistry', () => ({
  clearComposers: () => clearComposers(),
  removeDisconnectedComposers: () => removeDisconnectedComposers(),
}));

vi.mock('../src/features/gmail/gmailDebug', () => ({
  debugLog: () => undefined,
}));

vi.mock('../src/features/gmail/gmailSelectors', () => ({
  isGmailBodyEditorCandidate: () => false,
}));

vi.mock('../src/features/gmail/injectButton', () => ({
  injectButton: (...args: unknown[]) => injectButton(...args),
}));

import { startGmailObserver } from '../src/features/gmail/gmailObserver';

type MutationObserverCallback = (mutations: MutationRecord[], observer: MutationObserver) => void;

let mutationCallback: MutationObserverCallback | null = null;
const OriginalMutationObserver = globalThis.MutationObserver;

class MockMutationObserver {
  callback: MutationObserverCallback;

  constructor(callback: MutationObserverCallback) {
    this.callback = callback;
    mutationCallback = callback;
  }

  observe(): void {}

  disconnect(): void {}
}

describe('startGmailObserver', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mutationCallback = null;
    globalThis.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;
  });

  test('cancels pending debounced scans on cleanup', () => {
    const cleanup = startGmailObserver();
    expect(injectButton).toHaveBeenCalledTimes(1);

    mutationCallback?.([], {} as MutationObserver);
    cleanup();
    vi.advanceTimersByTime(200);

    expect(injectButton).toHaveBeenCalledTimes(1);
    expect(clearComposers).toHaveBeenCalledTimes(1);
    expect(removeDisconnectedComposers).toHaveBeenCalled();
  });

  test('clears delayed rescan timers on cleanup', () => {
    const cleanup = startGmailObserver();
    expect(injectButton).toHaveBeenCalledTimes(1);

    cleanup();
    vi.advanceTimersByTime(4000);

    expect(injectButton).toHaveBeenCalledTimes(1);
  });
});

afterEach(() => {
  vi.useRealTimers();
  globalThis.MutationObserver = OriginalMutationObserver;
});
