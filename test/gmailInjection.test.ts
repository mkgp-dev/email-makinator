// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { injectButton } from '../src/features/gmail/injectButton';
import type { GmailComposer } from '../src/features/gmail/gmailTypes';

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: () => ({
      render: () => undefined,
      unmount: () => undefined,
    }),
  },
  createRoot: () => ({
    render: () => undefined,
    unmount: () => undefined,
  }),
}));

function makeComposer(
  sessionId: string,
  options?: { toolbar?: boolean; hiddenToolbar?: boolean },
): GmailComposer {
  const container = document.createElement('div');
  const editorParent = document.createElement('div');
  const editor = document.createElement('div');
  editor.setAttribute('role', 'textbox');

  Object.defineProperty(container, 'getBoundingClientRect', {
    value: () => ({ width: 600, height: 400, top: 100, left: 100, right: 700, bottom: 500 }),
    configurable: true,
  });
  Object.defineProperty(editorParent, 'getBoundingClientRect', {
    value: () => ({ width: 560, height: 360, top: 120, left: 120, right: 680, bottom: 480 }),
    configurable: true,
  });
  Object.defineProperty(editor, 'getBoundingClientRect', {
    value: () => ({ width: 550, height: 350, top: 130, left: 130, right: 680, bottom: 480 }),
    configurable: true,
  });

  editorParent.appendChild(editor);
  container.appendChild(editorParent);

  let toolbar: HTMLElement | undefined;
  if (options?.toolbar) {
    toolbar = document.createElement('div');
    const table = document.createElement('table');
    const row = document.createElement('tr');
    const sendTd = document.createElement('td');
    const sendButton = document.createElement('button');
    sendButton.setAttribute('data-tooltip', 'Send');
    sendButton.setAttribute('aria-label', 'Send');
    sendTd.appendChild(sendButton);
    row.appendChild(sendTd);
    table.appendChild(row);
    toolbar.appendChild(table);
    Object.defineProperty(toolbar, 'getBoundingClientRect', {
      value: () => ({
        width: options.hiddenToolbar ? 0 : 500,
        height: options.hiddenToolbar ? 0 : 40,
        top: 460,
        left: 120,
        right: 620,
        bottom: 500,
      }),
      configurable: true,
    });
    if (options.hiddenToolbar) {
      toolbar.style.display = 'none';
    }
    container.appendChild(toolbar);
  }

  document.body.appendChild(container);

  return {
    sessionId,
    mode: 'new_email',
    container,
    editor,
    toolbar,
  };
}

describe('injectButton toolbar-only', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('injects only when toolbar is visible', () => {
    const composer = makeComposer('s1', { toolbar: true });

    injectButton(composer);

    const wrappers = composer.container.querySelectorAll('[data-email-makinator-button-wrapper="true"]');
    const buttons = composer.container.querySelectorAll('[data-email-makinator-button="true"]');
    expect(wrappers.length).toBe(1);
    expect(buttons.length).toBe(1);
    expect(Array.from(buttons).every((el) => el.tagName === 'BUTTON')).toBe(true);
    const button = buttons[0] as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Open Email Makinator');
    expect(button.getAttribute('data-tooltip-position')).toBe('top');
    const injectedWrapper = composer.container.querySelector(
      '[data-email-makinator-button-wrapper="true"]',
    ) as HTMLElement | null;
    expect(injectedWrapper).not.toBeNull();
    expect(injectedWrapper?.querySelector('[data-email-makinator-button="true"]')).toBe(button);
  });

  test('defers injection when toolbar is missing', () => {
    const composer = makeComposer('s2', { toolbar: false });

    injectButton(composer);

    expect(composer.container.querySelector('[data-email-makinator-button="true"]')).toBeNull();
  });

  test('defers injection when toolbar is hidden', () => {
    const composer = makeComposer('s3', { toolbar: true, hiddenToolbar: true });

    injectButton(composer);

    expect(composer.container.querySelector('[data-email-makinator-button="true"]')).toBeNull();
  });

  test('does not duplicate per session when toolbar is visible', () => {
    const composer = makeComposer('s4', { toolbar: true });

    injectButton(composer);
    injectButton(composer);

    const buttons = document.querySelectorAll(
      '[data-email-makinator-button="true"][data-email-makinator-session-id="s4"]',
    );
    expect(buttons.length).toBe(1);
  });

  test('does not mutate compose container style.position', () => {
    const composer = makeComposer('s5', { toolbar: true });

    injectButton(composer);

    expect(composer.container.style.position).toBe('');
  });

  test('keeps transparent background on hover', () => {
    const composer = makeComposer('s6', { toolbar: true });
    injectButton(composer);
    const button = composer.container.querySelector('[data-email-makinator-button="true"]') as HTMLButtonElement;
    expect(button.style.background).toBe('transparent');
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(button.style.background).toBe('transparent');
    button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(button.style.background).toBe('transparent');
  });

  test('reuses foreign-session composer button by retagging to current session', () => {
    const composer = makeComposer('s7', { toolbar: true });
    const existing = document.createElement('button');
    existing.setAttribute('data-email-makinator-button', 'true');
    existing.setAttribute('data-email-makinator-session-id', 'other-session');
    composer.container.appendChild(existing);

    injectButton(composer);

    const buttons = composer.container.querySelectorAll('[data-email-makinator-button="true"]');
    expect(buttons.length).toBe(1);
    expect((buttons[0] as HTMLElement).getAttribute('data-email-makinator-session-id')).toBe('s7');
    expect(buttons[0]).toBe(existing);
  });

  test('keeps one composer button and retags older-session button to current session', () => {
    const composer = makeComposer('s8', { toolbar: true });
    const existing = document.createElement('button');
    existing.setAttribute('data-email-makinator-button', 'true');
    existing.setAttribute('data-email-makinator-session-id', 'older-session');
    composer.container.appendChild(existing);

    injectButton(composer);

    const buttons = composer.container.querySelectorAll('[data-email-makinator-button="true"]');
    expect(buttons.length).toBe(1);
    expect((buttons[0] as HTMLElement).getAttribute('data-email-makinator-session-id')).toBe(
      's8',
    );
    expect(buttons[0]).toBe(existing);
  });
});
