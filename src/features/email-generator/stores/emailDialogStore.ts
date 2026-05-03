import { create } from 'zustand';
import type {
  EmailDialogAction,
  EmailDialogPhase,
  EmailPresetId,
  EmailTone,
} from '@/features/email-generator/types/emailGenerate.types';

export type EmailDialogState = {
  activeRequestId: number;
  sessionId: string | null;
  phase: EmailDialogPhase;
  action: EmailDialogAction;
  tone: EmailTone;
  preset: EmailPresetId;
  context: string;
  detectedDraft: string;
  importedDraft: string;
  replyContext: string;
  resultEmail: string;
  currentEmail: string;
  errorMessage: string;
  isOpen: boolean;
  isGenerating: boolean;
  mode: 'new_email' | 'reply';
  open: (sessionId: string, mode: 'new_email' | 'reply') => void;
  close: () => void;
  setAction: (action: EmailDialogAction) => void;
  setTone: (tone: EmailTone) => void;
  setPreset: (preset: EmailPresetId) => void;
  setContext: (context: string) => void;
  setDetectedDraft: (draft: string) => void;
  setImportedDraft: (draft: string) => void;
  setReplyContext: (replyContext: string) => void;
  setErrorMessage: (message: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  beginGeneration: () => number;
  finishGeneration: (requestId: number) => boolean;
  applyResult: (emailBody: string, requestId?: number) => boolean;
};

const INITIAL_STATE = {
  phase: 'initial' as const,
  action: 'generate_email' as const,
  tone: 'formal' as const,
  preset: 'custom' as const,
  context: '',
  detectedDraft: '',
  importedDraft: '',
  replyContext: '',
  resultEmail: '',
  currentEmail: '',
  errorMessage: '',
  isGenerating: false,
};

export const useEmailDialogStore = create<EmailDialogState>((set) => ({
  activeRequestId: 0,
  sessionId: null,
  mode: 'new_email',
  isOpen: false,
  ...INITIAL_STATE,
  open: (sessionId, mode) =>
    set((state) => ({
      ...INITIAL_STATE,
      activeRequestId: state.activeRequestId + 1,
      sessionId,
      isOpen: true,
      mode,
      action: mode === 'reply' ? 'reply' : 'generate_email',
    })),
  close: () =>
    set((state) => ({
      isOpen: false,
      sessionId: null,
      isGenerating: false,
      activeRequestId: state.activeRequestId + 1,
    })),
  setAction: (action) => set({ action, errorMessage: '' }),
  setTone: (tone) => set({ tone }),
  setPreset: (preset) => set({ preset }),
  setContext: (context) => set({ context }),
  setDetectedDraft: (detectedDraft) => set({ detectedDraft }),
  setImportedDraft: (importedDraft) => set({ importedDraft }),
  setReplyContext: (replyContext) => set({ replyContext }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  beginGeneration: () => {
    let requestId = 0;
    set((state) => {
      requestId = state.activeRequestId + 1;
      return {
        activeRequestId: requestId,
        isGenerating: true,
      };
    });
    return requestId;
  },
  finishGeneration: (requestId) => {
    let updated = false;
    set((state) => {
      if (state.activeRequestId !== requestId) {
        return state;
      }
      updated = true;
      return { isGenerating: false };
    });
    return updated;
  },
  applyResult: (emailBody, requestId) => {
    const normalizedBody = emailBody.trim();
    if (!normalizedBody) {
      return false;
    }

    let applied = false;
    set((state) => {
      if (typeof requestId === 'number' && state.activeRequestId !== requestId) {
        return state;
      }

      applied = true;
      return {
        phase: 'revision',
        resultEmail: normalizedBody,
        currentEmail: normalizedBody,
        context: '',
        errorMessage: '',
      };
    });
    return applied;
  },
}));
