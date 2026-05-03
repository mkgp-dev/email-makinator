import { debugLog } from '@/features/gmail/gmailDebug';
import type { GmailComposer, GmailComposerMode } from '@/features/gmail/gmailTypes';
import { findGmailBodyEditors, isVisibleElement } from '@/features/gmail/gmailSelectors';

const SESSION_ATTR = 'data-email-makinator-session-id';
const COMPOSE_CONTAINER_SELECTORS = ['.M9', '[role="dialog"]', 'form[role="presentation"]'] as const;

const TOOLBAR_SELECTORS = [
  '[aria-label="Formatting options"]',
  '[aria-label*="Formatting"]',
  '[aria-label*="More options"]',
  'div[role="toolbar"]',
  'table[role="presentation"]',
] as const;

function getOrCreateSessionId(container: HTMLElement): string {
  const existing = container.getAttribute(SESSION_ATTR);
  if (existing) {
    return existing;
  }

  const id = `em-${crypto.randomUUID()}`;
  container.setAttribute(SESSION_ATTR, id);
  return id;
}

function detectMode(container: HTMLElement): GmailComposerMode {
  const subjectBox = container.querySelector<HTMLElement>(
    'input[name="subjectbox"], textarea[name="subjectbox"]',
  );
  if (subjectBox && isVisibleElement(subjectBox)) {
    return 'new_email';
  }

  const ariaLabel = container.getAttribute('aria-label')?.toLowerCase() ?? '';
  if (ariaLabel.includes('reply') || ariaLabel.includes('forward')) {
    return 'reply';
  }

  const hasReplyMarkers =
    Boolean(
      container.querySelector(
        '[data-legacy-message-id], [data-legacy-thread-id], blockquote.gmail_quote, .gmail_quote',
      ),
    ) || container.classList.contains('adn');

  if (hasReplyMarkers) {
    return 'reply';
  }

  return 'new_email';
}

function findToolbar(container: HTMLElement, editor: HTMLElement): HTMLElement | undefined {
  for (const selector of TOOLBAR_SELECTORS) {
    const found = container.querySelector<HTMLElement>(selector);
    if (found && isVisibleElement(found)) {
      return found;
    }
  }

  for (const selector of TOOLBAR_SELECTORS) {
    const found = editor.closest<HTMLElement>('div')?.querySelector<HTMLElement>(selector);
    if (found && isVisibleElement(found)) {
      return found;
    }
  }

  return undefined;
}

export function findComposeContainers(root: ParentNode = document): HTMLElement[] {
  const candidates = new Set<HTMLElement>();

  for (const selector of COMPOSE_CONTAINER_SELECTORS) {
    root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (isVisibleElement(element)) {
        candidates.add(element);
      }
    });
  }

  const sorted = Array.from(candidates).sort((a, b) => {
    const depthA = a.closest('.M9') ? 1 : 2;
    const depthB = b.closest('.M9') ? 1 : 2;
    return depthA - depthB;
  });

  const selected: HTMLElement[] = [];
  for (const container of sorted) {
    const hasSelectedAncestor = selected.some((ancestor) => ancestor.contains(container));
    if (!hasSelectedAncestor) {
      selected.push(container);
    }
  }

  return selected;
}

function findNearestComposeContainer(editor: HTMLElement): HTMLElement | null {
  return (
    editor.closest<HTMLElement>('.M9') ??
    editor.closest<HTMLElement>('[role="dialog"]') ??
    editor.closest<HTMLElement>('form') ??
    editor.closest<HTMLElement>('.nH')
  );
}

export function resolveGmailComposerFromContainer(container: HTMLElement): GmailComposer | null {
  const editor = findGmailBodyEditors(container)[0];
  if (!editor) {
    return null;
  }

  const toolbar = findToolbar(container, editor);
  if (toolbar) {
    debugLog('toolbar found', { sessionId: container.getAttribute(SESSION_ATTR) ?? null });
  } else {
    debugLog('toolbar missing in container', { sessionId: container.getAttribute(SESSION_ATTR) ?? null });
  }

  return {
    sessionId: getOrCreateSessionId(container),
    mode: detectMode(container),
    container,
    editor,
    toolbar,
  };
}

export function resolveGmailComposer(editor: HTMLElement): GmailComposer | null {
  const container =
    findNearestComposeContainer(editor) ??
    editor.closest<HTMLElement>('[role="dialog"]') ??
    editor.closest<HTMLElement>('form') ??
    editor.parentElement ??
    editor;

  return resolveGmailComposerFromContainer(container);
}
