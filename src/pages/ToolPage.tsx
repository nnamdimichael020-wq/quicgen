import { lazy, Suspense } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { getTool, tools } from '../data/tools';
import { getToolContent } from '../data/tool-content';
import { usePageMeta, siteUrl } from '../lib/utils';
import { PrivacyBadge } from '../components/ui';
import ToolContent from '../components/ToolContent';

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

export default function ToolPage() {
  const { slug = '' } = useParams();
  const tool = getTool(slug);
  // Safe fallback keeps hook order stable while the unknown-slug redirect renders.
  const safeTool = tool ?? tools[0];
  const content = getToolContent(safeTool.slug);
  const faqItems = content?.faqs ?? [];
  usePageMeta({
    title: safeTool.metaTitle,
    description: safeTool.metaDescription,
    path: `/${safeTool.slug}`,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'WebApplication', name: `QuicGen ${safeTool.title}`,
      url: `${siteUrl}/${safeTool.slug}`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
      description: safeTool.metaDescription, isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [...safeTool.keywords, 'Free to use', 'Processes data in your browser'],
    },
    {
      '@context': 'https://schema.org', '@type': 'HowTo', name: `How to use the ${safeTool.title}`,
      description: safeTool.metaDescription, totalTime: 'PT2M',
      step: safeTool.howTo.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: `Step ${index + 1}`, text: step })),
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${siteUrl}/#tools` },
        { '@type': 'ListItem', position: 3, name: safeTool.title, item: `${siteUrl}/${safeTool.slug}` },
      ],
    },
  ]});
  if (!tool) return <Navigate to="/not-found" replace/>;
  const Icon = tool.icon;
  const Tool = workspace[tool.slug];

  return <main className="tool-page page-wrap">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/#tools">Tools</Link><span>/</span><span aria-current="page">{tool.title}</span></div>
    <div className="tool-heading"><div className={`tool-heading-icon accent-${tool.accent}`}><Icon size={26}/></div><div className="tool-heading-main"><span className="eyebrow">{tool.category === 'Featured' ? 'FEATURED TOOL' : `${tool.category.toUpperCase()} · MADE EASY`}</span><h1>{tool.title}</h1><p>{tool.description}</p></div><div className="tool-heading-badge"><PrivacyBadge/></div></div>
    <div className="tool-intro"><p>{tool.intro}</p><span><ShieldCheck size={14}/>No sign-up. No uploads. Just your result.</span></div>
    {Tool ? <Suspense fallback={<div className="tool-loading"><span className="loading-spinner"/>Preparing your tool…</div>}><Tool/></Suspense> : <div className="tool-unavailable"><p>This tool is being prepared.</p></div>}
    <ToolContent tool={tool}/>
    <div className="tool-bottom-link"><Link to="/help"><ArrowLeft size={14}/>Need a hand? Visit the help center</Link><span>QuicGen · {tool.title}</span></div>
  </main>;
}
