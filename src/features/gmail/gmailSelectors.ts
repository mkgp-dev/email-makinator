export const GMAIL_EDITOR_SELECTORS = [
  '[role="textbox"][aria-label="Message Body"][contenteditable="true"]',
  '[role="textbox"][aria-label*="Message Body"][contenteditable="true"]',
  '[role="textbox"][contenteditable="true"][g_editable="true"]',
  'div[contenteditable="true"][g_editable="true"]',
  'div.Am.Al.editable[contenteditable="true"]',
  'div.editable[contenteditable="true"][role="textbox"]',
] as const;

export function isVisibleElement(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

export function isGmailBodyEditorCandidate(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const role = element.getAttribute('role')?.toLowerCase();
  const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() ?? '';
  const contentEditable = element.getAttribute('contenteditable')?.toLowerCase();
  const gEditable = element.getAttribute('g_editable')?.toLowerCase();
  const className = String(element.className ?? '').toLowerCase();

  if (ariaLabel.includes('ask gemini')) {
    return false;
  }

  if (role === 'combobox') {
    return false;
  }

  if (role !== 'textbox') {
    return false;
  }

  if (contentEditable !== 'true') {
    return false;
  }

  const looksLikeMessageBody =
    ariaLabel.includes('message body') ||
    gEditable === 'true' ||
    className.includes('editable');

  if (!looksLikeMessageBody) {
    return false;
  }

  return isVisibleElement(element);
}

export function findGmailBodyEditors(root: ParentNode = document): HTMLElement[] {
  const candidates = new Set<Element>();

  for (const selector of GMAIL_EDITOR_SELECTORS) {
    root.querySelectorAll(selector).forEach((element) => candidates.add(element));
  }

  const activeElement = document.activeElement;
  if (activeElement) {
    candidates.add(activeElement);
  }

  return Array.from(candidates).filter(isGmailBodyEditorCandidate);
}
