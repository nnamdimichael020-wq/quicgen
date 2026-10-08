import { ShieldCheck } from 'lucide-react';

export default function PrivacyCallout() {
  return <div className="privacy-callout"><span className="privacy-callout-icon"><ShieldCheck size={17}/></span><span><strong>Private by design</strong><small>Your content is processed on this device. Nothing is uploaded or sent to QuicGen.</small></span><span className="privacy-live-dot" aria-hidden="true"/></div>;
}
