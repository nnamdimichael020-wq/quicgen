import guideEntries from './guides.json';
import guideSupplement from './guide-supplement.json';

export type GuideExample = { title: string; scenario: string; input: string; outcome: string; lesson: string };
export type GuideStep = { title: string; body: string };
export type GuidePoint = { title: string; body: string };
export type GuidePitfall = { problem: string; solution: string };
export type GuideFaq = { question: string; answer: string };

export type GuideInfo = {
  slug: string;
  toolSlug: string;
  title: string;
  description: string;
  excerpt: string;
  family: keyof typeof guideSupplement.families;
  topics: string[];
  opening: string[];
  purpose: string;
  steps: GuideStep[];
  examples: GuideExample[];
  choices: GuidePoint[];
  tips: GuidePoint[];
  troubleshooting: GuidePitfall[];
  privacyNote: string;
  faqs: GuideFaq[];
  closing: string;
};

export type SupplementSection = { id: string; title: string; body: string };
export const guides = guideEntries as GuideInfo[];
export const sharedGuideSections = guideSupplement.shared as SupplementSection[];
export const familyGuideSections = guideSupplement.families as Record<GuideInfo['family'], SupplementSection>;
export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));
export const guideByTool = new Map(guides.map((guide) => [guide.toolSlug, guide]));

export function guidePath(slug: string) {
  return `/blog/${slug}`;
}

export function guideWordCount(guide: GuideInfo, toolTitle: string, toolDescription: string) {
  const familySection = familyGuideSections[guide.family];
  const text = [
    toolTitle,
    toolDescription,
    guide.title,
    guide.description,
    ...guide.opening,
    guide.purpose,
    ...guide.steps.flatMap((step) => [step.title, step.body]),
    ...guide.examples.flatMap((example) => [example.title, example.scenario, example.input, example.outcome, example.lesson]),
    ...guide.choices.flatMap((point) => [point.title, point.body]),
    ...guide.tips.flatMap((point) => [point.title, point.body]),
    ...guide.troubleshooting.flatMap((item) => [item.problem, item.solution]),
    guide.privacyNote,
    ...guide.faqs.flatMap((item) => [item.question, item.answer]),
    guide.closing,
    ...sharedGuideSections.map((section) => section.body),
    familySection.body,
  ].join(' ');
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
}
