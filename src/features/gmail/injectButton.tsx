import React from 'react';
import ReactDOM from 'react-dom/client';
import { Bot } from 'lucide-react';
import type { GmailComposer } from '@/features/gmail/gmailTypes';
import { setComposer } from '@/features/gmail/composerRegistry';
import { useEmailDialogStore } from '@/features/email-generator/stores/emailDialogStore';
import { readGmailDraft } from '@/features/gmail/readGmailDraft';
import { readReplyContext } from '@/features/gmail/readReplyContext';
import { debugLog } from '@/features/gmail/gmailDebug';

const INJECTED_ATTR = 'data-email-makinator-injected';
const BUTTON_ATTR = 'data-email-makinator-button';
const WRAPPER_ATTR = 'data-email-makinator-button-wrapper';
const STYLE_ID = 'email-makinator-toolbar-button-style';
const rootByButton = new WeakMap<HTMLElement, ReturnType<typeof ReactDOM.createRoot>>();
const lastInjectAtBySession = new Map<string, number>();
const injectingSessionIds = new Set<string>();
const REINJECT_COOLDOWN_MS = 700;
const MAX_SESSION_CACHE_ENTRIES = 200;

function ensureToolbarButtonStyles(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes email-makinator-slate-icon {
      0% {
        color: color-mix(in oklab, oklch(82.8% 0.111 230.318) 42%, rgb(100, 116, 139));
        filter: drop-shadow(0 0 1px color-mix(in oklab, oklch(82.8% 0.111 230.318) 24%, transparent));
      }
      33% {
        color: color-mix(in oklab, oklch(82.8% 0.111 230.318) 54%, rgb(71, 85, 105));
        filter: drop-shadow(0 0 2px color-mix(in oklab, oklch(82.8% 0.111 230.318) 30%, transparent));
      }
      66% {
        color: color-mix(in oklab, oklch(82.8% 0.111 230.318) 36%, rgb(148, 163, 184));
        filter: drop-shadow(0 0 2px color-mix(in oklab, oklch(82.8% 0.111 230.318) 26%, transparent));
      }
      100% {
        color: color-mix(in oklab, oklch(82.8% 0.111 230.318) 42%, rgb(100, 116, 139));
        filter: drop-shadow(0 0 1px color-mix(in oklab, oklch(82.8% 0.111 230.318) 24%, transparent));
      }
    }

    .email-makinator-toolbar-button {
      transition: color 120ms ease;
    }

    .email-makinator-toolbar-button:hover {
      background: transparent !important;
    }

    .email-makinator-toolbar-button:hover svg {
      animation: email-makinator-slate-icon 1.4s linear infinite;
      stroke: currentColor;
    }
  `;
  document.head.appendChild(style);
}

function isStaleButton(button: HTMLElement): boolean {
  if (!button.isConnected) {
    return true;
  }
  return false;
}

function setLastInjectAt(sessionId: string, timestamp: number): void {
  lastInjectAtBySession.set(sessionId, timestamp);
  while (lastInjectAtBySession.size > MAX_SESSION_CACHE_ENTRIES) {
    const oldestSessionId = lastInjectAtBySession.keys().next().value;
    if (!oldestSessionId) {
      break;
    }
    lastInjectAtBySession.delete(oldestSessionId);
  }
}

function removeManagedButton(button: HTMLElement): void {
  const root = rootByButton.get(button);
  if (root) {
    root.unmount();
    rootByButton.delete(button);
  }

  const wrapper = button.closest<HTMLElement>(`[${WRAPPER_ATTR}="true"]`);
  if (wrapper) {
    wrapper.remove();
    return;
  }

  button.remove();
}

function isVisibleToolbar(toolbar: HTMLElement | undefined): toolbar is HTMLElement {
  if (!toolbar) {
    return false;
  }

  const rect = toolbar.getBoundingClientRect();
  const style = window.getComputedStyle(toolbar);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden'
  );
}

function createToolbarButton(composer: GmailComposer): HTMLButtonElement {
  ensureToolbarButtonStyles();

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'email-makinator-toolbar-button';
  button.setAttribute(BUTTON_ATTR, 'true');
  button.setAttribute(INJECTED_ATTR, 'true');
  button.setAttribute('data-email-makinator-session-id', composer.sessionId);
  button.setAttribute('aria-label', 'Open Email Makinator');
  button.setAttribute('data-tooltip', 'Email Makinator');
  button.setAttribute('data-tooltip-position', 'top');
  Object.assign(button.style, {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    minHeight: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '999px',
    border: '0',
    background: 'transparent',
    color: '#5f6368',
    cursor: 'pointer',
    padding: '0',
    margin: '0',
    flex: '0 0 auto',
    appearance: 'none',
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const store = useEmailDialogStore.getState();
    const hasReplyMarkers = Boolean(
      composer.container.querySelector(
        '[data-legacy-message-id], [data-legacy-thread-id], blockquote.gmail_quote, .gmail_quote, [aria-label*="Reply"], [aria-label*="reply"]',
      ),
    );
    const subjectField = composer.container.querySelector<HTMLElement>(
      'input[name="subjectbox"], textarea[name="subjectbox"]',
    );
    const subjectVisible = Boolean(
      subjectField &&
        subjectField.getBoundingClientRect().width > 0 &&
        subjectField.getBoundingClientRect().height > 0 &&
        window.getComputedStyle(subjectField).display !== 'none' &&
        window.getComputedStyle(subjectField).visibility !== 'hidden',
    );
    const resolvedMode =
      composer.mode === 'reply' || hasReplyMarkers || !subjectVisible ? 'reply' : 'new_email';

    store.open(composer.sessionId, resolvedMode);
    const draft = readGmailDraft(composer.editor);
    store.setDetectedDraft(draft);

    if (resolvedMode === 'reply') {
      store.setReplyContext(readReplyContext(composer.container));
      store.setAction('reply');
    }
  });

  const iconRoot = ReactDOM.createRoot(button);
  rootByButton.set(button, iconRoot);
  iconRoot.render(<Bot size={20} strokeWidth={2} />);
  return button;
}

function findSendTdAndRow(composer: GmailComposer): { sendTd: HTMLTableCellElement; row: HTMLTableRowElement } | null {
  const sendButton =
    composer.container.querySelector<HTMLElement>('[data-tooltip^="Send"]') ??
    composer.container.querySelector<HTMLElement>('[aria-label^="Send"]');

  if (!sendButton) {
    return null;
  }

  const sendTd = sendButton.closest<HTMLTableCellElement>('td');
  const row = sendTd?.closest<HTMLTableRowElement>('tr');
  if (!sendTd || !row) {
    return null;
  }

  return { sendTd, row };
}

function buildTdWrapper(composer: GmailComposer, button: HTMLButtonElement): HTMLTableCellElement {
  const wrapper = document.createElement('td');
  wrapper.className = 'gU aYL';
  wrapper.setAttribute(WRAPPER_ATTR, 'true');
  wrapper.setAttribute('data-email-makinator-session-id', composer.sessionId);
  Object.assign(wrapper.style, {
    paddingLeft: '12px',
    verticalAlign: 'middle',
  });
  wrapper.appendChild(button);
  return wrapper;
}

function insertIntoToolbar(composer: GmailComposer, button: HTMLButtonElement): void {
  const sendSlot = findSendTdAndRow(composer);
  if (!sendSlot) {
    debugLog('send row unavailable; deferring injection', { sessionId: composer.sessionId });
    return;
  }

  const wrapper = buildTdWrapper(composer, button);
  sendSlot.row.insertBefore(wrapper, sendSlot.sendTd.nextSibling);
}

export function injectButton(composer: GmailComposer): void {
  if (injectingSessionIds.has(composer.sessionId)) {
    debugLog('injection already in-flight; skipping', { sessionId: composer.sessionId });
    return;
  }

  injectingSessionIds.add(composer.sessionId);
  try {
  if (!composer.container.isConnected) {
    lastInjectAtBySession.delete(composer.sessionId);
    return;
  }

  if (!isVisibleToolbar(composer.toolbar)) {
    debugLog('toolbar unavailable; deferring injection', { sessionId: composer.sessionId });
    return;
  }

  const existingButtonsInComposer: HTMLElement[] = [];
  for (const button of composer.container.querySelectorAll<HTMLElement>(`[${BUTTON_ATTR}="true"]`)) {
    if (isStaleButton(button)) {
      removeManagedButton(button);
      continue;
    }
    existingButtonsInComposer.push(button);
  }

  if (existingButtonsInComposer.length === 1) {
    const [existingButton] = existingButtonsInComposer;
    existingButton.setAttribute('data-email-makinator-session-id', composer.sessionId);
    composer.container.setAttribute(INJECTED_ATTR, 'true');
    composer.container.setAttribute('data-email-makinator-session-id', composer.sessionId);
    setComposer(composer);
    debugLog('single existing button reused', { sessionId: composer.sessionId });
    return;
  }

  if (existingButtonsInComposer.length > 1) {
    const [primary, ...duplicates] = existingButtonsInComposer;
    for (const duplicate of duplicates) {
      removeManagedButton(duplicate);
    }
    primary.setAttribute('data-email-makinator-session-id', composer.sessionId);
    setComposer(composer);
    debugLog('composer duplicate cleanup', {
      sessionId: composer.sessionId,
      removed: duplicates.length,
    });
    return;
  }

  const now = Date.now();
  const lastInjectedAt = lastInjectAtBySession.get(composer.sessionId) ?? 0;
  if (now - lastInjectedAt < REINJECT_COOLDOWN_MS) {
    debugLog('reinjection cooldown active; skipping', {
      sessionId: composer.sessionId,
      sinceMs: now - lastInjectedAt,
    });
    setComposer(composer);
    return;
  }

  setComposer(composer);

  const button = createToolbarButton(composer);
  insertIntoToolbar(composer, button);
  setLastInjectAt(composer.sessionId, Date.now());

  composer.container.setAttribute(INJECTED_ATTR, 'true');
  composer.container.setAttribute('data-email-makinator-session-id', composer.sessionId);

  const rect = button.getBoundingClientRect();
  debugLog('button injected', {
    sessionId: composer.sessionId,
    strategy: 'toolbar',
    toolbarTag: composer.toolbar.tagName,
    buttonRect: rect
      ? {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
        }
      : null,
  });
  } finally {
    injectingSessionIds.delete(composer.sessionId);
  }
}
