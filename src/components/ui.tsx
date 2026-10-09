import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { copyText } from '../lib/utils';

export function Button({ className = '', variant = 'primary', children, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' | 'danger' }) {
  return <button type={type} className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return <label className={`field ${className}`}><span className="field-label">{label}{hint && <Hint text={hint}/>}</span>{children}</label>;
}

export function Hint({ text }: { text: string }) {
  return <span className="hint" title={text} role="img" aria-label={`Hint: ${text}`} tabIndex={0}>i</span>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input textarea ${props.className ?? ''}`} />;
}

export function PrivacyBadge({ compact = false }: { compact?: boolean }) {
  return <span className={`privacy-badge ${compact ? 'privacy-badge-compact' : ''}`} title="Your content is processed on this device and is never sent to QuicGen."><ShieldCheck size={15} aria-hidden="true"/><span>{compact ? 'Private by design' : '100% private · stays on this device'}</span></span>;
}

export function CopyButton({ value, label = 'Copy', className = '' }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const onCopy = async () => {
    const ok = await copyText(value);
    if (!ok) {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 1800);
      return;
    }
    setFailed(false);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return <><Button type="button" variant="secondary" className={`copy-button ${className}`} onClick={onCopy} disabled={!value} aria-label={copied ? 'Copied to clipboard' : failed ? 'Clipboard copy failed' : label} title={failed ? 'Clipboard copy failed. Try again.' : label}>
    {copied ? <Check size={15} aria-hidden="true"/> : <Copy size={15} aria-hidden="true"/>}<span>{copied ? 'Copied' : failed ? 'Try again' : label}</span>
  </Button>{(copied || failed) && <LiveRegion>{copied ? 'Copied to clipboard.' : 'Could not copy. Check your browser clipboard permissions.'}</LiveRegion>}</>;
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="section-heading">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{children && <p>{children}</p>}</div>;
}

export function LiveRegion({ children }: { children: ReactNode }) {
  return <span className="sr-only" role="status" aria-live="polite">{children}</span>;
}
