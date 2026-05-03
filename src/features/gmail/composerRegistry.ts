import type { GmailComposer } from '@/features/gmail/gmailTypes';

const bySessionId = new Map<string, GmailComposer>();

export function setComposer(composer: GmailComposer): void {
  bySessionId.set(composer.sessionId, composer);
}

export function getComposer(sessionId: string): GmailComposer | undefined {
  return bySessionId.get(sessionId);
}

export function getComposers(): GmailComposer[] {
  return [...bySessionId.values()];
}

export function removeComposer(sessionId: string): void {
  bySessionId.delete(sessionId);
}

export function removeDisconnectedComposers(): void {
  for (const [sessionId, composer] of bySessionId.entries()) {
    if (!composer.container.isConnected) {
      bySessionId.delete(sessionId);
    }
  }
}

export function clearComposers(): void {
  bySessionId.clear();
}
