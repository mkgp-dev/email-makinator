// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearComposers,
  getComposer,
  getComposers,
  removeComposer,
  removeDisconnectedComposers,
  setComposer,
} from '../src/features/gmail/composerRegistry';
import type { GmailComposer } from '../src/features/gmail/gmailTypes';

function makeComposer(sessionId: string): GmailComposer {
  const container = document.createElement('div');
  const editor = document.createElement('div');
  const toolbar = document.createElement('div');
  container.appendChild(editor);
  container.appendChild(toolbar);
  return {
    sessionId,
    mode: 'new_email',
    container,
    editor,
    toolbar,
  };
}

describe('composerRegistry', () => {
  beforeEach(() => {
    clearComposers();
    document.body.innerHTML = '';
  });

  test('removes a composer by session id', () => {
    const composer = makeComposer('s1');
    setComposer(composer);
    expect(getComposer('s1')).toBeDefined();

    removeComposer('s1');

    expect(getComposer('s1')).toBeUndefined();
  });

  test('prunes disconnected composers', () => {
    const connected = makeComposer('connected');
    const disconnected = makeComposer('disconnected');
    document.body.appendChild(connected.container);
    setComposer(connected);
    setComposer(disconnected);

    removeDisconnectedComposers();

    expect(getComposer('connected')).toBeDefined();
    expect(getComposer('disconnected')).toBeUndefined();
    expect(getComposers()).toHaveLength(1);
  });
});
