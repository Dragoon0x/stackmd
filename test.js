/**
 * test.js — Full test suite
 */

import { analyze } from "./src/analyzer.js";
import { generateStackMd } from "./src/generator.js";

let passed = 0, failed = 0;
function test(name, fn) { try { fn(); console.log(`  ✓ ${name}`); passed++; } catch (e) { console.log(`  ✗ ${name}`); console.log(`    ${e.message}`); failed++; } }
function assert(c, m) { if (!c) throw new Error(m || "Assertion failed"); }

// ── Mock data ────────────────────────────────────────────────
const mock = {
  url: "https://example.com",
  identity: { title: "Example - Build better products", description: "The platform for building modern apps", ogTitle: "Example", ogDescription: "Build better", ogImage: "/og.png", ogType: "website", ogSiteName: "Example", twitterCard: "summary_large_image", twitterSite: "@example", themeColor: "#5e6ad2", favicon: "/favicon.ico", appleTouchIcon: "", manifest: "", canonical: "https://example.com", language: "en", charset: "UTF-8", generator: "", viewport: "width=device-width, initial-scale=1", robots: "index, follow" },
  visual: {
    maps: {
      color: { "#1a1a1a": 200, "#333333": 80, "#5e6ad2": 30, "#ffffff": 10 },
      bgColor: { "#ffffff": 300, "#f5f5f5": 60, "#5e6ad2": 20 },
      borderColor: { "#e0e0e0": 100, "#5e6ad2": 10 },
      font: { '"Inter", sans-serif': 400, '"JetBrains Mono", monospace': 30 },
      fontSize: { "16px": 300, "14px": 200, "24px": 40, "32px": 20, "48px": 10 },
      fontWeight: { "400": 350, "600": 80, "700": 40 },
      lineHeight: { "24px": 200, "32px": 40 }, letterSpacing: { "-0.02em": 30 },
      spacing: { "4px": 100, "8px": 250, "16px": 300, "24px": 180, "32px": 120, "48px": 40, "15px": 15 },
      radius: { "8px": 200, "4px": 100, "12px": 60 },
      shadow: { "0px 1px 2px rgba(0,0,0,0.05)": 80, "0px 4px 12px rgba(0,0,0,0.1)": 40 },
      transition: { "all 0.2s ease": 100 }, zIndex: { "1": 20, "100": 3 },
      opacity: { "0.5": 20 }, display: { "flex": 200, "block": 300, "grid": 40 },
      position: { "relative": 150, "sticky": 3 },
    },
    componentData: {
      buttons: [
        { text: "Get Started", classes: "btn-primary", fontSize: "14px", fontWeight: "600", color: "#ffffff", bgColor: "#5e6ad2", borderRadius: "8px", padding: "10px 20px", border: "none", boxShadow: "none", transition: "all 0.2s ease", width: 120, height: 40 },
        { text: "Learn More", classes: "btn-ghost", fontSize: "14px", fontWeight: "500", color: "#333333", bgColor: "transparent", borderRadius: "8px", padding: "10px 20px", border: "1px solid #e0e0e0", boxShadow: "none", transition: "all 0.2s ease", width: 110, height: 40 },
      ],
      inputs: [{ type: "text", placeholder: "Search...", fontSize: "14px", fontWeight: "400", color: "#1a1a1a", bgColor: "#ffffff", borderRadius: "8px", padding: "10px 16px", border: "1px solid #e0e0e0", boxShadow: "none", transition: "", width: 260, height: 40 }],
      cards: [{ tag: "div", classes: "card", fontSize: "14px", fontWeight: "400", color: "#1a1a1a", bgColor: "#ffffff", borderRadius: "12px", padding: "24px", border: "1px solid #e0e0e0", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", transition: "none", width: 320, height: 200 }],
      links: [{ text: "Documentation", href: "/docs", textDecoration: "none", fontSize: "14px", fontWeight: "500", color: "#5e6ad2", bgColor: "transparent", borderRadius: "0px", padding: "0px", border: "none", boxShadow: "none", transition: "", width: 100, height: 20 }],
      headings: [
        { level: 1, text: "Build products that people love", fontSize: "48px", fontWeight: "700", fontFamily: '"Inter"', color: "#1a1a1a", bgColor: "transparent", borderRadius: "0px", padding: "0px", border: "none", boxShadow: "none", lineHeight: "56px", letterSpacing: "-0.02em", textTransform: "none", transition: "none", width: 600, height: 56 },
        { level: 2, text: "Features", fontSize: "32px", fontWeight: "600", fontFamily: '"Inter"', color: "#1a1a1a", bgColor: "transparent", borderRadius: "0px", padding: "0px", border: "none", boxShadow: "none", lineHeight: "40px", letterSpacing: "-0.01em", textTransform: "none", transition: "none", width: 200, height: 40 },
      ],
      nav: [{ fontSize: "14px", fontWeight: "500", color: "#1a1a1a", bgColor: "#ffffff", borderRadius: "0px", padding: "0px 24px", border: "none", boxShadow: "0px 1px 2px rgba(0,0,0,0.05)", transition: "none", width: 1440, height: 64, childCount: 5, position: "sticky" }],
      badges: [{ text: "New", fontSize: "12px", fontWeight: "500", color: "#ffffff", bgColor: "#5e6ad2", borderRadius: "9999px", padding: "2px 8px", border: "none", boxShadow: "none", transition: "none", width: 40, height: 20 }],
    },
  },
  cssVars: { "--color-primary": "#5e6ad2", "--color-bg": "#ffffff", "--font-sans": "Inter, sans-serif", "--radius": "8px" },
  content: {
    allText: ["Build products that people love", "Get Started", "Learn More", "We help you ship faster", "Your team deserves better tools", "Try it free for 14 days", "No credit card required"],
    headingTexts: ["Build products that people love", "Features", "Pricing", "Testimonials"],
    ctaTexts: ["Get Started", "Learn More", "Try it free", "Start building"],
    paragraphs: ["We help teams build better products by providing the tools they need to ship faster and iterate with confidence. Our platform is designed for modern development workflows.", "Your team deserves better tools. We believe in simplicity without sacrificing power. Every feature is designed to get out of your way."],
    listItems: ["Fast deployment", "Real-time collaboration", "Built-in analytics"],
    testimonials: [],
    stats: [],
    microcopy: ["No credit card required", "Cancel anytime", "Free for small teams"],
    errorMessages: [],
    emptyStates: [],
    labels: ["Email", "Password", "Company name"],
    placeholders: ["you@example.com", "Enter your password", "Search docs..."],
    wordFrequency: { "build": 5, "product": 4, "team": 3, "tools": 3, "better": 3, "fast": 2, "ship": 2, "design": 2, "modern": 2, "platform": 2, "help": 2, "free": 2 },
    sentenceLengths: [8, 12, 15, 10, 14, 6, 4],
    punctuation: { exclamation: 2, question: 1, period: 8, ellipsis: 0, emoji: 0 },
    capitalization: { allCaps: 0, titleCase: 4, sentenceCase: 10, lower: 2 },
    pronouns: { we: 4, you: 3, i: 0, they: 0, our: 3, your: 3 },
    toneSignals: { informal: 3, formal: 1, technical: 1, playful: 0, urgent: 1 },
  },
  architecture: {
    navLinks: [{ text: "Features", href: "/features", isExternal: false }, { text: "Pricing", href: "/pricing", isExternal: false }, { text: "Docs", href: "/docs", isExternal: false }, { text: "Blog", href: "/blog", isExternal: false }, { text: "Sign in", href: "/login", isExternal: false }],
    footerLinks: [{ text: "Privacy", href: "/privacy" }, { text: "Terms", href: "/terms" }, { text: "Twitter", href: "https://twitter.com/example" }],
    internalLinks: Array(25).fill("/page"),
    externalLinks: Array(5).fill("https://external.com"),
    anchorLinks: ["#features", "#pricing"],
    sections: [{ id: "hero", heading: "Build products that people love", childCount: 3 }, { id: "features", heading: "Features", childCount: 6 }, { id: "pricing", heading: "Pricing", childCount: 3 }],
    landmarks: { header: 1, main: 1, footer: 1, nav: 1, section: 3 },
    headingHierarchy: [{ level: 1, text: "Build products that people love" }, { level: 2, text: "Features" }, { level: 2, text: "Pricing" }],
    breadcrumbs: [],
    pagination: false, search: true, sidebarNav: false, tabNav: false,
    dropdowns: 2, accordions: 0, depth: 12,
  },
  uxPatterns: {
    ctas: [{ text: "Get Started", position: "above-fold", prominence: "high", bgColor: "rgb(94,106,210)", fontSize: "14px" }, { text: "Learn More", position: "above-fold", prominence: "medium", bgColor: "transparent", fontSize: "14px" }],
    forms: [{ fields: 2, submitText: "Sign up", action: "/signup", method: "post" }],
    socialProof: ["We switched to Example and our team velocity doubled."],
    pricing: true, hero: { headline: "Build products that people love", subheadline: "The platform for modern development teams", cta: "Get Started", hasImage: true },
    testimonials: true, faq: false, newsletter: true, chatWidget: false,
    cookieBanner: true, notifications: false, progressIndicators: false,
    infiniteScroll: false, stickyElements: [{ tag: "nav", position: "sticky", height: 64 }],
    overlays: 0, carousels: 0, videoEmbeds: 1, maps: 0, animations: 3,
    loadingPatterns: [], scrollBehavior: { smooth: true, snapPoints: false, parallax: false },
    interactionDensity: 45,
  },
  behavior: {
    formValidation: { html5: 2, custom: 1, inline: true, patterns: [] },
    interactiveStates: [],
    focusManagement: { focusVisible: true, focusTrap: false, skipLink: true },
    loadingStates: [], errorHandling: [],
    tooltips: 5, popovers: 1, modals: 2, drawers: 1, toasts: 0,
    datePickers: 0, fileUploads: 0, richTextEditors: 0, autoComplete: 1,
    dragDrop: false, keyboardShortcuts: [], clipboardActions: false, undoRedo: false,
  },
  motion: {
    transitions: { "all": 100, "opacity": 50, "transform": 30 },
    durations: { "0.2s": 80, "0.15s": 40, "0.3s": 30 },
    easings: { "ease": 60, "ease-in-out": 40 },
    keyframes: [{ name: "fadeIn", steps: 2 }, { name: "slideUp", steps: 2 }],
    animatedElements: 3,
  },
  accessibility: {
    contrastIssues: [{ text: "Muted label", fg: "#aaaaaa", bg: "#f5f5f5", ratio: 2.1, tag: "span" }],
    missingAlt: 2, ariaRoles: { button: 5, navigation: 1 }, ariaLabels: 12,
    focusVisible: true, skipLink: true,
    landmarks: { header: 1, main: 1, footer: 1, nav: 1 },
    headingOrder: [1, 2, 2, 3], tabIndex: { positive: 0, zero: 8, negative: 2 },
    formLabels: { labeled: 6, unlabeled: 1 }, liveRegions: 1, reducedMotion: false,
  },
  seo: {
    titleLength: 32, descriptionLength: 45, h1Count: 1, h1Text: "Build products that people love",
    imageAltCoverage: 85, internalLinkCount: 25, externalLinkCount: 5,
    structuredData: ["Organization", "WebSite"], openGraph: { "og:title": "Example", "og:type": "website" },
    twitter: { "twitter:card": "summary_large_image" }, hreflang: [], sitemap: false, ampVersion: false,
    preconnects: ["https://fonts.googleapis.com"], prefetches: [], lazyImages: 8, totalImages: 12,
  },
  techStack: {
    frameworks: ["React", "Next.js"], libraries: [], analytics: ["Google Analytics", "Segment"],
    fonts: { urls: ["https://fonts.googleapis.com/css2?family=Inter"], faces: [{ family: "Inter", weight: "400" }] },
    buildTools: [], hosting: ["Vercel"], cssFramework: "Tailwind CSS", jsFramework: null, meta: {},
  },
  performance: {
    resourceCount: 45, scriptCount: 12, stylesheetCount: 3, inlineScripts: 4, inlineStyles: 2,
    imageCount: 12, lazyImages: 8, asyncScripts: 5, deferScripts: 3, preloads: 2, preconnects: 3,
    serviceWorker: false, webWorkers: 0, domNodeCount: 1200, thirdPartyScripts: 4,
  },
  darkMode: null,
  breakpoints: { 640: 15, 768: 25, 1024: 30, 1280: 10 },
  screenshot: "base64data",
  gradients: { backgrounds: { "linear-gradient(135deg, #5e6ad2, #8b5cf6)": 5 }, text: 1, borders: 0 },
  iconSystem: { svgInline: 18, svgSprite: 3, iconFont: false, iconFontFamily: "", svgSizes: { "16x16": 10, "20x20": 6, "24x24": 2 }, iconClasses: [], totalIcons: 21 },
  imageTreatments: { count: 12, lazyLoaded: 8, avgWidth: 400, avgHeight: 280, borderRadius: { "8px": 5 }, objectFit: { "cover": 8, "contain": 2 }, aspectRatios: { "1.8:1": 4 }, formats: { "webp": 6, "png": 4, "jpg": 2 }, srcset: 5, decorative: 2, hero: { width: 1200, height: 600, format: "webp" } },
  interactiveStates: { hover: [{ tag: "button", cursor: "pointer", changes: { bg: { from: "rgb(94,106,210)", to: "rgb(110,122,226)" }, color: null, shadow: { from: "none", to: "0 4px 16px rgba(94,106,210,0.3)" }, transform: null } }], focus: [] },
  layoutSystem: { flexCount: 180, gridCount: 35, gridTemplates: { "repeat(3, 1fr)": 8, "1fr 1fr": 5 }, flexDirections: { "row": 120, "column": 60 }, containerWidths: { "1200px": 10, "768px": 5 }, gapValues: { "8px": 40, "16px": 30, "24px": 15 }, stickyCount: 3, fixedCount: 2, absoluteCount: 25, overflowHidden: 40, containerQueries: false },
  fontLoading: { preloaded: ["/fonts/inter.woff2"], googleFonts: ["https://fonts.googleapis.com/css2?family=Inter"], typekit: [], fontFaces: [{ family: "Inter", weight: "400", style: "normal", display: "swap" }], displaySwap: 1, fontDisplay: { "swap": 1 }, totalFonts: 2, customFonts: 1 },
  socialLinks: { twitter: "https://twitter.com/example", github: "https://github.com/example", discord: "https://discord.gg/example" },
  pricingData: { detected: true, tiers: [{ name: "Starter", price: "$0/mo", cta: "Get Started", featureCount: 3, features: ["5 projects", "1 user", "Basic support"] }, { name: "Pro", price: "$29/mo", cta: "Start free trial", featureCount: 6, features: [] }], currency: "USD", billingToggle: true, freeTier: true, enterprise: false },
  scrollPatterns: { smoothScroll: true, scrollSnap: false, parallax: false, stickyHeaders: 2, scrollIndicator: false, backToTop: true, infiniteScroll: false, lazyLoadTrigger: false, revealAnimations: 8 },
  thirdPartyServices: { payments: ["Stripe"], errorTracking: ["Sentry"], cdns: ["Cloudflare"], maps: [], chat: ["Intercom"], auth: ["Auth0"], email: ["Resend"], cms: [], ab: [] },
  schemaData: { jsonLd: [{ type: "Organization", hasName: true, hasDescription: true, hasImage: true, hasUrl: true }, { type: "WebSite", hasName: true, hasDescription: false, hasImage: false, hasUrl: true }], microdata: [], openGraph: { title: "Example", type: "website" }, twitterCards: { card: "summary_large_image" } },
  colorMatrix: [{ key: "#1a1a1a|#ffffff", fg: "#1a1a1a", bg: "#ffffff", ratio: 16.0, aa: true, aaa: true, aaLarge: true, sample: "Main text" }, { key: "#5e6ad2|#ffffff", fg: "#5e6ad2", bg: "#ffffff", ratio: 4.7, aa: true, aaa: false, aaLarge: true, sample: "Link" }, { key: "#aaaaaa|#f5f5f5", fg: "#aaaaaa", bg: "#f5f5f5", ratio: 2.1, aa: false, aaa: false, aaLarge: false, sample: "Muted" }],
  typographyDeep: { textAlign: { center: 15, right: 3 }, textDecoration: { underline: 8 }, textOverflow: { ellipsis: 12 }, whiteSpace: { nowrap: 20 }, wordBreak: {}, textIndent: 0, writingModes: {}, fontFeatureSettings: {}, fontVariant: {}, textShadow: {}, lineClamp: 5, hyphens: 0, allCapsCount: 8, italicCount: 4, underlineLinks: 12, noUnderlineLinks: 25, monospacedBlocks: 6, avgCharsPerLine: 65, maxLineWidth: 720 },
  colorContext: { opacityUsage: { "0.5": 15, "0.8": 8 }, blendModes: { "multiply": 2 }, backdropFilters: { "blur(10px)": 3 }, cssFilters: { "brightness(0.95)": 2 }, accentColor: "#5e6ad2", colorScheme: "light dark", forcedColors: false, currentColorUsage: 5, transparentUsage: 40, hslUsage: 12, rgbUsage: 0, namedColors: 0 },
  layoutDeep: { justifyContent: { "center": 40, "space-between": 30, "flex-start": 60 }, alignItems: { "center": 80, "stretch": 30, "flex-start": 20 }, flexWrap: { "wrap": 15 }, flexGrow: 12, flexShrink: 3, orderUsage: 2, gridAreas: {}, gridAutoFlow: {}, placeItems: {}, columnCount: 0, aspectRatioCSS: { "16 / 9": 4, "1 / 1": 3 }, subgrid: false, inlineSize: 0, blockSize: 0, logicalProps: 8 },
  interactionPatterns: { cursorTypes: { pointer: 85, "not-allowed": 3, grab: 2 }, pointerEvents: { none: 15 }, touchAction: {}, userSelect: { none: 20 }, resize: 2, scrollMargin: 8, scrollPadding: 3, overscrollBehavior: {}, willChange: { transform: 5, opacity: 3 }, contentVisibility: 4, contain: {}, scrollbarCustom: true, focusWithin: true, hasHover: true, mediaHover: true },
  formDeep: { inputTypes: { text: 3, email: 2, password: 1, search: 1, hidden: 4 }, autocompleteAttrs: { email: 2, name: 1 }, requiredCount: 4, patternCount: 1, minMaxLength: 2, fieldsets: 1, legends: 1, inputModes: {}, formMethods: { post: 2 }, formActions: [], encTypes: {}, datalists: 0, outputElements: 0, meterElements: 0, progressElements: 1, textareaCount: 1, selectCount: 2, radioGroups: 0, checkboxCount: 3, rangeCount: 0, colorInputs: 0, fileInputs: 1, hiddenInputs: 4 },
  mediaDeep: { pictureElements: 3, sourceElements: 6, videoElements: { count: 1, autoplay: 1, loop: 1, muted: 1, controls: 0, playsInline: 1 }, audioElements: 0, canvasElements: 0, iframesByDomain: { "youtube.com": 1 }, svgComplexity: { totalPaths: 120, totalElements: 200, avgPathsPerSvg: 6, viewBoxes: { "0 0 24 24": 12 } }, objectEmbeds: 0, figureElements: 4, figcaptionElements: 3, mapElements: 0, webpCount: 6, avifCount: 0, svgAsImg: 3, dataUriImages: 2, backgroundImages: 15 },
  navDeep: { targetBlank: 8, noopener: 6, noreferrer: 4, relTypes: { noopener: 6, noreferrer: 4 }, telLinks: 0, mailtoLinks: 1, downloadLinks: 0, hashLinks: 5, protocolLinks: {}, ariaCurrentLinks: 1, activeClassLinks: 2, nestedNavDepth: 2, megaMenu: false, sidebarLinks: 0, footerColumns: 4, legalLinks: ["privacy", "terms"], sitemap: false, linksBySection: {} },
  a11yDeep: { ariaAttributes: { "aria-label": 15, "aria-hidden": 8, "aria-expanded": 4, "aria-controls": 3 }, ariaHidden: 8, ariaExpanded: 4, ariaDescribedBy: 2, ariaControls: 3, ariaOwns: 0, ariaLive: { polite: 2 }, langAttributes: 0, titleAttributes: 12, srOnlyElements: 6, tabOrder: [], focusableElements: 45, inertElements: 0, dialogElements: 2, alertDialogs: 0, ariaInvalid: 1, ariaRequired: 3, ariaDisabled: 0, autocompleteOff: 0, negativeTabindex: 4, positiveTabindex: 0, visuallyHiddenTechniques: { clipRect: 3, srOnly: 6, offscreen: 0, zeroSize: 0 } },
  perfDeep: { moduleScripts: 8, classicScripts: 4, nomoduleScripts: 0, deferCount: 6, asyncCount: 3, inlineScriptBytes: 15000, inlineStyleBytes: 8000, webComponents: 0, shadowDOMs: 0, templateElements: 0, slotElements: 0, importMaps: 0, fetchPriority: { high: 2, low: 0, auto: 0 }, dnsPrefetch: 3, prerender: 0, modulePreload: 2, criticalCSS: 1, noscript: 1, loadingAttr: { eager: 4, lazy: 8 }, decodingAttr: { sync: 0, async: 6, auto: 6 }, intersectionObservers: 0, mutationObservers: 0, resizeObservers: 0, eventListenerCount: 0, cssContainment: 5, contentVisibility: 3 },
  contentMetrics: { totalTextLength: 12000, aboveFoldText: 3000, belowFoldText: 9000, contentToChromeRatio: 88, linkToTextRatio: 15, imageToTextRatio: 40, headingDensity: 25, listDensity: 18, tableCount: 1, codeBlocks: 8, preElements: 3, blockquotes: 2, abbreviations: 0, definitions: 0, timeElements: 3, markElements: 0, detailsElements: 2, summaryElements: 2, rubyElements: 0, mathElements: 0, wordCount: 2400, paragraphCount: 24, avgParagraphLength: 45, longestParagraph: 120, shortestParagraph: 8, emptyParagraphs: 0, singleSentenceParagraphs: 6 },
};

// ═══════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════

console.log("\n  stackmd test suite\n");
console.log("  ── Analyzer ──────────────────────────────────────\n");

let data;

test("analyze() runs without errors", () => { data = analyze(mock); assert(data, "null"); });
test("colors are clustered with roles", () => { assert(data.designSystem.colors.length > 0); assert(data.designSystem.colors[0].role); });
test("fonts extracted with roles", () => { assert(data.designSystem.fonts.length >= 1); assert(data.designSystem.fonts[0].role === "primary"); });
test("spacing scale built", () => { assert(data.designSystem.spacingScale.length > 0); });
test("grid system detected", () => { assert(data.designSystem.gridSystem === null || data.designSystem.gridSystem.base > 0); });
test("components detected", () => { assert(data.designSystem.components.length > 0); });
test("heading map populated", () => { assert(Object.keys(data.designSystem.headingMap).length > 0); });
test("CSS vars filtered", () => { assert(Object.keys(data.designSystem.cssVars).length > 0); });

console.log("\n  ── Brand Voice ───────────────────────────────────\n");

test("brand voice personality generated", () => { assert(data.brandVoice.personality.length > 0, "no personality"); });
test("reading level detected", () => { assert(["simple", "standard", "advanced", "academic"].includes(data.brandVoice.readingLevel)); });
test("pronoun strategy detected", () => { assert(data.brandVoice.pronounStrategy !== "neutral", "should detect we/you"); });
test("CTA pattern detected", () => { assert(data.brandVoice.ctaPattern !== "unknown"); });
test("tone profile has values", () => { assert(typeof data.brandVoice.toneProfile.formality === "number"); });
test("top words extracted", () => { assert(data.brandVoice.topWords.length > 0); });
test("writing density detected", () => { assert(["minimal", "concise", "standard", "content-rich"].includes(data.brandVoice.writingDensity)); });

console.log("\n  ── UX Analysis ───────────────────────────────────\n");

test("page type inferred", () => { assert(data.uxAnalysis.pageType !== "unknown"); });
test("conversion strategy detected", () => { assert(data.uxAnalysis.conversionStrategy !== "unknown"); });
test("navigation complexity assessed", () => { assert(["minimal", "standard", "complex", "dense"].includes(data.uxAnalysis.navigationComplexity)); });
test("interactivity level assessed", () => { assert(data.uxAnalysis.interactivityLevel); });
test("UX patterns detected", () => { assert(data.uxAnalysis.patternSummary.length > 0); });
test("user journey signals present", () => { assert(data.uxAnalysis.userJourneySignals.length > 0); });

console.log("\n  ── DNA Score ─────────────────────────────────────\n");

test("DNA score calculated", () => { assert(data.dnaScore); assert(typeof data.dnaScore.overall === "number"); assert(data.dnaScore.overall >= 0 && data.dnaScore.overall <= 100); });
test("all score dimensions present", () => {
  const keys = Object.keys(data.dnaScore);
  assert(keys.includes("overall")); assert(keys.includes("accessibility")); assert(keys.includes("seo")); assert(keys.includes("performance"));
});

console.log("\n  ── Generator ─────────────────────────────────────\n");

let md;
test("generateStackMd() runs without errors", () => { md = generateStackMd(data); assert(typeof md === "string"); assert(md.length > 1000, "too short: " + md.length); });
test("has Product Identity section", () => { assert(md.includes("## 1. Product Identity")); });
test("has DNA Score section", () => { assert(md.includes("## 2. Product DNA Score")); });
test("has Brand Voice section", () => { assert(md.includes("## 3. Brand Voice")); });
test("has Content Strategy section", () => { assert(md.includes("## 4. Content Strategy")); });
test("has Visual Design section", () => { assert(md.includes("## 5. Visual Design")); });
test("has Component Styling section", () => { assert(md.includes("## 6. Component")); });
test("has UX Patterns section", () => { assert(md.includes("## 7. UX Patterns")); });
test("has Architecture section", () => { assert(md.includes("## 8. Information Architecture")); });
test("has Component Behavior section", () => { assert(md.includes("## 9. Component Behavior")); });
test("has Motion section", () => { assert(md.includes("## 10. Motion")); });
test("has Responsive section", () => { assert(md.includes("## 11. Responsive")); });
test("has Accessibility section", () => { assert(md.includes("## 12. Accessibility")); });
test("has SEO section", () => { assert(md.includes("## 13. SEO")); });
test("has Tech Stack section", () => { assert(md.includes("## 14. Technology Stack")); });
test("has Agent Build Guide", () => { assert(md.includes("Agent Build Guide")); });
test("includes educational disclaimer", () => { assert(md.includes("educational and experimental")); });
test("includes brand voice personality", () => { assert(md.includes(data.brandVoice.contentPersonality)); });
test("includes CTA texts", () => { assert(md.includes("Get Started")); });
test("includes full agent prompt", () => { assert(md.includes("IDENTITY:")); assert(md.includes("VISUAL:")); assert(md.includes("VOICE:")); assert(md.includes("UX:")); });

console.log("\n  ── New Extraction Passes ─────────────────────────\n");

test("gradients extracted and in output", () => {
  assert(data.gradientList.length > 0, "no gradients");
  assert(data.gradientList[0].value, "no gradient value");
  assert(md.includes("Gradient"), "missing from markdown");
});

test("icon system extracted", () => {
  assert(data.iconSystem, "no icon system");
  assert(data.iconSystem.svgInline === 18, "wrong svg count");
  assert(data.iconSystem.totalIcons === 21, "wrong total");
  assert(md.includes("Icon System"), "missing from markdown");
});

test("image treatments extracted", () => {
  assert(data.imageTreatments, "no image treatments");
  assert(data.imageTreatments.count === 12, "wrong count");
  assert(data.imageTreatments.hero, "no hero image");
  assert(md.includes("Image Treatments"), "missing from markdown");
});

test("interactive states extracted", () => {
  assert(data.interactiveStates, "no states");
  assert(data.interactiveStates.hover.length > 0, "no hover");
  assert(md.includes("Hover Effects"), "missing from markdown");
});

test("layout system extracted", () => {
  assert(data.layoutSystem, "no layout");
  assert(data.layoutSystem.flexCount === 180, "wrong flex count");
  assert(data.layoutSystem.gridCount === 35, "wrong grid count");
  assert(md.includes("Layout System"), "missing from markdown");
});

test("container widths processed", () => {
  assert(data.containerWidths.length > 0, "no container widths");
  assert(md.includes("Container Widths"), "missing from markdown");
});

test("font loading extracted", () => {
  assert(data.fontLoading, "no font loading");
  assert(data.fontLoading.displaySwap === 1, "wrong swap count");
  assert(md.includes("Font Loading"), "missing from markdown");
});

test("social links extracted", () => {
  assert(Object.keys(data.socialLinks).length === 3, "wrong social count");
  assert(data.socialLinks.twitter, "no twitter");
  assert(data.socialLinks.github, "no github");
  assert(md.includes("Social Presence"), "missing from markdown");
});

test("pricing structure extracted", () => {
  assert(data.pricingData, "no pricing");
  assert(data.pricingData.detected === true, "not detected");
  assert(data.pricingData.tiers.length === 2, "wrong tier count");
  assert(data.pricingData.currency === "USD", "wrong currency");
  assert(md.includes("Pricing Structure"), "missing from markdown");
});

test("scroll patterns extracted", () => {
  assert(data.scrollPatterns, "no scroll");
  assert(data.scrollPatterns.smoothScroll === true, "no smooth");
  assert(data.scrollPatterns.revealAnimations === 8, "wrong reveals");
  assert(md.includes("Scroll Behavior"), "missing from markdown");
});

test("third-party services extracted", () => {
  assert(data.thirdPartyServices, "no services");
  assert(data.thirdPartyServices.payments[0] === "Stripe", "no stripe");
  assert(data.thirdPartyServices.errorTracking[0] === "Sentry", "no sentry");
  assert(md.includes("Third-Party Services"), "missing from markdown");
});

test("schema data extracted", () => {
  assert(data.schemaData, "no schema");
  assert(data.schemaData.jsonLd.length === 2, "wrong jsonld count");
  assert(md.includes("Structured Data"), "missing from markdown");
});

test("color accessibility matrix extracted", () => {
  assert(data.colorPairings, "no pairings");
  assert(data.colorPairings.total === 3, "wrong total");
  assert(data.colorPairings.accessible.length === 2, "wrong accessible");
  assert(data.colorPairings.failing.length === 1, "wrong failing");
  assert(md.includes("Color Accessibility Matrix"), "missing from markdown");
});

test("DNA score includes all dimensions", () => {
  const keys = Object.keys(data.dnaScore);
  assert(keys.length >= 8, "not enough score dimensions: " + keys.length);
  for (const [k, v] of Object.entries(data.dnaScore)) {
    assert(typeof v === "number", `${k} is not a number`);
    assert(v >= 0 && v <= 100, `${k} out of range: ${v}`);
  }
});

console.log("\n  ── Deep Extraction Passes ────────────────────────\n");

test("typography deep extracted and in output", () => {
  assert(data.typographyDeep, "no data");
  assert(data.typographyDeep.avgCharsPerLine === 65, "wrong chars/line");
  assert(data.typographyDeep.allCapsCount === 8, "wrong caps count");
  assert(md.includes("Typography Deep"), "missing from markdown");
});

test("color context extracted and in output", () => {
  assert(data.colorContext, "no data");
  assert(data.colorContext.colorScheme === "light dark", "wrong scheme");
  assert(md.includes("Color Context"), "missing from markdown");
});

test("layout deep extracted and in output", () => {
  assert(data.layoutDeep, "no data");
  assert(data.layoutDeep.flexGrow === 12, "wrong flexGrow");
  assert(md.includes("Layout Deep"), "missing from markdown");
});

test("interaction patterns extracted and in output", () => {
  assert(data.interactionPatterns, "no data");
  assert(data.interactionPatterns.scrollbarCustom === true, "no scrollbar");
  assert(md.includes("Interaction Patterns"), "missing from markdown");
});

test("form deep extracted and in output", () => {
  assert(data.formDeep, "no data");
  assert(data.formDeep.requiredCount === 4, "wrong required");
  assert(data.formDeep.hiddenInputs === 4, "wrong hidden");
  assert(md.includes("Form Deep"), "missing from markdown");
});

test("media deep extracted and in output", () => {
  assert(data.mediaDeep, "no data");
  assert(data.mediaDeep.pictureElements === 3, "wrong picture count");
  assert(data.mediaDeep.videoElements.count === 1, "wrong video count");
  assert(md.includes("Media Deep"), "missing from markdown");
});

test("navigation deep extracted and in output", () => {
  assert(data.navDeep, "no data");
  assert(data.navDeep.targetBlank === 8, "wrong blank count");
  assert(data.navDeep.footerColumns === 4, "wrong footer cols");
  assert(md.includes("Navigation Deep"), "missing from markdown");
});

test("accessibility deep extracted and in output", () => {
  assert(data.a11yDeep, "no data");
  assert(data.a11yDeep.focusableElements === 45, "wrong focusable");
  assert(data.a11yDeep.srOnlyElements === 6, "wrong sr-only");
  assert(md.includes("Accessibility Deep"), "missing from markdown");
});

test("performance deep extracted and in output", () => {
  assert(data.perfDeep, "no data");
  assert(data.perfDeep.moduleScripts === 8, "wrong modules");
  assert(data.perfDeep.criticalCSS === 1, "wrong critical css");
  assert(md.includes("Performance Deep"), "missing from markdown");
});

test("content metrics extracted and in output", () => {
  assert(data.contentMetrics, "no data");
  assert(data.contentMetrics.wordCount === 2400, "wrong word count");
  assert(data.contentMetrics.contentToChromeRatio === 88, "wrong ratio");
  assert(md.includes("Content Metrics"), "missing from markdown");
});

test("STACK.md has section 19 (Deep Extraction)", () => {
  assert(md.includes("## 19. Deep Extraction Report"), "missing section 19");
});

test("STACK.md has section 20 (Agent Build Guide)", () => {
  assert(md.includes("## 20. Agent Build Guide"), "missing section 20");
});

console.log("\n  ── Intelligence Layer ────────────────────────────\n");

test("intelligence layer generated", () => {
  assert(data.intelligence, "no intelligence");
});

test("readability calculated", () => {
  assert(data.intelligence.readability, "no readability");
  assert(typeof data.intelligence.readability.fleschEase === "number", "no ease score");
  assert(data.intelligence.readability.grade, "no grade");
  assert(md.includes("Readability Score"), "missing from markdown");
});

test("headline formulas classified", () => {
  assert(data.intelligence.headlines.length > 0, "no headlines");
  assert(data.intelligence.headlines[0].formula, "no formula");
  assert(md.includes("Headline Analysis"), "missing from markdown");
});

test("emotional tone mapped", () => {
  assert(data.intelligence.emotionalTone, "no emotional tone");
  assert(data.intelligence.emotionalTone.dominant.length > 0, "no dominant emotions");
  assert(md.includes("Emotional Profile"), "missing from markdown");
});

test("trust signals classified", () => {
  assert(data.intelligence.trustSignals, "no trust");
  assert(data.intelligence.trustSignals.totalSignals > 0, "no signals");
  assert(md.includes("Trust Signals"), "missing from markdown");
});

test("color psychology analyzed", () => {
  assert(data.intelligence.colorPsychology, "no color psych");
  assert(data.intelligence.colorPsychology.temperature, "no temperature");
  assert(data.intelligence.colorPsychology.harmony, "no harmony");
  assert(md.includes("Color Psychology"), "missing from markdown");
});

test("content quality audited", () => {
  assert(data.intelligence.contentQuality, "no content quality");
  assert(data.intelligence.contentQuality.grade, "no grade");
  assert(data.intelligence.contentQuality.score >= 0, "bad score");
  assert(md.includes("Content Quality"), "missing from markdown");
});

test("SEO audited", () => {
  assert(data.intelligence.seoAudit, "no seo audit");
  assert(data.intelligence.seoAudit.grade, "no grade");
  assert(data.intelligence.seoAudit.checks.length > 10, "too few checks");
});

test("performance risks assessed", () => {
  assert(data.intelligence.performanceRisks, "no perf risks");
  assert(data.intelligence.performanceRisks.grade, "no grade");
});

test("accessibility graded", () => {
  assert(data.intelligence.accessibilityGrade, "no a11y grade");
  assert(data.intelligence.accessibilityGrade.wcagLevel, "no wcag level");
  assert(data.intelligence.accessibilityGrade.checks.length > 10, "too few checks");
});

test("product maturity estimated", () => {
  assert(data.intelligence.productMaturity, "no maturity");
  assert(data.intelligence.productMaturity.level, "no level");
  assert(data.intelligence.productMaturity.signals.length > 0, "no signals");
  assert(md.includes("Product Maturity"), "missing from markdown");
});

test("conversion funnel analyzed", () => {
  assert(data.intelligence.conversionFunnel, "no funnel");
  assert(data.intelligence.conversionFunnel.stages.length > 0, "no stages");
  assert(data.intelligence.conversionFunnel.funnelType, "no type");
  assert(md.includes("Conversion Funnel"), "missing from markdown");
});

test("audit grades table in output", () => {
  assert(md.includes("Audit Grades"), "missing audit table");
  assert(md.includes("Content Quality"), "missing CQ in table");
  assert(md.includes("Technical SEO"), "missing SEO in table");
  assert(md.includes("Performance"), "missing perf in table");
  assert(md.includes("Accessibility"), "missing a11y in table");
});

console.log("\n  ── Edge Cases ────────────────────────────────────\n");

test("handles empty content", () => {
  const empty = { ...mock, content: { ...mock.content, allText: [], paragraphs: [], ctaTexts: [], sentenceLengths: [], wordFrequency: {}, toneSignals: { informal: 0, formal: 0, technical: 0, playful: 0, urgent: 0 }, punctuation: { exclamation: 0, question: 0, period: 0, ellipsis: 0, emoji: 0 }, pronouns: { we: 0, you: 0, i: 0, they: 0, our: 0, your: 0 }, headingTexts: [], listItems: [], microcopy: [], labels: [], placeholders: [] } };
  const r = analyze(empty);
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null dark mode", () => {
  const r = analyze({ ...mock, darkMode: null });
  const m = generateStackMd(r);
  assert(!m.includes("Dark Mode Overrides"));
});

test("handles empty tech stack", () => {
  const r = analyze({ ...mock, techStack: { ...mock.techStack, frameworks: [], cssFramework: null, analytics: [], hosting: [] } });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null accessibility", () => {
  const r = analyze({ ...mock, accessibility: null });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles no hero", () => {
  const r = analyze({ ...mock, uxPatterns: { ...mock.uxPatterns, hero: null } });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null gradients", () => {
  const r = analyze({ ...mock, gradients: null });
  assert(r.gradientList.length === 0);
});

test("handles null icon system", () => {
  const r = analyze({ ...mock, iconSystem: null });
  assert(r.iconSystem === null);
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null image treatments", () => {
  const r = analyze({ ...mock, imageTreatments: null });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null interactive states", () => {
  const r = analyze({ ...mock, interactiveStates: null });
  const m = generateStackMd(r);
  assert(!m.includes("Hover Effects"));
});

test("handles null layout system", () => {
  const r = analyze({ ...mock, layoutSystem: null });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null font loading", () => {
  const r = analyze({ ...mock, fontLoading: null });
  const m = generateStackMd(r);
  assert(!m.includes("Font Loading"));
});

test("handles empty social links", () => {
  const r = analyze({ ...mock, socialLinks: {} });
  const m = generateStackMd(r);
  assert(!m.includes("Social Presence"));
});

test("handles no pricing", () => {
  const r = analyze({ ...mock, pricingData: { detected: false, tiers: [], currency: "", billingToggle: false, freeTier: false, enterprise: false } });
  const m = generateStackMd(r);
  assert(!m.includes("Pricing Structure"));
});

test("handles null scroll patterns", () => {
  const r = analyze({ ...mock, scrollPatterns: null });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null third-party services", () => {
  const r = analyze({ ...mock, thirdPartyServices: null });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles null schema data", () => {
  const r = analyze({ ...mock, schemaData: null });
  const m = generateStackMd(r);
  assert(m.length > 100);
});

test("handles empty color matrix", () => {
  const r = analyze({ ...mock, colorMatrix: [] });
  assert(r.colorPairings.total === 0);
});

test("handles null typographyDeep", () => { const r = analyze({ ...mock, typographyDeep: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null colorContext", () => { const r = analyze({ ...mock, colorContext: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null layoutDeep", () => { const r = analyze({ ...mock, layoutDeep: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null interactionPatterns", () => { const r = analyze({ ...mock, interactionPatterns: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null formDeep", () => { const r = analyze({ ...mock, formDeep: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null mediaDeep", () => { const r = analyze({ ...mock, mediaDeep: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null navDeep", () => { const r = analyze({ ...mock, navDeep: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null a11yDeep", () => { const r = analyze({ ...mock, a11yDeep: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null perfDeep", () => { const r = analyze({ ...mock, perfDeep: null }); const m = generateStackMd(r); assert(m.length > 100); });
test("handles null contentMetrics", () => { const r = analyze({ ...mock, contentMetrics: null }); const m = generateStackMd(r); assert(m.length > 100); });

console.log("\n  ── Security ──────────────────────────────────────\n");

test("no XSS in markdown (malicious heading)", () => {
  const xss = { ...mock, content: { ...mock.content, headingTexts: ['<script>alert(1)</script>'] } };
  const r = analyze(xss);
  const m = generateStackMd(r);
  assert(!m.includes("<script>"), "XSS in markdown");
});

test("no XSS via URL", () => {
  const xss = { ...mock };
  xss.url = '"><script>alert(1)</script>';
  const r = analyze(xss);
  const m = generateStackMd(r);
  assert(!m.includes("<script>"), "XSS via URL");
});

test("no XSS via CTA text", () => {
  const xss = { ...mock, content: { ...mock.content, ctaTexts: ['<img onerror=alert(1)>'] } };
  const r = analyze(xss);
  const m = generateStackMd(r);
  assert(!m.includes("onerror"), "XSS via CTA");
});

test("no XSS via font family", () => {
  const xss = { ...mock };
  xss.visual = { ...mock.visual, maps: { ...mock.visual.maps, font: { '"><script>alert(1)</script>': 100 } } };
  const r = analyze(xss);
  assert(!r.designSystem.fonts[0].stack.includes("<script>"), "XSS via font");
});

test("no XSS via social links", () => {
  const xss = { ...mock, socialLinks: { twitter: 'javascript:alert(1)' } };
  const r = analyze(xss);
  const m = generateStackMd(r);
  assert(!m.includes("javascript:"), "XSS via social");
});

test("no XSS via pricing tier name", () => {
  const xss = { ...mock, pricingData: { ...mock.pricingData, tiers: [{ name: '<img onerror=alert(1)>', price: "$0", cta: "Go", featureCount: 0, features: [] }] } };
  const r = analyze(xss);
  const m = generateStackMd(r);
  assert(!m.includes("onerror"), "XSS via pricing");
});

test("no XSS via schema type", () => {
  const xss = { ...mock, schemaData: { ...mock.schemaData, jsonLd: [{ type: '<script>alert(1)</script>', hasName: false, hasDescription: false, hasImage: false, hasUrl: false }] } };
  const r = analyze(xss);
  const m = generateStackMd(r);
  assert(!m.includes("<script>"), "XSS via schema");
});

test("educational disclaimer present", () => {
  const m = generateStackMd(data);
  assert(m.includes("educational"), "missing disclaimer");
});

// ── Summary ──────────────────────────────────────────────────
console.log(`\n  ────────────────────────────────────────────────\n`);
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
