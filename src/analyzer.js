/**
 * analyzer.js — Product DNA analysis
 *
 * Transforms raw extracted data into structured product intelligence:
 * visual system, brand voice profile, UX pattern map, content strategy,
 * information architecture, and technology audit.
 *
 * For educational and experimental purposes only.
 */

import { generateIntelligence } from "./intelligence.js";

// ═══════════════════════════════════════════════════════════════
// Color utilities
// ═══════════════════════════════════════════════════════════════

function hexToRgb(hex) {
  if (!hex?.startsWith("#")) return null;
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length !== 6) return null;
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function colorDistance(a, b) {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  if (!ra || !rb) return Infinity;
  return Math.sqrt((ra.r - rb.r) ** 2 + (ra.g - rb.g) ** 2 + (ra.b - rb.b) ** 2);
}

function clusterColors(colorMap, threshold = 20) {
  const entries = Object.entries(colorMap).filter(([h]) => h?.startsWith("#") && h.length === 7).sort((a, b) => b[1] - a[1]);
  const clusters = [], used = new Set();
  for (const [hex, count] of entries) {
    if (used.has(hex)) continue;
    const cluster = { hex, count, members: [hex] };
    for (const [other] of entries) {
      if (other === hex || used.has(other)) continue;
      if (colorDistance(hex, other) < threshold) { cluster.members.push(other); cluster.count += colorMap[other]; used.add(other); }
    }
    used.add(hex); clusters.push(cluster);
  }
  return clusters.sort((a, b) => b.count - a.count);
}

function inferRole(hex, bgC, textC, borderC) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "unknown";
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (hsl.l > 97) return "background";
  if (hsl.l > 93) return "surface";
  if (hsl.l < 5) return "text-primary";
  if (hsl.l < 20) return "text-secondary";
  if (hsl.s > 60 && hsl.l > 35 && hsl.l < 65) return "accent";
  if (bgC > textC * 2 && hsl.l > 80) return "surface";
  if (textC > bgC * 2) return "text";
  if (borderC > textC) return "border";
  return "neutral";
}

// ═══════════════════════════════════════════════════════════════
// Brand voice analysis
// ═══════════════════════════════════════════════════════════════

function analyzeVoice(content) {
  const voice = {
    personality: [],
    toneProfile: { formality: 0, warmth: 0, technicality: 0, urgency: 0, playfulness: 0 },
    readingLevel: "standard",
    avgSentenceLength: 0,
    avgWordLength: 0,
    vocabularyRichness: 0,
    pronounStrategy: "neutral",
    punctuationStyle: "standard",
    ctaPattern: "unknown",
    writingDensity: "standard",
    topWords: [],
    contentPersonality: "",
  };

  // Sentence length
  if (content.sentenceLengths.length > 0) {
    voice.avgSentenceLength = Math.round(content.sentenceLengths.reduce((a, b) => a + b, 0) / content.sentenceLengths.length);
  }

  // Reading level from sentence length
  if (voice.avgSentenceLength < 10) voice.readingLevel = "simple";
  else if (voice.avgSentenceLength < 16) voice.readingLevel = "standard";
  else if (voice.avgSentenceLength < 22) voice.readingLevel = "advanced";
  else voice.readingLevel = "academic";

  // Tone profile (normalize to 0-100)
  const ts = content.toneSignals;
  const total = Object.values(ts).reduce((a, b) => a + b, 1);
  voice.toneProfile.formality = Math.round((ts.formal / total) * 100);
  voice.toneProfile.warmth = Math.round(((ts.informal + ts.playful) / total) * 100);
  voice.toneProfile.technicality = Math.round((ts.technical / total) * 100);
  voice.toneProfile.urgency = Math.round((ts.urgent / total) * 100);
  voice.toneProfile.playfulness = Math.round((ts.playful / total) * 100);

  // Pronoun strategy
  const { we, you } = content.pronouns;
  if (you > we * 2) voice.pronounStrategy = "user-centric (you/your)";
  else if (we > you * 2) voice.pronounStrategy = "company-centric (we/our)";
  else if (we > 0 && you > 0) voice.pronounStrategy = "balanced (we + you)";
  else voice.pronounStrategy = "neutral (third person)";

  // Punctuation style
  const punc = content.punctuation;
  if (punc.exclamation > punc.period * 0.3) voice.punctuationStyle = "enthusiastic";
  else if (punc.question > punc.period * 0.3) voice.punctuationStyle = "conversational";
  else if (punc.ellipsis > 3) voice.punctuationStyle = "contemplative";
  else voice.punctuationStyle = "standard";

  // CTA pattern
  const ctaTexts = content.ctaTexts.map(t => t.toLowerCase());
  if (ctaTexts.some(t => t.includes("free") || t.includes("try"))) voice.ctaPattern = "low-commitment (try/free)";
  else if (ctaTexts.some(t => t.includes("start") || t.includes("begin"))) voice.ctaPattern = "action-oriented (start/begin)";
  else if (ctaTexts.some(t => t.includes("learn") || t.includes("explore"))) voice.ctaPattern = "discovery (learn/explore)";
  else if (ctaTexts.some(t => t.includes("buy") || t.includes("purchase") || t.includes("order"))) voice.ctaPattern = "transactional (buy/order)";
  else if (ctaTexts.some(t => t.includes("contact") || t.includes("talk") || t.includes("demo"))) voice.ctaPattern = "relationship (contact/demo)";
  else if (ctaTexts.length > 0) voice.ctaPattern = "mixed";

  // Writing density
  const totalText = content.paragraphs.join(" ");
  const wordCount = totalText.split(/\s+/).length;
  if (wordCount < 200) voice.writingDensity = "minimal";
  else if (wordCount < 500) voice.writingDensity = "concise";
  else if (wordCount < 1000) voice.writingDensity = "standard";
  else voice.writingDensity = "content-rich";

  // Vocabulary richness (unique words / total words)
  const uniqueWords = Object.keys(content.wordFrequency).length;
  const totalWords = Object.values(content.wordFrequency).reduce((a, b) => a + b, 1);
  voice.vocabularyRichness = Math.round((uniqueWords / totalWords) * 100);

  // Top words (excluding common stop words)
  const stopWords = new Set(["the","and","for","that","this","with","from","have","will","your","been","they","their","what","about","which","when","were","more","other","than","into","some","could","them","only","also","just","after","made","like","being","many","those","then","very","make","over","such","most","these","would","each","much","does","where","before","should","through","while","between","still","even","both","here","because","every","same","another","come","know","take","right","down","well","back","going","want","really","something","doing","need","look","think","good","work","first","people","time","using"]);
  voice.topWords = Object.entries(content.wordFrequency)
    .filter(([w]) => !stopWords.has(w) && w.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Personality summary
  const traits = [];
  if (voice.toneProfile.technicality > 30) traits.push("technical");
  if (voice.toneProfile.warmth > 30) traits.push("warm");
  if (voice.toneProfile.playfulness > 20) traits.push("playful");
  if (voice.toneProfile.formality > 30) traits.push("professional");
  if (voice.toneProfile.urgency > 20) traits.push("urgent");
  if (voice.readingLevel === "simple") traits.push("accessible");
  if (voice.readingLevel === "academic") traits.push("sophisticated");
  if (voice.vocabularyRichness > 60) traits.push("diverse vocabulary");
  if (voice.writingDensity === "minimal") traits.push("sparse");
  if (voice.writingDensity === "content-rich") traits.push("verbose");
  voice.personality = traits;
  voice.contentPersonality = traits.length > 0 ? traits.join(", ") : "neutral";

  return voice;
}

// ═══════════════════════════════════════════════════════════════
// UX pattern analysis
// ═══════════════════════════════════════════════════════════════

function analyzeUX(uxPatterns, architecture) {
  const ux = {
    pageType: "unknown",
    conversionStrategy: "unknown",
    navigationComplexity: "simple",
    contentDensity: "standard",
    interactivityLevel: "low",
    patternSummary: [],
    userJourneySignals: [],
  };

  // Page type inference
  if (uxPatterns.pricing) ux.pageType = "pricing";
  else if (uxPatterns.hero && uxPatterns.ctas.length > 2) ux.pageType = "landing";
  else if (architecture.sections.length > 5) ux.pageType = "long-form";
  else if (uxPatterns.forms.length > 0 && uxPatterns.forms[0]?.fields > 3) ux.pageType = "form/signup";
  else if (architecture.navLinks.length > 10) ux.pageType = "documentation";
  else if (uxPatterns.hero) ux.pageType = "homepage";
  else ux.pageType = "content";

  // Conversion strategy
  if (uxPatterns.newsletter) ux.conversionStrategy = "email capture";
  else if (uxPatterns.pricing) ux.conversionStrategy = "pricing-led";
  else if (uxPatterns.chatWidget) ux.conversionStrategy = "conversation-led";
  else if (uxPatterns.ctas.filter(c => c.position === "above-fold").length > 1) ux.conversionStrategy = "CTA-heavy";
  else if (uxPatterns.forms.length > 0) ux.conversionStrategy = "form-based";
  else ux.conversionStrategy = "content-driven";

  // Navigation complexity
  const navCount = architecture.navLinks.length;
  if (navCount <= 5) ux.navigationComplexity = "minimal";
  else if (navCount <= 10) ux.navigationComplexity = "standard";
  else if (navCount <= 20) ux.navigationComplexity = "complex";
  else ux.navigationComplexity = "dense";

  // Interactivity
  const interactiveCount = uxPatterns.interactionDensity;
  if (interactiveCount < 20) ux.interactivityLevel = "minimal";
  else if (interactiveCount < 50) ux.interactivityLevel = "standard";
  else if (interactiveCount < 100) ux.interactivityLevel = "interactive";
  else ux.interactivityLevel = "app-like";

  // Pattern summary
  if (uxPatterns.hero) ux.patternSummary.push("hero section");
  if (uxPatterns.testimonials) ux.patternSummary.push("social proof");
  if (uxPatterns.pricing) ux.patternSummary.push("pricing table");
  if (uxPatterns.faq) ux.patternSummary.push("FAQ");
  if (uxPatterns.newsletter) ux.patternSummary.push("newsletter signup");
  if (uxPatterns.chatWidget) ux.patternSummary.push("chat widget");
  if (uxPatterns.cookieBanner) ux.patternSummary.push("cookie consent");
  if (uxPatterns.carousels > 0) ux.patternSummary.push("carousel");
  if (uxPatterns.videoEmbeds > 0) ux.patternSummary.push("video");
  if (uxPatterns.stickyElements.length > 0) ux.patternSummary.push("sticky navigation");

  // User journey signals
  if (uxPatterns.hero?.cta) ux.userJourneySignals.push(`Primary CTA: "${uxPatterns.hero.cta}"`);
  if (uxPatterns.forms.length > 0) ux.userJourneySignals.push(`${uxPatterns.forms.length} form(s) with avg ${Math.round(uxPatterns.forms.reduce((a, f) => a + f.fields, 0) / uxPatterns.forms.length)} fields`);
  if (architecture.breadcrumbs.length > 0) ux.userJourneySignals.push("Breadcrumb navigation present");
  if (architecture.search) ux.userJourneySignals.push("Search functionality");
  if (architecture.pagination) ux.userJourneySignals.push("Paginated content");

  return ux;
}

// ═══════════════════════════════════════════════════════════════
// Visual system analysis
// ═══════════════════════════════════════════════════════════════

function analyzeVisual(visual, cssVars) {
  const maps = visual.maps;

  // Colors
  const allColors = {};
  for (const [h, c] of Object.entries(maps.color)) allColors[h] = (allColors[h] || 0) + c;
  for (const [h, c] of Object.entries(maps.bgColor)) allColors[h] = (allColors[h] || 0) + c;
  for (const [h, c] of Object.entries(maps.borderColor)) allColors[h] = (allColors[h] || 0) + c;

  const colorClusters = clusterColors(allColors);
  const colors = colorClusters.slice(0, 24).map(c => {
    const rgb = hexToRgb(c.hex);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
    return { hex: c.hex, hsl, count: c.count, role: inferRole(c.hex, maps.bgColor[c.hex] || 0, maps.color[c.hex] || 0, maps.borderColor[c.hex] || 0) };
  });

  // Fonts
  const fonts = Object.entries(maps.font).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([raw, count], i) => ({
    stack: raw.replace(/<[^>]*>/g, "").replace(/[<>"'`=]/g, ""),
    families: raw.split(",").map(f => f.trim().replace(/^["']|["']$/g, "").replace(/<[^>]*>/g, "").replace(/[<>"'`=]/g, "").trim()).filter(f => f && f.length < 100),
    count,
    role: i === 0 ? "primary" : i === 1 ? "secondary" : "tertiary",
  }));

  // Type scale
  const typeSizes = Object.entries(maps.fontSize).map(([s, c]) => ({ size: s, px: parseFloat(s), count: c })).filter(s => !isNaN(s.px)).sort((a, b) => b.px - a.px).slice(0, 15);

  // Headings
  const headingMap = {};
  for (const h of visual.componentData.headings) {
    const level = `h${h.level}`;
    if (!headingMap[level]) headingMap[level] = { size: h.fontSize, weight: h.fontWeight, lineHeight: h.lineHeight, letterSpacing: h.letterSpacing, textTransform: h.textTransform };
  }

  // Spacing
  const spacingScale = [];
  const spacingEntries = Object.entries(maps.spacing).map(([v, c]) => ({ value: v, px: parseFloat(v), count: c })).filter(s => !isNaN(s.px) && s.px > 0 && s.px <= 200).sort((a, b) => a.px - b.px);
  for (const v of spacingEntries) {
    const existing = spacingScale.find(s => Math.abs(s.px - v.px) < 2);
    if (existing) existing.count += v.count; else spacingScale.push({ ...v });
  }

  // Grid detection
  let gridSystem = null;
  const pxValues = spacingScale.map(s => s.px);
  for (const base of [4, 8]) {
    const onGrid = pxValues.filter(px => px % base === 0 || Math.abs(px % base) <= 1).length;
    const adherence = Math.round((onGrid / Math.max(pxValues.length, 1)) * 100);
    if (adherence > 50 && (!gridSystem || adherence > gridSystem.adherence)) {
      gridSystem = { base, adherence };
    }
  }

  const radii = Object.entries(maps.radius).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, c]) => ({ value: v, count: c }));
  const shadows = Object.entries(maps.shadow).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, c]) => {
    let level = "sm";
    const m = v.match(/(\d+)px\s+(\d+)px\s+(\d+)px/);
    if (m) { const blur = parseInt(m[3]); if (blur > 30) level = "xl"; else if (blur > 20) level = "lg"; else if (blur > 10) level = "md"; }
    return { value: v, count: c, level };
  });

  const isDark = colors.find(c => c.role === "background")?.hsl?.l < 30;

  // Components
  const components = [];
  const dedup = (arr, keys) => { const seen = new Set(); return arr.filter(i => { const sig = keys.map(k => i[k] || "").join("|"); if (seen.has(sig)) return false; seen.add(sig); return true; }); };

  if (visual.componentData.buttons.length > 0) {
    components.push({ type: "button", count: visual.componentData.buttons.length, variants: dedup(visual.componentData.buttons, ["bgColor", "color", "borderRadius"]).slice(0, 5).map(s => ({ bgColor: s.bgColor, color: s.color, borderRadius: s.borderRadius, padding: s.padding, fontSize: s.fontSize, fontWeight: s.fontWeight, border: s.border, sample: s.text })) });
  }
  if (visual.componentData.inputs.length > 0) {
    components.push({ type: "input", count: visual.componentData.inputs.length, variants: dedup(visual.componentData.inputs, ["bgColor", "border", "borderRadius"]).slice(0, 3).map(s => ({ bgColor: s.bgColor, color: s.color, border: s.border, borderRadius: s.borderRadius, padding: s.padding })) });
  }
  if (visual.componentData.cards.length > 0) {
    components.push({ type: "card", count: visual.componentData.cards.length, variants: dedup(visual.componentData.cards, ["bgColor", "borderRadius", "boxShadow"]).slice(0, 3).map(s => ({ bgColor: s.bgColor, borderRadius: s.borderRadius, boxShadow: s.boxShadow, padding: s.padding })) });
  }
  if (visual.componentData.nav.length > 0) {
    components.push({ type: "navigation", count: visual.componentData.nav.length, variants: visual.componentData.nav.slice(0, 2).map(s => ({ bgColor: s.bgColor, color: s.color, padding: s.padding, height: s.height, position: s.position })) });
  }

  const fontWeights = Object.entries(maps.fontWeight).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w, c]) => ({ weight: w, count: c }));

  const relevantVars = Object.entries(cssVars || {}).filter(([k]) => /color|bg|font|size|radius|shadow|spacing|gap|border|text|primary|secondary|accent/i.test(k)).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  return { colors, fonts, typeSizes, headingMap, spacingScale, gridSystem, radii, shadows, isDark, components, fontWeights, cssVars: relevantVars };
}

// ═══════════════════════════════════════════════════════════════
// Product DNA score
// ═══════════════════════════════════════════════════════════════

function scoreProductDNA(data) {
  const scores = {};
  let total = 0, count = 0;

  const s = (key, val) => { scores[key] = val; total += val; count++; };

  // Visual system
  const colorCount = data.designSystem.colors.length;
  s("visual.colors", colorCount >= 3 && colorCount <= 12 ? 90 : colorCount <= 20 ? 70 : 50);
  s("visual.typography", data.designSystem.fonts.length <= 2 ? 95 : data.designSystem.fonts.length <= 3 ? 75 : 50);
  s("visual.spacing", data.designSystem.gridSystem ? data.designSystem.gridSystem.adherence : 50);

  // Brand voice
  s("voice.consistency", data.brandVoice.personality.length > 0 ? 80 : 40);
  s("voice.ctaClarity", data.brandVoice.ctaPattern !== "unknown" ? 85 : 40);

  // UX
  s("ux.conversion", data.uxAnalysis.conversionStrategy !== "unknown" ? 80 : 40);
  s("ux.navigation", data.architecture.navLinks.length > 0 ? 85 : 40);

  // Accessibility
  const a11yIssues = data.accessibility?.contrastIssues?.length || 0;
  s("accessibility", a11yIssues === 0 ? 100 : a11yIssues <= 3 ? 75 : a11yIssues <= 8 ? 50 : 25);

  // SEO
  const seoScore = (data.seo.titleLength > 0 ? 20 : 0) + (data.seo.descriptionLength > 0 ? 20 : 0) + (data.seo.h1Count === 1 ? 20 : 0) + (data.seo.imageAltCoverage > 80 ? 20 : 10) + (data.seo.structuredData.length > 0 ? 20 : 0);
  s("seo", seoScore);

  // Performance
  const perfScore = (data.performance.lazyImages > 0 ? 25 : 0) + (data.performance.asyncScripts > 0 ? 25 : 0) + (data.performance.preconnects > 0 ? 25 : 0) + (data.performance.domNodeCount < 1500 ? 25 : data.performance.domNodeCount < 3000 ? 15 : 5);
  s("performance", perfScore);

  scores.overall = Math.round(total / count);
  return scores;
}

// ═══════════════════════════════════════════════════════════════
// Main analysis
// ═══════════════════════════════════════════════════════════════

export function analyze(extracted) {
  const designSystem = analyzeVisual(extracted.visual, extracted.cssVars);
  const brandVoice = analyzeVoice(extracted.content);
  const uxAnalysis = analyzeUX(extracted.uxPatterns, extracted.architecture);

  const breakpointList = Object.entries(extracted.breakpoints || {}).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([px, rc]) => ({ px: parseInt(px), ruleCount: rc }));

  // Process gradient list
  const gradientList = Object.entries(extracted.gradients?.backgrounds || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, c]) => ({ value: v, count: c }));

  // Process layout system
  const containerWidths = Object.entries(extracted.layoutSystem?.containerWidths || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v, c]) => ({ value: v, count: c }));

  // Process color matrix into accessible/failing pairs
  const colorPairings = {
    accessible: (extracted.colorMatrix || []).filter(p => p.aa),
    failing: (extracted.colorMatrix || []).filter(p => !p.aa),
    total: (extracted.colorMatrix || []).length,
  };

  const data = {
    url: extracted.url,
    identity: extracted.identity,
    designSystem,
    brandVoice,
    uxAnalysis,
    content: {
      headingTexts: extracted.content.headingTexts.slice(0, 20),
      ctaTexts: [...new Set(extracted.content.ctaTexts)].slice(0, 15),
      paragraphCount: extracted.content.paragraphs.length,
      sampleParagraphs: extracted.content.paragraphs.slice(0, 5),
      labels: extracted.content.labels.slice(0, 10),
      placeholders: extracted.content.placeholders.slice(0, 10),
      microcopy: extracted.content.microcopy.slice(0, 10),
    },
    architecture: extracted.architecture,
    uxPatterns: extracted.uxPatterns,
    behavior: extracted.behavior,
    motion: extracted.motion,
    accessibility: extracted.accessibility,
    seo: extracted.seo,
    techStack: extracted.techStack,
    performance: extracted.performance,
    darkMode: extracted.darkMode,
    breakpointList,
    // New data
    gradientList,
    iconSystem: extracted.iconSystem || null,
    imageTreatments: extracted.imageTreatments || null,
    interactiveStates: extracted.interactiveStates || null,
    layoutSystem: extracted.layoutSystem || null,
    containerWidths,
    fontLoading: extracted.fontLoading || null,
    socialLinks: extracted.socialLinks || {},
    pricingData: extracted.pricingData || null,
    scrollPatterns: extracted.scrollPatterns || null,
    thirdPartyServices: extracted.thirdPartyServices || null,
    schemaData: extracted.schemaData || null,
    colorPairings,
    // Deep extraction passes
    typographyDeep: extracted.typographyDeep || null,
    colorContext: extracted.colorContext || null,
    layoutDeep: extracted.layoutDeep || null,
    interactionPatterns: extracted.interactionPatterns || null,
    formDeep: extracted.formDeep || null,
    mediaDeep: extracted.mediaDeep || null,
    navDeep: extracted.navDeep || null,
    a11yDeep: extracted.a11yDeep || null,
    perfDeep: extracted.perfDeep || null,
    contentMetrics: extracted.contentMetrics || null,
  };

  data.dnaScore = scoreProductDNA(data);
  data.intelligence = generateIntelligence(data);

  return data;
}
