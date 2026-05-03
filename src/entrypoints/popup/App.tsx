import { useEffect, useState, type ChangeEvent } from 'react';
import { AlertCircle, Bot, CircleCheck, LoaderCircle } from 'lucide-react';
import {
  DEFAULT_SETTINGS,
  getEmailMakinatorSettings,
  saveEmailMakinatorSettings,
  type EmailMakinatorSettings,
} from '@/shared/storage/settingsStorage';
import { cn } from '@/shared/utils/cn';
import { InfoAccordion } from '@/entrypoints/popup/components/InfoAccordion';
import { ModelDropdown } from '@/entrypoints/popup/components/ModelDropdown';

function App() {
  const [settings, setSettings] = useState<EmailMakinatorSettings>(DEFAULT_SETTINGS);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showEarlyStage, setShowEarlyStage] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  useEffect(() => {
    getEmailMakinatorSettings()
      .then(setSettings)
      .catch(() => {
        setSettings(DEFAULT_SETTINGS);
      });
  }, []);

  useEffect(() => {
    if (saveState === 'idle' || saveState === 'saving') return;

    const timeout = window.setTimeout(() => {
      setSaveState('idle');
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [saveState]);

  const save = async () => {
    setSaveState('saving');
    try {
      await saveEmailMakinatorSettings(settings);
      setSaveState('success');
    } catch {
      setSaveState('error');
    }
  };
  const isSaveDisabled = saveState === 'saving' || saveState === 'success' || saveState === 'error';

  return (
    <main className="w-100 bg-slate-900 pb-4 pl-4 pr-3 pt-5 text-slate-100">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Email Makinator logo" className="h-10 w-10 rounded-md" />
        <div>
          <h1 className="text-lg font-semibold leading-5 text-slate-100">Email Makinator</h1>
          <p className="mt-1 text-xs text-slate-400">Powered with Pollinations AI</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-3">
          <InfoAccordion
            title="Early stage"
            open={showEarlyStage}
            onToggle={() => setShowEarlyStage((value) => !value)}
          >
            <div className="space-y-2">
              <p>
                Email Makinator is still in its early stage and will continue to improve over time. It
                currently supports Gmail, with plans to explore and support other email providers in
                the future.
              </p>
              <p>
                Responses may sometimes be slow, incomplete, or inaccurate. For better results, please
                be specific with your request and avoid vague instructions.
              </p>
              <p>
                If something feels confusing, incorrect, or could be improved, you can submit a report
                and help make the project better.
              </p>
            </div>
          </InfoAccordion>
          <InfoAccordion title="Usage" open={showUsage} onToggle={() => setShowUsage((value) => !value)}>
            <p>
              Open Gmail and look for the Email Makinator bot icon{' '}
              <Bot className="mx-1 inline h-3.5 w-3.5 align-[-2px]" /> in the toolbar. Click the icon
              to open the dialog, then choose what you want to do, such as generate a new email,
              improve a draft, or create a reply.
            </p>
          </InfoAccordion>
        </div>

        <section className="mt-5">
          <h2 className="text-sm font-semibold text-slate-100">Model</h2>
          <p className="mt-1 text-xs text-slate-400">Choose which model to use.</p>
          <ModelDropdown
            value={settings.preferredModel}
            onChange={(model) => setSettings((prev) => ({ ...prev, preferredModel: model }))}
          />
        </section>

        <section className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-slate-100">Pollinations key (optional)</label>
          <input
            type="password"
            value={settings.pollinationsKey ?? ''}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setSettings((prev) => ({
                ...prev,
                pollinationsKey: event.target.value || undefined,
              }))
            }
            className={cn(
              'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100',
              'placeholder:text-slate-500 focus:border-slate-500 focus:outline-none',
            )}
            placeholder="sk_..."
          />
          <p className="text-xs leading-5 text-slate-400">
            You can create your own key at{' '}
            <a
              href="https://enter.pollinations.ai"
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
            >
              enter.pollinations.ai
            </a>{' '}
            and input it here to keep using without waiting for the default balance to refill.
          </p>
        </section>

        <button
          type="button"
          disabled={isSaveDisabled}
          aria-label={
            saveState === 'saving'
              ? 'Saving settings'
              : saveState === 'success'
                ? 'Settings saved'
                : saveState === 'error'
                  ? 'Save failed'
                  : 'Save settings'
          }
          className={cn(
            'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition',
            'hover:border-slate-600 hover:bg-[#172137]',
            'disabled:border-slate-600 disabled:bg-slate-950',
          )}
          onClick={save}
        >
          <span className="inline-flex items-center gap-2">
            {saveState === 'saving' ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {saveState === 'success' ? <CircleCheck size={16} className="text-emerald-300" /> : null}
            {saveState === 'error' ? <AlertCircle size={16} className="text-rose-300" /> : null}
            <span>
              {saveState === 'saving' || saveState === 'success' || saveState === 'error'
                ? ''
                : 'Save'}
            </span>
          </span>
        </button>
      </div>


      <div className="mt-4 border-t border-slate-800 pt-3 text-right text-xs leading-5 text-slate-400">
        <p>Built with WXT</p>
        <p>
          Developed by Mark Kenneth Pelayo (
          <a
            href="https://github.com/mkgp-dev"
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 hover:text-sky-200"
          >
            mkgp-dev
          </a>
          )
        </p>
      </div>
    </main>
  );
}

export default App;
