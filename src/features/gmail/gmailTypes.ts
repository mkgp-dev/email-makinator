export type GmailComposerMode = 'new_email' | 'reply';

export type GmailComposer = {
  sessionId: string;
  mode: GmailComposerMode;
  container: HTMLElement;
  editor: HTMLElement;
  toolbar?: HTMLElement;
};
