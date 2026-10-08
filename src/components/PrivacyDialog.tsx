import { useEffect, useRef, useState } from 'react';
import { Database, LockKeyhole, X } from 'lucide-react';
import { Button } from './ui';

export default function PrivacyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const clearData = () => {
    try {
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key?.startsWith('quicgen-')) localStorage.removeItem(key);
      }
      setCleared(true);
      window.setTimeout(() => window.location.reload(), 900);
    } catch {
      setCleared(false);
    }
  };

  return <dialog ref={dialogRef} className="privacy-dialog" aria-labelledby="privacy-dialog-title" aria-describedby="privacy-dialog-description" onClose={onClose} onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}>
    <div className="dialog-top"><div className="dialog-icon"><LockKeyhole size={21}/></div><button className="icon-button" aria-label="Close privacy settings" onClick={onClose}><X size={19}/></button></div>
    <span className="eyebrow">Your privacy, by default</span>
    <h2 id="privacy-dialog-title">Your data stays yours.</h2>
    <p id="privacy-dialog-description" className="dialog-intro">QuicGen tools run in your browser. What you type, generate or convert is never sent to our servers.</p>
    <div className="privacy-facts">
      <div><span className="fact-icon"><Database size={16}/></span><span><strong>Only saved on this device</strong><small>Theme preference and optional password history use your browser’s local storage.</small></span></div>
      <div><span className="fact-icon"><LockKeyhole size={16}/></span><span><strong>No accounts. No analytics.</strong><small>We don’t use tracking scripts or collect the content you work with.</small></span></div>
    </div>
    <div className="dialog-actions"><Button variant="secondary" onClick={onClose}>Done</Button><Button variant="danger" onClick={clearData}><Database size={15}/>{cleared ? 'Cleared — reloading…' : 'Clear all QuicGen data'}</Button></div>
    <p className="dialog-footnote">This removes QuicGen preferences and saved history from this browser. Your open page will reload.</p>
  </dialog>;
}
