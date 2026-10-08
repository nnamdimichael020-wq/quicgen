import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownUp, Check, Copy, ShieldCheck, Sparkles } from 'lucide-react';
import { md5, sha1 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { Button, CopyButton, Field, TextArea, TextInput } from '../ui';
import { copyText } from '../../lib/utils';

function hexToRgb(hex: string) {
  const cleaned = hex.trim().replace(/^#/, '');
  const expanded = cleaned.length === 3 ? [...cleaned].map((char) => char + char).join('') : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
  return { r: Number.parseInt(expanded.slice(0, 2), 16), g: Number.parseInt(expanded.slice(2, 4), 16), b: Number.parseInt(expanded.slice(4, 6), 16) };
}
function rgbToHsl({ r: red, g: green, b: blue }: { r: number; g: number; b: number }) {
  const r = red / 255, g = green / 255, b = blue / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  let h = 0, s = 0; const l = (max + min) / 2;
  if (delta) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60); if (h < 0) h += 360;
  }
  return `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function ColorPicker() {
  const [hex, setHex] = useState('#3B82F6');
  const parsed = useMemo(() => hexToRgb(hex), [hex]);
  const canonical = parsed ? `#${[parsed.r, parsed.g, parsed.b].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}` : '';
  const rgb = parsed ? `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})` : '';
  const hsl = parsed ? rgbToHsl(parsed) : '';
  const previewInk = parsed && (parsed.r * 0.299 + parsed.g * 0.587 + parsed.b * 0.114) > 158 ? '#142033' : '#ffffff';
  return <div className="tool-workspace color-picker-workspace"><div className="color-picker-layout"><div className="color-picker-preview" style={{ backgroundColor: parsed ? canonical : '#64748b', color: previewInk }}><div className="color-preview-top"><span className="eyebrow">YOUR COLOR, IN CONTEXT</span><span className="color-preview-check"><Check size={16}/></span></div><div className="color-preview-main"><span>Good color<br/>has a feeling.</span><small>Choose a shade you love.</small></div><div className="color-preview-bottom"><span className="color-preview-swatch"/><span>{canonical || 'Invalid color'}</span></div></div><div className="color-values-panel"><div><span className="eyebrow">COLOR CONVERTER</span><h3>Find the right shade.</h3><p>Pick a color or enter a HEX code to get every format instantly.</p></div><div className="picker-main-input"><input type="color" value={canonical || '#3b82f6'} onChange={(event) => setHex(event.target.value)} aria-label="Choose color visually"/><Field label="HEX"><TextInput value={hex} onChange={(event) => setHex(event.target.value)} placeholder="#3B82F6" maxLength={7}/></Field></div>
    {!parsed && <p className="error-message" role="alert">Enter a valid 3- or 6-digit HEX color.</p>}
    <div className="color-value-list"><ColorValue label="HEX" value={canonical}/><ColorValue label="RGB" value={rgb}/><ColorValue label="HSL" value={hsl}/></div><p className="tool-note"><ShieldCheck size={14}/> Nothing is sent to a server. Click a value to copy.</p></div></div></div>;
}
function ColorValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (!value || !(await copyText(value))) return; setCopied(true); window.setTimeout(() => setCopied(false), 1200); };
  return <button className="color-value-row" onClick={copy} disabled={!value}><span className="color-value-label">{label}</span><code>{value || '—'}</code><span className="color-value-copy">{copied ? <><Check size={14}/>Copied</> : <><Copy size={14}/>Copy</>}</span></button>;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const blockSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += blockSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + blockSize));
  return btoa(binary);
}
function base64ToText(input: string) {
  const cleaned = input.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!cleaned || !/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 === 1) throw new Error('That doesn’t look like valid Base64. Check the input and try again.');
  const padded = cleaned.padEnd(Math.ceil(cleaned.length / 4) * 4, '=');
  let binary: string;
  try { binary = atob(padded); } catch { throw new Error('That doesn’t look like valid Base64. Check the input and try again.'); }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error('This Base64 data is valid but does not contain readable UTF-8 text.'); }
}

type Base64Mode = 'encode' | 'decode';
export function Base64Tool() {
  const [mode, setMode] = useState<Base64Mode>('encode'); const [input, setInput] = useState('QuicGen keeps your text right here ✨');
  const result = useMemo(() => {
    if (!input) return { value: '', error: '' };
    try { return { value: mode === 'encode' ? bytesToBase64(new TextEncoder().encode(input)) : base64ToText(input), error: '' }; }
    catch (error) { return { value: '', error: error instanceof Error ? error.message : 'Could not convert this value.' }; }
  }, [input, mode]);
  const swap = () => { if (!result.error && result.value) { setInput(result.value); setMode((current) => current === 'encode' ? 'decode' : 'encode'); } };
  return <div className="tool-workspace base64-workspace"><div className="conversion-mode-tabs" role="group" aria-label="Base64 operation"><button aria-pressed={mode === 'encode'} className={mode === 'encode' ? 'active' : ''} onClick={() => setMode('encode')}>Text to Base64 <span>Encode</span></button><span className="conversion-arrows"><ArrowDownUp size={16}/></span><button aria-pressed={mode === 'decode'} className={mode === 'decode' ? 'active' : ''} onClick={() => setMode('decode')}>Base64 to text <span>Decode</span></button></div><div className="conversion-columns"><Field label={mode === 'encode' ? 'Text to encode' : 'Base64 input'} hint="Conversion runs locally. Base64 is an encoding, not encryption."><TextArea value={input} onChange={(event) => setInput(event.target.value)} rows={8} maxLength={500_000} placeholder={mode === 'encode' ? 'Type or paste your text…' : 'Paste Base64 text…'}/></Field><div className="conversion-swap"><Button variant="secondary" onClick={swap} disabled={!result.value || Boolean(result.error)} title="Use this result as the next input"><ArrowDownUp size={16}/><span>Use result as input</span></Button></div><Field label={mode === 'encode' ? 'Base64 output' : 'Decoded text'}><TextArea value={result.value} readOnly rows={8} placeholder={result.error ? 'Fix the input to see a result' : 'Your result will appear here…'}/></Field></div>{result.error && <div className="error-banner" role="alert"><AlertTriangle size={16}/>{result.error}</div>}<div className="conversion-footer"><span><ShieldCheck size={14}/> UTF-8 supported · on-device only</span><CopyButton value={result.value} label="Copy output"/></div><div className="encoding-note"><strong>Remember:</strong> Base64 is an encoding format, not encryption. Anyone can decode it.</div></div>;
}

export function HashGenerator() {
  const [input, setInput] = useState('QuicGen'); const [algorithm, setAlgorithm] = useState<'MD5' | 'SHA-1' | 'SHA-256'>('SHA-256');
  const output = useMemo(() => {
    if (!input) return '';
    const bytes = new TextEncoder().encode(input);
    if (algorithm === 'MD5') return bytesToHex(md5(bytes));
    if (algorithm === 'SHA-1') return bytesToHex(sha1(bytes));
    return bytesToHex(sha256(bytes));
  }, [input, algorithm]);
  return <div className="tool-workspace hash-workspace"><div className="hash-input-header"><div><span className="eyebrow">TEXT TO HASH</span><p>Enter any text to calculate its digest.</p></div><span className="hash-local-tag"><ShieldCheck size={14}/> Local only</span></div><TextArea className="hash-input" value={input} onChange={(event) => setInput(event.target.value)} rows={7} maxLength={250_000} placeholder="Type or paste your text…" aria-label="Text to hash"/><div className="hash-algorithm-select"><span className="field-label">Algorithm</span><div className="algorithm-options" role="group" aria-label="Hash algorithm">{(['MD5', 'SHA-1', 'SHA-256'] as const).map((item) => <button key={item} className={algorithm === item ? 'active' : ''} aria-pressed={algorithm === item} onClick={() => setAlgorithm(item)}><span>{item}</span><small>{item === 'MD5' ? '128-bit' : item === 'SHA-1' ? '160-bit' : '256-bit'}</small></button>)}</div></div><div className="hash-output-card"><div className="hash-output-header"><div><span className="eyebrow">{algorithm} DIGEST</span><span className="hash-output-length">{output.length} hex characters</span></div><CopyButton value={output} label="Copy hash"/></div><code className="hash-output-code">{output || 'Your hash will appear here…'}</code></div>{algorithm !== 'SHA-256' && <div className="hash-warning"><AlertTriangle size={17}/><span><strong>Legacy algorithm, compatibility only.</strong> {algorithm} is not suitable for new security-sensitive applications. Use SHA-256 for general integrity checks. Never use a fast hash like this to store passwords.</span></div>}<div className="hash-info"><span className="hash-info-icon"><Sparkles size={16}/></span><p>Even a tiny input change creates a very different digest. This is a one-way fingerprint, not encryption.</p></div></div>;
}
