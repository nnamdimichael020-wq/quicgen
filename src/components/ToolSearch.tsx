import { useId, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Layers, Search, X, type LucideIcon } from 'lucide-react';
import { searchTools } from '../lib/search';
import { getTool, type ToolInfo } from '../data/tools';
import { guides, guidePath } from '../data/guides';
import { topics, topicPath } from '../data/topics';

type SearchItem = {
  id: string;
  kind: 'tool' | 'guide' | 'topic';
  path: string;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  accent: string;
};
type ToolSearchProps = {
  variant?: 'header' | 'hero';
  placeholder?: string;
  onQueryChange?: (query: string) => void;
  onSelect?: () => void;
};

function normalizeSearchText(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function scoreResource(query: string, fields: string[]) {
  const normalizedQuery = normalizeSearchText(query);
  const terms = normalizedQuery.split(' ').filter(Boolean);
  const text = normalizeSearchText(fields.join(' '));
  if (!normalizedQuery || !text) return 0;
  if (text.startsWith(normalizedQuery)) return 100;
  if (text.includes(normalizedQuery)) return 80;
  const matchedTerms = terms.filter((term) => text.includes(term)).length;
  return matchedTerms === terms.length ? 48 + matchedTerms * 4 : matchedTerms * 10;
}

export default function ToolSearch({ variant = 'header', placeholder = 'Search tools & guides…', onQueryChange, onSelect }: ToolSearchProps) {
  const id = useId().replaceAll(':', '');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => {
    const toolItems: SearchItem[] = searchTools(query, 5).map((tool: ToolInfo) => ({
      id: tool.slug, kind: 'tool', path: `/${tool.slug}`, title: tool.title, description: tool.description,
      category: tool.category === 'Featured' ? 'Popular tool' : tool.category, icon: tool.icon, accent: tool.accent,
    }));
    const guideItems: SearchItem[] = guides.map((guide) => ({
      guide,
      tool: getTool(guide.toolSlug),
      score: scoreResource(query, [guide.title, guide.description, guide.excerpt, ...guide.topics]),
    })).filter((result) => result.score > 0 && result.tool).sort((left, right) => right.score - left.score).slice(0, 3).map(({ guide, tool }) => ({
      id: guide.slug, kind: 'guide', path: guidePath(guide.slug), title: guide.title, description: guide.excerpt,
      category: 'Practical guide', icon: tool!.icon, accent: tool!.accent,
    }));
    const topicItems: SearchItem[] = topics.map((topic) => ({
      topic,
      score: scoreResource(query, [topic.title, topic.description, topic.eyebrow, ...topic.intro, ...topic.sections.map((section) => section.title)]),
    })).filter((result) => result.score > 0).sort((left, right) => right.score - left.score).slice(0, 2).map(({ topic }) => ({
      id: topic.slug, kind: 'topic', path: topicPath(topic.slug), title: topic.title, description: topic.description,
      category: 'Topic collection', icon: Layers, accent: 'violet',
    }));
    return { toolItems, guideItems, topicItems, allItems: [...toolItems, ...guideItems, ...topicItems] };
  }, [query]);
  const activeItem = results.allItems[activeIndex];

  const updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setActiveIndex(-1);
    onQueryChange?.(nextQuery);
  };

  const clearAfterSelect = () => {
    setQuery('');
    setFocused(false);
    setActiveIndex(-1);
    onQueryChange?.('');
    onSelect?.();
  };

  const selectItem = (item: SearchItem) => {
    clearAfterSelect();
    navigate(item.path);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocused(true);
      if (results.allItems.length) setActiveIndex((index) => (index + 1) % results.allItems.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocused(true);
      if (results.allItems.length) setActiveIndex((index) => index <= 0 ? results.allItems.length - 1 : index - 1);
      return;
    }
    if (event.key === 'Enter') {
      if (activeItem) {
        event.preventDefault();
        selectItem(activeItem);
      } else if (results.allItems.length === 1) {
        event.preventDefault();
        selectItem(results.allItems[0]);
      }
      return;
    }
    if (event.key === 'Escape') {
      if (query) {
        setQuery('');
        onQueryChange?.('');
      }
      setActiveIndex(-1);
      setFocused(false);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveIndex(-1);
    onQueryChange?.('');
    inputRef.current?.focus();
  };

  const renderGroup = (label: string, items: SearchItem[], offset: number) => items.length > 0 && <div role="group" aria-label={label} key={label}>
    <div className="tool-search-results-label">{label}</div>
    {items.map((item, index) => <SearchResult key={`${item.kind}-${item.id}`} item={item} index={offset + index} id={id} active={offset + index === activeIndex} onActivate={() => setActiveIndex(offset + index)} onSelect={clearAfterSelect}/>)}
  </div>;

  return <div className={`tool-search tool-search-${variant}`} onBlur={handleBlur}>
    <label className="tool-search-field" htmlFor={`${id}-input`}>
      <Search className="tool-search-icon" size={variant === 'hero' ? 19 : 17} aria-hidden="true"/>
      <input
        ref={inputRef}
        id={`${id}-input`}
        type="search"
        role="combobox"
        aria-label="Search QuicGen tools, guides and topics"
        aria-autocomplete="list"
        aria-expanded={focused}
        aria-controls={focused && results.allItems.length ? `${id}-listbox` : undefined}
        aria-activedescendant={focused && activeItem ? `${id}-option-${activeItem.kind}-${activeItem.id}` : undefined}
        autoComplete="off"
        spellCheck={false}
        className="tool-search-input"
        placeholder={placeholder}
        value={query}
        onFocus={() => setFocused(true)}
        onChange={updateQuery}
        onKeyDown={handleKeyDown}
      />
      {query ? <button type="button" className="tool-search-clear" onClick={clearSearch} aria-label="Clear search"><X size={15}/></button> : variant === 'hero' ? <kbd className="search-shortcut"><span>⌘</span> K</kbd> : null}
    </label>
    {focused && <div className="tool-search-dropdown">
      {!query.trim() ? <div className="tool-search-empty"><span className="tool-search-empty-icon"><Search size={16}/></span><span><strong>Find the right tool or guide</strong><small>Search by name, task, topic or category.</small></span></div> : results.allItems.length ? <div id={`${id}-listbox`} role="listbox" aria-label="Search suggestions">
        {renderGroup('TOOLS', results.toolItems, 0)}
        {renderGroup('GUIDES', results.guideItems, results.toolItems.length)}
        {renderGroup('TOPICS', results.topicItems, results.toolItems.length + results.guideItems.length)}
        <p className="tool-search-hint"><kbd>↑</kbd><kbd>↓</kbd> to navigate <span>·</span> <kbd>Enter</kbd> to open</p>
      </div> : <div className="tool-search-no-results"><span className="tool-search-empty-icon"><Search size={16}/></span><span className="tool-search-no-results-copy"><strong>No tools or guides found for “{query.trim()}”</strong><small>Try a shorter phrase, a task, or a different spelling.</small><Link to="/blog" onClick={clearAfterSelect}>Browse all guides <ArrowUpRight size={13}/></Link></span></div>}
    </div>}
  </div>;
}

function SearchResult({ item, index, id, active, onActivate, onSelect }: { item: SearchItem; index: number; id: string; active: boolean; onActivate: () => void; onSelect: () => void }) {
  const Icon = item.icon;
  return <Link
    id={`${id}-option-${item.kind}-${item.id}`}
    to={item.path}
    role="option"
    aria-selected={active}
    className={`tool-search-result ${active ? 'active' : ''}`}
    onMouseEnter={onActivate}
    onClick={onSelect}
  >
    <span className={`tool-search-result-icon accent-${item.accent}`}><Icon size={17}/></span>
    <span className="tool-search-result-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
    <span className="tool-search-result-category">{item.category}</span>
    <ArrowUpRight className="tool-search-result-arrow" size={15}/>
    <span className="sr-only">Result {index + 1}</span>
  </Link>;
}
