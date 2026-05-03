function dispatchInput(editor: HTMLElement): void {
  editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

export function replaceGmailBody(editor: HTMLElement, text: string): void {
  editor.focus();
  editor.innerText = text;
  dispatchInput(editor);
}

export function appendToGmailBody(editor: HTMLElement, text: string): void {
  editor.focus();
  const currentText = editor.innerText.trim();
  editor.innerText = currentText ? `${currentText}\n\n${text}` : text;
  dispatchInput(editor);
}
