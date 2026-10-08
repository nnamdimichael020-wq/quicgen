import { useMemo, useState } from 'react';
import { ArrowLeftRight, CalendarDays, Clock3, Minus, Plus, Sparkles } from 'lucide-react';
import { Field, TextInput } from '../ui';
import { clamp, formatCurrency, formatNumber, safeNumber } from '../../lib/utils';

type PercentageMode = 'of' | 'what-percent' | 'change';
const todayISO = () => {
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
};

export function PercentageCalculator() {
  const [mode, setMode] = useState<PercentageMode>('of');
  const [percentage, setPercentage] = useState('20'); const [first, setFirst] = useState('150'); const [second, setSecond] = useState('');
  const p = safeNumber(percentage), a = safeNumber(first), b = safeNumber(second || (mode === 'change' ? '180' : '200'));
  const result = mode === 'of' ? (p / 100) * a : mode === 'what-percent' ? (b === 0 ? null : (a / b) * 100) : (a === 0 ? null : ((b - a) / Math.abs(a)) * 100);
  return <div className="tool-workspace percentage-workspace">
    <div className="calculator-tabs" role="group" aria-label="Percentage calculation type"><button aria-pressed={mode === 'of'} className={mode === 'of' ? 'active' : ''} onClick={() => setMode('of')}>Find a percentage</button><button aria-pressed={mode === 'what-percent'} className={mode === 'what-percent' ? 'active' : ''} onClick={() => setMode('what-percent')}>What percent?</button><button aria-pressed={mode === 'change'} className={mode === 'change' ? 'active' : ''} onClick={() => setMode('change')}>Percentage change</button></div>
    <div className="percentage-form">
      {mode === 'of' && <><Field label="Percentage"><span className="input-suffix"><TextInput type="number" value={percentage} onChange={(event) => setPercentage(event.target.value)}/><span>%</span></span></Field><span className="math-word">of</span><Field label="Number"><TextInput type="number" value={first} onChange={(event) => setFirst(event.target.value)}/></Field></>}
      {mode === 'what-percent' && <><Field label="Part"><TextInput type="number" value={first} onChange={(event) => setFirst(event.target.value)}/></Field><span className="math-word">is what percent of</span><Field label="Whole"><TextInput type="number" value={second || '200'} onChange={(event) => setSecond(event.target.value)}/></Field></>}
      {mode === 'change' && <><Field label="Starting value"><TextInput type="number" value={first} onChange={(event) => setFirst(event.target.value)}/></Field><span className="math-word"><ArrowLeftRight size={16}/></span><Field label="Ending value"><TextInput type="number" value={second || '180'} onChange={(event) => setSecond(event.target.value)}/></Field></>}
    </div>
    <div className="percentage-result"><span className="result-sparkle"><Sparkles size={17}/></span><div><span className="result-label">{mode === 'of' ? `${p}% of ${formatNumber(a)}` : mode === 'what-percent' ? `${formatNumber(a)} as a percentage of ${formatNumber(second ? b : 200)}` : 'Percentage change'}</span><strong>{result === null || !Number.isFinite(result) ? '—' : mode === 'of' ? formatNumber(result, 4) : `${result > 0 && mode === 'change' ? '+' : ''}${formatNumber(result, 4)}%`}</strong>{result === null && <small>Enter a non-zero {mode === 'change' ? 'starting value' : 'whole'} to calculate.</small>}</div></div>
    <div className="math-explanation">{mode === 'of' ? <span>Formula: <code>(percentage ÷ 100) × number</code></span> : mode === 'what-percent' ? <span>Formula: <code>(part ÷ whole) × 100</code></span> : <span>Formula: <code>((ending − starting) ÷ |starting|) × 100</code></span>}</div>
  </div>;
}

const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'];
export function TipCalculator() {
  const [bill, setBill] = useState('56.40'); const [tipPercent, setTipPercent] = useState(18); const [people, setPeople] = useState(2); const [currency, setCurrency] = useState('USD');
  const amount = Math.max(0, safeNumber(bill)); const tip = amount * tipPercent / 100; const total = amount + tip; const each = total / Math.max(1, people);
  return <div className="tool-workspace tip-workspace"><div className="tip-form-panel"><div className="tip-form-header"><div><span className="eyebrow">LET’S SETTLE UP</span><h3>Split the bill, not the math.</h3></div><select className="input currency-select" value={currency} onChange={(event) => setCurrency(event.target.value)} aria-label="Currency">{currencyOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
    <Field label="Bill amount"><span className="input-prefix"><span>{new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).formatToParts(1).find((part) => part.type === 'currency')?.value || '$'}</span><TextInput type="number" min="0" step="0.01" value={bill} onChange={(event) => setBill(event.target.value)}/></span></Field>
    <Field label="Tip percentage"><div className="tip-percent-line"><span className="range-value">{tipPercent}%</span><input type="range" min={0} max={50} step={1} value={tipPercent} onChange={(event) => setTipPercent(Number(event.target.value))} aria-label="Tip percentage"/></div></Field>
    <div className="tip-preset-row">{[10, 15, 18, 20, 25].map((amount) => <button key={amount} className={tipPercent === amount ? 'active' : ''} onClick={() => setTipPercent(amount)}>{amount}%</button>)}</div>
    <div className="people-row"><div><strong>Split between</strong><small>How many people are sharing?</small></div><div className="stepper-control"><button onClick={() => setPeople((value) => clamp(value - 1, 1, 50))} aria-label="One fewer person"><Minus size={14}/></button><span>{people} {people === 1 ? 'person' : 'people'}</span><button onClick={() => setPeople((value) => clamp(value + 1, 1, 50))} aria-label="One more person"><Plus size={14}/></button></div></div>
  </div><aside className="tip-summary"><span className="summary-eyebrow">EVERYONE CHIPS IN</span><div className="per-person-result"><span>Per person</span><strong>{formatCurrency(each, currency)}</strong><small>{people} {people === 1 ? 'person' : 'people'} sharing evenly</small></div><div className="tip-summary-divider"/><div className="tip-summary-row"><span>Bill before tip</span><strong>{formatCurrency(amount, currency)}</strong></div><div className="tip-summary-row"><span>Tip · {tipPercent}%</span><strong>{formatCurrency(tip, currency)}</strong></div><div className="tip-summary-row total-row"><span>Total bill</span><strong>{formatCurrency(total, currency)}</strong></div><div className="tip-summary-note">A fair split. No awkward guesswork.</div></aside></div>;
}

export function TimeCalculator() {
  const [time, setTime] = useState('09:00'); const [hours, setHours] = useState('2'); const [minutes, setMinutes] = useState('30'); const [operation, setOperation] = useState<'add' | 'subtract'>('add'); const [format, setFormat] = useState<'24h' | '12h'>('24h');
  const [hourPart, minutePart] = time.split(':').map(Number);
  const hasValidTime = Number.isFinite(hourPart) && Number.isFinite(minutePart);
  const totalMinutes = (hasValidTime ? hourPart * 60 + minutePart : 0) + (operation === 'add' ? 1 : -1) * (Math.floor(Math.max(0, safeNumber(hours))) * 60 + Math.floor(Math.max(0, safeNumber(minutes))));
  const dayOffset = Math.floor(totalMinutes / 1440);
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const resultDate = new Date(Date.UTC(2020, 0, 1, Math.floor(normalized / 60), normalized % 60));
  const result = hasValidTime ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', hour12: format === '12h', timeZone: 'UTC' }).format(resultDate) : '—';
  return <div className="tool-workspace time-workspace"><div className="time-form-grid"><Field label="Starting time"><TextInput type="time" value={time} onChange={(event) => setTime(event.target.value)}/></Field><span className="time-op-sign">{operation === 'add' ? '+' : '−'}</span><Field label="Hours"><TextInput type="number" min={0} max={999} value={hours} onChange={(event) => setHours(event.target.value)}/></Field><Field label="Minutes"><TextInput type="number" min={0} max={999} value={minutes} onChange={(event) => setMinutes(event.target.value)}/></Field></div><div className="time-action-row"><div className="segmented-control"><button className={operation === 'add' ? 'active' : ''} onClick={() => setOperation('add')}><Plus size={14}/>Add time</button><button className={operation === 'subtract' ? 'active' : ''} onClick={() => setOperation('subtract')}><Minus size={14}/>Subtract</button></div><div className="segmented-control clock-format"><button className={format === '24h' ? 'active' : ''} onClick={() => setFormat('24h')}>24-hour</button><button className={format === '12h' ? 'active' : ''} onClick={() => setFormat('12h')}>12-hour</button></div></div><div className="time-result"><span className="time-result-icon"><Clock3 size={21}/></span><div><span className="result-label">Resulting time</span><strong>{result}</strong>{dayOffset !== 0 && <small>{dayOffset > 0 ? `+${dayOffset} day${dayOffset === 1 ? '' : 's'}` : `${dayOffset} day${dayOffset === -1 ? '' : 's'} earlier`}</small>}</div><div className="time-result-dial" aria-hidden="true"><span/></div></div><p className="math-explanation">Calculations wrap across midnight automatically, with the day difference included.</p></div>;
}

type DateMode = 'difference' | 'add' | 'age';
export function DateCalculator() {
  const [mode, setMode] = useState<DateMode>('difference');
  const [start, setStart] = useState(todayISO()); const [end, setEnd] = useState(todayISO()); const [amount, setAmount] = useState('30'); const [direction, setDirection] = useState<'add' | 'subtract'>('add');
  const result = useMemo(() => {
    const dateFrom = parseDate(start); const dateTo = parseDate(end);
    if (mode === 'difference') {
      if (!dateFrom || !dateTo) return null;
      const days = Math.round((dateTo.getTime() - dateFrom.getTime()) / 86_400_000);
      return { kind: 'difference' as const, days: Math.abs(days), direction: days < 0 ? 'earlier' : 'later', weeks: Math.floor(Math.abs(days) / 7), remainder: Math.abs(days) % 7 };
    }
    if (mode === 'add') {
      if (!dateFrom) return null;
      const resultDate = new Date(dateFrom); resultDate.setUTCDate(resultDate.getUTCDate() + (direction === 'add' ? 1 : -1) * Math.floor(Math.max(0, safeNumber(amount))));
      return { kind: 'add' as const, date: resultDate };
    }
    if (!dateFrom || dateFrom.getTime() > Date.now()) return null;
    const today = parseDate(todayISO())!;
    let years = today.getUTCFullYear() - dateFrom.getUTCFullYear();
    let months = today.getUTCMonth() - dateFrom.getUTCMonth();
    let days = today.getUTCDate() - dateFrom.getUTCDate();
    if (days < 0) { months -= 1; days += new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0)).getUTCDate(); }
    if (months < 0) { years -= 1; months += 12; }
    return { kind: 'age' as const, years, months, days };
  }, [mode, start, end, amount, direction]);

  return <div className="tool-workspace date-workspace"><div className="calculator-tabs" role="group" aria-label="Date calculation type"><button aria-pressed={mode === 'difference'} className={mode === 'difference' ? 'active' : ''} onClick={() => setMode('difference')}>Days between</button><button aria-pressed={mode === 'add'} className={mode === 'add' ? 'active' : ''} onClick={() => setMode('add')}>Add / subtract</button><button aria-pressed={mode === 'age'} className={mode === 'age' ? 'active' : ''} onClick={() => setMode('age')}>Age calculator</button></div>
    <div className="date-form-grid">{mode === 'difference' ? <><Field label="Start date"><TextInput type="date" value={start} onChange={(event) => setStart(event.target.value)}/></Field><span className="date-form-arrow"><ArrowLeftRight size={17}/></span><Field label="End date"><TextInput type="date" value={end} onChange={(event) => setEnd(event.target.value)}/></Field></> : mode === 'add' ? <><Field label="Starting date"><TextInput type="date" value={start} onChange={(event) => setStart(event.target.value)}/></Field><Field label="Days"><TextInput type="number" min={0} value={amount} onChange={(event) => setAmount(event.target.value)}/></Field><Field label="Direction"><select className="input" value={direction} onChange={(event) => setDirection(event.target.value as typeof direction)}><option value="add">Add days</option><option value="subtract">Subtract days</option></select></Field></> : <Field label="Date of birth"><TextInput type="date" max={todayISO()} value={start} onChange={(event) => setStart(event.target.value)}/></Field>}</div>
    <div className={`date-result ${mode === 'age' ? 'date-result-age' : ''}`}><span className="date-result-icon"><CalendarDays size={21}/></span>{result?.kind === 'difference' ? <div><span className="result-label">Time between these dates</span><strong>{formatNumber(result.days)} <small>{result.days === 1 ? 'day' : 'days'}</small></strong><span className="date-secondary-result">{result.weeks} {result.weeks === 1 ? 'week' : 'weeks'} and {result.remainder} {result.remainder === 1 ? 'day' : 'days'} · {result.direction}</span></div> : result?.kind === 'add' ? <div><span className="result-label">Your new date</span><strong>{new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' }).format(result.date)}</strong><span className="date-secondary-result">{result.date.toISOString().slice(0, 10)}</span></div> : result?.kind === 'age' ? <div><span className="result-label">Age today</span><strong>{result.years} <small>years</small></strong><span className="date-secondary-result">{result.months} months and {result.days} days</span></div> : <div><span className="result-label">Choose a valid date</span><strong>—</strong></div>}</div>
    <p className="math-explanation">Uses calendar dates in UTC to avoid daylight-saving changes affecting the day count.</p></div>;
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
  return parsed;
}
