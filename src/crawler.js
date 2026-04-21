/**
 * crawler.js — Multi-page crawling
 *
 * Follows internal links from a seed URL, extracts product DNA from
 * each page, and merges the results into a comprehensive site-wide
 * analysis. Respects a configurable page limit and deduplicates URLs.
 *
 * For educational and experimental purposes only.
 */

import puppeteer from "puppeteer";
import { stack } from "./index.js";

/**
 * Crawl a site starting from a seed URL.
 *
 * @param {string} seedUrl - Starting URL
 * @param {object} options
 * @param {number} options.maxPages - Max pages to crawl (default: 5)
 * @param {number} options.wait - Wait time per page in ms (default: 3000)
 * @param {boolean} options.extractDark - Extract dark mode tokens
 * @param {function} options.onProgress - Progress callback
 * @returns {object} { pages, merged, sitemap }
 */
export async function crawl(seedUrl, options = {}) {
  const { maxPages = 5, wait = 3000, extractDark = false, onProgress } = options;
  const log = onProgress || (() => {});

  if (!seedUrl.startsWith("http")) seedUrl = "https://" + seedUrl;

  const origin = new URL(seedUrl).origin;
  const visited = new Set();
  const queue = [seedUrl];
  const pages = [];

  log(`Crawling ${origin} (max ${maxPages} pages)...`);

  // Phase 1: Discover internal links from seed page
  log("Discovering internal links...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const discoveryPage = await browser.newPage();
    await discoveryPage.setViewport({ width: 1440, height: 900 });
    await discoveryPage.goto(seedUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const internalLinks = await discoveryPage.evaluate((orig) => {
      const links = new Set();
      for (const a of document.querySelectorAll("a[href]")) {
        try {
          const url = new URL(a.href, document.location.origin);
          if (url.origin === orig && !url.hash && url.pathname !== document.location.pathname) {
            // Skip non-content paths
            const skip = /\.(png|jpg|jpeg|gif|svg|pdf|zip|css|js|xml|json|ico|woff|woff2|ttf|eot)$/i;
            if (!skip.test(url.pathname)) {
              links.add(url.origin + url.pathname);
            }
          }
        } catch (e) {}
      }
      return [...links];
    }, origin);

    await discoveryPage.close();

    // Add discovered links to queue (up to maxPages - 1 since seed is page 1)
    for (const link of internalLinks.slice(0, maxPages - 1)) {
      if (!queue.includes(link)) queue.push(link);
    }
  } finally {
    await browser.close();
  }

  // Phase 2: Extract DNA from each page
  const pagesToCrawl = queue.slice(0, maxPages);
  log(`Found ${pagesToCrawl.length} pages to analyze`);

  for (let i = 0; i < pagesToCrawl.length; i++) {
    const url = pagesToCrawl[i];
    if (visited.has(url)) continue;
    visited.add(url);

    log(`[${i + 1}/${pagesToCrawl.length}] Extracting: ${url}`);
    try {
      const result = await stack(url, { wait, extractDark });
      pages.push({ url, data: result.data, markdown: result.markdown });
    } catch (err) {
      log(`  Warning: Failed to extract ${url}: ${err.message}`);
    }
  }

  // Phase 3: Merge results
  log("Merging site-wide analysis...");
  const merged = mergePages(pages);

  // Phase 4: Build sitemap
  const sitemap = pages.map(p => ({
    url: p.url,
    title: p.data.identity?.title || "",
    pageType: p.data.uxAnalysis?.pageType || "unknown",
    score: p.data.dnaScore?.overall || 0,
  }));

  return { pages, merged, sitemap };
}

/**
 * Merge multiple page extractions into a unified site analysis.
 */
function mergePages(pages) {
  if (pages.length === 0) return null;
  if (pages.length === 1) return pages[0].data;

  const base = JSON.parse(JSON.stringify(pages[0].data));

  // Merge colors across all pages
  const allColors = new Map();
  for (const page of pages) {
    for (const color of page.data.designSystem?.colors || []) {
      const existing = allColors.get(color.hex);
      if (existing) {
        existing.count += color.count;
        existing.pages = (existing.pages || 1) + 1;
      } else {
        allColors.set(color.hex, { ...color, pages: 1 });
      }
    }
  }
  base.designSystem.colors = [...allColors.values()].sort((a, b) => b.count - a.count);

  // Merge fonts
  const allFonts = new Map();
  for (const page of pages) {
    for (const font of page.data.designSystem?.fonts || []) {
      const existing = allFonts.get(font.family);
      if (existing) {
        existing.count += font.count;
      } else {
        allFonts.set(font.family, { ...font });
      }
    }
  }
  base.designSystem.fonts = [...allFonts.values()].sort((a, b) => b.count - a.count);

  // Merge components
  const allComponents = new Map();
  for (const page of pages) {
    for (const comp of page.data.designSystem?.components || []) {
      const existing = allComponents.get(comp.type);
      if (existing) {
        existing.count += comp.count;
        // Merge variants (deduplicate)
        const existingVariants = JSON.stringify(existing.variants);
        for (const v of comp.variants || []) {
          if (!existingVariants.includes(JSON.stringify(v))) {
            existing.variants.push(v);
          }
        }
      } else {
        allComponents.set(comp.type, { ...comp });
      }
    }
  }
  base.designSystem.components = [...allComponents.values()];

  // Merge CTA texts
  const allCTAs = new Set();
  for (const page of pages) {
    for (const cta of page.data.content?.ctaTexts || []) {
      allCTAs.add(cta);
    }
  }
  base.content.ctaTexts = [...allCTAs].slice(0, 30);

  // Merge heading texts
  const allHeadings = new Set();
  for (const page of pages) {
    for (const h of page.data.content?.headingTexts || []) {
      allHeadings.add(h);
    }
  }
  base.content.headingTexts = [...allHeadings].slice(0, 40);

  // Merge tech stack
  const allFrameworks = new Set();
  const allAnalytics = new Set();
  for (const page of pages) {
    for (const fw of page.data.techStack?.frameworks || []) allFrameworks.add(fw);
    for (const a of page.data.techStack?.analytics || []) allAnalytics.add(a);
  }
  base.techStack.frameworks = [...allFrameworks];
  base.techStack.analytics = [...allAnalytics];

  // Merge nav links
  const allNavLinks = new Map();
  for (const page of pages) {
    for (const link of page.data.architecture?.navLinks || []) {
      if (!allNavLinks.has(link.text)) allNavLinks.set(link.text, link);
    }
  }
  base.architecture.navLinks = [...allNavLinks.values()];

  // Average the DNA score across all pages
  const scoreKeys = Object.keys(pages[0].data.dnaScore || {});
  for (const key of scoreKeys) {
    const scores = pages.map(p => p.data.dnaScore?.[key] || 0).filter(s => s > 0);
    if (scores.length > 0) {
      base.dnaScore[key] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  }

  // Tag as multi-page
  base._multiPage = {
    pageCount: pages.length,
    urls: pages.map(p => p.url),
  };

  return base;
}

/**
 * Generate a site-wide STACK.md that includes per-page summaries.
 */
export function generateCrawlReport(crawlResult) {
  const { pages, merged, sitemap } = crawlResult;
  const lines = [];
  const ln = (t = "") => lines.push(t);

  ln("# STACK.md — Site-Wide Analysis");
  ln();
  ln(`> ${pages.length} pages analyzed`);
  ln(`> Generated: ${new Date().toISOString().split("T")[0]}`);
  ln(`> This file was generated for educational and experimental purposes only.`);
  ln();
  ln("---");
  ln();

  // Sitemap
  ln("## Sitemap");
  ln();
  ln("| Page | Type | Score |");
  ln("|------|------|-------|");
  for (const page of sitemap) {
    const name = page.title.split(/[|\-–—]/)[0].trim() || page.url;
    ln(`| [${esc(name)}](${page.url}) | ${page.pageType} | ${page.score}/100 |`);
  }
  ln();

  // Site-wide design system
  if (merged) {
    ln("## Site-Wide Design System");
    ln();
    ln(`- **Colors detected:** ${merged.designSystem.colors.length}`);
    ln(`- **Fonts detected:** ${merged.designSystem.fonts.length}`);
    ln(`- **Component types:** ${merged.designSystem.components.length}`);
    if (merged.designSystem.gridSystem) {
      ln(`- **Spacing grid:** ${merged.designSystem.gridSystem.base}px base (${merged.designSystem.gridSystem.adherence}% adherence)`);
    }
    ln();

    // Color palette
    if (merged.designSystem.colors.length > 0) {
      ln("### Colors");
      ln();
      ln("| Color | Role | Usage | Pages |");
      ln("|-------|------|-------|-------|");
      for (const c of merged.designSystem.colors.slice(0, 15)) {
        ln(`| \`${c.hex}\` | ${c.role} | ${c.count}× | ${c.pages || 1} |`);
      }
      ln();
    }

    // Fonts
    if (merged.designSystem.fonts.length > 0) {
      ln("### Typography");
      ln();
      for (const f of merged.designSystem.fonts.slice(0, 4)) {
        ln(`- **${esc(f.family)}** — ${f.count}× usage`);
      }
      ln();
    }

    // Tech stack
    ln("### Technology Stack");
    ln();
    if (merged.techStack.frameworks.length > 0) ln(`- **Frameworks:** ${merged.techStack.frameworks.join(", ")}`);
    if (merged.techStack.cssFramework) ln(`- **CSS:** ${merged.techStack.cssFramework}`);
    if (merged.techStack.analytics.length > 0) ln(`- **Analytics:** ${merged.techStack.analytics.join(", ")}`);
    ln();
  }

  // Per-page summaries
  ln("## Per-Page Analysis");
  ln();
  for (const page of pages) {
    const d = page.data;
    const name = d.identity?.title?.split(/[|\-–—]/)[0].trim() || page.url;
    ln(`### ${esc(name)}`);
    ln();
    ln(`- **URL:** ${page.url}`);
    ln(`- **Type:** ${d.uxAnalysis?.pageType || "unknown"}`);
    ln(`- **Score:** ${d.dnaScore?.overall || 0}/100`);
    ln(`- **Voice:** ${d.brandVoice?.contentPersonality || "neutral"}`);
    if (d.uxPatterns?.hero?.headline) ln(`- **Hero:** "${esc(d.uxPatterns.hero.headline)}"`);
    ln();
  }

  return lines.join("\n");
}

function esc(s) {
  if (!s) return "";
  return String(s).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}
