import { requestEmailGeneration } from '@/features/email-generator/api/requestEmailGeneration';
import { IS_DEV } from '@/shared/config/env';
import {
  EMAIL_MAKINATOR_GENERATE,
  type EmailMakinatorGenerateMessage,
  type EmailMakinatorGenerateResponse,
} from '@/shared/runtime/messages';

export default defineBackground(() => {
  if (IS_DEV) console.log('Email Makinator background active.', { id: browser.runtime.id });

  browser.runtime.onMessage.addListener(
    (
      message: EmailMakinatorGenerateMessage,
      _sender,
      sendResponse: (response: EmailMakinatorGenerateResponse) => void,
    ) => {
      if (!message || message.type !== EMAIL_MAKINATOR_GENERATE) return;

      (async () => {
        try {
          const data = await requestEmailGeneration(message.payload.request, {
            pollinationsKey: message.payload.pollinationsKey,
          });
          
          sendResponse({ ok: true, data });
        } catch (error) {
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : 'AI generation failed.',
          });
        }
      })();

      return true;
    },
  );
});
