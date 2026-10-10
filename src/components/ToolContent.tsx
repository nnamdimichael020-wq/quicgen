import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen } from 'lucide-react';
import { getTool, tools, type ToolInfo } from '../data/tools';
import { getToolContent } from '../data/tool-content';
import { guideByTool, guides, guidePath, type GuideInfo } from '../data/guides';
import { topicBySlug, topicPath } from '../data/topics';
import PrivacyCallout from './PrivacyCallout';
import AdSlot from './AdSlot';

/** Pick neighbouring guides by relevance: same tool family first, shared topics second. */
export function relatedGuidesFor(tool: ToolInfo, limit = 3): GuideInfo[] {
  const ownGuide = guideByTool.get(tool.slug);
  const ownTopics = new Set(ownGuide?.topics ?? []);
  return guides
    .filter((guide) => guide.slug !== ownGuide?.slug)
    .map((guide) => {
      let score = 0;
      if (getTool(guide.toolSlug)?.category === tool.category) score += 3;
      score += guide.topics.filter((topic) => ownTopics.has(topic)).length;
      return { guide, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.guide);
}

/** Pick neighbouring tools: same category first, featured fallbacks to fill the row. */
export function relatedToolsFor(tool: ToolInfo, limit = 3): ToolInfo[] {
  const picked: ToolInfo[] = [];
  for (const candidate of tools) {
    if (candidate.slug !== tool.slug && candidate.category === tool.category) picked.push(candidate);
    if (picked.length === limit) return picked;
  }
  for (const candidate of tools) {
    if (candidate.slug !== tool.slug && candidate.category === 'Featured' && !picked.includes(candidate)) picked.push(candidate);
    if (picked.length === limit) break;
  }
  return picked;
}

type ToolContentProps = {
  tool: ToolInfo;
};

/**
 * Shared content section rendered below the interactive tool on every tool
 * page: what the tool does, how to use it, an FAQ, related guides and related
 * tools — plus the reserved ad placement zones.
 */
export default function ToolContent({ tool }: ToolContentProps) {
  const content = getToolContent(tool.slug);
  const toolGuide = guideByTool.get(tool.slug);
  const relatedGuides = relatedGuidesFor(tool);
  const relatedTools = relatedToolsFor(tool);
  const primaryTopic = toolGuide?.topics.map((slug) => topicBySlug.get(slug)).find(Boolean);

  return <>
    <AdSlot placement="tool-below" variant="leaderboard"/>
    <div className="tool-detail-layout">
      <div className="tool-content-column">
        <section className="tool-about-section" aria-labelledby="tool-about-heading">
          <span className="eyebrow">ABOUT THIS TOOL</span>
          <h2 id="tool-about-heading">What the {tool.title} does</h2>
          {content?.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
        <section className="how-to-section" aria-labelledby="tool-how-to-heading">
          <span className="eyebrow">A QUICK HOW-TO</span>
          <h2 id="tool-how-to-heading">How to use the {tool.title}</h2>
          <p className="detail-lede">No learning curve. Just a few little steps and you’re done.</p>
          <ol className="how-to-steps">{tool.howTo.map((step, index) => <li key={step}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
          {toolGuide && <Link to={guidePath(toolGuide.slug)} className="tool-guide-promo"><span className="tool-guide-promo-icon"><BookOpen size={18}/></span><span><small>{primaryTopic ? `A PRACTICAL GUIDE · ${primaryTopic.title.split(':')[0].toUpperCase()}` : 'A PRACTICAL GUIDE'}</small><strong>{toolGuide.title}</strong><span>{toolGuide.excerpt}</span></span><ArrowUpRight size={17}/></Link>}
        </section>
      </div>
      <aside className="tool-aside">
        <PrivacyCallout/>
        {primaryTopic && <Link className="tool-topic-link" to={topicPath(primaryTopic.slug)}><BookOpen size={16}/><span><strong>{primaryTopic.title}</strong><small>Explore related tools and guides</small></span><ArrowRight size={14}/></Link>}
        <div className="tool-faq-card" id="faq">
          <span className="eyebrow">GOOD TO KNOW</span>
          <h2>Frequently asked questions</h2>
          {content?.faqs.map((item, index) => <details key={item.question} className="faq-item" open={index === 0}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
        </div>
        <AdSlot placement="tool-inline" variant="rectangle"/>
      </aside>
    </div>
    <section className="related-tools" aria-labelledby="related-guides-heading">
      <div className="related-header"><div><span className="eyebrow">READ NEXT</span><h2 id="related-guides-heading">Related guides</h2></div><Link to="/blog" className="text-link">All guides <ArrowRight size={15}/></Link></div>
      <div className="related-grid">{relatedGuides.map((guide) => <Link to={guidePath(guide.slug)} className="related-card" key={guide.slug}><span className="related-icon"><BookOpen size={17}/></span><span><strong>{guide.title}</strong><small>{guide.excerpt}</small></span><ArrowUpRight size={16}/></Link>)}</div>
    </section>
    <section className="related-tools related-tools-tight" aria-labelledby="related-tools-heading">
      <div className="related-header"><div><span className="eyebrow">KEEP THE FLOW</span><h2 id="related-tools-heading">Related tools</h2></div><Link to="/#tools" className="text-link">See all tools <ArrowRight size={15}/></Link></div>
      <div className="related-grid">{relatedTools.map((item) => { const RelatedIcon = item.icon; return <Link to={`/${item.slug}`} className="related-card" key={item.slug}><span className={`related-icon accent-${item.accent}`}><RelatedIcon size={18}/></span><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowUpRight size={16}/></Link>; })}</div>
    </section>
  </>;
}
