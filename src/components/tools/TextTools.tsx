import { useMemo, useState } from 'react';
import { AlignLeft, Download, RefreshCw, Trash2, Type, WandSparkles } from 'lucide-react';
import { Button, CopyButton, Field, TextArea, TextInput } from '../ui';
import { clamp, downloadBlob, secureRandomInt } from '../../lib/utils';

const wordPattern = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function WordCounter() {
  const [text, setText] = useState('');
  const counts = useMemo(() => {
    const words = text.match(wordPattern) ?? [];
    const characters = [...text].length;
    const noSpaces = [...text.replace(/\s/gu, '')].length;
    const sentences = text.trim() ? (text.match(/[.!?]+(?=\s|$)/gu) ?? []).length || (/[\p{L}\p{N}]/u.test(text) ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/u).filter((paragraph) => paragraph.trim()).length : 0;
    const readingMinutes = words.length / 200;
    const reading = readingMinutes < 1 ? 'Less than a minute' : `${Math.ceil(readingMinutes)} min${Math.ceil(readingMinutes) === 1 ? '' : 's'}`;
    return { words: words.length, characters, noSpaces, sentences, paragraphs, reading };
  }, [text]);
  return <div className="tool-workspace word-workspace"><div className="text-tool-toolbar"><div><span className="eyebrow">LIVE COUNTS</span><p>Your numbers update while you write.</p></div><div className="text-actions">{text && <CopyButton value={text} label="Copy text"/>}<Button variant="quiet" onClick={() => setText('')} disabled={!text}><Trash2 size={14}/>Clear</Button></div></div><TextArea className="writing-area" value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste or write your text here…" rows={10} aria-label="Text to count"/>
    <div className="word-stats-grid"><StatCard label="Words" value={counts.words} icon={<AlignLeft size={16}/>} highlight/><StatCard label="Characters" value={counts.characters} icon={<Type size={16}/>}/><StatCard label="No spaces" value={counts.noSpaces} icon={<span className="spaces-symbol">↔</span>}/><StatCard label="Sentences" value={counts.sentences} icon={<span className="sentence-symbol">¶</span>}/><StatCard label="Paragraphs" value={counts.paragraphs} icon={<AlignLeft size={16}/>}/><StatCard label="Reading time" value={counts.reading} icon={<span className="reading-symbol">◷</span>}/></div><p className="tool-note">Reading time uses an average of 200 words per minute. Everything is counted locally.</p></div>;
}

function StatCard({ label, value, icon, highlight = false }: { label: string; value: string | number; icon: React.ReactNode; highlight?: boolean }) {
  return <div className={`word-stat ${highlight ? 'word-stat-highlight' : ''}`}><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></div>;
}

type CaseMode = 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'alternating';
const caseOptions: { id: CaseMode; label: string; example: string }[] = [
  { id: 'uppercase', label: 'UPPERCASE', example: 'HELLO WORLD' }, { id: 'lowercase', label: 'lowercase', example: 'hello world' }, { id: 'title', label: 'Title Case', example: 'Hello World' }, { id: 'sentence', label: 'Sentence case', example: 'Hello world.' }, { id: 'alternating', label: 'aLtErNaTiNg', example: 'hElLo WoRlD' },
];
function convertCase(text: string, mode: CaseMode) {
  if (mode === 'uppercase') return text.toLocaleUpperCase();
  if (mode === 'lowercase') return text.toLocaleLowerCase();
  if (mode === 'title') return text.toLocaleLowerCase().replace(/(^|[\s\-–—])([\p{L}\p{N}])/gu, (_match, boundary: string, letter: string) => boundary + letter.toLocaleUpperCase());
  if (mode === 'sentence') {
    return text.toLocaleLowerCase().replace(/(^\s*|[.!?]\s+)([\p{L}])/gu, (_match, before: string, letter: string) => before + letter.toLocaleUpperCase());
  }
  let index = 0;
  return [...text].map((char) => {
    if (!/[\p{L}]/u.test(char)) return char;
    const converted = index % 2 === 0 ? char.toLocaleLowerCase() : char.toLocaleUpperCase(); index += 1; return converted;
  }).join('');
}

export function CaseConverter() {
  const [text, setText] = useState('the little things make a big difference. turn any text into the case you need.');
  const [activeCase, setActiveCase] = useState<CaseMode>('title');
  const result = useMemo(() => convertCase(text, activeCase), [text, activeCase]);
  return <div className="tool-workspace case-workspace"><div className="case-input-header"><div><span className="eyebrow">YOUR TEXT</span><p>Paste or type anything you’d like to change.</p></div><Button variant="quiet" onClick={() => setText('')} disabled={!text}><Trash2 size={14}/>Clear</Button></div><TextArea className="case-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type or paste your text here…" rows={5} aria-label="Text to convert"/>
    <div className="case-options-grid">{caseOptions.map((option) => <button key={option.id} onClick={() => setActiveCase(option.id)} className={`case-option ${activeCase === option.id ? 'selected' : ''}`} aria-pressed={activeCase === option.id}><span className="case-option-sample">Aa</span><span><strong>{option.label}</strong><small>{option.example}</small></span><span className="case-option-check">✓</span></button>)}</div>
    <div className="case-output-header"><div><span className="eyebrow">CONVERTED TEXT</span><p>{result.length.toLocaleString()} characters</p></div><CopyButton value={result} label="Copy result"/></div><TextArea className="case-output" value={result} readOnly aria-label="Converted text" rows={5}/><p className="tool-note">Your text is processed in this browser tab and never uploaded.</p></div>;
}

const loremSentences = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
  'Aenean lacinia bibendum nulla sed consectetur.',
  'Donec ullamcorper nulla non metus auctor fringilla.',
  'Nullam quis risus eget urna mollis ornare vel eu leo.',
  'Praesent commodo cursus magna, vel scelerisque nisl consectetur.',
  'Vestibulum id ligula porta felis euismod semper.',
  'Maecenas faucibus mollis interdum, vivamus sagittis lacus vel augue.',
  'Cras mattis consectetur purus sit amet fermentum.',
  'Sed posuere consectetur est at lobortis.',
];
const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
type LoremUnit = 'paragraphs' | 'sentences' | 'words';
function chooseSentence() { return loremSentences[secureRandomInt(0, loremSentences.length - 1)]; }
function makeLorem(unit: LoremUnit, quantity: number) {
  if (unit === 'words') return Array.from({ length: quantity }, (_, index) => loremWords[index % loremWords.length]).join(' ');
  if (unit === 'sentences') return Array.from({ length: quantity }, () => chooseSentence()).join(' ');
  return Array.from({ length: quantity }, (_, paragraphIndex) => {
    const count = 4 + secureRandomInt(0, 2);
    return Array.from({ length: count }, (_, sentenceIndex) => paragraphIndex === 0 && sentenceIndex === 0 ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' : chooseSentence()).join(' ');
  }).join('\n\n');
}

export function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<LoremUnit>('paragraphs'); const [quantity, setQuantity] = useState(3); const [text, setText] = useState(() => makeLorem('paragraphs', 3));
  const generate = () => setText(makeLorem(unit, Math.floor(clamp(quantity, 1, unit === 'words' ? 1000 : 50))));
  const wordCount = (text.match(wordPattern) ?? []).length;
  const cap = unit === 'words' ? 1000 : 50;
  return <div className="tool-workspace lorem-workspace"><div className="lorem-controls"><div className="lorem-unit-select"><span className="field-label">Generate by</span><div className="segmented-control">{(['paragraphs', 'sentences', 'words'] as LoremUnit[]).map((option) => <button key={option} className={unit === option ? 'active' : ''} onClick={() => setUnit(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div></div><Field label={`Number of ${unit}`}><TextInput type="number" min={1} max={cap} value={quantity} onChange={(event) => setQuantity(Math.floor(clamp(Number(event.target.value) || 1, 1, cap)))}/></Field><Button onClick={generate}><WandSparkles size={15}/>Generate text</Button></div>
    <div className="lorem-output-header"><div><span className="eyebrow">PLACEHOLDER, PERFECTED</span><p>{wordCount} words · {text.length} characters</p></div><div><Button variant="secondary" onClick={() => downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'lorem-ipsum.txt')}><Download size={14}/>Download</Button><CopyButton value={text} label="Copy text"/></div></div><TextArea className="lorem-output" value={text} onChange={(event) => setText(event.target.value)} aria-label="Generated Lorem Ipsum text" rows={10}/><p className="tool-note"><RefreshCw size={13}/> Refresh whenever you need more filler. The generated text is only in this tab.</p></div>;
}
