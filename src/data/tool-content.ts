import contentEntries from './tool-content.json';

export type ToolFaq = { question: string; answer: string };

export type ToolContentInfo = {
  /** Short pitch shown right under the tool heading. */
  intro: string;
  /** Practical numbered steps for the "How to use it" block. */
  howTo: string[];
  /** 2–3 short paragraphs explaining what the tool does and why it is useful. */
  about: string[];
  /** 3–5 unique questions and answers for this specific tool. */
  faqs: ToolFaq[];
};

export const toolContent = contentEntries as Record<string, ToolContentInfo>;
export const toolContentBySlug = new Map(Object.entries(toolContent));

export function getToolContent(slug: string): ToolContentInfo | undefined {
  return toolContentBySlug.get(slug);
}
