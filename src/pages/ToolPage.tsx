import { lazy, Suspense } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react';
import { getTool, tools } from '../data/tools';
import { guideByTool, guides, guidePath } from '../data/guides';
import { topicBySlug, topicPath } from '../data/topics';
import { usePageMeta, siteUrl } from '../lib/utils';
import { PrivacyBadge } from '../components/ui';
import PrivacyCallout from '../components/PrivacyCallout';

const QRGenerator = lazy(() => import('../components/tools/QRGenerator'));
const SecurityAndRandom = () => import('../components/tools/SecurityAndRandom');
const PasswordGenerator = lazy(() => SecurityAndRandom().then((module) => ({ default: module.PasswordGenerator })));
const UUIDGenerator = lazy(() => SecurityAndRandom().then((module) => ({ default: module.UUIDGenerator })));
const RandomNumberGenerator = lazy(() => SecurityAndRandom().then((module) => ({ default: module.RandomNumberGenerator })));
const RandomStringGenerator = lazy(() => SecurityAndRandom().then((module) => ({ default: module.RandomStringGenerator })));
const RandomColorGenerator = lazy(() => SecurityAndRandom().then((module) => ({ default: module.RandomColorGenerator })));
const DiceRoller = lazy(() => SecurityAndRandom().then((module) => ({ default: module.DiceRoller })));
const Calculators = () => import('../components/tools/Calculators');
const PercentageCalculator = lazy(() => Calculators().then((module) => ({ default: module.PercentageCalculator })));
const TipCalculator = lazy(() => Calculators().then((module) => ({ default: module.TipCalculator })));
const TimeCalculator = lazy(() => Calculators().then((module) => ({ default: module.TimeCalculator })));
const DateCalculator = lazy(() => Calculators().then((module) => ({ default: module.DateCalculator })));
const TextTools = () => import('../components/tools/TextTools');
const WordCounter = lazy(() => TextTools().then((module) => ({ default: module.WordCounter })));
const CaseConverter = lazy(() => TextTools().then((module) => ({ default: module.CaseConverter })));
const LoremIpsumGenerator = lazy(() => TextTools().then((module) => ({ default: module.LoremIpsumGenerator })));
const UtilityTools = () => import('../components/tools/UtilityTools');
const ColorPicker = lazy(() => UtilityTools().then((module) => ({ default: module.ColorPicker })));
const Base64Tool = lazy(() => UtilityTools().then((module) => ({ default: module.Base64Tool })));
const HashGenerator = lazy(() => UtilityTools().then((module) => ({ default: module.HashGenerator })));

const workspace: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'qr-code-generator': QRGenerator, 'password-generator': PasswordGenerator, 'uuid-generator': UUIDGenerator,
  'random-number-generator': RandomNumberGenerator, 'random-string-generator': RandomStringGenerator,
  'random-color-generator': RandomColorGenerator, 'dice-roller': DiceRoller,
  'percentage-calculator': PercentageCalculator, 'tip-calculator': TipCalculator, 'time-calculator': TimeCalculator, 'date-calculator': DateCalculator,
  'word-counter': WordCounter, 'case-converter': CaseConverter, 'lorem-ipsum-generator': LoremIpsumGenerator,
  'color-picker': ColorPicker, 'base64-encoder-decoder': Base64Tool, 'hash-generator': HashGenerator,
};

const toolFaqs = (toolName: string) => [
  { q: `Is the ${toolName.toLowerCase()} free to use?`, a: 'Yes. QuicGen tools are free to use, with no account, usage limit for typical tasks, or payment required.' },
  { q: 'Is my input uploaded or saved?', a: 'No. This tool processes your input locally in your browser. QuicGen does not receive, store or log the content you enter. It is not saved unless a tool clearly offers an optional local history.' },
  { q: 'Can I use this on my phone?', a: 'Yes. The page is responsive and works in current mobile and desktop browsers. Your results are created on the device you are using.' },
];

export default function ToolPage() {
  const { slug = '' } = useParams();
  const tool = getTool(slug);
  if (!tool) return <Navigate to="/not-found" replace/>;
  const Tool = workspace[slug];
  const Icon = tool.icon;
  const faqItems = toolFaqs(tool.title);
  usePageMeta({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/${tool.slug}`,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'WebApplication', name: `QuicGen ${tool.title}`,
      url: `${siteUrl}/${tool.slug}`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
      description: tool.metaDescription, isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [...tool.keywords, 'Free to use', 'Processes data in your browser'],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${siteUrl}/#tools` },
        { '@type': 'ListItem', position: 3, name: tool.title, item: `${siteUrl}/${tool.slug}` },
      ],
    },
  ]});
  const toolGuide = guideByTool.get(tool.slug);
  const guideTopics = new Set(toolGuide?.topics ?? []);
  const relatedGuides = guides.filter((guide) => guide.slug !== toolGuide?.slug && guide.topics.some((topic) => guideTopics.has(topic))).slice(0, 3);
  const related = tools.filter((other) => other.slug !== tool.slug && (other.category === tool.category || other.category === 'Featured')).slice(0, 3);
  const primaryTopic = toolGuide?.topics.map((slug) => topicBySlug.get(slug)).find(Boolean);

  return <main className="tool-page page-wrap">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/#tools">Tools</Link><span>/</span><span aria-current="page">{tool.title}</span></div>
    <div className="tool-heading"><div className={`tool-heading-icon accent-${tool.accent}`}><Icon size={26}/></div><div className="tool-heading-main"><span className="eyebrow">{tool.category === 'Featured' ? 'FEATURED TOOL' : `${tool.category.toUpperCase()} · MADE EASY`}</span><h1>{tool.title}</h1><p>{tool.description}</p></div><div className="tool-heading-badge"><PrivacyBadge/></div></div>
    <div className="tool-intro"><p>{tool.intro}</p><span><ShieldCheck size={14}/>No sign-up. No uploads. Just your result.</span></div>
    {Tool ? <Suspense fallback={<div className="tool-loading"><span className="loading-spinner"/>Preparing your tool…</div>}><Tool/></Suspense> : <div className="tool-unavailable"><p>This tool is being prepared.</p></div>}
    <div className="tool-detail-layout"><section className="how-to-section"><span className="eyebrow">A QUICK HOW-TO</span><h2>How to use the {tool.title.toLowerCase()}</h2><p className="detail-lede">No learning curve. Just a few little steps and you’re done.</p><ol className="how-to-steps">{tool.howTo.map((step, index) => <li key={step}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>{toolGuide && <Link to={guidePath(toolGuide.slug)} className="tool-guide-promo"><span className="tool-guide-promo-icon"><BookOpen size={18}/></span><span><small>{primaryTopic ? `A PRACTICAL GUIDE · ${primaryTopic.title.split(':')[0].toUpperCase()}` : 'A PRACTICAL GUIDE'}</small><strong>{toolGuide.title}</strong><span>{toolGuide.excerpt}</span></span><ArrowUpRight size={17}/></Link>}</section>
      <aside className="tool-aside"><PrivacyCallout/>{primaryTopic && <Link className="tool-topic-link" to={topicPath(primaryTopic.slug)}><BookOpen size={16}/><span><strong>{primaryTopic.title}</strong><small>Explore related tools and guides</small></span><ArrowRight size={14}/></Link>}<div className="tool-faq-card"><span className="eyebrow">GOOD TO KNOW</span><h2>A few quick answers.</h2>{faqItems.map((item, index) => <details key={item.q} className="faq-item" open={index === 0}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}</div></aside></div>
    <section className="related-tools"><div className="related-header"><div><span className="eyebrow">KEEP THE FLOW</span><h2>A few more good ones.</h2></div><Link to="/#tools" className="text-link">See all tools <ArrowRight size={15}/></Link></div><div className="related-grid">{related.map((item) => { const RelatedIcon = item.icon; return <Link to={`/${item.slug}`} className="related-card" key={item.slug}><span className={`related-icon accent-${item.accent}`}><RelatedIcon size={18}/></span><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowUpRight size={16}/></Link>; })}</div>{relatedGuides.length > 0 && <div className="tool-related-guides"><div className="tool-related-guides-heading"><span className="eyebrow">READ NEXT</span><Link to="/blog" className="text-link">All guides <ArrowRight size={13}/></Link></div><div className="related-grid">{relatedGuides.map((guide) => <Link to={guidePath(guide.slug)} className="related-card" key={guide.slug}><span className="related-icon"><BookOpen size={17}/></span><span><strong>{guide.title}</strong><small>{guide.excerpt}</small></span><ArrowUpRight size={16}/></Link>)}</div></div>}</section>
    <div className="tool-bottom-link"><Link to="/help"><ArrowLeft size={14}/>Need a hand? Visit the help center</Link><span>QuicGen · {tool.title}</span></div>
  </main>;
}
