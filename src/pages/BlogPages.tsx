import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react';
import { tools } from '../data/tools';
import { siteUrl, usePageMeta } from '../lib/utils';

/** A useful directory in Phase 1; Phase 2 replaces this with the full guide library. */
export function BlogIndexPage() {
  usePageMeta({
    title: 'QuicGen Blog & Tool Guides',
    description: 'Practical guides to using QuicGen’s free QR, password, calculator, text and privacy-first tools.',
    path: '/blog',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Blog', name: 'QuicGen Guides', url: `${siteUrl}/blog`, description: 'Practical, privacy-first guides for everyday online tools.' },
  });
  return <main className="static-page page-wrap blog-page">
    <header className="blog-hero"><span className="eyebrow"><BookOpen size={14}/> THE QUICGEN FIELD GUIDE</span><h1>Helpful guides.<br/><span>Less guesswork.</span></h1><p>Clear, practical walkthroughs for making the most of free online tools—without giving up your privacy.</p><div className="blog-privacy-note"><ShieldCheck size={15}/> Every guide links to a tool that runs directly in your browser.</div></header>
    <section className="blog-index-section"><div className="section-heading"><span className="eyebrow">TOOL WALKTHROUGHS</span><h2>Choose a guide to get started.</h2><p>Open any tool for its step-by-step instructions and practical tips.</p></div><div className="blog-card-grid">{tools.map((tool) => {
      const Icon = tool.icon;
      return <article className="blog-card" key={tool.slug}><span className={`blog-card-icon accent-${tool.accent}`}><Icon size={18}/></span><span className="blog-card-category">{tool.category === 'Featured' ? 'Popular tools' : tool.category}</span><h3>{tool.title}: a practical guide</h3><p>{tool.intro}</p><Link to={`/${tool.slug}`} className="text-link">Read the tool walkthrough <ArrowRight size={14}/></Link><Link to={`/${tool.slug}`} className="blog-card-stretched-link" aria-label={`Open the ${tool.title} walkthrough`}><ArrowUpRight size={16}/></Link></article>;
    })}</div></section>
  </main>;
}
