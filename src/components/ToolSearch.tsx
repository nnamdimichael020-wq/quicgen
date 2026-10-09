import { useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type FocusEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { searchTools } from '../lib/search';
import type { ToolInfo } from '../data/tools';

type ToolSearchProps = {
  variant?: 'header' | 'hero';
  placeholder?: string;
  onQueryChange?: (query: string) => void;
  onSelect?: () => void;
};

export default function ToolSearch({ variant = 'header', placeholder = 'Search all tools…', onQueryChange, onSelect }: ToolSearchProps) {
  const id = useId().replaceAll(':', '');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => searchTools(query, 7), [query]);
  const activeTool = results[activeIndex];

  const updateQuery = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setActiveIndex(-1);
    onQueryChange?.(nextQuery);
  };

  const selectTool = (tool: ToolInfo) => {
    setQuery('');
    setFocused(false);
    setActiveIndex(-1);
    onQueryChange?.('');
    onSelect?.();
    navigate(`/${tool.slug}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocused(true);
      if (results.length) setActiveIndex((index) => (index + 1) % results.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocused(true);
      if (results.length) setActiveIndex((index) => index <= 0 ? results.length - 1 : index - 1);
      return;
    }
    if (event.key === 'Enter') {
      if (activeTool) {
        event.preventDefault();
        selectTool(activeTool);
      } else if (results.length === 1) {
        event.preventDefault();
        selectTool(results[0]);
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

  const clearAfterSelect = () => {
    setQuery('');
    setFocused(false);
    setActiveIndex(-1);
    onQueryChange?.('');
    onSelect?.();
  };

  return <div className={`tool-search tool-search-${variant}`} onBlur={handleBlur}>
    <label className="tool-search-field" htmlFor={`${id}-input`}>
      <Search className="tool-search-icon" size={variant === 'hero' ? 19 : 17} aria-hidden="true"/>
      <input
        ref={inputRef}
        id={`${id}-input`}
        type="search"
        role="combobox"
        aria-label="Search QuicGen tools"
        aria-autocomplete="list"
        aria-expanded={focused}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={activeTool ? `${id}-option-${activeTool.slug}` : undefined}
        autoComplete="off"
        spellCheck={false}
        className="tool-search-input"
        placeholder={placeholder}
        value={query}
        onFocus={() => setFocused(true)}
        onChange={updateQuery}
        onKeyDown={handleKeyDown}
      />
      {query ? <button type="button" className="tool-search-clear" onClick={clearSearch} aria-label="Clear tool search"><X size={15}/></button> : variant === 'hero' ? <kbd className="search-shortcut"><span>⌘</span> K</kbd> : null}
    </label>
    {focused && <div className="tool-search-dropdown" id={`${id}-listbox`} role="listbox" aria-label="Matching tools">
      {!query.trim() ? <div className="tool-search-empty"><span className="tool-search-empty-icon"><Search size={16}/></span><span><strong>Find the right tool</strong><small>Search by name, task or category.</small></span></div> : results.length ? <>
        <div className="tool-search-results-label">{results.length === 7 ? 'TOP MATCHES' : `${results.length} MATCH${results.length === 1 ? '' : 'ES'}`}</div>
        {results.map((tool, index) => <SearchResult key={tool.slug} tool={tool} index={index} id={id} active={index === activeIndex} onActivate={() => setActiveIndex(index)} onSelect={clearAfterSelect}/>) }
        <p className="tool-search-hint"><kbd>↑</kbd><kbd>↓</kbd> to navigate <span>·</span> <kbd>Enter</kbd> to open</p>
      </> : <div className="tool-search-no-results"><span className="tool-search-empty-icon"><Search size={16}/></span><strong>No tools found for “{query.trim()}”</strong><small>Try a shorter phrase, a category, or a different spelling.</small></div>}
    </div>}
  </div>;
}

function SearchResult({ tool, index, id, active, onActivate, onSelect }: { tool: ToolInfo; index: number; id: string; active: boolean; onActivate: () => void; onSelect: () => void }) {
  const Icon = tool.icon;
  return <Link
    id={`${id}-option-${tool.slug}`}
    to={`/${tool.slug}`}
    role="option"
    aria-selected={active}
    className={`tool-search-result ${active ? 'active' : ''}`}
    onMouseEnter={onActivate}
    onClick={onSelect}
  >
    <span className={`tool-search-result-icon accent-${tool.accent}`}><Icon size={17}/></span>
    <span className="tool-search-result-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span>
    <span className="tool-search-result-category">{tool.category === 'Featured' ? 'Popular' : tool.category}</span>
    <ArrowUpRight className="tool-search-result-arrow" size={15}/>
    <span className="sr-only">Result {index + 1}</span>
  </Link>;
}
