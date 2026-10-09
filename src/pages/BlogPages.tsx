import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Clock3, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';
import { tools, getTool } from '../data/tools';
import { guides, guideBySlug, guidePath, guideWordCount, familyGuideSections, sharedGuideSections } from '../data/guides';
import { topics, topicBySlug, topicPath } from '../data/topics';
import { siteUrl, usePageMeta } from '../lib/utils';

export function BlogIndexPage() {
  usePageMeta({
    title: 'QuicGen Blog & Practical Tool Guides',
    description: 'Read practical, privacy-first guides for QR codes, strong passwords, calculators, text tools, color formats and browser utilities.',
    path: '/blog',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Blog', name: 'QuicGen Guides', url: `${siteUrl}/blog`, description: 'Practical, privacy-first guides for everyday online tools.' },
  });
  return <main className="static-page page-wrap blog-page">
    <header className="blog-hero"><span className="eyebrow"><BookOpen size={14}/> THE QUICGEN FIELD GUIDE</span><h1>Helpful guides.<br/><span>Less guesswork.</span></h1><p>Clear, practical walkthroughs for everyday tasks—from creating a scan-ready QR code to checking a date calculation—with the actual tool only a click away.</p><div className="blog-privacy-note"><ShieldCheck size={15}/> Practical instructions. No sign-up. Tools run in your browser.</div></header>
    <section className="blog-index-section"><div className="blog-section-heading"><div><span className="eyebrow">THE GUIDE LIBRARY</span><h2>Start with the task at hand.</h2><p>{guides.length} detailed walkthroughs, each paired with the free tool it explains.</p></div><Link to="/topics" className="text-link">Browse topics <ArrowRight size={14}/></Link></div>
      <div className="blog-topic-pills" aria-label="Browse guide topics">{topics.map((topic) => <Link key={topic.slug} to={topicPath(topic.slug)}>{topic.title.split(':')[0]}</Link>)}</div>
      <div className="blog-card-grid">{guides.map((guide) => {
        const tool = getTool(guide.toolSlug);
        if (!tool) return null;
        const Icon = tool.icon;
        return <article className="blog-card" key={guide.slug}><div className="blog-card-top"><span className={`blog-card-icon accent-${tool.accent}`}><Icon size={18}/></span><span className="blog-card-category">{tool.category === 'Featured' ? 'Popular tools' : tool.category}</span></div><h3><Link to={guidePath(guide.slug)}>{guide.title}</Link></h3><p>{guide.excerpt}</p><div className="blog-card-footer"><span><Clock3 size={13}/>{Math.max(5, Math.ceil(guideWordCount(guide, tool.title, tool.description) / 220))} min read</span><Link to={`/${tool.slug}`} aria-label={`Open ${tool.title}`} title={`Open ${tool.title}`}><ArrowUpRight size={15}/></Link></div><Link to={guidePath(guide.slug)} className="blog-card-stretched-link" aria-label={`Read: ${guide.title}`}/></article>;
      })}</div>
    </section>
  </main>;
}

export function GuidePage() {
  const { slug = '' } = useParams();
  const guide = guideBySlug.get(slug);
  const tool = guide ? getTool(guide.toolSlug) : undefined;
  const safeGuide = guide ?? guides[0];
  const safeTool = tool ?? getTool(safeGuide.toolSlug)!;
  const path = guidePath(safeGuide.slug);
  const canonical = `${siteUrl}${path}`;
  const wordCount = guideWordCount(safeGuide, safeTool.title, safeTool.description);
  const relatedGuides = guides.filter((item) => item.slug !== safeGuide.slug && item.topics.some((topic) => safeGuide.topics.includes(topic))).slice(0, 3);
  const relatedTools = tools.filter((item) => item.slug !== safeTool.slug && (item.category === safeTool.category || safeGuide.topics.some((topic) => topic === 'privacy-first-tools'))).slice(0, 3);
  const familySupplement = familyGuideSections[safeGuide.family];
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: safeGuide.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  };
  usePageMeta({
    title: safeGuide.title,
    description: safeGuide.description,
    path,
    ogType: 'article',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Article', headline: safeGuide.title, description: safeGuide.description, mainEntityOfPage: canonical, url: canonical, datePublished: '2026-10-09', dateModified: '2026-10-09', author: { '@type': 'Organization', name: 'QuicGen' }, publisher: { '@type': 'Organization', name: 'QuicGen', url: siteUrl }, wordCount },
      { '@context': 'https://schema.org', '@type': 'HowTo', name: safeGuide.title, description: safeGuide.description, totalTime: `PT${Math.max(5, Math.ceil(wordCount / 220))}M`, tool: { '@type': 'HowToTool', name: safeTool.title }, step: safeGuide.steps.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.title, text: step.body, url: `${canonical}#step-${index + 1}` })) },
      faqSchema,
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog & guides', item: `${siteUrl}/blog` },
        { '@type': 'ListItem', position: 3, name: safeGuide.title, item: canonical },
      ] },
    ],
  });
  if (!guide || !tool) return <Navigate to="/not-found" replace/>;

  const toc = [
    ['overview', 'At a glance'], ['why-it-matters', 'Why it matters'], ['walkthrough', 'Step-by-step'], ['examples', 'Practical examples'], ['choices', 'Options and trade-offs'], ['best-practices', 'Best practices'], ['troubleshooting', 'Troubleshooting'], ['privacy', 'Privacy and limits'], ['faq', 'FAQs'], ['next-steps', 'Next steps'],
  ];
  const Icon = tool.icon;
  return <main className="guide-page page-wrap">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/blog">Blog &amp; guides</Link><span>/</span><span aria-current="page">{guide.title}</span></nav>
    <header className="guide-header"><span className="eyebrow"><BookOpen size={13}/> PRACTICAL GUIDE · {tool.category.toUpperCase()}</span><h1>{guide.title}</h1><p className="guide-deck">{guide.excerpt}</p><div className="guide-meta"><span><Clock3 size={14}/>{Math.max(5, Math.ceil(wordCount / 220))} min read</span><span><FileText size={14}/>{wordCount.toLocaleString()} words</span><span><ShieldCheck size={14}/>Updated October 9, 2026</span></div><div className="guide-tool-cta"><span className={`guide-tool-icon accent-${tool.accent}`}><Icon size={21}/></span><span><strong>Ready to try it?</strong><small>{tool.description}</small></span><Link className="button button-primary" to={`/${tool.slug}`}>Open {tool.title.replace(/ generator| calculator| converter| picker/gi, '')} <ArrowUpRight size={15}/></Link></div>
      <div className="guide-topics">{guide.topics.map((topicSlug) => { const topic = topicBySlug.get(topicSlug); return topic ? <Link key={topicSlug} to={topicPath(topicSlug)}>{topic.title.split(':')[0]}</Link> : null; })}</div>
    </header>
    <div className="guide-layout"><aside className="guide-toc"><span className="eyebrow">ON THIS PAGE</span>{toc.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}<Link className="guide-toc-tool" to={`/${tool.slug}`}><LockKeyhole size={14}/>Open the tool</Link></aside>
      <article className="guide-article" itemScope itemType="https://schema.org/Article" data-article-word-count={wordCount}>
        <section id="overview" className="guide-prose"><span className="guide-section-kicker">A USEFUL STARTING POINT</span>{guide.opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="guide-takeaway"><strong>In short</strong><p>{guide.excerpt}</p></div></section>
        <section id="why-it-matters" className="guide-prose"><h2>Why this task deserves a clear process</h2><p>{guide.purpose}</p><p>Before you begin, decide what a correct result looks like and where it will go next. The steps below are designed around the everyday use of {tool.title.toLowerCase()}, not around a hidden account or a server-side workflow.</p></section>
        <section className="guide-prose"><h2>{familySupplement.title}</h2><p>{familySupplement.body.replaceAll('{{tool}}', tool.title.toLowerCase())}</p></section>
        <section id="walkthrough" className="guide-prose"><h2>A step-by-step walkthrough</h2><p>Use this sequence as a starting point, then follow any rules required by the system or people receiving your result.</p><ol className="guide-steps">{guide.steps.map((step, index) => <li id={`step-${index + 1}`} key={step.title}><span className="guide-step-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>{safeTool.howTo.map((step, index) => <p className="guide-tool-instruction" key={step}><strong>Tool step {index + 1}.</strong> {step}</p>)}</section>
        <section id="examples" className="guide-prose"><h2>Practical examples</h2><p>Examples are most useful when the inputs and assumptions are visible. Adapt the values to your own context and check any domain-specific rules before sharing a result.</p><div className="guide-examples">{guide.examples.map((example) => <section className="guide-example" key={example.title}><span className="eyebrow">WORKED EXAMPLE</span><h3>{example.title}</h3><p>{example.scenario}</p><dl><div><dt>Inputs</dt><dd>{example.input}</dd></div><div><dt>Result</dt><dd>{example.outcome}</dd></div></dl><p>{example.lesson}</p></section>)}</div></section>
        <section id="choices" className="guide-prose"><h2>Options and trade-offs</h2><p>Settings are there to fit a task, not to decorate a result. Choose the simplest option that meets the requirement and keep a note of any assumption that could change the answer.</p><div className="guide-point-grid">{guide.choices.map((point) => <div className="guide-point" key={point.title}><h3>{point.title}</h3><p>{point.body}</p></div>)}</div></section>
        <section id="best-practices" className="guide-prose"><h2>Best practices for dependable results</h2><ul className="guide-checklist">{guide.tips.map((point) => <li key={point.title}><span className="guide-check"><ShieldCheck size={14}/></span><div><strong>{point.title}</strong><p>{point.body}</p></div></li>)}</ul><p>For repeat work, save a brief procedure or checklist with the project. That makes decisions easier to review and reduces variation between people, devices and future versions of the same task.</p></section>
        <section id="troubleshooting" className="guide-prose"><h2>Common problems and how to fix them</h2><div className="guide-troubleshooting">{guide.troubleshooting.map((item) => <details key={item.problem}><summary>{item.problem}<span aria-hidden="true">+</span></summary><p>{item.solution}</p></details>)}</div><p>If the result still looks wrong, return to the original task statement and compare each input with the destination’s specification. A sensible-looking number or string can still be wrong when a unit, character, date or policy assumption differs.</p></section>
        <section id="privacy" className="guide-prose"><h2>Privacy and sensible limits</h2><p>{guide.privacyNote}</p>{sharedGuideSections.filter((section) => section.id === 'client-side-limits').map((section) => <p key={section.id}>{section.body.replaceAll('{{tool}}', tool.title.toLowerCase())}</p>)}<div className="guide-privacy-card"><ShieldCheck size={17}/><span><strong>Processed on this device</strong><small>Tool inputs are handled in your browser and are not sent to QuicGen.</small></span><Link to="/privacy">Read our privacy policy <ArrowRight size={13}/></Link></div></section>
        {sharedGuideSections.filter((section) => section.id === 'plan-the-task' || section.id === 'quality-check' || section.id === 'carry-context').map((section) => <section className="guide-prose" key={section.id}><h2>{section.title}</h2><p>{section.body.replaceAll('{{tool}}', tool.title.toLowerCase())}</p></section>)}
        <section id="faq" className="guide-prose"><h2>Frequently asked questions</h2><div className="guide-faq-list">{guide.faqs.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>
        <section id="next-steps" className="guide-prose guide-next-steps"><h2>Put the guide into practice</h2><p>{guide.closing}</p><div className="guide-bottom-cta"><span className={`guide-tool-icon accent-${tool.accent}`}><Icon size={20}/></span><div><strong>Continue with {tool.title}</strong><small>{tool.description}</small></div><Link to={`/${tool.slug}`} className="button button-primary">Open tool <ArrowUpRight size={15}/></Link></div></section>
      </article>
    </div>
    <section className="guide-related"><div className="blog-section-heading"><div><span className="eyebrow">KEEP LEARNING</span><h2>Related guides</h2><p>Follow the next useful step or explore another tool in this topic.</p></div><Link to="/blog" className="text-link">All guides <ArrowRight size={14}/></Link></div><div className="guide-related-grid">{relatedGuides.map((item) => { const relatedTool = getTool(item.toolSlug); return <Link to={guidePath(item.slug)} className="guide-related-card" key={item.slug}><span className="eyebrow">{relatedTool?.category ?? 'GUIDE'}</span><strong>{item.title}</strong><small>{item.excerpt}</small><span className="text-link">Read the guide <ArrowRight size={13}/></span></Link>; })}{relatedTools.map((item) => { const RelatedIcon = item.icon; return <Link to={`/${item.slug}`} className="guide-related-card guide-related-tool" key={item.slug}><span className="guide-related-tool-icon"><RelatedIcon size={17}/></span><span className="eyebrow">RELATED TOOL</span><strong>{item.title}</strong><small>{item.description}</small><span className="text-link">Open tool <ArrowRight size={13}/></span></Link>; })}</div></section>
  </main>;
}

export function TopicsIndexPage() {
  usePageMeta({ title: 'Explore QuicGen Topics & Tool Collections', description: 'Browse focused collections of privacy-first tools and practical guides for QR codes, password security and everyday calculators.', path: '/topics', jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'QuicGen Topics', url: `${siteUrl}/topics`, description: 'Topic collections of tools and guides.' } });
  return <main className="static-page page-wrap topic-index-page"><header className="topic-hero"><span className="eyebrow"><BookOpen size={14}/> EXPLORE BY TOPIC</span><h1>Good tools,<br/><span>thoughtfully grouped.</span></h1><p>Start with a topic, find a practical guide and open the tool that helps you take the next step.</p></header><section className="topic-card-grid">{topics.map((topic) => <article className="topic-card" key={topic.slug}><span className="topic-card-kicker">{topic.eyebrow}</span><h2><Link to={topicPath(topic.slug)}>{topic.title}</Link></h2><p>{topic.description}</p><div><span>{topic.toolSlugs.length} tools</span><span>{topic.guideSlugs.length} guides</span></div><Link to={topicPath(topic.slug)} className="text-link">Explore topic <ArrowRight size={14}/></Link></article>)}</section></main>;
}

export function TopicPage() {
  const { slug = '' } = useParams();
  const topic = topicBySlug.get(slug);
  const safeTopic = topic ?? topics[0];
  const path = topicPath(safeTopic.slug);
  const canonical = `${siteUrl}${path}`;
  const topicTools = safeTopic.toolSlugs.map(getTool).filter((tool) => Boolean(tool));
  const topicGuides = safeTopic.guideSlugs.map((guideSlug) => guideBySlug.get(guideSlug)).filter((guide) => Boolean(guide));
  usePageMeta({
    title: safeTopic.title,
    description: safeTopic.description,
    path,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: safeTopic.title, description: safeTopic.description, url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: [...topicTools.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool!.title, url: `${siteUrl}/${tool!.slug}` })), ...topicGuides.map((guide, index) => ({ '@type': 'ListItem', position: topicTools.length + index + 1, name: guide!.title, url: `${siteUrl}${guidePath(guide!.slug)}` }))] } },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: safeTopic.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Topics', item: `${siteUrl}/topics` },
        { '@type': 'ListItem', position: 3, name: safeTopic.title, item: canonical },
      ] },
    ],
  });
  if (!topic) return <Navigate to="/not-found" replace/>;
  return <main className="static-page page-wrap topic-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/topics">Topics</Link><span>/</span><span aria-current="page">{topic.title.split(':')[0]}</span></nav>
    <header className="topic-hero topic-page-hero"><span className="eyebrow">{topic.eyebrow}</span><h1>{topic.title}</h1><p>{topic.description}</p></header>
    <article className="topic-editorial">{topic.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="topic-editorial-grid">{topic.sections.map((section, index) => <section key={section.title}><span className="topic-section-index">{String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2><p>{section.body}</p></section>)}</div></article>
    <section className="topic-list-section"><div className="blog-section-heading"><div><span className="eyebrow">TOOLS IN THIS TOPIC</span><h2>Put it to work.</h2></div></div><div className="topic-tools-grid">{topicTools.map((tool) => { const Icon = tool!.icon; return <Link className="topic-tool-card" key={tool!.slug} to={`/${tool!.slug}`}><span className={`tool-heading-icon accent-${tool!.accent}`}><Icon size={20}/></span><span><strong>{tool!.title}</strong><small>{tool!.description}</small></span><ArrowUpRight size={16}/></Link>; })}</div></section>
    <section className="topic-list-section"><div className="blog-section-heading"><div><span className="eyebrow">PRACTICAL GUIDES</span><h2>Learn the details.</h2></div><Link to="/blog" className="text-link">All guides <ArrowRight size={14}/></Link></div><div className="topic-guides-grid">{topicGuides.map((guide) => <Link to={guidePath(guide!.slug)} key={guide!.slug}><span className="eyebrow">STEP-BY-STEP GUIDE</span><strong>{guide!.title}</strong><small>{guide!.excerpt}</small><span className="text-link">Read guide <ArrowRight size={13}/></span></Link>)}</div></section>
    <section className="topic-faq-section"><div className="section-heading"><span className="eyebrow">GOOD TO KNOW</span><h2>Questions about {topic.title.split(':')[0].toLowerCase()}.</h2></div><div className="guide-faq-list">{topic.faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>
    <div className="topic-back-link"><Link to="/topics"><ArrowLeft size={14}/>All topics</Link><Link to="/blog">More guides <ArrowRight size={14}/></Link></div>
  </main>;
}
