import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Command, LockKeyhole, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { categories, tools, type ToolCategory } from '../data/tools';
import { usePageMeta, siteUrl } from '../lib/utils';
import { SectionHeading } from '../components/ui';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ToolCategory | 'All tools'>('All tools');
  const searchRef = useRef<HTMLInputElement>(null);

  usePageMeta({
    title: 'Free Online Tools That Respect Your Privacy',
    description: 'Generate anything, instantly. QuicGen is a collection of fast, beautifully simple online tools—QR codes, passwords, calculators and more—that run in your browser.',
    path: '/',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'QuicGen', url: `${siteUrl}/`, description: 'Fast, free online tools that run in your browser.' },
      { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'QuicGen', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'A free collection of privacy-first online tools that process data in your browser.' },
    ],
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = category === 'All tools' || tool.category === category;
      const matchesQuery = !normalized || [tool.title, tool.description, tool.category, ...tool.keywords].join(' ').toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return <main>
    <section className="hero-section">
      <div className="hero-glow hero-glow-one"/><div className="hero-glow hero-glow-two"/>
      <div className="page-wrap hero-layout">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-spark"><Sparkles size={13}/></span> Small tools. A little more time.</div>
          <h1>Generate anything.<br/><span>Instantly.</span></h1>
          <p className="hero-description">The useful tools you need, without the busywork. Quick, thoughtfully made, and private from the very first click.</p>
          <div className="hero-search-wrap">
            <Search size={19} aria-hidden="true"/>
            <input ref={searchRef} type="search" className="hero-search" placeholder="What can we help you make?" value={query} onChange={(event) => { setQuery(event.target.value); setCategory('All tools'); }} aria-label="Search all tools" />
            <kbd className="search-shortcut"><Command size={12}/> K</kbd>
          </div>
          <div className="hero-footnote"><span><Zap size={14}/> Instant results</span><span><LockKeyhole size={14}/> Nothing leaves your device</span><span><Check size={14}/> Always free</span></div>
        </div>
        <div className="hero-art" aria-label="QuicGen tools preview">
          <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
          <div className="hero-float-card float-top"><span className="float-icon float-blue"><QrGlyph/></span><span><strong>QR code, ready</strong><small>Styled just the way you like</small></span><span className="float-status"><Check size={12}/></span></div>
          <div className="hero-device-card">
            <div className="device-top"><div className="device-dots"><i/><i/><i/></div><span>quicgen.tools</span><span className="device-lock"><LockKeyhole size={12}/></span></div>
            <div className="device-content"><div className="device-heading"><span>Made in a moment</span><strong>Your next idea,<br/>ready to go.</strong></div><div className="qr-art" aria-hidden="true"><span className="qr-corner qr-corner-a"/><span className="qr-corner qr-corner-b"/><span className="qr-corner qr-corner-c"/><span className="qr-noise">▥ ▧ ▥<br/>▧ ▥ ▧<br/>▥ ▧ ▥</span><span className="qr-center">q</span></div><div className="device-footer"><span><i/> 100% on-device</span><span className="device-arrow"><ArrowUpRight size={14}/></span></div></div>
          </div>
          <div className="hero-float-card float-bottom"><span className="float-lock"><ShieldCheck size={16}/></span><span><strong>Your data stays yours</strong><small>Private by design. Always.</small></span></div>
          <div className="hero-star star-one">✳</div><div className="hero-star star-two">✦</div>
        </div>
      </div>
      <div className="hero-bottom page-wrap"><span>MADE FOR EVERYDAY MOMENTS</span><div className="hero-bottom-line"/><span>NO SIGN-UP · NO UPLOADS · NO DRAMA</span></div>
    </section>

    <section className="featured-strip page-wrap" aria-label="Popular tools">
      <div className="featured-intro"><span className="eyebrow">Start with a favorite</span><h2>Popular right now</h2><p>Good things, one click away.</p></div>
      <div className="featured-cards">
        {tools.slice(0, 3).map((tool, index) => {
          const Icon = tool.icon;
          return <Link to={`/${tool.slug}`} className={`featured-card featured-${tool.accent}`} key={tool.slug}>
            <span className="featured-icon"><Icon size={20}/></span><span className="featured-card-copy"><span className="featured-card-label">{index === 0 ? 'MOST LOVED' : index === 1 ? 'SECURE BY DESIGN' : 'DEVELOPER FAVORITE'}</span><strong>{tool.title}</strong><small>{tool.description}</small></span><ArrowUpRight className="featured-arrow" size={17}/>
          </Link>;
        })}
      </div>
    </section>

    <section id="tools" className="tools-section page-wrap">
      <div className="tools-heading-row"><SectionHeading eyebrow="THE TOOLBOX" title="Find your just-right tool">A growing collection of useful things, made to feel effortless.</SectionHeading><div className="tools-count"><span className="count-dot"/>{tools.length} tools and counting</div></div>
      <div className="category-tabs" role="group" aria-label="Filter tools by category">
        {(['All tools', ...categories.map((item) => item.name)] as const).map((item) => <button key={item} type="button" aria-pressed={category === item} className={`category-tab ${category === item ? 'active' : ''}`} onClick={() => setCategory(item as ToolCategory | 'All tools')}>
          {item}{item === 'All tools' && <span>{tools.length}</span>}
        </button>)}
      </div>
      {filtered.length === 0 ? <div className="empty-search"><span className="empty-search-icon"><Search size={22}/></span><h3>No tools found</h3><p>Try a different search, or explore all of our tools.</p><button className="text-button" onClick={() => { setQuery(''); setCategory('All tools'); }}>Clear your search <ArrowRight size={15}/></button></div> : category === 'All tools' && !query.trim() ? <div className="category-sections">
        {categories.map((group) => {
          const grouped = filtered.filter((tool) => tool.category === group.name);
          if (!grouped.length) return null;
          return <section className="tool-category" key={group.name} aria-labelledby={`cat-${group.name.replace(/\W/g, '').toLowerCase()}`}>
            <div className="category-heading"><div><h3 id={`cat-${group.name.replace(/\W/g, '').toLowerCase()}`}>{group.name}</h3><span>{group.description}</span></div><span className="category-total">{grouped.length.toString().padStart(2, '0')} tools</span></div>
            <div className={`tool-grid ${group.name === 'Featured' ? 'tool-grid-featured' : ''}`}>
              {grouped.map((tool) => <ToolCard key={tool.slug} tool={tool}/>) }
            </div>
          </section>;
        })}
      </div> : <div className="tool-grid search-results">{filtered.map((tool) => <ToolCard key={tool.slug} tool={tool}/>)}</div>}
    </section>

    <section className="principles-section">
      <div className="page-wrap principles-layout">
        <div><span className="eyebrow">A better kind of online tool</span><h2>Fast is nice.<br/><span>Feeling safe is better.</span></h2><p>QuicGen is built around a simple idea: you shouldn’t have to trade your privacy for convenience. Your tools work right here, on your device—so your input stays yours.</p><Link to="/privacy" className="text-link">See how we protect your privacy <ArrowRight size={15}/></Link></div>
        <div className="principle-list">
          <Principle icon={<Zap size={19}/>} number="01" title="Instant, by design" text="No queues, no accounts, no waiting on a server. Your result appears as you work."/>
          <Principle icon={<ShieldCheck size={19}/>} number="02" title="Private, always" text="Your text, files and generated results are processed locally in your browser."/>
          <Principle icon={<Sparkles size={19}/>} number="03" title="Thought through" text="Simple interfaces, useful details and downloads ready when you are."/>
        </div>
      </div>
    </section>

    <section className="bottom-cta page-wrap">
      <div className="bottom-cta-icon"><Sparkles size={21}/></div><div><span className="eyebrow">One last thing</span><h2>Less searching. More doing.</h2><p>Your next handy tool is right around the corner.</p></div><a href="#tools" className="button button-primary">Explore all tools <ArrowRight size={16}/></a>
    </section>
  </main>;
}

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  const Icon = tool.icon;
  return <Link to={`/${tool.slug}`} className={`tool-card accent-${tool.accent}`}>
    <div className="tool-card-top"><span className="tool-icon"><Icon size={20}/></span><span className="tool-card-arrow"><ArrowUpRight size={17}/></span></div>
    <h4>{tool.title}</h4><p>{tool.description}</p><span className="tool-card-bottom"><span>{tool.category === 'Featured' ? 'Popular tool' : tool.category}</span><ArrowRight size={14}/></span>
  </Link>;
}

function Principle({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) {
  return <div className="principle-item"><span className="principle-icon">{icon}</span><span className="principle-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>;
}

function QrGlyph() {
  return <span className="qr-glyph" aria-hidden="true"><i/><i/><i/><i/><i/><i/></span>;
}
