/**
 * index.js — Main orchestrator
 * For educational and experimental purposes only.
 */

import { extractFromURL } from "./extractor.js";
import { analyze } from "./analyzer.js";
import { generateStackMd } from "./generator.js";

export async function stack(url, options = {}) {
  if (!url.startsWith("http")) url = "https://" + url;

  const extracted = await extractFromURL(url, {
    wait: options.wait || 3000,
    extractDark: options.extractDark || false,
    onProgress: options.onProgress,
  });

  options.onProgress?.("Analyzing product DNA...");
  const data = analyze(extracted);

  options.onProgress?.("Generating STACK.md...");
  const markdown = generateStackMd(data);

  return { markdown, data, screenshot: extracted.screenshot };
}
