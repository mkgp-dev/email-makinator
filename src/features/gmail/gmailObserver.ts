import {
  findComposeContainers,
  resolveGmailComposer,
  resolveGmailComposerFromContainer,
} from '@/features/gmail/gmailComposer';
import { clearComposers, removeDisconnectedComposers } from '@/features/gmail/composerRegistry';
import { debugLog } from '@/features/gmail/gmailDebug';
import { isGmailBodyEditorCandidate } from '@/features/gmail/gmailSelectors';
import { injectButton } from '@/features/gmail/injectButton';

type DebouncedFn = {
  cancel: () => void;
  schedule: () => void;
};

function debounce(fn: () => void, waitMs: number): DebouncedFn {
  let timeoutId: number | undefined;
  return {
    cancel: () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    },
    schedule: () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        timeoutId = undefined;
        fn();
      }, waitMs);
    },
  };
}

export function startGmailObserver(): () => void {
  debugLog('content script started');

  const scanAndInject = () => {
    removeDisconnectedComposers();
    debugLog('scan started');
    const composeContainers = findComposeContainers();
    debugLog('compose containers found', { count: composeContainers.length });

    for (const container of composeContainers) {
      const composer = resolveGmailComposerFromContainer(container);
      if (!composer) {
        continue;
      }
      debugLog('composer resolved', { sessionId: composer.sessionId, mode: composer.mode });
      injectButton(composer);
    }
  };

  const debouncedScan = debounce(scanAndInject, 120);

  const observer = new MutationObserver(() => {
    debouncedScan.schedule();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  debugLog('observer started');

  const focusinHandler = (event: FocusEvent) => {
    const target = event.target;
    if (target instanceof HTMLElement && isGmailBodyEditorCandidate(target)) {
      debugLog('focusin detected valid editor');
      const composer = resolveGmailComposer(target);
      if (composer) {
        injectButton(composer);
      }
      debouncedScan.schedule();
    }
  };

  document.addEventListener('focusin', focusinHandler, true);

  scanAndInject();

  const timerIds = [250, 750, 1500, 3000].map((delay) =>
    window.setTimeout(() => {
      scanAndInject();
    }, delay),
  );

  return () => {
    observer.disconnect();
    debouncedScan.cancel();
    document.removeEventListener('focusin', focusinHandler, true);
    for (const id of timerIds) {
      window.clearTimeout(id);
    }
    clearComposers();
  };
}
