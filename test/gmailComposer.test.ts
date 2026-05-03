// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { resolveGmailComposerFromContainer } from '../src/features/gmail/gmailComposer';

function setVisibleRect(element: HTMLElement, width = 500, height = 40) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => ({ width, height, top: 10, left: 10, right: 10 + width, bottom: 10 + height }),
    configurable: true,
  });
}

function makeContainer(): HTMLElement {
  const container = document.createElement('div');
  setVisibleRect(container, 600, 400);

  const editor = document.createElement('div');
  editor.setAttribute('role', 'textbox');
  editor.setAttribute('contenteditable', 'true');
  editor.setAttribute('g_editable', 'true');
  editor.setAttribute('aria-label', 'Message Body');
  setVisibleRect(editor, 500, 220);

  container.appendChild(editor);
  document.body.appendChild(container);
  return container;
}

describe('gmailComposer mode detection', () => {
  test('classifies compose with visible subject box as new_email', () => {
    const container = makeContainer();
    const subject = document.createElement('input');
    subject.setAttribute('name', 'subjectbox');
    setVisibleRect(subject, 300, 24);
    container.appendChild(subject);

    const composer = resolveGmailComposerFromContainer(container);
    expect(composer?.mode).toBe('new_email');
  });

  test('classifies compose with reply markers as reply', () => {
    const container = makeContainer();
    const quote = document.createElement('blockquote');
    quote.className = 'gmail_quote';
    container.appendChild(quote);

    const composer = resolveGmailComposerFromContainer(container);
    expect(composer?.mode).toBe('reply');
  });
});

