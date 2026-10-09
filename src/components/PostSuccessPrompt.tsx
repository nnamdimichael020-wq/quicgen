import { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, Home, X } from 'lucide-react';
import { Button } from './ui';

const CHOICE_KEY = 'quicgen-bookmark-prompt-choice';
const SESSION_KEY = 'quicgen-bookmark-prompt-shown';

type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform?: string };
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

function readChoice() {
  try { return localStorage.getItem(CHOICE_KEY) !== null; }
  catch {
    try { return sessionStorage.getItem(CHOICE_KEY) !== null; }
    catch { return false; }
  }
}

function saveChoice(choice: 'accepted' | 'dismissed') {
  try { localStorage.setItem(CHOICE_KEY, choice); }
  catch {
    try { sessionStorage.setItem(CHOICE_KEY, choice); }
    catch { /* The prompt remains dismissible for the current page session. */ }
  }
  try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch { /* Storage is optional. */ }
}

export default function PostSuccessPrompt() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);
  const deferredPrompt = useRef<InstallPromptEvent | null>(null);

  useEffect(() => {
    const updateDevice = () => setMobile(window.matchMedia('(max-width: 760px)').matches);
    updateDevice();
    window.addEventListener('resize', updateDevice, { passive: true });

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as InstallPromptEvent;
      setInstallAvailable(true);
    };
    const onSuccess = () => {
      if (readChoice()) return;
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch { /* The choice still works if storage is disabled. */ }
      setOpen(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('quicgen:success', onSuccess);
    return () => {
      window.removeEventListener('resize', updateDevice);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('quicgen:success', onSuccess);
    };
  }, []);

  const choose = (choice: 'accepted' | 'dismissed') => {
    saveChoice(choice);
    setOpen(false);
  };

  const addToHomeScreen = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) {
      choose('accepted');
      return;
    }
    setInstalling(true);
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      deferredPrompt.current = null;
      setInstallAvailable(false);
      choose(result.outcome);
    } catch {
      setInstalling(false);
      setInstallAvailable(false);
      deferredPrompt.current = null;
    }
    setInstalling(false);
  };

  if (!open) return null;
  return <aside className="bookmark-prompt" role="region" aria-labelledby="bookmark-prompt-title" aria-live="polite">
    <div className="bookmark-prompt-top"><span className="bookmark-prompt-icon">{mobile ? <Home size={17}/> : <Bookmark size={17}/>}</span><button className="icon-button" type="button" aria-label="Dismiss bookmark reminder" onClick={() => choose('dismissed')}><X size={17}/></button></div>
    <span className="eyebrow">A SMALL, OPTIONAL REMINDER</span>
    <h2 id="bookmark-prompt-title">Enjoying QuicGen?</h2>
    {mobile ? <><p>Keep the tools close by adding QuicGen to your Home Screen. On iPhone, use Share → Add to Home Screen; on Android, open your browser menu and choose “Install” or “Add to Home screen.”</p><div className="bookmark-prompt-actions"><Button type="button" onClick={addToHomeScreen} disabled={installing}>{installAvailable ? <Home size={14}/> : <Check size={14}/>}{installing ? 'Opening install…' : installAvailable ? 'Add to Home Screen' : 'I’ll add it'}</Button><Button type="button" variant="quiet" onClick={() => choose('dismissed')}>Not now</Button></div></> : <><p>Save this page for next time. Use <kbd>Ctrl</kbd> + <kbd>D</kbd> on Windows or <kbd>⌘</kbd> + <kbd>D</kbd> on Mac to bookmark it.</p><div className="bookmark-prompt-actions"><Button type="button" onClick={() => choose('accepted')}><Check size={14}/>I’ll bookmark it</Button><Button type="button" variant="quiet" onClick={() => choose('dismissed')}>Not now</Button></div></>}
  </aside>;
}
