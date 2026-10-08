import { useMemo, useState } from 'react';
import { Check, Download, Eye, EyeOff, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Button, CopyButton, Field, LiveRegion, TextInput } from '../ui';
import { clamp, copyText, downloadBlob, getStored, removeStored, secureRandomInt, secureRandomString, setStored } from '../../lib/utils';

const charGroups = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};
const ambiguous = '0O1lI|';

function createPassword(length: number, settings: Record<keyof typeof charGroups, boolean>, omitAmbiguous: boolean, pronounceable: boolean) {
  if (pronounceable) {
    const consonants = omitAmbiguous ? 'bcdfghjkmnpqrstvwxyz' : 'bcdfghjklmnpqrstvwxyz';
    const vowels = omitAmbiguous ? 'aeuy' : 'aeiouy';
    let output = '';
    for (let i = 0; i < length; i += 1) output += (i % 2 === 0 ? consonants : vowels)[secureRandomInt(0, (i % 2 === 0 ? consonants : vowels).length - 1)];
    return output.charAt(0).toUpperCase() + output.slice(1);
  }
  const selected = (Object.keys(charGroups) as (keyof typeof charGroups)[]).filter((key) => settings[key]);
  if (!selected.length) throw new Error('Select at least one character type.');
  if (length < selected.length) throw new Error('Increase the length to fit one character from each selected type.');
  const chooseFrom = (value: string) => omitAmbiguous ? [...value].filter((character) => !ambiguous.includes(character)).join('') : value;
  const groups = selected.map((key) => chooseFrom(charGroups[key])).filter(Boolean);
  const pool = [...new Set(groups.join(''))].join('');
  if (!pool) throw new Error('The selected characters leave an empty character set.');
  const result = groups.map((group) => secureRandomString(1, group));
  result.push(secureRandomString(length - result.length, pool));
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join('');
}

function scorePassword(password: string, settings: Record<keyof typeof charGroups, boolean>, omitAmbiguous: boolean, pronounceable: boolean) {
  const selectedGroups = Object.entries(settings).filter(([, on]) => on).map(([key]) => charGroups[key as keyof typeof charGroups]);
  const characterPool = selectedGroups.reduce((total, group) => total + (omitAmbiguous ? [...group].filter((character) => !ambiguous.includes(character)).length : group.length), 0);
  const entropy = pronounceable ? Math.max(0, password.length * 3.2) : password.length * Math.log2(Math.max(1, characterPool));
  const score = entropy < 28 ? 1 : entropy < 45 ? 2 : entropy < 70 ? 3 : 4;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const feedback = password.length < 12 ? 'Try 12 or more characters for better protection.' : entropy < 45 ? 'Add another character type or increase the length.' : password.length >= 16 ? 'Nice—long, unique passwords are harder to guess.' : 'Consider adding a few more characters for extra strength.';
  return { score, label: labels[score], entropy, feedback };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(18);
  const [settings, setSettings] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [omitAmbiguous, setOmitAmbiguous] = useState(true);
  const [pronounceable, setPronounceable] = useState(false);
  const [password, setPassword] = useState(() => createPassword(18, { lowercase: true, uppercase: true, numbers: true, symbols: true }, true, false));
  const [showPassword, setShowPassword] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [error, setError] = useState('');
  const [historyEnabled, setHistoryEnabled] = useState(() => getStored('quicgen-password-history-enabled', false));
  const [history, setHistory] = useState<string[]>(() => getStored('quicgen-password-history', []));
  const strength = useMemo(() => scorePassword(password, settings, omitAmbiguous, pronounceable), [password, settings, omitAmbiguous, pronounceable]);

  const generate = () => {
    try {
      const value = createPassword(length, settings, omitAmbiguous, pronounceable);
      setPassword(value); setError(''); setAnnouncement('A new password has been generated.');
      if (historyEnabled) {
        const next = [value, ...history.filter((item) => item !== value)].slice(0, 5);
        setHistory(next); setStored('quicgen-password-history', next);
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not generate a password.'); setAnnouncement('Password could not be generated. Check the settings.'); }
  };
  const toggleHistory = (checked: boolean) => {
    setHistoryEnabled(checked); setStored('quicgen-password-history-enabled', checked);
    if (!checked) { setHistory([]); removeStored('quicgen-password-history'); }
  };
  const setGroup = (key: keyof typeof charGroups, checked: boolean) => setSettings((current) => ({ ...current, [key]: checked }));
  return <div className="tool-workspace password-workspace">
    <div className="password-layout">
      <div className="password-controls">
        <div className="password-display-card">
          <div className="password-display-heading"><span className="eyebrow">YOUR NEW PASSWORD</span><span className={`strength-tag strength-${strength.score}`}><i/>{strength.label}</span></div>
          <div className="password-output-row"><input className={`password-output ${showPassword ? '' : 'password-hidden'}`} readOnly aria-label={showPassword ? 'Generated password' : 'Generated password, hidden'} value={showPassword ? password : '•'.repeat(password.length)}/><button className="icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button><CopyButton value={password} label="Copy"/></div>
          <div className="strength-meter" aria-label={`Password strength: ${strength.label}`}><span className={strength.score >= 1 ? 'filled' : ''}/><span className={strength.score >= 2 ? 'filled' : ''}/><span className={strength.score >= 3 ? 'filled' : ''}/><span className={strength.score >= 4 ? 'filled' : ''}/></div>
          <div className="strength-detail"><span>{Math.round(strength.entropy)} bits estimated entropy · estimate only, no breach lookup</span><span>{strength.feedback}</span></div>
          {error && <p className="error-message" role="alert">{error}</p>}
          <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
        </div>
        <div className="settings-card">
          <div className="settings-heading"><div><h3>Make it yours</h3><p>Choose the details that matter to you.</p></div><button className="text-button" onClick={() => { setLength(18); setSettings({ lowercase: true, uppercase: true, numbers: true, symbols: true }); setOmitAmbiguous(true); setPronounceable(false); setError(''); }}>Reset</button></div>
          <Field label="Password length"><span className="range-line"><input type="range" min="4" max="64" value={length} onChange={(event) => setLength(Number(event.target.value))} aria-label="Password length"/><span className="range-value">{length}</span></span></Field>
          <div className="character-choice-grid">{(Object.keys(charGroups) as (keyof typeof charGroups)[]).map((key) => <label className="check-card" key={key}><input type="checkbox" checked={settings[key]} onChange={(event) => setGroup(key, event.target.checked)}/><span className="custom-check"><Check size={12}/></span><span><strong>{{ lowercase: 'Lowercase', uppercase: 'Uppercase', numbers: 'Numbers', symbols: 'Symbols' }[key]}</strong><small>{key === 'symbols' ? '! @ #' : key === 'numbers' ? '0–9' : key === 'lowercase' ? 'a–z' : 'A–Z'}</small></span></label>)}</div>
          <label className="toggle-row"><span><strong>Exclude look-alike characters</strong><small>Skip O, 0, l, 1 and I</small></span><input type="checkbox" checked={omitAmbiguous} onChange={(event) => setOmitAmbiguous(event.target.checked)} aria-label="Exclude look-alike characters"/><i className="toggle-switch"/></label>
          <label className="toggle-row"><span><strong>Pronounceable password</strong><small>Easier to read aloud; uses alternating letters</small></span><input type="checkbox" checked={pronounceable} onChange={(event) => setPronounceable(event.target.checked)} aria-label="Generate a pronounceable password"/><i className="toggle-switch"/></label>
          <Button className="generate-password-button" onClick={generate}><RefreshCw size={16}/>Generate new password</Button>
        </div>
      </div>
      <aside className="password-side">
        <div className="password-security-card"><span className="security-shield"><ShieldCheck size={20}/></span><h3>Made with real randomness</h3><p>Passwords are generated in this tab with the Web Crypto API. We never transmit or store them unless you explicitly switch on local history.</p><div><span><Check size={14}/> Cryptographically secure</span><span><Check size={14}/> No server requests</span></div></div>
        <div className="history-card"><div className="history-header"><div><h3>Recent passwords</h3><p>History is off until you enable it.</p></div><label className="mini-switch"><input type="checkbox" checked={historyEnabled} onChange={(event) => toggleHistory(event.target.checked)} aria-label="Save password history on this device"/><i className="toggle-switch"/></label></div>
          {!historyEnabled ? <div className="history-opt-in"><ShieldCheck size={17}/><span>Keep a short history on this device for quick reuse. It never syncs or leaves your browser.</span></div> : history.length ? <div className="history-list">{history.map((item, index) => <div className="history-item" key={`${index}-${item}`}><span>{item}</span><CopyButton value={item} label="Copy"/></div>)}<button className="history-clear" onClick={() => { setHistory([]); removeStored('quicgen-password-history'); }}><Trash2 size={13}/>Clear history</button></div> : <p className="empty-history">New passwords you generate will appear here.</p>}
        </div>
      </aside>
    </div>
  </div>;
}

function createUuid() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((part) => part.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function UUIDGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 5 }, createUuid));
  const generate = () => setIds(Array.from({ length: Math.floor(clamp(quantity, 1, 100)) }, createUuid));
  return <div className="tool-workspace uuid-workspace">
    <div className="uuid-toolbar"><div className="uuid-toolbar-copy"><span className="uuid-symbol"><span>8</span></span><div><h3>Version 4 UUIDs</h3><p>Randomly generated with browser cryptography.</p></div></div><div className="uuid-controls"><Field label="Quantity"><TextInput type="number" min={1} max={100} value={quantity} onChange={(event) => setQuantity(Math.floor(clamp(Number(event.target.value) || 1, 1, 100)))}/></Field><Button onClick={generate}><RefreshCw size={15}/>Generate batch</Button></div></div>
    <div className="uuid-list" role="region" aria-label="Generated UUID v4 values" aria-live="polite">{ids.map((id, index) => <div className="uuid-row" key={id}><span className="uuid-index">{String(index + 1).padStart(2, '0')}</span><code>{id}</code><CopyButton value={id} label="Copy"/></div>)}</div>
    <div className="uuid-bottom"><span><ShieldCheck size={15}/> UUID v4 · 122 random bits</span><div><CopyButton value={ids.join('\n')} label="Copy all"/><Button variant="quiet" onClick={() => downloadBlob(new Blob([ids.join('\n')], { type: 'text/plain;charset=utf-8' }), 'quicgen-uuids.txt')}><Download size={15}/>Download .txt</Button></div></div>
  </div>;
}

export function RandomNumberGenerator() {
  const [min, setMin] = useState('1'); const [max, setMax] = useState('100'); const [quantity, setQuantity] = useState('5');
  const [unique, setUnique] = useState(false); const [results, setResults] = useState<number[]>([]); const [error, setError] = useState('');
  const generate = () => {
    const low = Number(min), high = Number(max), count = Math.floor(clamp(Number(quantity) || 1, 1, 100));
    if (!Number.isSafeInteger(low) || !Number.isSafeInteger(high) || high < low) { setError('Enter whole numbers and make sure the maximum is at least the minimum.'); return; }
    if (unique && BigInt(high) - BigInt(low) + 1n < BigInt(count)) { setError('There aren’t enough unique numbers in that range. Increase the range or lower the quantity.'); return; }
    try {
      let generated: number[];
      if (unique && high - low < 100_000) {
        const values = Array.from({ length: high - low + 1 }, (_, index) => low + index);
        for (let index = 0; index < count; index += 1) { const pick = secureRandomInt(index, values.length - 1); [values[index], values[pick]] = [values[pick], values[index]]; }
        generated = values.slice(0, count);
      } else if (unique) {
        const chosen = new Set<number>();
        while (chosen.size < count) chosen.add(secureRandomInt(low, high));
        generated = [...chosen];
      } else generated = Array.from({ length: count }, () => secureRandomInt(low, high));
      setResults(generated); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not generate numbers.'); }
  };
  return <div className="tool-workspace random-workspace">
    <div className="random-settings-grid"><Field label="Minimum"><TextInput type="number" value={min} onChange={(event) => setMin(event.target.value)}/></Field><Field label="Maximum"><TextInput type="number" value={max} onChange={(event) => setMax(event.target.value)}/></Field><Field label="How many?"><TextInput type="number" min={1} max={100} value={quantity} onChange={(event) => setQuantity(event.target.value)}/></Field></div>
    <label className="toggle-row compact-toggle"><span><strong>Unique results</strong><small>Don’t repeat a number in this draw</small></span><input type="checkbox" checked={unique} onChange={(event) => setUnique(event.target.checked)} aria-label="Unique numbers only"/><i className="toggle-switch"/></label>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="result-actions-row"><Button onClick={generate}><RefreshCw size={15}/>Generate numbers</Button>{results.length > 0 && <CopyButton value={results.join(', ')} label="Copy all"/>}</div>
    <div className="number-result-grid" role="region" aria-label="Generated random numbers" aria-live="polite">{results.map((number, index) => <div className="number-result" key={`${index}-${number}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{number}</strong><CopyButton value={String(number)} label="Copy number"/></div>)}</div>
    {!results.length && <div className="empty-result"><span className="empty-result-icon">?</span><p>Your random numbers will show up here.</p></div>}
    <p className="tool-note"><ShieldCheck size={14}/> Generated with cryptographically secure browser randomness.</p>
  </div>;
}

export function RandomStringGenerator() {
  const [length, setLength] = useState('16'); const [quantity, setQuantity] = useState('5');
  const [sets, setSets] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: false });
  const [custom, setCustom] = useState(''); const [results, setResults] = useState<string[]>([]); const [error, setError] = useState('');
  const generate = () => {
    const size = Math.floor(clamp(Number(length) || 1, 1, 256)); const count = Math.floor(clamp(Number(quantity) || 1, 1, 50));
    const alphabet = custom.trim() || Object.entries(sets).filter(([, active]) => active).map(([key]) => charGroups[key as keyof typeof charGroups]).join('');
    if (!alphabet) { setError('Choose a character set or enter your own characters.'); return; }
    try { setResults(Array.from({ length: count }, () => secureRandomString(size, alphabet))); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not generate strings.'); }
  };
  return <div className="tool-workspace random-workspace">
    <div className="random-settings-grid"><Field label="Length"><TextInput type="number" min={1} max={256} value={length} onChange={(event) => setLength(event.target.value)}/></Field><Field label="How many strings?"><TextInput type="number" min={1} max={50} value={quantity} onChange={(event) => setQuantity(event.target.value)}/></Field><Field label="Custom characters" hint="When provided, this exact character set is used instead of the options below."><TextInput value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Optional"/></Field></div>
    <div className="string-options">{Object.keys(sets).map((key) => <label className="inline-check" key={key}><input type="checkbox" checked={sets[key as keyof typeof sets]} disabled={Boolean(custom.trim())} onChange={(event) => setSets((current) => ({ ...current, [key]: event.target.checked }))}/><span>{key === 'lowercase' ? 'a–z' : key === 'uppercase' ? 'A–Z' : key === 'numbers' ? '0–9' : 'Symbols'}</span></label>)}</div>
    {error && <p className="error-message" role="alert">{error}</p>}<div className="result-actions-row"><Button onClick={generate}><RefreshCw size={15}/>Generate strings</Button>{results.length > 0 && <CopyButton value={results.join('\n')} label="Copy all"/>}</div>
    <div className="string-result-list">{results.map((value, index) => <div className="string-result" key={`${index}-${value}`}><code>{value}</code><CopyButton value={value} label="Copy"/></div>)}</div>
    {!results.length && <div className="empty-result"><span className="empty-result-icon">Aa</span><p>Your random strings will show up here.</p></div>}
    <p className="tool-note"><ShieldCheck size={14}/> Each character is chosen with unbiased cryptographic randomness.</p>
  </div>;
}

function rgbToHsl(red: number, green: number, blue: number) {
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

export function RandomColorGenerator() {
  const [colors, setColors] = useState<string[]>(() => Array.from({ length: 6 }, createRandomHex));
  const [format, setFormat] = useState<'HEX' | 'RGB' | 'HSL'>('HEX');
  const [copiedColor, setCopiedColor] = useState('');
  const [failedColor, setFailedColor] = useState('');
  const makePalette = () => { setColors(Array.from({ length: 6 }, createRandomHex)); setCopiedColor(''); setFailedColor(''); };
  const toRgb = (hex: string) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
  const colorValue = (hex: string) => { const { r, g, b } = toRgb(hex); return format === 'HEX' ? hex.toUpperCase() : format === 'RGB' ? `rgb(${r}, ${g}, ${b})` : rgbToHsl(r, g, b); };
  const copyColor = async (color: string) => {
    const copied = await copyText(colorValue(color));
    if (copied) {
      setCopiedColor(color); setFailedColor('');
      window.setTimeout(() => setCopiedColor((current) => current === color ? '' : current), 1300);
    } else {
      setCopiedColor(''); setFailedColor(color);
      window.setTimeout(() => setFailedColor((current) => current === color ? '' : current), 1800);
    }
  };
  return <div className="tool-workspace color-gen-workspace"><div className="color-palette-toolbar"><div><span className="eyebrow">A little color, just for you</span><p>Click any value to copy it to your clipboard.</p></div><div className="color-gen-actions"><select className="input format-select" value={format} onChange={(event) => { setFormat(event.target.value as typeof format); setCopiedColor(''); setFailedColor(''); }} aria-label="Color format"><option>HEX</option><option>RGB</option><option>HSL</option></select><Button onClick={makePalette}><RefreshCw size={15}/>New palette</Button></div></div>
    <div className="generated-color-grid">{colors.map((color, index) => <button className="generated-color" key={`${color}-${index}`} onClick={() => copyColor(color)} title={copiedColor === color ? 'Copied to clipboard' : failedColor === color ? 'Clipboard copy failed. Try again.' : `Copy ${colorValue(color)}`} aria-label={copiedColor === color ? 'Copied to clipboard' : failedColor === color ? 'Clipboard copy failed. Activate to try again.' : `Copy ${colorValue(color)}`}><span className="generated-color-swatch" style={{ backgroundColor: color }}><span>{copiedColor === color ? 'Copied ✓' : failedColor === color ? 'Try again' : 'Copy'}</span></span><span className="generated-color-meta"><span>COLOR {String(index + 1).padStart(2, '0')}</span><strong>{colorValue(color)}</strong></span></button>)}</div>
    <LiveRegion>{copiedColor ? `${colorValue(copiedColor)} copied to clipboard.` : failedColor ? 'Could not copy the color. Check your browser clipboard permissions.' : ''}</LiveRegion>
    <p className="tool-note"><ShieldCheck size={14}/> Colors generated on your device · no data saved.</p></div>;
}
function createRandomHex() { const values = new Uint8Array(3); crypto.getRandomValues(values); return `#${[...values].map((value) => value.toString(16).padStart(2, '0')).join('')}`; }

export function DiceRoller() {
  const [dice, setDice] = useState(2); const [sides, setSides] = useState(6); const [roll, setRoll] = useState<number[]>([]);
  const rollDice = () => setRoll(Array.from({ length: clamp(dice, 1, 20) }, () => secureRandomInt(1, sides)));
  const total = roll.reduce((sum, value) => sum + value, 0);
  return <div className="tool-workspace dice-workspace"><div className="dice-controls"><div className="field"><span className="field-label">Number of dice</span><span className="stepper-control"><button onClick={() => setDice((n) => clamp(n - 1, 1, 20))} aria-label="Remove a die">−</button><TextInput type="number" min={1} max={20} value={dice} aria-label="Number of dice" onChange={(event) => setDice(Math.floor(clamp(Number(event.target.value) || 1, 1, 20)))}/><button onClick={() => setDice((n) => clamp(n + 1, 1, 20))} aria-label="Add a die">+</button></span></div><Field label="Sides on each die"><select className="input" value={sides} onChange={(event) => setSides(Number(event.target.value))}><option value={4}>4-sided · d4</option><option value={6}>6-sided · d6</option><option value={8}>8-sided · d8</option><option value={10}>10-sided · d10</option><option value={12}>12-sided · d12</option><option value={20}>20-sided · d20</option></select></Field><Button className="roll-button" onClick={rollDice}><span className="dice-glyph">⚄</span>Roll {dice} {sides}-sided {dice === 1 ? 'die' : 'dice'}</Button></div>
    <div className="dice-stage" aria-live="polite">{roll.length ? <><div className="dice-results">{roll.map((value, index) => <div className={`die die-${sides}`} key={`${index}-${value}`}><span>d{sides}</span><strong>{value}</strong></div>)}</div><div className="dice-total"><span>TOTAL</span><strong>{total}</strong><span>{roll.length} {roll.length === 1 ? 'die' : 'dice'} rolled</span></div></> : <div className="dice-empty"><span className="dice-empty-glyph">⚄</span><strong>Ready when you are.</strong><span>Your dice will land right here.</span></div>}</div>
    <p className="tool-note"><ShieldCheck size={14}/> Each die uses secure random numbers, generated locally.</p></div>;
}
