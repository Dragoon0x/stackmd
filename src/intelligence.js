/**
 * intelligence.js — Deep inference engine
 *
 * Takes analyzed data and produces high-level product intelligence:
 * readability scoring, headline classification, emotional mapping,
 * trust signal taxonomy, color psychology, content quality audit,
 * SEO audit, performance risk assessment, accessibility grading,
 * product maturity estimation, and conversion funnel analysis.
 *
 * For educational and experimental purposes only.
 */

// ═══════════════════════════════════════════════════════════════
// 1. READABILITY SCORING
// ═══════════════════════════════════════════════════════════════

export function calculateReadability(content) {
  const paragraphs = content.sampleParagraphs || [];
  if (paragraphs.length === 0) return { fleschKincaid: null, fleschEase: null, grade: "unknown", label: "insufficient data" };

  const allText = paragraphs.join(" ");
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = allText.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  if (sentences.length === 0 || words.length === 0) return { fleschKincaid: null, fleschEase: null, grade: "unknown", label: "insufficient data" };

  const avgSentenceLen = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch-Kincaid Grade Level
  const fkGrade = Math.round((0.39 * avgSentenceLen + 11.8 * avgSyllablesPerWord - 15.59) * 10) / 10;

  // Flesch Reading Ease (0-100, higher = easier)
  const fkEase = Math.round((206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord) * 10) / 10;

  let grade, label;
  if (fkEase >= 90) { grade = "5th"; label = "very easy — understood by 11-year-olds"; }
  else if (fkEase >= 80) { grade = "6th"; label = "easy — conversational English"; }
  else if (fkEase >= 70) { grade = "7th"; label = "fairly easy — understood by most adults"; }
  else if (fkEase >= 60) { grade = "8th-9th"; label = "standard — plain English"; }
  else if (fkEase >= 50) { grade = "10th-12th"; label = "fairly difficult — requires some education"; }
  else if (fkEase >= 30) { grade = "college"; label = "difficult — college-level reading"; }
  else { grade = "graduate"; label = "very difficult — professional/academic"; }

  return {
    fleschKincaid: Math.max(0, fkGrade),
    fleschEase: Math.min(100, Math.max(0, fkEase)),
    grade,
    label,
    stats: {
      sentences: sentences.length,
      words: words.length,
      syllables,
      avgSentenceLen: Math.round(avgSentenceLen * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    },
  };
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 2) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// ═══════════════════════════════════════════════════════════════
// 2. HEADLINE FORMULA CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

export function classifyHeadlines(headingTexts) {
  return headingTexts.map(text => {
    const lower = text.toLowerCase();
    const formula = detectFormula(lower, text);
    const wordCount = text.split(/\s+/).length;
    const hasNumber = /\d/.test(text);
    const hasPowerWord = /free|new|secret|proven|ultimate|best|easy|fast|instant|guaranteed|exclusive|limited|save|discover|unlock|transform|master/i.test(text);
    const emotional = /love|hate|fear|amazing|shocking|incredible|powerful|beautiful|terrible|perfect|worst|best/i.test(text);

    return {
      text: text.slice(0, 100),
      formula,
      wordCount,
      hasNumber,
      hasPowerWord,
      emotional,
      length: text.length <= 30 ? "short" : text.length <= 60 ? "medium" : "long",
    };
  });
}

function detectFormula(lower, original) {
  if (/^how to\b/i.test(lower)) return "how-to";
  if (/^\d+\s/.test(original) || /^top\s+\d/i.test(lower)) return "numbered-list";
  if (/\?$/.test(original)) return "question";
  if (/^(get|start|try|build|create|make|learn|discover|join|sign|download)\b/i.test(lower)) return "command";
  if (/^(why|what|when|where|who)\b/i.test(lower)) return "w-question";
  if (/^the\s+(ultimate|complete|definitive|essential)\b/i.test(lower)) return "ultimate-guide";
  if (/\bvs\.?\b|\bversus\b|\bcompared\b/i.test(lower)) return "comparison";
  if (/\bwithout\b|\bno\b.*\bneeded\b|\bdon't\b/i.test(lower)) return "contrarian";
  if (/\bin\s+\d+\s+(minutes?|seconds?|steps?|days?)\b/i.test(lower)) return "time-bound";
  if (/^[A-Z][a-z]/.test(original) && original.split(/\s+/).length <= 4) return "label";
  return "declarative";
}

// ═══════════════════════════════════════════════════════════════
// 3. EMOTIONAL TONE MAPPING
// ═══════════════════════════════════════════════════════════════

export function mapEmotionalTone(content, voice) {
  const allText = (content.sampleParagraphs || []).join(" ") + " " + (content.headingTexts || []).join(" ");
  const lower = allText.toLowerCase();

  const emotions = {
    confidence: score(lower, ["proven", "trusted", "reliable", "secure", "guaranteed", "leading", "industry", "enterprise", "professional"]),
    excitement: score(lower, ["new", "launching", "introducing", "exciting", "revolutionary", "breakthrough", "game-changing", "incredible"]),
    urgency: score(lower, ["now", "today", "limited", "hurry", "last chance", "don't miss", "ending soon", "act fast", "before"]),
    empathy: score(lower, ["understand", "struggle", "frustrating", "we know", "been there", "challenge", "pain", "difficult"]),
    aspiration: score(lower, ["dream", "vision", "future", "imagine", "potential", "growth", "success", "achieve", "transform"]),
    simplicity: score(lower, ["simple", "easy", "effortless", "intuitive", "clean", "minimal", "straightforward", "no hassle"]),
    exclusivity: score(lower, ["exclusive", "premium", "elite", "select", "invitation", "limited edition", "members only", "vip"]),
    community: score(lower, ["team", "together", "community", "join", "thousands", "millions", "developers", "companies", "people"]),
    authority: score(lower, ["expert", "leader", "award", "recognized", "certified", "patent", "research", "backed by"]),
    safety: score(lower, ["safe", "secure", "protect", "privacy", "encrypted", "compliant", "gdpr", "soc2", "hipaa"]),
  };

  // Normalize to 0-100
  const maxVal = Math.max(...Object.values(emotions), 1);
  for (const key of Object.keys(emotions)) {
    emotions[key] = Math.round((emotions[key] / maxVal) * 100);
  }

  // Determine dominant emotions (top 3)
  const ranked = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
  const dominant = ranked.filter(([, v]) => v > 20).slice(0, 3).map(([k]) => k);

  return { emotions, dominant, profile: dominant.length > 0 ? dominant.join(", ") : "neutral" };
}

function score(text, words) {
  let s = 0;
  for (const w of words) {
    const regex = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
    const matches = text.match(regex);
    if (matches) s += matches.length;
  }
  return s;
}

// ═══════════════════════════════════════════════════════════════
// 4. TRUST SIGNAL TAXONOMY
// ═══════════════════════════════════════════════════════════════

export function classifyTrustSignals(data) {
  const signals = {
    social: [],     // testimonials, reviews, user counts
    authority: [],  // logos, certifications, awards
    security: [],   // SSL, compliance badges
    transparency: [], // pricing, open source
    proof: [],      // case studies, stats, metrics
  };

  const ux = data.uxPatterns || {};
  const content = data.content || {};
  const seo = data.seo || {};
  const allText = [...(content.headingTexts || []), ...(content.ctaTexts || [])].join(" ").toLowerCase();

  // Social proof
  if (ux.testimonials) signals.social.push("testimonials");
  if (ux.socialProof?.length > 0) signals.social.push(`${ux.socialProof.length} social proof blocks`);
  if (/\d+[,.]?\d*\s*(users?|customers?|companies|teams|developers)/i.test(allText)) signals.social.push("user count claim");
  if (/\d+[,.]?\d*\s*\+?\s*(stars?|reviews?|ratings?)/i.test(allText)) signals.social.push("review count");
  if (Object.keys(data.socialLinks || {}).length > 0) signals.social.push(`${Object.keys(data.socialLinks).length} social profiles linked`);

  // Authority
  if (/trusted by|used by|loved by|built for/i.test(allText)) signals.authority.push("trusted-by statement");
  if (seo.structuredData?.includes("Organization")) signals.authority.push("Organization schema");
  if (/award|winner|recognized|leader|gartner|forrester/i.test(allText)) signals.authority.push("award/recognition");
  // Logo bars detected from component classes
  const componentClasses = (data.designSystem?.components || []).flatMap(c => (c.variants || []).map(v => v.classes || "")).join(" ").toLowerCase();
  if (/logo|client|partner|customer/i.test(componentClasses)) signals.authority.push("logo bar likely");

  // Security
  if (/soc\s?2|hipaa|gdpr|iso\s?27001|pci|encrypted|secure/i.test(allText)) signals.security.push("compliance mention");
  if (data.identity?.canonical?.startsWith("https")) signals.security.push("HTTPS");

  // Transparency
  if (data.pricingData?.detected) signals.transparency.push("public pricing");
  if (/open.?source|github|mit license|apache/i.test(allText)) signals.transparency.push("open source");
  if (/changelog|roadmap|status page/i.test(allText)) signals.transparency.push("public roadmap/changelog");

  // Proof
  if (/\d+%\s*(faster|more|reduction|increase|improvement)/i.test(allText)) signals.proof.push("metric-based claim");
  if (/case stud(y|ies)|success stor(y|ies)/i.test(allText)) signals.proof.push("case studies");

  const totalSignals = Object.values(signals).flat().length;
  const trustLevel = totalSignals >= 8 ? "high" : totalSignals >= 4 ? "moderate" : totalSignals >= 1 ? "low" : "minimal";

  return { signals, totalSignals, trustLevel };
}

// ═══════════════════════════════════════════════════════════════
// 5. COLOR PSYCHOLOGY & HARMONY
// ═══════════════════════════════════════════════════════════════

export function analyzeColorPsychology(colors) {
  if (!colors || colors.length === 0) return { temperature: "neutral", harmony: "unknown", mood: [], dominantHue: null };

  const chromatic = colors.filter(c => c.hsl && c.hsl.s > 15);
  const hues = chromatic.map(c => c.hsl.h);

  // Temperature
  const warmCount = hues.filter(h => (h >= 0 && h <= 60) || h >= 330).length;
  const coolCount = hues.filter(h => h >= 180 && h <= 300).length;
  const temperature = warmCount > coolCount * 1.5 ? "warm" : coolCount > warmCount * 1.5 ? "cool" : "neutral";

  // Harmony detection
  let harmony = "mixed";
  const uniqueHues = [...new Set(hues.map(h => Math.round(h / 30) * 30))];
  if (chromatic.length === 0) harmony = "achromatic";
  else if (uniqueHues.length === 1) harmony = "monochromatic";
  else if (uniqueHues.length === 2) {
    const diff = Math.abs(uniqueHues[0] - uniqueHues[1]);
    if (diff > 150 && diff < 210) harmony = "complementary";
    else if (diff < 60) harmony = "analogous";
    else harmony = "split";
  }
  else if (uniqueHues.length === 3) {
    const sorted = [...uniqueHues].sort((a, b) => a - b);
    const gaps = [sorted[1] - sorted[0], sorted[2] - sorted[1], 360 - sorted[2] + sorted[0]];
    if (gaps.every(g => g > 80 && g < 160)) harmony = "triadic";
    else if (Math.max(...gaps) < 90) harmony = "analogous";
  }

  // Mood from colors
  const mood = [];
  const avgLightness = colors.reduce((sum, c) => sum + (c.hsl?.l || 50), 0) / colors.length;
  const avgSaturation = chromatic.length > 0 ? chromatic.reduce((sum, c) => sum + c.hsl.s, 0) / chromatic.length : 0;

  if (avgLightness > 70) mood.push("airy");
  if (avgLightness < 30) mood.push("dramatic");
  if (avgSaturation > 60) mood.push("vibrant");
  if (avgSaturation < 20) mood.push("muted");
  if (temperature === "warm") mood.push("inviting");
  if (temperature === "cool") mood.push("professional");
  if (harmony === "monochromatic") mood.push("cohesive");
  if (harmony === "complementary") mood.push("high-contrast");

  // Dominant hue name
  const accentHue = chromatic.sort((a, b) => b.count - a.count)[0]?.hsl?.h;
  const dominantHue = accentHue !== undefined ? hueToName(accentHue) : null;

  return { temperature, harmony, mood, dominantHue, avgLightness: Math.round(avgLightness), avgSaturation: Math.round(avgSaturation) };
}

function hueToName(h) {
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 150) return "green";
  if (h < 195) return "teal";
  if (h < 255) return "blue";
  if (h < 285) return "purple";
  if (h < 345) return "pink";
  return "red";
}

// ═══════════════════════════════════════════════════════════════
// 6. CONTENT QUALITY AUDIT
// ═══════════════════════════════════════════════════════════════

export function auditContentQuality(data) {
  const checks = [];
  const content = data.content || {};
  const voice = data.brandVoice || {};

  // Heading structure
  const headings = content.headingTexts || [];
  checks.push({ name: "Has primary heading", pass: headings.length > 0, weight: 10 });
  checks.push({ name: "Has content hierarchy (3+ headings)", pass: headings.length >= 3, weight: 8 });
  checks.push({ name: "Headings under 60 chars", pass: headings.every(h => h.length <= 60), weight: 5 });

  // CTA clarity
  const ctas = content.ctaTexts || [];
  checks.push({ name: "Has CTA text", pass: ctas.length > 0, weight: 10 });
  checks.push({ name: "CTAs are action-oriented", pass: ctas.some(c => /^(get|start|try|sign|join|create|build|download|learn|explore|discover)/i.test(c)), weight: 8 });
  checks.push({ name: "CTAs under 25 chars", pass: ctas.every(c => c.length <= 25), weight: 5 });

  // Voice consistency
  checks.push({ name: "Consistent pronoun strategy", pass: voice.pronounStrategy !== "neutral", weight: 6 });
  checks.push({ name: "Reading level appropriate", pass: voice.readingLevel === "standard" || voice.readingLevel === "simple", weight: 6 });
  checks.push({ name: "Has microcopy", pass: (content.microcopy || []).length > 0, weight: 5 });

  // Form UX
  checks.push({ name: "Form labels present", pass: (content.labels || []).length > 0 || (data.accessibility?.formLabels?.labeled || 0) > 0, weight: 5 });
  checks.push({ name: "Placeholder text used", pass: (content.placeholders || []).length > 0, weight: 3 });

  // Content density
  checks.push({ name: "Sufficient content depth", pass: (content.paragraphCount || 0) >= 3, weight: 7 });

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earnedWeight = checks.filter(c => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  return {
    score,
    grade: score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F",
    checks,
    passed: checks.filter(c => c.pass).length,
    failed: checks.filter(c => !c.pass).length,
    total: checks.length,
  };
}

// ═══════════════════════════════════════════════════════════════
// 7. TECHNICAL SEO AUDIT
// ═══════════════════════════════════════════════════════════════

export function auditSEO(data) {
  const checks = [];
  const seo = data.seo || {};
  const identity = data.identity || {};

  checks.push({ name: "Title tag present", pass: seo.titleLength > 0, weight: 10, detail: `${seo.titleLength} chars` });
  checks.push({ name: "Title under 60 chars", pass: seo.titleLength > 0 && seo.titleLength <= 60, weight: 5, detail: `${seo.titleLength} chars` });
  checks.push({ name: "Meta description present", pass: seo.descriptionLength > 0, weight: 10, detail: `${seo.descriptionLength} chars` });
  checks.push({ name: "Meta description 120-160 chars", pass: seo.descriptionLength >= 120 && seo.descriptionLength <= 160, weight: 5, detail: `${seo.descriptionLength} chars` });
  checks.push({ name: "Single H1 tag", pass: seo.h1Count === 1, weight: 10, detail: `${seo.h1Count} found` });
  checks.push({ name: "Image alt coverage > 80%", pass: seo.imageAltCoverage >= 80, weight: 8, detail: `${seo.imageAltCoverage}%` });
  checks.push({ name: "Canonical URL set", pass: !!identity.canonical, weight: 8 });
  checks.push({ name: "Language attribute set", pass: !!identity.language, weight: 5 });
  checks.push({ name: "OpenGraph tags present", pass: Object.keys(seo.openGraph || {}).length >= 3, weight: 7 });
  checks.push({ name: "Structured data (JSON-LD)", pass: (seo.structuredData || []).length > 0, weight: 8, detail: (seo.structuredData || []).join(", ") });
  checks.push({ name: "Viewport meta tag", pass: !!identity.viewport, weight: 5 });
  checks.push({ name: "HTTPS", pass: (data.url || "").startsWith("https"), weight: 8 });
  checks.push({ name: "Lazy loading images", pass: seo.lazyImages > 0, weight: 5, detail: `${seo.lazyImages}/${seo.totalImages}` });

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earnedWeight = checks.filter(c => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  return {
    score,
    grade: score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F",
    checks,
    passed: checks.filter(c => c.pass).length,
    total: checks.length,
  };
}

// ═══════════════════════════════════════════════════════════════
// 8. PERFORMANCE RISK ASSESSMENT
// ═══════════════════════════════════════════════════════════════

export function assessPerformanceRisks(data) {
  const risks = [];
  const perf = data.performance || {};
  const perfDeep = data.perfDeep || {};

  if (perf.domNodeCount > 3000) risks.push({ severity: "high", issue: `Excessive DOM nodes (${perf.domNodeCount})`, suggestion: "Virtualize long lists, reduce nesting" });
  else if (perf.domNodeCount > 1500) risks.push({ severity: "medium", issue: `Large DOM (${perf.domNodeCount} nodes)`, suggestion: "Consider lazy rendering" });

  if (perf.thirdPartyScripts > 8) risks.push({ severity: "high", issue: `${perf.thirdPartyScripts} third-party scripts`, suggestion: "Audit and defer non-critical scripts" });
  else if (perf.thirdPartyScripts > 4) risks.push({ severity: "medium", issue: `${perf.thirdPartyScripts} third-party scripts`, suggestion: "Consider loading non-critical scripts async" });

  if (perf.scriptCount > 20) risks.push({ severity: "high", issue: `${perf.scriptCount} script tags`, suggestion: "Bundle scripts, use code splitting" });
  if (perf.stylesheetCount > 5) risks.push({ severity: "medium", issue: `${perf.stylesheetCount} stylesheets`, suggestion: "Consolidate CSS, inline critical styles" });

  const totalImages = perf.imageCount || 0;
  const lazyImages = perf.lazyImages || 0;
  if (totalImages > 10 && lazyImages < totalImages * 0.5) risks.push({ severity: "medium", issue: `Only ${lazyImages}/${totalImages} images lazy loaded`, suggestion: "Add loading='lazy' to below-fold images" });

  if (perfDeep) {
    if (perfDeep.inlineScriptBytes > 50000) risks.push({ severity: "high", issue: `${(perfDeep.inlineScriptBytes / 1024).toFixed(0)}KB inline scripts`, suggestion: "Extract to external files for caching" });
    if (perfDeep.inlineStyleBytes > 30000) risks.push({ severity: "medium", issue: `${(perfDeep.inlineStyleBytes / 1024).toFixed(0)}KB inline styles`, suggestion: "Extract to stylesheet for caching" });
    if (perf.preconnects === 0 && perf.thirdPartyScripts > 2) risks.push({ severity: "low", issue: "No preconnect hints", suggestion: "Add preconnect for critical third-party origins" });
    if (perfDeep.moduleScripts === 0 && perf.scriptCount > 5) risks.push({ severity: "low", issue: "No ES module scripts", suggestion: "Consider module scripts for tree-shaking" });
  }

  const riskScore = Math.max(0, 100 - risks.filter(r => r.severity === "high").length * 20 - risks.filter(r => r.severity === "medium").length * 10 - risks.filter(r => r.severity === "low").length * 3);

  return {
    score: riskScore,
    grade: riskScore >= 90 ? "A" : riskScore >= 75 ? "B" : riskScore >= 60 ? "C" : riskScore >= 40 ? "D" : "F",
    risks,
    high: risks.filter(r => r.severity === "high").length,
    medium: risks.filter(r => r.severity === "medium").length,
    low: risks.filter(r => r.severity === "low").length,
  };
}

// ═══════════════════════════════════════════════════════════════
// 9. ACCESSIBILITY GRADE
// ═══════════════════════════════════════════════════════════════

export function gradeAccessibility(data) {
  const checks = [];
  const a = data.accessibility || {};
  const a11yDeep = data.a11yDeep || {};
  const behavior = data.behavior || {};

  checks.push({ name: "No contrast failures", pass: (a.contrastIssues || []).length === 0, weight: 15, detail: `${(a.contrastIssues || []).length} issues` });
  checks.push({ name: "All images have alt text", pass: (a.missingAlt || 0) === 0, weight: 10, detail: `${a.missingAlt || 0} missing` });
  checks.push({ name: "Skip link present", pass: !!a.skipLink, weight: 8 });
  checks.push({ name: "Focus styles defined", pass: !!a.focusVisible, weight: 10 });
  checks.push({ name: "Sequential heading order", pass: (a.headingOrder || []).every((h, i) => i === 0 || h <= a.headingOrder[i - 1] + 1), weight: 8 });
  checks.push({ name: "Landmark regions used", pass: Object.keys(a.landmarks || {}).length >= 3, weight: 7 });
  checks.push({ name: "Form inputs labeled", pass: (a.formLabels?.unlabeled || 0) === 0, weight: 10, detail: `${a.formLabels?.unlabeled || 0} unlabeled` });
  checks.push({ name: "ARIA labels used", pass: (a.ariaLabels || 0) > 0, weight: 5 });
  checks.push({ name: "No positive tabindex", pass: (a11yDeep.positiveTabindex || 0) === 0, weight: 8 });
  checks.push({ name: "prefers-reduced-motion", pass: !!a.reducedMotion, weight: 5 });
  checks.push({ name: "Live regions for dynamic content", pass: (a.liveRegions || 0) > 0, weight: 5 });
  checks.push({ name: "Screen-reader text present", pass: (a11yDeep.srOnlyElements || 0) > 0, weight: 4 });

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earnedWeight = checks.filter(c => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  const wcagLevel = score >= 90 ? "likely AA compliant" : score >= 70 ? "partial AA compliance" : score >= 50 ? "significant gaps" : "major issues";

  return {
    score,
    grade: score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F",
    wcagLevel,
    checks,
    passed: checks.filter(c => c.pass).length,
    total: checks.length,
  };
}

// ═══════════════════════════════════════════════════════════════
// 10. PRODUCT MATURITY ESTIMATION
// ═══════════════════════════════════════════════════════════════

export function estimateMaturity(data) {
  let maturityScore = 0;
  const signals = [];

  // Design system signals
  if (Object.keys(data.designSystem?.cssVars || {}).length > 10) { maturityScore += 10; signals.push("Extensive CSS custom properties"); }
  if (data.designSystem?.gridSystem?.adherence > 70) { maturityScore += 8; signals.push("Consistent spacing grid"); }
  if (data.designSystem?.components?.length >= 4) { maturityScore += 8; signals.push("Multiple component types"); }

  // Tech maturity
  if ((data.techStack?.frameworks || []).length > 0) { maturityScore += 6; signals.push("Modern framework"); }
  if (data.techStack?.cssFramework) { maturityScore += 5; signals.push("CSS framework"); }
  if ((data.techStack?.analytics || []).length > 0) { maturityScore += 5; signals.push("Analytics integrated"); }

  // Content maturity
  if ((data.seo?.structuredData || []).length > 0) { maturityScore += 7; signals.push("Structured data"); }
  if (data.identity?.canonical) { maturityScore += 4; signals.push("Canonical URL"); }
  if (data.identity?.manifest) { maturityScore += 4; signals.push("Web app manifest"); }
  if (Object.keys(data.seo?.openGraph || {}).length >= 4) { maturityScore += 5; signals.push("Full OpenGraph tags"); }

  // UX maturity
  if (data.pricingData?.detected) { maturityScore += 5; signals.push("Public pricing"); }
  if ((data.uxPatterns?.forms || []).length > 0) { maturityScore += 4; signals.push("Forms present"); }
  if (data.behavior?.focusManagement?.focusVisible) { maturityScore += 5; signals.push("Focus management"); }
  if (data.accessibility?.reducedMotion) { maturityScore += 4; signals.push("Reduced motion support"); }
  if (data.scrollPatterns?.smoothScroll) { maturityScore += 3; signals.push("Smooth scrolling"); }

  // Performance maturity
  if ((data.performance?.preconnects || 0) > 0) { maturityScore += 4; signals.push("Preconnect hints"); }
  if ((data.performance?.lazyImages || 0) > 0) { maturityScore += 4; signals.push("Lazy loading"); }
  if (data.performance?.serviceWorker) { maturityScore += 5; signals.push("Service worker"); }
  if (data.perfDeep?.criticalCSS > 0) { maturityScore += 4; signals.push("Critical CSS"); }

  const level = maturityScore >= 80 ? "production-grade" : maturityScore >= 60 ? "mature" : maturityScore >= 40 ? "growing" : maturityScore >= 20 ? "early" : "prototype";

  return { score: Math.min(100, maturityScore), level, signals };
}

// ═══════════════════════════════════════════════════════════════
// 11. CONVERSION FUNNEL ANALYSIS
// ═══════════════════════════════════════════════════════════════

export function analyzeFunnel(data) {
  const ux = data.uxPatterns || {};
  const content = data.content || {};
  const stages = [];

  // Awareness (hero, headline)
  if (ux.hero) stages.push({ stage: "awareness", element: "hero section", present: true, detail: ux.hero.headline?.slice(0, 60) });
  else stages.push({ stage: "awareness", element: "hero section", present: false });

  // Interest (features, benefits, social proof)
  const hasFeatures = (content.headingTexts || []).some(h => /feature|benefit|why|how it works/i.test(h));
  stages.push({ stage: "interest", element: "features/benefits section", present: hasFeatures });
  stages.push({ stage: "interest", element: "social proof", present: !!ux.testimonials });

  // Consideration (pricing, comparison, FAQ)
  if (data.pricingData?.detected) stages.push({ stage: "consideration", element: "pricing", present: true, detail: `${data.pricingData.tiers.length} tiers` });
  stages.push({ stage: "consideration", element: "FAQ", present: !!ux.faq });

  // Decision (CTA, form)
  const aboveFoldCTA = (ux.ctas || []).filter(c => c.position === "above-fold");
  stages.push({ stage: "decision", element: "above-fold CTA", present: aboveFoldCTA.length > 0, detail: aboveFoldCTA[0]?.text });
  stages.push({ stage: "decision", element: "signup form", present: (ux.forms || []).length > 0 });

  // Retention (newsletter, chat)
  stages.push({ stage: "retention", element: "newsletter signup", present: !!ux.newsletter });
  stages.push({ stage: "retention", element: "chat widget", present: !!ux.chatWidget });

  const presentCount = stages.filter(s => s.present).length;
  const completeness = Math.round((presentCount / stages.length) * 100);
  const funnelType = data.pricingData?.detected ? "product-led" : ux.chatWidget ? "sales-led" : (ux.forms || []).length > 0 ? "form-based" : "content-led";

  return { stages, completeness, funnelType, presentCount, totalStages: stages.length };
}

// ═══════════════════════════════════════════════════════════════
// MASTER INTELLIGENCE FUNCTION
// ═══════════════════════════════════════════════════════════════

export function generateIntelligence(data) {
  return {
    readability: calculateReadability(data.content || {}),
    headlines: classifyHeadlines(data.content?.headingTexts || []),
    emotionalTone: mapEmotionalTone(data.content || {}, data.brandVoice || {}),
    trustSignals: classifyTrustSignals(data),
    colorPsychology: analyzeColorPsychology(data.designSystem?.colors || []),
    contentQuality: auditContentQuality(data),
    seoAudit: auditSEO(data),
    performanceRisks: assessPerformanceRisks(data),
    accessibilityGrade: gradeAccessibility(data),
    productMaturity: estimateMaturity(data),
    conversionFunnel: analyzeFunnel(data),
  };
}
