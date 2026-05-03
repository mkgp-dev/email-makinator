const GMAIL_DEBUG = import.meta.env.DEV;

export function debugLog(message: string, data?: unknown): void {
  if (!GMAIL_DEBUG) {
    return;
  }

  console.debug(`[Email Makinator][Gmail] ${message}`, data ?? '');
}
