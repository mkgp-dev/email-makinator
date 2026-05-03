// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest';
import {
  findGmailBodyEditors,
  isGmailBodyEditorCandidate,
} from '../src/features/gmail/gmailSelectors';

function makeVisible(element: HTMLElement, width = 500, height = 300) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => ({ width, height, top: 0, left: 0, right: width, bottom: height }),
    configurable: true,
  });
}

describe('gmail selector candidates', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('accepts visible message body editor with g_editable=true', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-label', 'Message Body');
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('g_editable', 'true');
    makeVisible(el);
    document.body.appendChild(el);

    expect(isGmailBodyEditorCandidate(el)).toBe(true);
  });

  test('accepts visible editable textbox class fallback', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'textbox');
    el.setAttribute('contenteditable', 'true');
    el.className = 'editable';
    makeVisible(el);
    document.body.appendChild(el);

    expect(isGmailBodyEditorCandidate(el)).toBe(true);
  });

  test('rejects ask gemini combobox-like element', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'combobox');
    el.setAttribute('aria-label', 'Ask Gemini');
    el.setAttribute('contenteditable', 'true');
    makeVisible(el, 0, 0);
    document.body.appendChild(el);

    expect(isGmailBodyEditorCandidate(el)).toBe(false);
  });

  test('rejects zero-size elements', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-label', 'Message Body');
    el.setAttribute('contenteditable', 'true');
    makeVisible(el, 0, 0);
    document.body.appendChild(el);

    expect(isGmailBodyEditorCandidate(el)).toBe(false);
  });

  test('findGmailBodyEditors dedupes and includes activeElement', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-label', 'Message Body');
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('g_editable', 'true');
    makeVisible(el);
    document.body.appendChild(el);

    Object.defineProperty(document, 'activeElement', {
      value: el,
      configurable: true,
    });

    const found = findGmailBodyEditors();
    expect(found.length).toBe(1);
    expect(found[0]).toBe(el);
  });
});
