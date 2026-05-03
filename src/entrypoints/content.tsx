import React from 'react';
import ReactDOM from 'react-dom/client';
import tailwindCss from '@/assets/tailwind.css?inline';
import { startGmailObserver } from '@/features/gmail/gmailObserver';
import { EmailGeneratorApp } from '@/features/email-generator/EmailGeneratorApp';

const CLEANUP_HOOK = '__emailMakinatorCleanup__';

type WindowWithCleanup = Window & {
  [CLEANUP_HOOK]?: () => void;
};

export default defineContentScript({
  matches: ['*://mail.google.com/*'],
  main() {
    const windowWithCleanup = window as WindowWithCleanup;
    windowWithCleanup[CLEANUP_HOOK]?.();

    const existingHost = document.getElementById('email-makinator-shadow-host');
    if (existingHost) existingHost.remove();

    const cleanupObserver = startGmailObserver();

    const mount = document.createElement('div');
    mount.id = 'email-makinator-root';
    const shadowHost = document.createElement('div');
    shadowHost.id = 'email-makinator-shadow-host';
    document.body.appendChild(shadowHost);

    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = tailwindCss;
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(mount);

    const root = ReactDOM.createRoot(mount);
    root.render(
      <React.StrictMode>
        <EmailGeneratorApp />
      </React.StrictMode>,
    );

    let isCleanedUp = false;
    const cleanup = () => {
      if (isCleanedUp) return;
      
      isCleanedUp = true;
      cleanupObserver();
      root.unmount();
      shadowHost.remove();
      if (windowWithCleanup[CLEANUP_HOOK] === cleanup) {
        delete windowWithCleanup[CLEANUP_HOOK];
      }
      window.removeEventListener('beforeunload', cleanup);
      window.removeEventListener('pagehide', cleanup);
    };

    windowWithCleanup[CLEANUP_HOOK] = cleanup;
    window.addEventListener('beforeunload', cleanup, { once: true });
    window.addEventListener('pagehide', cleanup, { once: true });
  },
});
