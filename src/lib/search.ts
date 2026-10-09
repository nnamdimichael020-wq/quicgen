import { tools, type ToolInfo } from '../data/tools';

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function editDistance(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 2) return 3;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length];
}

function scoreTool(tool: ToolInfo, query: string, queryTerms: string[]) {
  const title = normalize(tool.title);
  const slug = normalize(tool.slug);
  const description = normalize(tool.description);
  const category = normalize(tool.category);
  const keywords = tool.keywords.map(normalize);
  const allText = [title, slug, description, category, ...keywords].join(' ');
  let score = 0;

  if (title === query) score += 150;
  else if (title.startsWith(query)) score += 115;
  else if (title.includes(query)) score += 90;
  if (slug.includes(query)) score += 65;
  if (keywords.some((keyword) => keyword === query)) score += 105;
  else if (keywords.some((keyword) => keyword.startsWith(query))) score += 75;
  else if (keywords.some((keyword) => keyword.includes(query))) score += 58;
  if (description.includes(query)) score += 35;
  if (category.includes(query)) score += 28;

  const titleTerms = title.split(' ');
  const candidates = [...titleTerms, ...slug.split(' '), ...keywords.flatMap((keyword) => keyword.split(' '))];
  for (const term of queryTerms) {
    if (titleTerms.some((candidate) => candidate === term)) score += 55;
    else if (titleTerms.some((candidate) => candidate.startsWith(term))) score += 42;
    else if (candidates.some((candidate) => candidate.includes(term))) score += 27;
    else if (term.length >= 4) {
      const threshold = term.length >= 7 ? 2 : 1;
      const nearest = Math.min(...candidates.map((candidate) => editDistance(term, candidate)));
      if (nearest <= threshold) score += nearest === 1 ? 19 : 12;
    }
  }

  // Reward tools that match every meaningful word instead of noisy partial matches.
  if (queryTerms.length > 1 && queryTerms.every((term) => allText.includes(term))) score += 30;
  return score;
}

/** Rank tool-only results, including common typos, by relevance to the typed query. */
export function searchTools(query: string, limit = tools.length) {
  const normalized = normalize(query);
  if (!normalized) return [];
  const terms = normalized.split(' ').filter(Boolean);
  return tools
    .map((tool) => ({ tool, score: scoreTool(tool, normalized, terms) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.tool.title.localeCompare(right.tool.title))
    .slice(0, limit)
    .map(({ tool }) => tool);
}
