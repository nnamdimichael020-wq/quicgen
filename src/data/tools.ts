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

export const tools: ToolInfo[] = [
  {
    slug: 'qr-code-generator', title: 'QR code generator', description: 'Design a custom QR code for links, Wi-Fi, contact cards and more.', category: 'Featured', icon: QrCode, accent: 'blue',
    metaTitle: 'Free QR Code Generator — Custom, Private & Downloadable | QuicGen',
    metaDescription: 'Create custom QR codes for URLs, Wi-Fi, contacts, email and more. Style and download high-resolution PNG, SVG or PDF—right in your browser.',
    intro: 'Make a QR code that looks as good as it works. Add your brand colors, a logo and a frame, then download a crisp file that is ready to share or print. Your content stays on this device.',
    howTo: ['Choose what your QR code should contain and enter the details.', 'Pick a dot style and color. Add an optional logo or caption to make it yours.', 'Scan the live preview, then download the format that fits your project.'],
    keywords: ['custom qr code', 'qr code maker', 'wifi qr code'],
  },
  {
    slug: 'password-generator', title: 'Password generator', description: 'Create strong, memorable passwords and check their strength.', category: 'Featured', icon: KeyRound, accent: 'purple',
    metaTitle: 'Secure Password Generator & Strength Checker | QuicGen',
    metaDescription: 'Generate strong, customizable passwords with cryptographically secure randomness. Check password strength privately in your browser.',
    intro: 'Create a unique password with the exact length and character mix you need. QuicGen uses your browser’s secure random generator—passwords are never sent to a server.',
    howTo: ['Set a length and choose the character groups to include.', 'Optionally exclude look-alike characters or use the pronounceable mode.', 'Generate, review the strength estimate and copy when you’re ready.'],
    keywords: ['secure password generator', 'strong password', 'password strength checker'],
  },
  {
    slug: 'uuid-generator', title: 'UUID generator', description: 'Generate one or a batch of unique version 4 identifiers.', category: 'Featured', icon: Fingerprint, accent: 'violet',
    metaTitle: 'Free UUID v4 Generator — Generate IDs in Bulk | QuicGen',
    metaDescription: 'Generate secure, random UUID version 4 identifiers in batches. Copy individual IDs, copy all, or download a text file. Runs locally.',
    intro: 'Generate version 4 UUIDs for test data, records, projects and more. Each identifier is made with the browser’s cryptographically secure random number generator.',
    howTo: ['Choose how many UUIDs you need (up to 100 at a time).', 'Generate a fresh batch with one click.', 'Copy an individual ID, copy the full list or download a text file.'],
    keywords: ['uuid v4 generator', 'guid generator', 'random uuid'],
  },
  {
    slug: 'random-number-generator', title: 'Random number generator', description: 'Pick random numbers in a range, with an optional no-repeat mode.', category: 'Generators', icon: Shuffle, accent: 'blue',
    metaTitle: 'Random Number Generator — Secure & Custom Range | QuicGen',
    metaDescription: 'Generate random numbers between any whole-number limits. Choose quantity and unique results using browser-based secure randomness.',
    intro: 'Get a quick, unbiased selection of numbers for games, giveaways, sampling or test data. Results are generated on your device using cryptographic randomness.',
    howTo: ['Enter the inclusive minimum and maximum values.', 'Choose how many results to generate and whether repeats are allowed.', 'Generate and copy your results or start a fresh draw.'],
    keywords: ['random number picker', 'random number generator', 'number generator'],
  },
  {
    slug: 'random-string-generator', title: 'Random string generator', description: 'Build random strings with the exact length and characters you want.', category: 'Generators', icon: Type, accent: 'pink',
    metaTitle: 'Random String Generator — Custom Characters & Length | QuicGen',
    metaDescription: 'Create random strings with letters, digits and symbols. Customize length and character sets, then copy results instantly.',
    intro: 'Create random strings for test data, temporary labels and development workflows. Choose exactly which character groups to use and generate right in your browser.',
    howTo: ['Choose the string length and number of strings.', 'Select letters, numbers or symbols—or enter a custom character set.', 'Generate and copy the results.'],
    keywords: ['random string generator', 'random text generator', 'test data'],
  },
  {
    slug: 'random-color-generator', title: 'Random color generator', description: 'Discover fresh colors in HEX, RGB or HSL formats.', category: 'Generators', icon: Palette, accent: 'pink',
    metaTitle: 'Random Color Generator — HEX, RGB & HSL | QuicGen',
    metaDescription: 'Generate a palette of random colors and copy HEX, RGB or HSL values. A fast, private color inspiration tool.',
    intro: 'Spark a fresh palette for a mockup, moodboard or side project. Generate colors, inspect their HEX, RGB and HSL values, then copy the format you need.',
    howTo: ['Choose how many colors to generate.', 'Tap generate to create a new palette.', 'Click any color value to copy it, or save a color in your own design tool.'],
    keywords: ['random color generator', 'random hex color', 'color palette generator'],
  },
  {
    slug: 'dice-roller', title: 'Dice roller', description: 'Roll virtual dice for tabletop games, decisions and quick random picks.', category: 'Generators', icon: Dice5, accent: 'orange',
    metaTitle: 'Online Dice Roller — Roll Multiple Dice | QuicGen',
    metaDescription: 'Roll one or more virtual dice with customizable sides. See each result, the total and your recent rolls—all locally.',
    intro: 'Roll up to 20 dice with 4, 6, 8, 10, 12 or 20 sides. Each roll is generated locally, so it’s quick, private and always ready for game night.',
    howTo: ['Pick the number of dice and the number of sides.', 'Roll to see every die and the combined total.', 'Roll again whenever you need a new result.'],
    keywords: ['online dice roller', 'virtual dice', 'roll dice'],
  },
  {
    slug: 'percentage-calculator', title: 'Percentage calculator', description: 'Solve percentage, percentage change and “what percent of” problems.', category: 'Calculators', icon: Percent, accent: 'green',
    metaTitle: 'Percentage Calculator — Find Percentages & Change | QuicGen',
    metaDescription: 'Calculate a percentage of a value, find what percent one number is of another, or work out percentage change. Instant and free.',
    intro: 'Take the mental arithmetic out of discounts, comparisons and everyday math. Switch between three common percentage questions and see the answer update instantly.',
    howTo: ['Choose the percentage calculation that matches your question.', 'Enter the values in the labeled fields.', 'Read the live result—no submit button or account required.'],
    keywords: ['percentage calculator', 'percent change calculator', 'what percent of calculator'],
  },
  {
    slug: 'tip-calculator', title: 'Tip calculator', description: 'Work out a tip, the full bill and a fair split per person.', category: 'Calculators', icon: Calculator, accent: 'green',
    metaTitle: 'Tip Calculator — Split the Bill & Calculate Tips | QuicGen',
    metaDescription: 'Calculate a restaurant tip, total bill and per-person share. Adjust the tip percentage and number of people for an instant result.',
    intro: 'A simple way to settle the bill. Choose a tip percentage, add the bill amount and split the total evenly across your table.',
    howTo: ['Enter the bill amount before tip.', 'Choose a tip percentage and the number of people sharing.', 'See the tip, total and amount per person update immediately.'],
    keywords: ['tip calculator', 'bill splitter', 'restaurant tip calculator'],
  },
  {
    slug: 'time-calculator', title: 'Time calculator', description: 'Add or subtract hours and minutes from a start time.', category: 'Calculators', icon: Clock3, accent: 'green',
    metaTitle: 'Time Calculator — Add & Subtract Hours and Minutes | QuicGen',
    metaDescription: 'Quickly add or subtract hours and minutes from a time. See the resulting time and day offset with a clear 12 or 24-hour clock.',
    intro: 'Plan a shift, duration or schedule without mental time math. Add or subtract a duration from any start time, including calculations that cross midnight.',
    howTo: ['Choose a start time and set the number of hours and minutes.', 'Select whether to add or subtract the duration.', 'Read the resulting time and any day change.'],
    keywords: ['time calculator', 'add hours to time', 'hours and minutes calculator'],
  },
  {
    slug: 'date-calculator', title: 'Date calculator', description: 'Find the days between dates, add days or calculate an age.', category: 'Calculators', icon: CalendarDays, accent: 'green',
    metaTitle: 'Date Calculator — Date Difference, Add Days & Age | QuicGen',
    metaDescription: 'Calculate the days between two dates, add or subtract days from a date, or find an age. Accurate calendar calculations, no sign-up.',
    intro: 'Answer common date questions in seconds. Calculate the gap between two dates, move forward or backward by a number of days, or find someone’s age.',
    howTo: ['Pick the date calculation you need.', 'Choose the relevant date or dates and enter a day count if needed.', 'See the result immediately, calculated using calendar dates.'],
    keywords: ['date calculator', 'days between dates', 'age calculator'],
  },
  {
    slug: 'word-counter', title: 'Word counter', description: 'Count words, characters, sentences and estimated reading time.', category: 'Text tools', icon: TextCursorInput, accent: 'amber',
    metaTitle: 'Word Counter — Words, Characters & Reading Time | QuicGen',
    metaDescription: 'Count words, characters with and without spaces, sentences and paragraphs. Get a live reading-time estimate as you type.',
    intro: 'Get a useful snapshot of your writing as you work. Counts update instantly and your text is processed only in this browser tab.',
    howTo: ['Paste or type your text into the editor.', 'Review live counts for words, characters, sentences and paragraphs.', 'Use the reading-time estimate to check the length at a glance.'],
    keywords: ['word counter', 'character counter', 'reading time calculator'],
  },
  {
    slug: 'case-converter', title: 'Case converter', description: 'Switch text between uppercase, lowercase, title case and more.', category: 'Text tools', icon: CaseSensitive, accent: 'amber',
    metaTitle: 'Case Converter — Uppercase, Lowercase, Title Case & More | QuicGen',
    metaDescription: 'Convert text to uppercase, lowercase, title case, sentence case or alternating case instantly. Copy your result in one click.',
    intro: 'Clean up headings, sentences or pasted text with a single click. Your original stays editable, and every conversion happens right here in your browser.',
    howTo: ['Paste or type the text you want to transform.', 'Choose uppercase, lowercase, title, sentence or alternating case.', 'Copy the converted result or keep editing it in the output box.'],
    keywords: ['case converter', 'uppercase converter', 'title case converter'],
  },
  {
    slug: 'lorem-ipsum-generator', title: 'Lorem ipsum generator', description: 'Generate placeholder copy by paragraph, sentence or word count.', category: 'Text tools', icon: Type, accent: 'amber',
    metaTitle: 'Lorem Ipsum Generator — Free Placeholder Text | QuicGen',
    metaDescription: 'Generate Lorem Ipsum placeholder text by paragraph, sentence or word count. Copy clean filler text instantly and privately.',
    intro: 'Create just enough placeholder copy to test a layout, prototype or draft. Choose the unit and amount, then generate or copy the text instantly.',
    howTo: ['Choose paragraphs, sentences or words.', 'Set the amount of placeholder text to generate.', 'Generate and copy the Lorem Ipsum output.'],
    keywords: ['lorem ipsum generator', 'placeholder text generator', 'dummy text'],
  },
  {
    slug: 'color-picker', title: 'Color picker & converter', description: 'Pick a color and convert between HEX, RGB and HSL.', category: 'Utilities', icon: Pipette, accent: 'pink',
    metaTitle: 'Color Picker & Converter — HEX, RGB and HSL | QuicGen',
    metaDescription: 'Pick a color visually or enter a HEX value. Instantly convert between HEX, RGB and HSL and copy the format you need.',
    intro: 'Choose a color visually or paste a HEX code to explore its values. QuicGen converts between HEX, RGB and HSL in real time—no uploads, no tracking.',
    howTo: ['Use the color picker or enter a valid HEX value.', 'Review the matching RGB and HSL values.', 'Click any code to copy it for your design or development work.'],
    keywords: ['color picker', 'hex to rgb converter', 'rgb to hsl'],
  },
  {
    slug: 'base64-encoder-decoder', title: 'Base64 encoder & decoder', description: 'Encode text to Base64 or decode Base64 back to readable text.', category: 'Utilities', icon: Binary, accent: 'blue',
    metaTitle: 'Base64 Encoder & Decoder — Convert Text Locally | QuicGen',
    metaDescription: 'Encode plain text as Base64 or decode Base64 into UTF-8 text. Conversion happens locally in your browser with clear error feedback.',
    intro: 'Convert text to and from Base64 without sending it anywhere. The tool supports UTF-8 characters, including emoji and non-Latin scripts.',
    howTo: ['Enter text to encode, or Base64 text to decode.', 'Choose the direction of conversion.', 'Copy the output. Invalid Base64 is flagged instead of silently mangled.'],
    keywords: ['base64 encoder', 'base64 decoder', 'base64 to text'],
  },
  {
    slug: 'hash-generator', title: 'Hash generator', description: 'Create MD5, SHA-1 and SHA-256 digests from text locally.', category: 'Utilities', icon: Hash, accent: 'blue',
    metaTitle: 'Hash Generator — MD5, SHA-1 & SHA-256 | QuicGen',
    metaDescription: 'Generate MD5, SHA-1 and SHA-256 hashes from text in your browser. Private by design, with clear guidance about legacy algorithms.',
    intro: 'Calculate a message digest from text without uploading the input. SHA-256 is suitable for general integrity checks; MD5 and SHA-1 are included for compatibility, not security.',
    howTo: ['Type or paste the text you want to hash.', 'Choose MD5, SHA-1 or SHA-256.', 'Copy the hexadecimal digest. For passwords, use a dedicated password-hashing algorithm instead.'],
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
