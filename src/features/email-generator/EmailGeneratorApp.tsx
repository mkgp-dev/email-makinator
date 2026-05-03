import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Dialog } from '@/shared/components/Dialog';
import { generateEmail } from '@/features/email-generator/api/generateEmail';
import { buildGenerateRequest } from '@/features/email-generator/api/buildGenerateRequest';
import { getGenerateValidationError } from '@/features/email-generator/api/validateGenerateRequest';
import { useEmailDialogStore } from '@/features/email-generator/stores/emailDialogStore';
import { getComposer } from '@/features/gmail/composerRegistry';
import {
  appendToGmailBody,
  replaceGmailBody,
} from '@/features/gmail/insertIntoGmailBody';
import { readGmailDraft } from '@/features/gmail/readGmailDraft';
import { readReplyContext } from '@/features/gmail/readReplyContext';
import {
  DEFAULT_SETTINGS,
  getEmailMakinatorSettings,
} from '@/shared/storage/settingsStorage';
import { DialogFooter } from '@/features/email-generator/components/DialogFooter';
import { DialogAlert } from '@/features/email-generator/components/DialogAlert';
import { DialogCard } from '@/features/email-generator/components/DialogCard';
import { DialogTextarea } from '@/features/email-generator/components/DialogTextarea';
import { DialogConfirm } from '@/features/email-generator/components/DialogConfirm';
import type { EmailDialogAction } from '@/features/email-generator/types/emailGenerate.types';

function inferCanSelectReply(sessionId: string | null, mode: 'new_email' | 'reply'): boolean {
  if (mode === 'reply') {
    return true;
  }

  if (!sessionId) {
    return true;
  }

  const composer = getComposer(sessionId);
  if (!composer) {
    return true;
  }

  const subjectField = composer.container.querySelector<HTMLElement>(
    'input[name="subjectbox"], textarea[name="subjectbox"]',
  );

  const isVisibleSubjectField = Boolean(
    subjectField &&
      subjectField.getBoundingClientRect().width > 0 &&
      subjectField.getBoundingClientRect().height > 0 &&
      window.getComputedStyle(subjectField).display !== 'none' &&
      window.getComputedStyle(subjectField).visibility !== 'hidden',
  );

  const hasReplyMarkers = Boolean(
    composer.container.querySelector(
      '[data-legacy-message-id], [data-legacy-thread-id], blockquote.gmail_quote, .gmail_quote, [aria-label*="Reply"]',
    ),
  );

  const isDefinitelyNewCompose = isVisibleSubjectField && !hasReplyMarkers;
  return !isDefinitelyNewCompose;
}

export function EmailGeneratorApp() {
  const state = useEmailDialogStore(
    useShallow((store) => ({
      sessionId: store.sessionId,
      phase: store.phase,
      action: store.action,
      tone: store.tone,
      preset: store.preset,
      context: store.context,
      detectedDraft: store.detectedDraft,
      importedDraft: store.importedDraft,
      replyContext: store.replyContext,
      resultEmail: store.resultEmail,
      errorMessage: store.errorMessage,
      isOpen: store.isOpen,
      isGenerating: store.isGenerating,
      mode: store.mode,
      close: store.close,
      setAction: store.setAction,
      setTone: store.setTone,
      setPreset: store.setPreset,
      setContext: store.setContext,
      setImportedDraft: store.setImportedDraft,
      setReplyContext: store.setReplyContext,
      setErrorMessage: store.setErrorMessage,
      setGenerating: store.setGenerating,
      beginGeneration: store.beginGeneration,
      finishGeneration: store.finishGeneration,
      applyResult: store.applyResult,
    })),
  );
  const [showInsertConflict, setShowInsertConflict] = useState(false);
  const [isErrorAlertMounted, setIsErrorAlertMounted] = useState(false);
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);
  const [isDraftAlertMounted, setIsDraftAlertMounted] = useState(false);
  const [isDraftAlertVisible, setIsDraftAlertVisible] = useState(false);
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const [stableAction, setStableAction] = useState<EmailDialogAction>(state.action);
  const [canSelectReply, setCanSelectReply] = useState(() =>
    inferCanSelectReply(state.sessionId, state.mode),
  );
  const dismissTimeoutRef = useRef<number | null>(null);
  const unmountTimeoutRef = useRef<number | null>(null);
  const draftAlertUnmountTimeoutRef = useRef<number | null>(null);
  const modeSwitchTimeoutRef = useRef<number | null>(null);

  const canUseEmail = Boolean(state.resultEmail) && !state.isGenerating;
  const canSubmit = Boolean(state.context.trim());
  const hasDetectedDraft = Boolean(state.detectedDraft.trim());
  const canSelectDraft = hasDetectedDraft || Boolean(state.importedDraft.trim());
  const previewImportedContent =
    state.phase === 'initial'
      ? state.action === 'reply'
        ? state.replyContext
        : state.action === 'improve_draft'
          ? state.importedDraft
          : ''
      : state.importedDraft;
  const editorAction = isModeSwitching ? stableAction : state.action;
  const isCompactEditor =
    state.phase === 'revision' || editorAction === 'improve_draft' || editorAction === 'reply';
  const showDraftAlert =
    state.phase === 'initial' &&
    state.mode !== 'reply' &&
    hasDetectedDraft &&
    !state.importedDraft.trim();

  const promptPlaceholder = useMemo(
    () =>
      state.phase === 'revision'
        ? 'Ask for a change, like “make it shorter” or “make it more professional”.'
        : state.action === 'reply'
          ? 'Describe your reply intent and constraints.'
          : 'Describe what email you want to write.',
    [state.phase, state.action],
  );

  useEffect(() => {
    setCanSelectReply(inferCanSelectReply(state.sessionId, state.mode));
  }, [state.sessionId, state.mode, state.isOpen]);

  useEffect(() => {
    const clearTimers = () => {
      if (dismissTimeoutRef.current) {
        window.clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
      if (unmountTimeoutRef.current) {
        window.clearTimeout(unmountTimeoutRef.current);
        unmountTimeoutRef.current = null;
      }
    };

    if (!state.errorMessage) {
      setIsErrorAlertVisible(false);
      unmountTimeoutRef.current = window.setTimeout(() => {
        setIsErrorAlertMounted(false);
      }, 220);
      return clearTimers;
    }

    clearTimers();
    setIsErrorAlertMounted(true);
    window.requestAnimationFrame(() => {
      setIsErrorAlertVisible(true);
    });
    dismissTimeoutRef.current = window.setTimeout(() => {
      setIsErrorAlertVisible(false);
      unmountTimeoutRef.current = window.setTimeout(() => {
        state.setErrorMessage('');
        setIsErrorAlertMounted(false);
      }, 220);
    }, 3000);

    return clearTimers;
  }, [state.errorMessage, state.setErrorMessage]);

  useEffect(() => {
    if (draftAlertUnmountTimeoutRef.current) {
      window.clearTimeout(draftAlertUnmountTimeoutRef.current);
      draftAlertUnmountTimeoutRef.current = null;
    }

    if (showDraftAlert) {
      setIsDraftAlertMounted(true);
      setIsDraftAlertVisible(false);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsDraftAlertVisible(true);
        });
      });
      return;
    }

    setIsDraftAlertVisible(false);
    draftAlertUnmountTimeoutRef.current = window.setTimeout(() => {
      setIsDraftAlertMounted(false);
    }, 180);
  }, [showDraftAlert]);

  useEffect(
    () => () => {
      if (dismissTimeoutRef.current) {
        window.clearTimeout(dismissTimeoutRef.current);
      }
      if (unmountTimeoutRef.current) {
        window.clearTimeout(unmountTimeoutRef.current);
      }
      if (draftAlertUnmountTimeoutRef.current) {
        window.clearTimeout(draftAlertUnmountTimeoutRef.current);
      }
      if (modeSwitchTimeoutRef.current) {
        window.clearTimeout(modeSwitchTimeoutRef.current);
      }
    },
    [],
  );

  const closeErrorAlert = () => {
    if (dismissTimeoutRef.current) {
      window.clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    if (unmountTimeoutRef.current) {
      window.clearTimeout(unmountTimeoutRef.current);
      unmountTimeoutRef.current = null;
    }
    setIsErrorAlertVisible(false);
    unmountTimeoutRef.current = window.setTimeout(() => {
      state.setErrorMessage('');
      setIsErrorAlertMounted(false);
    }, 220);
  };

  if (!state.isOpen || !state.sessionId) {
    return null;
  }

  const onGenerate = async () => {
    const validationError = getGenerateValidationError({
      phase: state.phase,
      action: state.action,
      context: state.context,
      importedDraft: state.importedDraft,
      replyContext: state.replyContext,
    });

    if (validationError) {
      state.setErrorMessage(validationError);
      return;
    }

    const requestId = state.beginGeneration();
    state.setErrorMessage('');

    try {
      let settings = DEFAULT_SETTINGS;

      try {
        settings = await getEmailMakinatorSettings();
      } catch (error) {
        console.warn('[Email Makinator] Failed to load settings. Using defaults.', error);
      }

      const request = buildGenerateRequest({
        model: settings.preferredModel,
        phase: state.phase,
        action: state.action,
        tone: state.tone,
        preset: state.preset,
        context: state.context,
        importedDraft: state.importedDraft,
        replyContext: state.replyContext,
        resultEmail: state.resultEmail,
      });

      const response = await generateEmail(request, {
        pollinationsKey: settings.pollinationsKey,
      });

      const emailBody =
        response.action === 'generated' || response.action === 'revised'
          ? response.output.emailBody
          : '';
      const didApply = state.applyResult(emailBody, requestId);
      if (!didApply) {
        state.setErrorMessage('AI did not return an email body.');
      }
    } catch (error) {
      state.setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      state.finishGeneration(requestId);
    }
  };

  const insertEmail = (mode: 'replace' | 'append') => {
    const composer = getComposer(state.sessionId!);
    if (!composer) {
      state.setErrorMessage('Composer was not found. Please reopen Email Makinator.');
      return;
    }

    if (mode === 'replace') {
      replaceGmailBody(composer.editor, state.resultEmail);
    } else {
      appendToGmailBody(composer.editor, state.resultEmail);
    }

    setShowInsertConflict(false);
    state.close();
  };

  const onUseThisEmail = () => {
    const composer = getComposer(state.sessionId!);
    if (!composer) {
      state.setErrorMessage('Composer was not found. Please reopen Email Makinator.');
      return;
    }

    if (composer.editor.innerText.trim()) {
      setShowInsertConflict(true);
      return;
    }

    replaceGmailBody(composer.editor, state.resultEmail);
    state.close();
  };

  const onActionChange = (nextAction: EmailDialogAction) => {
    if (modeSwitchTimeoutRef.current) {
      window.clearTimeout(modeSwitchTimeoutRef.current);
      modeSwitchTimeoutRef.current = null;
    }

    setIsModeSwitching(true);
    state.setAction(nextAction);
    modeSwitchTimeoutRef.current = window.setTimeout(() => {
      const currentComposer = state.sessionId ? getComposer(state.sessionId) : null;

      if (!currentComposer) {
        if (nextAction === 'generate_email') {
          state.setImportedDraft('');
        }
        setStableAction(nextAction);
        setIsModeSwitching(false);
        return;
      }

      if (nextAction === 'generate_email') {
        state.setImportedDraft('');
        setStableAction(nextAction);
        setIsModeSwitching(false);
        return;
      }

      if (nextAction === 'improve_draft') {
        state.setImportedDraft(readGmailDraft(currentComposer.editor));
        setStableAction(nextAction);
        setIsModeSwitching(false);
        return;
      }

      state.setReplyContext(readReplyContext(currentComposer.container));
      setStableAction(nextAction);
      setIsModeSwitching(false);
    }, 220);
  };

  return (
    <>
      <Dialog onClose={state.close} ariaLabelledBy="email-makinator-dialog-title">
        <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#dadce0] px-6 py-4">
          <h2
            id="email-makinator-dialog-title"
            className="text-[28px] font-normal leading-8 text-[#202124]"
          >
            Email Makinator
          </h2>
          <button
            onClick={state.close}
            aria-label="Close dialog"
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-6 pb-5 pt-3">
          <div className="flex flex-1 min-h-0 flex-col gap-3 pr-1">
            {isErrorAlertMounted ? (
              <div
                className={`transition-all duration-200 ${
                  isErrorAlertVisible
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-1 opacity-0'
                }`}
              >
                <DialogAlert variant="error" onDismiss={closeErrorAlert} dismissLabel="Dismiss error">
                  {state.errorMessage}
                </DialogAlert>
              </div>
            ) : null}

            {isDraftAlertMounted ? (
              <div
                className={`transition-all duration-200 ${
                  isDraftAlertVisible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
                }`}
              >
                <DialogAlert variant="info">
                  Looks like you already started a draft. Use <strong>Draft</strong> mode if you
                  want to edit or improve it.
                </DialogAlert>
              </div>
            ) : null}

            <div
              className={`shrink-0 overflow-hidden transition-[height,opacity,transform] duration-300 ease-out ${
                isCompactEditor ? 'h-full' : 'h-80'
              } ${isModeSwitching ? 'translate-y-0.5 opacity-85' : 'translate-y-0 opacity-100'}`}
            >
              <DialogCard
                resultEmail={state.resultEmail}
                importedDraft={previewImportedContent}
                isLoading={state.isGenerating || isModeSwitching}
                loadingLabel={
                  isModeSwitching
                    ? 'Please wait while we load the content.'
                    : 'Hang tight while we wait for a response.'
                }
              />
            </div>
          </div>

          <div className="mt-3 shrink-0 border-t border-[#dadce0] bg-white pt-3 transition-all duration-300 ease-out">
            <DialogTextarea
              value={state.context}
              onChange={state.setContext}
              placeholder={promptPlaceholder}
              compact={isCompactEditor}
              disabled={state.isGenerating || isModeSwitching}
            />

            <DialogFooter
              phase={state.phase}
              canSelectReply={canSelectReply}
              canSelectDraft={canSelectDraft}
              action={state.action}
              tone={state.tone}
              preset={state.preset}
              isGenerating={state.isGenerating || isModeSwitching}
              onActionChange={onActionChange}
              onToneChange={state.setTone}
              onPresetChange={state.setPreset}
              onSubmit={onGenerate}
              canSubmit={canSubmit}
              canUseEmail={canUseEmail}
              onUseEmail={onUseThisEmail}
            />
          </div>
        </div>
        </div>
      </Dialog>

      {showInsertConflict ? (
        <DialogConfirm
          onReplace={() => insertEmail('replace')}
          onAppend={() => insertEmail('append')}
          onCancel={() => setShowInsertConflict(false)}
        />
      ) : null}
    </>
  );
}
