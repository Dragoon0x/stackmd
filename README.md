# stackmd

Extract full product DNA from any live URL into a single STACK.md file.

```
npx stackmd https://example.com
```

stackmd crawls any URL and extracts the full product DNA: brand voice, UX patterns, content strategy, visual design, information architecture, component behavior, SEO structure, performance signals, and technology stack. 36 extraction passes. 200+ data points. Everything an AI agent needs to rebuild a product that works, feels, and thinks like the original.

> **This project is for educational and experimental purposes only.** It reads publicly visible computed styles, content, and structure from rendered web pages. No ownership of any product identity is claimed. See [Disclaimer](#disclaimer).

## What it extracts

STACK.md covers 15 sections. Every section gives an AI coding agent real context, not just tokens.

| # | Section | What it captures |
|---|---------|-----------------|
| 1 | Product Identity | Name, tagline, page type, detected frameworks, voice personality |
| 2 | Product DNA Score | 0-100 across visual, voice, UX, accessibility, SEO, performance |
| 3 | Brand Voice & Tone | Personality traits, reading level, pronoun strategy, CTA patterns, vocabulary |
| 4 | Content Strategy | Heading hierarchy, form labels, placeholders, microcopy, writing density |
| 5 | Visual Design System | Colors, typography, spacing grid, depth, dark mode |
| 6 | Component Styling | Buttons, inputs, cards, navigation with full CSS per variant |
| 7 | UX Patterns | Page type, conversion strategy, hero, forms, social proof, sticky elements |
| 8 | Information Architecture | Navigation links, page sections, footer, structure stats |
| 9 | Component Behavior | Tooltips, modals, drawers, form validation, focus management |
| 10 | Motion & Animation | Transition durations, easings, keyframe animations |
| 11 | Responsive Strategy | Breakpoints from @media rules |
| 12 | Accessibility Profile | WCAG contrast, heading order, landmarks, ARIA, focus, reduced motion |
| 13 | SEO & Performance | Title, meta, structured data, Open Graph, DOM nodes, lazy loading |
| 14 | Technology Stack | React/Next/Vue/Angular/Svelte, Tailwind/Bootstrap, analytics, hosting |
| 15 | Agent Build Guide | Quick reference + full structured prompt with identity, visual, voice, and UX |

## How it works

1. Puppeteer loads the page in a headless browser
2. Every visible DOM element is scanned for computed styles
3. All text content is analyzed for voice, tone, and reading level
4. Navigation, sections, and page structure are mapped
5. UX patterns (hero, CTAs, forms, social proof) are detected by heuristic
6. Component behavior (modals, tooltips, validation) is inventoried
7. Technology stack is identified from DOM signatures and CSS variable patterns
8. SEO structure and performance signals are collected
9. Everything is scored across 10 dimensions and output as a structured STACK.md

## Install

```bash
npm install -g stackmd
```

## Usage

```bash
stackmd https://example.com
stackmd https://example.com -o ./docs/product-dna.md
stackmd https://example.com --dark --json
stackmd https://example.com --wait 5000
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <path>` | Output file path | `./STACK.md` |
| `--json` | Output raw data as JSON | `false` |
| `--dark` | Extract dark mode tokens | `false` |
| `--wait <ms>` | Wait time for dynamic content | `3000` |

## Programmatic API

```js
import { stack } from "stackmd";

const result = await stack("https://example.com", {
  wait: 3000,
  extractDark: true,
  onProgress: (msg) => console.log(msg),
});

result.markdown                    // STACK.md content
result.data.brandVoice             // personality, reading level, CTA patterns
result.data.uxAnalysis             // page type, conversion strategy, patterns
result.data.designSystem           // colors, fonts, spacing, components
result.data.techStack              // frameworks, CSS framework, analytics
result.data.dnaScore               // 0-100 across 10 dimensions
```

## Disclaimer

This tool is provided strictly for **educational and experimental purposes**. It reads publicly visible computed CSS values, text content, and DOM structure from rendered web pages, equivalent to what any browser's developer tools expose.

- No proprietary code, assets, or non-public information is accessed
- Extracted data represents publicly visible content and styling
- No ownership of any product identity, brand, or design system is claimed
- Users are responsible for ensuring compliance with applicable terms of service
- This tool does not bypass any access controls, authentication, or rate limiting
- Output should not be used to create confusingly similar products or infringe on trademarks

The author provides this tool as-is with no warranty. Use responsibly.

## License

MIT
