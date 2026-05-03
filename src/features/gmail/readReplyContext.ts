const MAX_REPLY_CONTEXT = 5000;

export function readReplyContext(composerContainer: HTMLElement): string {
  const thread = composerContainer.closest('[role="main"]') ?? document.body;
  const messageBodySelectors = [
    '.adn .a3s.aiL',
    '.adn .a3s',
    '[data-message-id] .a3s.aiL',
    '[data-message-id] .a3s',
  ] as const;

  for (const selector of messageBodySelectors) {
    const nodes = Array.from(thread.querySelectorAll<HTMLElement>(selector));
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      const text = nodes[i]?.innerText?.trim();
      if (text) {
        return text.slice(0, MAX_REPLY_CONTEXT);
      }
    }
  }

  const blocks = Array.from(
    thread.querySelectorAll<HTMLElement>('[data-message-id], [role="listitem"], .adn'),
  );

  for (let i = blocks.length - 1; i >= 0; i -= 1) {
    const text = sanitizeReplyContext(blocks[i]?.innerText ?? '');
    if (text) {
      return text.slice(0, MAX_REPLY_CONTEXT);
    }
  }

  return '';
}

function sanitizeReplyContext(raw: string): string {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const lowered = line.toLowerCase();
      if (['reply', 'reply all', 'forward', 'more'].includes(lowered)) {
        return false;
      }
      if (lowered.startsWith('to ') || lowered.startsWith('from ') || lowered.startsWith('subject ')) {
        return false;
      }
      if (lowered.includes("can't react with an emoji")) {
        return false;
      }
      return true;
    });

  return lines.join('\n').trim();
}
