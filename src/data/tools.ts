import {
  CalendarDays,
  CaseSensitive,
  Clock3,
  Dice5,
  Fingerprint,
  Hash,
  KeyRound,
  Palette,
  Percent,
  Pipette,
  QrCode,
  Shuffle,
  TextCursorInput,
  Type,
  Binary,
  Calculator,
  type LucideIcon,
} from 'lucide-react';
import { getToolContent } from './tool-content';

export type ToolCategory = 'Featured' | 'Generators' | 'Calculators' | 'Text tools' | 'Utilities';
export type ToolInfo = {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  accent: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  howTo: string[];
  keywords: string[];
};

function contentFor(slug: string): Pick<ToolInfo, 'intro' | 'howTo'> {
  const content = getToolContent(slug);
  if (!content) throw new Error(`Missing tool content for "${slug}"`);
  return { intro: content.intro, howTo: content.howTo };
}

export const tools: ToolInfo[] = [
  {
    slug: 'qr-code-generator', title: 'QR code generator', description: 'Design a custom QR code for links, Wi-Fi, contact cards and more.', category: 'Featured', icon: QrCode, accent: 'blue',
    metaTitle: 'Free QR Code Generator — Custom, Private & Downloadable | QuicGen',
    metaDescription: 'Create custom QR codes for URLs, Wi-Fi, contacts, email and more. Style and download high-resolution PNG, SVG or PDF—right in your browser.',
    ...contentFor('qr-code-generator'),
    keywords: ['custom qr code', 'qr code maker', 'wifi qr code'],
  },
  {
    slug: 'password-generator', title: 'Password generator', description: 'Create strong, memorable passwords and check their strength.', category: 'Featured', icon: KeyRound, accent: 'purple',
    metaTitle: 'Secure Password Generator & Strength Checker | QuicGen',
    metaDescription: 'Generate strong, customizable passwords with cryptographically secure randomness. Check password strength privately in your browser.',
    ...contentFor('password-generator'),
    keywords: ['secure password generator', 'strong password', 'password strength checker'],
  },
  {
    slug: 'uuid-generator', title: 'UUID generator', description: 'Generate one or a batch of unique version 4 identifiers.', category: 'Featured', icon: Fingerprint, accent: 'violet',
    metaTitle: 'Free UUID v4 Generator — Generate IDs in Bulk | QuicGen',
    metaDescription: 'Generate secure, random UUID version 4 identifiers in batches. Copy individual IDs, copy all, or download a text file. Runs locally.',
    ...contentFor('uuid-generator'),
    keywords: ['uuid v4 generator', 'guid generator', 'random uuid'],
  },
  {
    slug: 'random-number-generator', title: 'Random number generator', description: 'Pick random numbers in a range, with an optional no-repeat mode.', category: 'Generators', icon: Shuffle, accent: 'blue',
    metaTitle: 'Random Number Generator — Secure & Custom Range | QuicGen',
    metaDescription: 'Generate random numbers between any whole-number limits. Choose quantity and unique results using browser-based secure randomness.',
    ...contentFor('random-number-generator'),
    keywords: ['random number picker', 'random number generator', 'number generator'],
  },
  {
    slug: 'random-string-generator', title: 'Random string generator', description: 'Build random strings with the exact length and characters you want.', category: 'Generators', icon: Type, accent: 'pink',
    metaTitle: 'Random String Generator — Custom Characters & Length | QuicGen',
    metaDescription: 'Create random strings with letters, digits and symbols. Customize length and character sets, then copy results instantly.',
    ...contentFor('random-string-generator'),
    keywords: ['random string generator', 'random text generator', 'test data'],
  },
  {
    slug: 'random-color-generator', title: 'Random color generator', description: 'Discover fresh colors in HEX, RGB or HSL formats.', category: 'Generators', icon: Palette, accent: 'pink',
    metaTitle: 'Random Color Generator — HEX, RGB & HSL | QuicGen',
    metaDescription: 'Generate a palette of random colors and copy HEX, RGB or HSL values. A fast, private color inspiration tool.',
    ...contentFor('random-color-generator'),
    keywords: ['random color generator', 'random hex color', 'color palette generator'],
  },
  {
    slug: 'dice-roller', title: 'Dice roller', description: 'Roll virtual dice for tabletop games, decisions and quick random picks.', category: 'Generators', icon: Dice5, accent: 'orange',
    metaTitle: 'Online Dice Roller — Roll Multiple Dice | QuicGen',
    metaDescription: 'Roll one or more virtual dice with customizable sides. See each result, the total and your recent rolls—all locally.',
    ...contentFor('dice-roller'),
    keywords: ['online dice roller', 'virtual dice', 'roll dice'],
  },
  {
    slug: 'percentage-calculator', title: 'Percentage calculator', description: 'Solve percentage, percentage change and “what percent of” problems.', category: 'Calculators', icon: Percent, accent: 'green',
    metaTitle: 'Percentage Calculator — Find Percentages & Change | QuicGen',
    metaDescription: 'Calculate a percentage of a value, find what percent one number is of another, or work out percentage change. Instant and free.',
    ...contentFor('percentage-calculator'),
    keywords: ['percentage calculator', 'percent change calculator', 'what percent of calculator'],
  },
  {
    slug: 'tip-calculator', title: 'Tip calculator', description: 'Work out a tip, the full bill and a fair split per person.', category: 'Calculators', icon: Calculator, accent: 'green',
    metaTitle: 'Tip Calculator — Split the Bill & Calculate Tips | QuicGen',
    metaDescription: 'Calculate a restaurant tip, total bill and per-person share. Adjust the tip percentage and number of people for an instant result.',
    ...contentFor('tip-calculator'),
    keywords: ['tip calculator', 'bill splitter', 'restaurant tip calculator'],
  },
  {
    slug: 'time-calculator', title: 'Time calculator', description: 'Add or subtract hours and minutes from a start time.', category: 'Calculators', icon: Clock3, accent: 'green',
    metaTitle: 'Time Calculator — Add & Subtract Hours and Minutes | QuicGen',
    metaDescription: 'Quickly add or subtract hours and minutes from a time. See the resulting time and day offset with a clear 12 or 24-hour clock.',
    ...contentFor('time-calculator'),
    keywords: ['time calculator', 'add hours to time', 'hours and minutes calculator'],
  },
  {
    slug: 'date-calculator', title: 'Date calculator', description: 'Find the days between dates, add days or calculate an age.', category: 'Calculators', icon: CalendarDays, accent: 'green',
    metaTitle: 'Date Calculator — Date Difference, Add Days & Age | QuicGen',
    metaDescription: 'Calculate the days between two dates, add or subtract days from a date, or find an age. Accurate calendar calculations, no sign-up.',
    ...contentFor('date-calculator'),
    keywords: ['date calculator', 'days between dates', 'age calculator'],
  },
  {
    slug: 'word-counter', title: 'Word counter', description: 'Count words, characters, sentences and estimated reading time.', category: 'Text tools', icon: TextCursorInput, accent: 'amber',
    metaTitle: 'Word Counter — Words, Characters & Reading Time | QuicGen',
    metaDescription: 'Count words, characters with and without spaces, sentences and paragraphs. Get a live reading-time estimate as you type.',
    ...contentFor('word-counter'),
    keywords: ['word counter', 'character counter', 'reading time calculator'],
  },
  {
    slug: 'case-converter', title: 'Case converter', description: 'Switch text between uppercase, lowercase, title case and more.', category: 'Text tools', icon: CaseSensitive, accent: 'amber',
    metaTitle: 'Case Converter — Uppercase, Lowercase, Title Case & More | QuicGen',
    metaDescription: 'Convert text to uppercase, lowercase, title case, sentence case or alternating case instantly. Copy your result in one click.',
    ...contentFor('case-converter'),
    keywords: ['case converter', 'uppercase converter', 'title case converter'],
  },
  {
    slug: 'lorem-ipsum-generator', title: 'Lorem ipsum generator', description: 'Generate placeholder copy by paragraph, sentence or word count.', category: 'Text tools', icon: Type, accent: 'amber',
    metaTitle: 'Lorem Ipsum Generator — Free Placeholder Text | QuicGen',
    metaDescription: 'Generate Lorem Ipsum placeholder text by paragraph, sentence or word count. Copy clean filler text instantly and privately.',
    ...contentFor('lorem-ipsum-generator'),
    keywords: ['lorem ipsum generator', 'placeholder text generator', 'dummy text'],
  },
  {
    slug: 'color-picker', title: 'Color picker & converter', description: 'Pick a color and convert between HEX, RGB and HSL.', category: 'Utilities', icon: Pipette, accent: 'pink',
    metaTitle: 'Color Picker & Converter — HEX, RGB and HSL | QuicGen',
    metaDescription: 'Pick a color visually or enter a HEX value. Instantly convert between HEX, RGB and HSL and copy the format you need.',
    ...contentFor('color-picker'),
    keywords: ['color picker', 'hex to rgb converter', 'rgb to hsl'],
  },
  {
    slug: 'base64-encoder-decoder', title: 'Base64 encoder & decoder', description: 'Encode text to Base64 or decode Base64 back to readable text.', category: 'Utilities', icon: Binary, accent: 'blue',
    metaTitle: 'Base64 Encoder & Decoder — Convert Text Locally | QuicGen',
    metaDescription: 'Encode plain text as Base64 or decode Base64 into UTF-8 text. Conversion happens locally in your browser with clear error feedback.',
    ...contentFor('base64-encoder-decoder'),
    keywords: ['base64 encoder', 'base64 decoder', 'base64 to text'],
  },
  {
    slug: 'hash-generator', title: 'Hash generator', description: 'Create MD5, SHA-1 and SHA-256 digests from text locally.', category: 'Utilities', icon: Hash, accent: 'blue',
    metaTitle: 'Hash Generator — MD5, SHA-1 & SHA-256 | QuicGen',
    metaDescription: 'Generate MD5, SHA-1 and SHA-256 hashes from text in your browser. Private by design, with clear guidance about legacy algorithms.',
    ...contentFor('hash-generator'),
    keywords: ['hash generator', 'md5 generator', 'sha256 generator'],
  },
];

export const categories: { name: ToolCategory; description: string }[] = [
  { name: 'Featured', description: 'The tools people reach for first.' },
  { name: 'Generators', description: 'Create something fresh in a click.' },
  { name: 'Calculators', description: 'Get the numbers right, instantly.' },
  { name: 'Text tools', description: 'Make every word work harder.' },
  { name: 'Utilities', description: 'Handy conversions, all in one place.' },
];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
