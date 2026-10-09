import topicEntries from './topics.json';

export type TopicFaq = { question: string; answer: string };
export type TopicInfo = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string[];
  sections: { title: string; body: string }[];
  toolSlugs: string[];
  guideSlugs: string[];
  faqs: TopicFaq[];
};

export const topics = topicEntries as TopicInfo[];
export const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));
export function topicPath(slug: string) {
  return `/topics/${slug}`;
}
