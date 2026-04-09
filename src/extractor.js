/**
 * extractor.js — Full product DNA extraction
 *
 * Extracts visual design, brand voice, UX patterns, content strategy,
 * component behavior, information architecture, performance signals,
 * SEO structure, and technology stack from a live URL.
 *
 * For educational and experimental purposes only.
 */

import puppeteer from "puppeteer";

export async function extractFromURL(url, options = {}) {
  const { wait = 3000, extractDark = false, onProgress } = options;
  const log = onProgress || (() => {});

  log("Launching headless browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    log(`Loading ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    log("Waiting for dynamic content...");
    await new Promise(r => setTimeout(r, wait));

    // ═══ 1. META & IDENTITY ═════════════════════════════════
    log("Extracting product identity...");
    const identity = await page.evaluate(() => {
      const getMeta = (name) =>
        document.querySelector(`meta[name="${name}"]`)?.content ||
        document.querySelector(`meta[property="${name}"]`)?.content || "";
      return {
        title: document.title || "",
        description: getMeta("description"),
        ogTitle: getMeta("og:title"),
        ogDescription: getMeta("og:description"),
        ogImage: getMeta("og:image"),
        ogType: getMeta("og:type"),
        ogSiteName: getMeta("og:site_name"),
        twitterCard: getMeta("twitter:card"),
        twitterSite: getMeta("twitter:site"),
        themeColor: getMeta("theme-color"),
        favicon: document.querySelector('link[rel="icon"]')?.href ||
          document.querySelector('link[rel="shortcut icon"]')?.href || "",
        appleTouchIcon: document.querySelector('link[rel="apple-touch-icon"]')?.href || "",
        manifest: document.querySelector('link[rel="manifest"]')?.href || "",
        canonical: document.querySelector('link[rel="canonical"]')?.href || "",
        language: document.documentElement.lang || "",
        charset: document.characterSet || "",
        generator: getMeta("generator"),
        viewport: getMeta("viewport"),
        robots: getMeta("robots"),
      };
    });

    // ═══ 2. VISUAL DESIGN ═══════════════════════════════════
    log("Scanning visual design tokens...");
    const visual = await page.evaluate(() => {
      const maps = { color: {}, bgColor: {}, borderColor: {}, font: {}, fontSize: {}, fontWeight: {},
        lineHeight: {}, letterSpacing: {}, spacing: {}, radius: {}, shadow: {}, transition: {},
        zIndex: {}, opacity: {}, display: {}, position: {} };
      const componentData = { buttons: [], inputs: [], cards: [], links: [], headings: [], nav: [], badges: [] };

      function add(map, val) {
        if (!val || val === "none" || val === "normal" || val === "0px" || val === "auto") return;
        map[val] = (map[val] || 0) + 1;
      }
      function rgbToHex(rgb) {
        if (!rgb || rgb === "transparent" || rgb.startsWith("#")) return rgb;
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return rgb;
        if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
        return "#" + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, "0")).join("");
      }

      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const tag = el.tagName.toLowerCase();
        const c = rgbToHex(cs.color), bg = rgbToHex(cs.backgroundColor), bc = rgbToHex(cs.borderColor);
        if (c) add(maps.color, c);
        if (bg) add(maps.bgColor, bg);
        if (bc && bc !== c) add(maps.borderColor, bc);
        add(maps.font, cs.fontFamily);
        add(maps.fontSize, cs.fontSize);
        add(maps.fontWeight, cs.fontWeight);
        add(maps.lineHeight, cs.lineHeight);
        if (cs.letterSpacing !== "normal") add(maps.letterSpacing, cs.letterSpacing);
        for (const p of ["marginTop","marginBottom","paddingTop","paddingBottom","paddingLeft","paddingRight","gap"]) {
          const v = cs[p]; if (v && v !== "0px" && v !== "auto") add(maps.spacing, v);
        }
        if (cs.borderRadius !== "0px") add(maps.radius, cs.borderRadius);
        if (cs.boxShadow !== "none") add(maps.shadow, cs.boxShadow);
        if (cs.transition && !cs.transition.includes("0s ease 0s")) add(maps.transition, cs.transition);
        if (cs.zIndex !== "auto") add(maps.zIndex, cs.zIndex);
        if (cs.opacity !== "1") add(maps.opacity, cs.opacity);
        add(maps.display, cs.display);
        add(maps.position, cs.position);

        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        const base = { fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: c, bgColor: bg,
          borderRadius: cs.borderRadius, padding: cs.padding, border: cs.border, boxShadow: cs.boxShadow,
          transition: cs.transition, width: Math.round(rect.width), height: Math.round(rect.height) };

        if (tag === "button" || el.getAttribute("role") === "button" || el.classList.toString().match(/btn|button/i))
          componentData.buttons.push({ text: el.textContent.trim().slice(0, 50), classes: el.className?.toString()?.slice(0, 100) || "", ...base });
        if (tag === "input" || tag === "textarea" || tag === "select")
          componentData.inputs.push({ type: el.type || tag, placeholder: el.placeholder || "", ...base });
        if (tag === "a" && el.getAttribute("role") !== "button")
          componentData.links.push({ text: el.textContent.trim().slice(0, 50), href: (el.href || "").slice(0, 100), textDecoration: cs.textDecoration, ...base });
        if (/^h[1-6]$/.test(tag))
          componentData.headings.push({ level: parseInt(tag[1]), text: el.textContent.trim().slice(0, 100), letterSpacing: cs.letterSpacing, textTransform: cs.textTransform, fontFamily: cs.fontFamily, lineHeight: cs.lineHeight, ...base });
        if (cs.boxShadow !== "none" && cs.borderRadius !== "0px" && parseInt(cs.padding) > 8 && rect.width > 100 && rect.height > 80)
          componentData.cards.push({ tag, classes: el.className?.toString()?.slice(0, 100) || "", ...base });
        if (tag === "nav" || el.getAttribute("role") === "navigation")
          componentData.nav.push({ ...base, childCount: el.children.length, position: cs.position });
        if (rect.width < 200 && rect.height < 40 && rect.height > 16 && bg && bg !== "#ffffff" && bg !== "#000000" && cs.borderRadius !== "0px") {
          const t = el.textContent.trim();
          if (t.length > 0 && t.length < 30) componentData.badges.push({ text: t, ...base });
        }
      }
      return { maps, componentData };
    });

    // ═══ 3. CSS VARIABLES ═══════════════════════════════════
    log("Extracting CSS custom properties...");
    const cssVars = await page.evaluate(() => {
      const vars = {};
      const rootStyle = getComputedStyle(document.documentElement);
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === ":root" || rule.selectorText === "html") {
              for (const prop of rule.style) {
                if (prop.startsWith("--")) vars[prop] = rootStyle.getPropertyValue(prop).trim();
              }
            }
          }
        } catch (e) {}
      }
      return vars;
    });

    // ═══ 4. BRAND VOICE & CONTENT ═══════════════════════════
    log("Analyzing brand voice and content...");
    const content = await page.evaluate(() => {
      const result = {
        allText: [],
        headingTexts: [],
        ctaTexts: [],
        paragraphs: [],
        listItems: [],
        testimonials: [],
        stats: [],
        microcopy: [],
        errorMessages: [],
        emptyStates: [],
        labels: [],
        placeholders: [],
        wordFrequency: {},
        sentenceLengths: [],
        punctuation: { exclamation: 0, question: 0, period: 0, ellipsis: 0, emoji: 0 },
        capitalization: { allCaps: 0, titleCase: 0, sentenceCase: 0, lower: 0 },
        pronouns: { we: 0, you: 0, i: 0, they: 0, our: 0, your: 0 },
        toneSignals: { informal: 0, formal: 0, technical: 0, playful: 0, urgent: 0 },
      };

      // Headings
      for (const h of document.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
        const t = h.textContent.trim();
        if (t.length > 0 && t.length < 200) result.headingTexts.push(t);
      }

      // Paragraphs
      for (const p of document.querySelectorAll("p")) {
        const t = p.textContent.trim();
        if (t.length > 20 && t.length < 1000) {
          result.paragraphs.push(t);
          // Sentence analysis
          const sentences = t.split(/[.!?]+/).filter(s => s.trim().length > 5);
          for (const s of sentences) {
            result.sentenceLengths.push(s.trim().split(/\s+/).length);
          }
        }
      }

      // CTA text from buttons and prominent links
      for (const el of document.querySelectorAll("button, a[class*='btn'], a[class*='cta'], a[role='button'], [class*='hero'] a")) {
        const t = el.textContent.trim();
        if (t.length > 0 && t.length < 60) result.ctaTexts.push(t);
      }

      // Form labels and placeholders
      for (const el of document.querySelectorAll("label")) {
        const t = el.textContent.trim();
        if (t.length > 0 && t.length < 80) result.labels.push(t);
      }
      for (const el of document.querySelectorAll("input[placeholder], textarea[placeholder]")) {
        if (el.placeholder) result.placeholders.push(el.placeholder);
      }

      // List items
      for (const li of document.querySelectorAll("li")) {
        const t = li.textContent.trim();
        if (t.length > 5 && t.length < 200) result.listItems.push(t);
      }

      // Microcopy (small text elements)
      for (const el of document.querySelectorAll("small, .caption, .hint, .help-text, [class*='helper'], [class*='description'], [class*='subtitle']")) {
        const t = el.textContent.trim();
        if (t.length > 0 && t.length < 200) result.microcopy.push(t);
      }

      // Collect all visible text for analysis
      const textEls = document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,button,a,span,label,td,th");
      for (const el of textEls) {
        const t = el.textContent.trim();
        if (t.length > 2 && t.length < 200) {
          result.allText.push(t);
          // Word frequency
          const words = t.toLowerCase().split(/\s+/);
          for (const w of words) {
            const clean = w.replace(/[^a-z']/g, "");
            if (clean.length > 3) result.wordFrequency[clean] = (result.wordFrequency[clean] || 0) + 1;
          }
        }
      }

      // Analyze text patterns
      for (const text of result.allText) {
        // Punctuation
        result.punctuation.exclamation += (text.match(/!/g) || []).length;
        result.punctuation.question += (text.match(/\?/g) || []).length;
        result.punctuation.period += (text.match(/\./g) || []).length;
        result.punctuation.ellipsis += (text.match(/\.\.\./g) || []).length;
        result.punctuation.emoji += (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu) || []).length;

        // Capitalization
        if (text === text.toUpperCase() && text.length > 3) result.capitalization.allCaps++;
        else if (/^[A-Z][a-z]/.test(text)) result.capitalization.sentenceCase++;

        // Pronouns
        const lower = text.toLowerCase();
        if (/\bwe\b|\bour\b|\bus\b/.test(lower)) { result.pronouns.we++; result.pronouns.our++; }
        if (/\byou\b|\byour\b|\byours\b/.test(lower)) { result.pronouns.you++; result.pronouns.your++; }

        // Tone signals
        if (/\bhey\b|\bcool\b|\bawesome\b|\bwow\b|\byeah\b|!{2,}/i.test(text)) result.toneSignals.playful++;
        if (/\bplease\b|\bkindly\b|\bthank you\b|\bwe appreciate\b/i.test(text)) result.toneSignals.formal++;
        if (/\bAPI\b|\bSDK\b|\bCLI\b|\bendpoint\b|\bconfig\b|\bdeploy\b/i.test(text)) result.toneSignals.technical++;
        if (/\blimited\b|\bhurry\b|\bnow\b|\btoday\b|\bdon't miss\b/i.test(text)) result.toneSignals.urgent++;
        if (/\bjust\b|\bsimply\b|\beasy\b|\bquick\b|\bno worries\b/i.test(text)) result.toneSignals.informal++;
      }

      return result;
    });

    // ═══ 5. INFORMATION ARCHITECTURE ════════════════════════
    log("Mapping information architecture...");
    const architecture = await page.evaluate(() => {
      const result = {
        navLinks: [],
        footerLinks: [],
        internalLinks: [],
        externalLinks: [],
        anchorLinks: [],
        sections: [],
        landmarks: {},
        headingHierarchy: [],
        breadcrumbs: [],
        pagination: false,
        search: false,
        sidebarNav: false,
        tabNav: false,
        dropdowns: 0,
        modals: 0,
        accordions: 0,
        depth: 0,
      };

      // Navigation links
      for (const nav of document.querySelectorAll("nav, [role='navigation']")) {
        for (const a of nav.querySelectorAll("a")) {
          const text = a.textContent.trim();
          const href = a.href || "";
          if (text.length > 0 && text.length < 60) {
            result.navLinks.push({ text, href: href.slice(0, 150), isExternal: href.startsWith("http") && !href.includes(location.hostname) });
          }
        }
      }

      // Footer links
      const footer = document.querySelector("footer, [role='contentinfo']");
      if (footer) {
        for (const a of footer.querySelectorAll("a")) {
          const text = a.textContent.trim();
          if (text.length > 0 && text.length < 60) result.footerLinks.push({ text, href: (a.href || "").slice(0, 150) });
        }
      }

      // All links categorized
      for (const a of document.querySelectorAll("a[href]")) {
        const href = a.href || "";
        if (href.startsWith("#")) result.anchorLinks.push(href);
        else if (href.includes(location.hostname) || href.startsWith("/")) result.internalLinks.push(href.slice(0, 150));
        else if (href.startsWith("http")) result.externalLinks.push(href.slice(0, 150));
      }

      // Sections
      for (const section of document.querySelectorAll("section, [role='region']")) {
        const id = section.id || "";
        const heading = section.querySelector("h1, h2, h3");
        result.sections.push({
          id,
          heading: heading?.textContent?.trim()?.slice(0, 100) || "",
          childCount: section.children.length,
        });
      }

      // Landmarks
      for (const tag of ["header", "main", "footer", "aside", "nav", "section", "article"]) {
        const count = document.querySelectorAll(tag).length;
        if (count > 0) result.landmarks[tag] = count;
      }

      // Heading hierarchy
      for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
        const rect = h.getBoundingClientRect();
        if (rect.width > 0) result.headingHierarchy.push({ level: parseInt(h.tagName[1]), text: h.textContent.trim().slice(0, 80) });
      }

      // Breadcrumbs
      const bc = document.querySelector("[class*='breadcrumb'], [aria-label*='breadcrumb'], nav[class*='bread']");
      if (bc) {
        for (const a of bc.querySelectorAll("a, span")) {
          const t = a.textContent.trim();
          if (t.length > 0 && t.length < 40) result.breadcrumbs.push(t);
        }
      }

      // Pattern detection
      result.search = !!document.querySelector("input[type='search'], [role='search'], [class*='search'], input[placeholder*='earch']");
      result.pagination = !!document.querySelector("[class*='pagination'], [aria-label*='pagination'], .page-numbers");
      result.sidebarNav = !!document.querySelector("aside nav, [class*='sidebar'] nav, [class*='side-nav']");
      result.tabNav = !!document.querySelector("[role='tablist'], [class*='tabs']");
      result.dropdowns = document.querySelectorAll("[class*='dropdown'], [class*='menu'], details").length;
      result.accordions = document.querySelectorAll("[class*='accordion'], details, [class*='collapsible'], [class*='expandable']").length;

      // Nesting depth
      let maxDepth = 0;
      function measureDepth(el, depth) {
        if (depth > maxDepth) maxDepth = depth;
        if (depth > 15) return;
        for (const child of el.children) measureDepth(child, depth + 1);
      }
      measureDepth(document.body, 0);
      result.depth = Math.min(maxDepth, 30);

      return result;
    });

    // ═══ 6. UX PATTERNS ═════════════════════════════════════
    log("Detecting UX patterns...");
    const uxPatterns = await page.evaluate(() => {
      const result = {
        ctas: [],
        forms: [],
        socialProof: [],
        pricing: false,
        hero: null,
        testimonials: false,
        faq: false,
        newsletter: false,
        chatWidget: false,
        cookieBanner: false,
        notifications: false,
        progressIndicators: false,
        infiniteScroll: false,
        stickyElements: [],
        overlays: 0,
        carousels: 0,
        videoEmbeds: 0,
        maps: 0,
        animations: 0,
        loadingPatterns: [],
        scrollBehavior: { smooth: false, snapPoints: false, parallax: false },
        interactionDensity: 0,
      };

      // CTAs
      const ctaEls = document.querySelectorAll("button, a[class*='btn'], a[class*='cta'], a[role='button'], [class*='hero'] a, input[type='submit']");
      for (const el of ctaEls) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) continue;
        const cs = getComputedStyle(el);
        result.ctas.push({
          text: el.textContent.trim().slice(0, 50),
          position: rect.y < 600 ? "above-fold" : "below-fold",
          prominence: rect.width > 150 ? "high" : "medium",
          bgColor: cs.backgroundColor,
          fontSize: cs.fontSize,
        });
      }

      // Forms
      for (const form of document.querySelectorAll("form")) {
        const inputs = form.querySelectorAll("input:not([type='hidden']):not([type='submit']), textarea, select");
        const submit = form.querySelector("button[type='submit'], input[type='submit'], button:not([type])");
        result.forms.push({
          fields: inputs.length,
          submitText: submit?.textContent?.trim()?.slice(0, 40) || "",
          action: form.action?.slice(0, 100) || "",
          method: form.method || "get",
        });
      }

      // Social proof signals
      for (const el of document.querySelectorAll("[class*='testimonial'], [class*='review'], [class*='quote'], blockquote")) {
        result.socialProof.push(el.textContent.trim().slice(0, 200));
        result.testimonials = true;
      }

      // Hero section
      const heroEl = document.querySelector("[class*='hero'], [class*='banner'], header + section, main > section:first-child");
      if (heroEl) {
        const h = heroEl.querySelector("h1, h2");
        const p = heroEl.querySelector("p");
        const cta = heroEl.querySelector("a, button");
        result.hero = {
          headline: h?.textContent?.trim()?.slice(0, 150) || "",
          subheadline: p?.textContent?.trim()?.slice(0, 200) || "",
          cta: cta?.textContent?.trim()?.slice(0, 50) || "",
          hasImage: !!heroEl.querySelector("img, video, [class*='image']"),
        };
      }

      // Pattern detection
      result.pricing = !!document.querySelector("[class*='pricing'], [class*='plan'], [class*='tier']");
      result.faq = !!document.querySelector("[class*='faq'], [class*='frequently'], [itemtype*='FAQPage']");
      result.newsletter = !!document.querySelector("[class*='newsletter'], [class*='subscribe'], input[type='email']");
      result.chatWidget = !!document.querySelector("[class*='chat'], [class*='intercom'], [class*='drift'], [class*='crisp'], [class*='zendesk'], iframe[src*='chat']");
      result.cookieBanner = !!document.querySelector("[class*='cookie'], [class*='consent'], [class*='gdpr'], [id*='cookie']");
      result.carousels = document.querySelectorAll("[class*='carousel'], [class*='slider'], [class*='swiper'], .slick-track").length;
      result.videoEmbeds = document.querySelectorAll("video, iframe[src*='youtube'], iframe[src*='vimeo'], iframe[src*='wistia']").length;
      result.maps = document.querySelectorAll("iframe[src*='google.com/maps'], [class*='map'], .mapboxgl-map").length;
      result.notifications = !!document.querySelector("[class*='toast'], [class*='notification'], [class*='alert'], [role='alert']");
      result.progressIndicators = !!document.querySelector("[class*='progress'], progress, [role='progressbar'], [class*='stepper']");

      // Sticky elements
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.position === "sticky" || cs.position === "fixed") {
          const rect = el.getBoundingClientRect();
          if (rect.width > 100 && rect.height > 20) {
            result.stickyElements.push({ tag: el.tagName.toLowerCase(), position: cs.position, height: Math.round(rect.height) });
          }
        }
      }

      // Scroll behavior
      result.scrollBehavior.smooth = getComputedStyle(document.documentElement).scrollBehavior === "smooth";

      // Animation count
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== "none") result.animations++;
      }

      // Interactive element density
      const interactive = document.querySelectorAll("a, button, input, select, textarea, [tabindex], [onclick], [role='button']");
      result.interactionDensity = interactive.length;

      return result;
    });

    // ═══ 7. COMPONENT BEHAVIOR ══════════════════════════════
    log("Analyzing component behavior...");
    const behavior = await page.evaluate(() => {
      const result = {
        formValidation: { html5: 0, custom: 0, inline: false, patterns: [] },
        interactiveStates: [],
        focusManagement: { focusVisible: false, focusTrap: false, skipLink: false },
        loadingStates: [],
        errorHandling: [],
        tooltips: 0,
        popovers: 0,
        modals: 0,
        drawers: 0,
        toasts: 0,
        datePickers: 0,
        fileUploads: 0,
        richTextEditors: 0,
        autoComplete: 0,
        dragDrop: false,
        keyboardShortcuts: [],
        clipboardActions: false,
        undoRedo: false,
      };

      // Form validation patterns
      for (const input of document.querySelectorAll("input, textarea, select")) {
        if (input.required) result.formValidation.html5++;
        if (input.pattern) result.formValidation.patterns.push(input.pattern);
        const errorEl = input.parentElement?.querySelector("[class*='error'], [class*='invalid'], [class*='validation']");
        if (errorEl) result.formValidation.custom++;
      }
      result.formValidation.inline = result.formValidation.custom > 0;

      // Focus management
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText?.includes(":focus-visible") || rule.selectorText?.includes(":focus"))
              result.focusManagement.focusVisible = true;
          }
        } catch (e) {}
      }
      result.focusManagement.skipLink = !!document.querySelector("a[href='#main'], a[href='#content'], a.skip-link");

      // UI patterns
      result.tooltips = document.querySelectorAll("[data-tooltip], [title], [class*='tooltip'], [role='tooltip']").length;
      result.popovers = document.querySelectorAll("[class*='popover'], [data-popover]").length;
      result.modals = document.querySelectorAll("[class*='modal'], [role='dialog'], dialog").length;
      result.drawers = document.querySelectorAll("[class*='drawer'], [class*='sidebar'][class*='mobile']").length;
      result.toasts = document.querySelectorAll("[class*='toast'], [class*='snackbar']").length;
      result.datePickers = document.querySelectorAll("input[type='date'], [class*='datepicker'], [class*='calendar']").length;
      result.fileUploads = document.querySelectorAll("input[type='file'], [class*='dropzone'], [class*='upload']").length;
      result.autoComplete = document.querySelectorAll("[class*='autocomplete'], [class*='combobox'], [role='combobox'], datalist").length;
      result.dragDrop = !!document.querySelector("[draggable='true'], [class*='draggable'], [class*='sortable']");

      return result;
    });

    // ═══ 8. MOTION SYSTEM ═══════════════════════════════════
    log("Extracting motion system...");
    const motion = await page.evaluate(() => {
      const result = { transitions: {}, durations: {}, easings: {}, keyframes: [], animatedElements: 0 };
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const tr = cs.transition;
        if (tr && !tr.includes("0s ease 0s") && tr !== "none 0s ease 0s") {
          const parts = tr.split(",").map(p => p.trim());
          for (const part of parts) {
            const tokens = part.split(/\s+/);
            if (tokens.length >= 2) {
              result.transitions[tokens[0]] = (result.transitions[tokens[0]] || 0) + 1;
              result.durations[tokens[1]] = (result.durations[tokens[1]] || 0) + 1;
              if (tokens[2]) result.easings[tokens[2]] = (result.easings[tokens[2]] || 0) + 1;
            }
          }
        }
        if (cs.animationName && cs.animationName !== "none") result.animatedElements++;
      }
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) { if (rule instanceof CSSKeyframesRule) result.keyframes.push({ name: rule.name, steps: rule.cssRules.length }); } } catch (e) {}
      }
      return result;
    });

    // ═══ 9. ACCESSIBILITY ═══════════════════════════════════
    log("Running accessibility audit...");
    const accessibility = await page.evaluate(() => {
      const a = { contrastIssues: [], missingAlt: 0, ariaRoles: {}, ariaLabels: 0, focusVisible: false, skipLink: false,
        landmarks: {}, headingOrder: [], tabIndex: { positive: 0, zero: 0, negative: 0 },
        formLabels: { labeled: 0, unlabeled: 0 }, liveRegions: 0, reducedMotion: false };

      function luminance(hex) {
        if (!hex?.startsWith("#") || hex.length !== 7) return null;
        const rgb = [1, 3, 5].map(i => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      }
      function rgbToHex(rgb) {
        if (!rgb || rgb === "transparent") return null;
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? "#" + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, "0")).join("") : null;
      }

      let checked = 0;
      for (const el of document.querySelectorAll("p, span, a, h1, h2, h3, h4, h5, h6, li, button, label")) {
        if (checked > 150) break;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) continue;
        const cs = getComputedStyle(el);
        const fg = rgbToHex(cs.color), bg = rgbToHex(cs.backgroundColor);
        if (fg && bg) {
          const l1 = luminance(fg), l2 = luminance(bg);
          if (l1 !== null && l2 !== null) {
            const ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
            if (ratio < 4.5) a.contrastIssues.push({ text: el.textContent.trim().slice(0, 30), fg, bg, ratio, tag: el.tagName.toLowerCase() });
          }
          checked++;
        }
      }

      for (const img of document.querySelectorAll("img")) { if (!img.alt && !img.getAttribute("aria-label")) a.missingAlt++; }
      for (const el of document.querySelectorAll("[role]")) { const r = el.getAttribute("role"); a.ariaRoles[r] = (a.ariaRoles[r] || 0) + 1; }
      a.ariaLabels = document.querySelectorAll("[aria-label], [aria-labelledby]").length;
      a.skipLink = !!document.querySelector("a[href='#main'], a[href='#content'], a.skip-link");
      for (const tag of ["header", "main", "footer", "aside", "nav", "section", "article"]) { const c = document.querySelectorAll(tag).length; if (c > 0) a.landmarks[tag] = c; }
      for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) { const rect = h.getBoundingClientRect(); if (rect.width > 0) a.headingOrder.push(parseInt(h.tagName[1])); }
      for (const el of document.querySelectorAll("[tabindex]")) { const ti = parseInt(el.getAttribute("tabindex")); if (ti > 0) a.tabIndex.positive++; else if (ti === 0) a.tabIndex.zero++; else a.tabIndex.negative++; }
      for (const input of document.querySelectorAll("input:not([type='hidden']):not([type='submit']), select, textarea")) {
        const hasLabel = (input.id && document.querySelector(`label[for="${input.id}"]`)) || input.getAttribute("aria-label") || input.getAttribute("aria-labelledby");
        if (hasLabel) a.formLabels.labeled++; else a.formLabels.unlabeled++;
      }
      a.liveRegions = document.querySelectorAll("[aria-live], [role='status'], [role='alert'], [role='log']").length;

      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) { if (rule.conditionText?.includes("prefers-reduced-motion") || rule.selectorText?.includes(":focus-visible")) { a.reducedMotion = a.reducedMotion || rule.conditionText?.includes("reduced-motion"); a.focusVisible = a.focusVisible || rule.selectorText?.includes("focus"); } if (rule.cssRules) { for (const inner of rule.cssRules) { if (inner.conditionText?.includes("prefers-reduced-motion")) a.reducedMotion = true; } } } } catch (e) {}
      }
      return a;
    });

    // ═══ 10. SEO STRUCTURE ══════════════════════════════════
    log("Analyzing SEO structure...");
    const seo = await page.evaluate(() => {
      const result = {
        titleLength: document.title?.length || 0,
        descriptionLength: (document.querySelector('meta[name="description"]')?.content || "").length,
        h1Count: document.querySelectorAll("h1").length,
        h1Text: document.querySelector("h1")?.textContent?.trim()?.slice(0, 100) || "",
        imageAltCoverage: 0,
        internalLinkCount: 0,
        externalLinkCount: 0,
        structuredData: [],
        openGraph: {},
        twitter: {},
        hreflang: [],
        sitemap: !!document.querySelector('link[rel="sitemap"]'),
        ampVersion: !!document.querySelector('link[rel="amphtml"]'),
        preconnects: [],
        prefetches: [],
        lazyImages: 0,
        totalImages: 0,
      };

      // Image alt coverage
      const imgs = document.querySelectorAll("img");
      result.totalImages = imgs.length;
      let withAlt = 0;
      for (const img of imgs) { if (img.alt) withAlt++; if (img.loading === "lazy") result.lazyImages++; }
      result.imageAltCoverage = imgs.length > 0 ? Math.round((withAlt / imgs.length) * 100) : 100;

      // Links
      for (const a of document.querySelectorAll("a[href]")) {
        const href = a.href || "";
        if (href.includes(location.hostname) || href.startsWith("/")) result.internalLinkCount++;
        else if (href.startsWith("http")) result.externalLinkCount++;
      }

      // Structured data
      for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        try { const data = JSON.parse(script.textContent); result.structuredData.push(data["@type"] || "Unknown"); } catch (e) {}
      }

      // OpenGraph
      for (const meta of document.querySelectorAll('meta[property^="og:"]')) {
        result.openGraph[meta.getAttribute("property")] = (meta.content || "").slice(0, 200);
      }

      // Twitter
      for (const meta of document.querySelectorAll('meta[name^="twitter:"]')) {
        result.twitter[meta.getAttribute("name")] = (meta.content || "").slice(0, 200);
      }

      // Performance hints
      for (const link of document.querySelectorAll("link[rel='preconnect']")) result.preconnects.push(link.href);
      for (const link of document.querySelectorAll("link[rel='prefetch'], link[rel='preload']")) result.prefetches.push({ href: link.href?.slice(0, 100), as: link.getAttribute("as") || "" });

      return result;
    });

    // ═══ 11. TECHNOLOGY STACK ═══════════════════════════════
    log("Detecting technology stack...");
    const techStack = await page.evaluate(() => {
      const result = {
        frameworks: [],
        libraries: [],
        analytics: [],
        fonts: { urls: [], faces: [] },
        buildTools: [],
        hosting: [],
        cssFramework: null,
        jsFramework: null,
        meta: {},
      };

      // React
      if (document.querySelector("[data-reactroot], [data-reactid]") || document.querySelector("#__next") || window.__NEXT_DATA__)
        result.frameworks.push("React");
      if (document.querySelector("#__next") || window.__NEXT_DATA__) result.frameworks.push("Next.js");
      if (document.querySelector("#__nuxt") || window.__NUXT__) result.frameworks.push("Nuxt.js");
      if (document.querySelector("[data-v-]") || document.querySelector("[class*='v-']")) result.frameworks.push("Vue.js");
      if (document.querySelector("[_ngcontent]") || document.querySelector("[ng-version]")) result.frameworks.push("Angular");
      if (document.querySelector("[data-svelte-h]") || document.querySelector("[class^='svelte-']")) result.frameworks.push("Svelte");
      if (document.querySelector("#gatsby-focus-wrapper")) result.frameworks.push("Gatsby");
      if (document.querySelector("[data-astro-cid]")) result.frameworks.push("Astro");
      if (document.querySelector("meta[name='generator'][content*='Hugo']")) result.frameworks.push("Hugo");
      if (document.querySelector("meta[name='generator'][content*='WordPress']")) result.frameworks.push("WordPress");
      if (document.querySelector("meta[name='generator'][content*='Webflow']")) result.frameworks.push("Webflow");
      if (document.querySelector("[class*='wf-']")) result.frameworks.push("Webflow");
      if (document.querySelector("[data-wf-site]")) result.frameworks.push("Webflow");
      if (document.querySelector("[class*='framer-']")) result.frameworks.push("Framer");
      if (document.querySelector("[class*='notion-']")) result.frameworks.push("Notion");

      // CSS frameworks
      const varKeys = [];
      const rootStyle = getComputedStyle(document.documentElement);
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) { if (rule.selectorText === ":root") { for (const prop of rule.style) { if (prop.startsWith("--")) varKeys.push(prop); } } } } catch (e) {}
      }
      if (varKeys.some(k => k.startsWith("--tw-"))) result.cssFramework = "Tailwind CSS";
      else if (varKeys.some(k => k.startsWith("--bs-"))) result.cssFramework = "Bootstrap";
      else if (varKeys.some(k => k.startsWith("--chakra-"))) result.cssFramework = "Chakra UI";
      else if (varKeys.some(k => k.startsWith("--mui-"))) result.cssFramework = "Material UI";
      else if (varKeys.some(k => k.startsWith("--ant-"))) result.cssFramework = "Ant Design";

      // Analytics
      if (window.gtag || document.querySelector("script[src*='gtag']") || document.querySelector("script[src*='google-analytics']")) result.analytics.push("Google Analytics");
      if (window._paq || document.querySelector("script[src*='matomo']")) result.analytics.push("Matomo");
      if (document.querySelector("script[src*='segment']") || window.analytics) result.analytics.push("Segment");
      if (document.querySelector("script[src*='hotjar']") || window.hj) result.analytics.push("Hotjar");
      if (document.querySelector("script[src*='mixpanel']")) result.analytics.push("Mixpanel");
      if (document.querySelector("script[src*='amplitude']")) result.analytics.push("Amplitude");
      if (document.querySelector("script[src*='plausible']")) result.analytics.push("Plausible");
      if (document.querySelector("script[src*='posthog']")) result.analytics.push("PostHog");

      // Fonts
      for (const link of document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="font"]')) {
        const href = link.href || "";
        if (href.includes("fonts.googleapis.com") || href.includes("use.typekit.net") || href.match(/\.woff2?|\.ttf/))
          result.fonts.urls.push(href);
      }
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) { if (rule instanceof CSSFontFaceRule) { result.fonts.faces.push({ family: rule.style.getPropertyValue("font-family").replace(/["']/g, "").trim(), weight: rule.style.getPropertyValue("font-weight") || "400" }); } } } catch (e) {}
      }

      // Hosting hints
      const scripts = [...document.querySelectorAll("script[src]")].map(s => s.src);
      if (scripts.some(s => s.includes("vercel"))) result.hosting.push("Vercel");
      if (scripts.some(s => s.includes("netlify"))) result.hosting.push("Netlify");
      if (scripts.some(s => s.includes("cloudflare"))) result.hosting.push("Cloudflare");
      if (document.querySelector("meta[name='generator'][content*='Shopify']")) result.hosting.push("Shopify");

      return result;
    });

    // ═══ 12. PERFORMANCE SIGNALS ════════════════════════════
    log("Collecting performance signals...");
    const performance = await page.evaluate(() => {
      const result = {
        resourceCount: 0,
        scriptCount: document.querySelectorAll("script[src]").length,
        stylesheetCount: document.querySelectorAll("link[rel='stylesheet']").length,
        inlineScripts: document.querySelectorAll("script:not([src])").length,
        inlineStyles: document.querySelectorAll("style").length,
        imageCount: document.querySelectorAll("img").length,
        lazyImages: document.querySelectorAll("img[loading='lazy']").length,
        asyncScripts: document.querySelectorAll("script[async]").length,
        deferScripts: document.querySelectorAll("script[defer]").length,
        preloads: document.querySelectorAll("link[rel='preload']").length,
        preconnects: document.querySelectorAll("link[rel='preconnect']").length,
        serviceWorker: !!navigator.serviceWorker?.controller,
        webWorkers: 0,
        domNodeCount: document.querySelectorAll("*").length,
        thirdPartyScripts: 0,
      };

      const hostname = location.hostname;
      for (const script of document.querySelectorAll("script[src]")) {
        if (script.src && !script.src.includes(hostname)) result.thirdPartyScripts++;
      }
      result.resourceCount = result.scriptCount + result.stylesheetCount + result.imageCount;

      return result;
    });

    // ═══ 13. DARK MODE ══════════════════════════════════════
    let darkMode = null;
    if (extractDark) {
      log("Extracting dark mode tokens...");
      darkMode = await page.evaluate(() => {
        const vars = {};
        for (const sheet of document.styleSheets) {
          try {
            const scan = (rules) => {
              for (const rule of rules) {
                if (rule instanceof CSSMediaRule && rule.conditionText?.includes("prefers-color-scheme: dark")) {
                  for (const inner of rule.cssRules) { if (inner.style) { for (const prop of inner.style) { if (prop.startsWith("--")) vars[prop] = inner.style.getPropertyValue(prop).trim(); } } }
                }
                if (rule.selectorText?.includes(".dark") || rule.selectorText?.includes('[data-theme="dark"]')) {
                  if (rule.style) { for (const prop of rule.style) { if (prop.startsWith("--")) vars[prop] = rule.style.getPropertyValue(prop).trim(); } }
                }
                if (rule.cssRules) scan(rule.cssRules);
              }
            };
            scan(sheet.cssRules);
          } catch (e) {}
        }
        return Object.keys(vars).length > 0 ? vars : null;
      });
    }

    // ═══ 14. BREAKPOINTS ════════════════════════════════════
    log("Extracting breakpoints...");
    const breakpoints = await page.evaluate(() => {
      const bps = {};
      for (const sheet of document.styleSheets) {
        try {
          const scan = (rules) => {
            for (const rule of rules) {
              if (rule instanceof CSSMediaRule) {
                const matches = (rule.conditionText || "").match(/(\d+)px/g);
                if (matches) { for (const m of matches) { const px = parseInt(m); if (px >= 320 && px <= 2560) bps[px] = (bps[px] || 0) + rule.cssRules.length; } }
                scan(rule.cssRules);
              }
            }
          };
          scan(sheet.cssRules);
        } catch (e) {}
      }
      return bps;
    });

    // ═══ 15. GRADIENTS ══════════════════════════════════════
    log("Extracting gradients...");
    const gradients = await page.evaluate(() => {
      const result = { backgrounds: {}, text: 0, borders: 0 };
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const bg = cs.backgroundImage;
        if (bg && bg !== "none" && bg.includes("gradient")) {
          result.backgrounds[bg] = (result.backgrounds[bg] || 0) + 1;
        }
        if (cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text") result.text++;
      }
      return result;
    });

    // ═══ 16. ICON & SVG SYSTEM ══════════════════════════════
    log("Detecting icon system...");
    const iconSystem = await page.evaluate(() => {
      const result = { svgInline: 0, svgSprite: 0, iconFont: false, iconFontFamily: "", svgSizes: {}, iconClasses: [], totalIcons: 0 };
      for (const svg of document.querySelectorAll("svg")) {
        const rect = svg.getBoundingClientRect();
        if (rect.width > 0 && rect.width < 64 && rect.height > 0 && rect.height < 64) {
          result.svgInline++;
          const size = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
          result.svgSizes[size] = (result.svgSizes[size] || 0) + 1;
        }
      }
      result.svgSprite = document.querySelectorAll("svg use").length;
      for (const el of document.querySelectorAll("i, span")) {
        const cs = getComputedStyle(el);
        const classes = el.className?.toString() || "";
        if (classes.match(/icon|fa-|material-icons|bi-|feather|lucide|heroicon/i) || cs.fontFamily.match(/icon|fontawesome|material|feather/i)) {
          result.iconFont = true;
          result.iconFontFamily = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
          const match = classes.match(/(fa-\S+|material-icons|bi-\S+|icon-\S+|lucide-\S+)/);
          if (match && result.iconClasses.length < 15) result.iconClasses.push(match[1]);
        }
      }
      result.totalIcons = result.svgInline + result.svgSprite + result.iconClasses.length;
      return result;
    });

    // ═══ 17. IMAGE TREATMENTS ═══════════════════════════════
    log("Analyzing image treatments...");
    const imageTreatments = await page.evaluate(() => {
      const result = { count: 0, lazyLoaded: 0, avgWidth: 0, avgHeight: 0, borderRadius: {}, objectFit: {}, aspectRatios: {}, formats: {}, srcset: 0, decorative: 0, hero: null };
      let totalW = 0, totalH = 0;
      for (const img of document.querySelectorAll("img, picture source, video, [style*='background-image']")) {
        const rect = img.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        result.count++;
        totalW += rect.width; totalH += rect.height;
        const cs = getComputedStyle(img);
        if (cs.borderRadius !== "0px") result.borderRadius[cs.borderRadius] = (result.borderRadius[cs.borderRadius] || 0) + 1;
        if (cs.objectFit && cs.objectFit !== "fill") result.objectFit[cs.objectFit] = (result.objectFit[cs.objectFit] || 0) + 1;
        if (img.loading === "lazy") result.lazyLoaded++;
        if (img.srcset) result.srcset++;
        if (img.alt === "" || img.getAttribute("role") === "presentation") result.decorative++;
        const ratio = Math.round((rect.width / rect.height) * 10) / 10;
        if ([1, 1.3, 1.5, 1.8, 2, 0.6, 0.8].some(r => Math.abs(ratio - r) < 0.15)) {
          result.aspectRatios[`${ratio}:1`] = (result.aspectRatios[`${ratio}:1`] || 0) + 1;
        }
        const src = img.src || img.currentSrc || "";
        const ext = src.match(/\.(webp|avif|svg|png|jpg|jpeg|gif)(\?|$)/i);
        if (ext) result.formats[ext[1].toLowerCase()] = (result.formats[ext[1].toLowerCase()] || 0) + 1;
        if (!result.hero && rect.y < 600 && rect.width > 300) result.hero = { width: Math.round(rect.width), height: Math.round(rect.height), format: ext?.[1] || "unknown" };
      }
      if (result.count > 0) { result.avgWidth = Math.round(totalW / result.count); result.avgHeight = Math.round(totalH / result.count); }
      return result;
    });

    // ═══ 18. INTERACTIVE STATES (hover/focus) ════════════════
    log("Simulating interactive states...");
    const interactiveStates = await extractInteractiveStates(page);

    // ═══ 19. GRID & LAYOUT SYSTEM ═══════════════════════════
    log("Detecting layout system...");
    const layoutSystem = await page.evaluate(() => {
      const result = { flexCount: 0, gridCount: 0, gridTemplates: {}, flexDirections: {}, containerWidths: {}, gapValues: {}, aspectRatios: {}, stickyCount: 0, fixedCount: 0, absoluteCount: 0, overflowHidden: 0, containerQueries: false };
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) continue;
        if (cs.display === "flex" || cs.display === "inline-flex") {
          result.flexCount++;
          result.flexDirections[cs.flexDirection] = (result.flexDirections[cs.flexDirection] || 0) + 1;
        }
        if (cs.display === "grid" || cs.display === "inline-grid") {
          result.gridCount++;
          const tmpl = cs.gridTemplateColumns;
          if (tmpl && tmpl !== "none") {
            const simplified = tmpl.length > 80 ? tmpl.slice(0, 80) + "..." : tmpl;
            result.gridTemplates[simplified] = (result.gridTemplates[simplified] || 0) + 1;
          }
        }
        if (cs.gap && cs.gap !== "normal" && cs.gap !== "0px") result.gapValues[cs.gap] = (result.gapValues[cs.gap] || 0) + 1;
        if (cs.maxWidth !== "none" && cs.maxWidth !== "0px" && cs.maxWidth !== "100%") result.containerWidths[cs.maxWidth] = (result.containerWidths[cs.maxWidth] || 0) + 1;
        if (cs.position === "sticky") result.stickyCount++;
        if (cs.position === "fixed") result.fixedCount++;
        if (cs.position === "absolute") result.absoluteCount++;
        if (cs.overflow === "hidden") result.overflowHidden++;
      }
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) { if (rule instanceof CSSContainerRule || rule.conditionText?.includes("container")) result.containerQueries = true; } } catch (e) {}
      }
      return result;
    });

    // ═══ 20. FONT LOADING STRATEGY ══════════════════════════
    log("Analyzing font loading...");
    const fontLoading = await page.evaluate(() => {
      const result = { preloaded: [], googleFonts: [], typekit: [], fontFaces: [], displaySwap: 0, fontDisplay: {}, totalFonts: 0, customFonts: 0 };
      for (const link of document.querySelectorAll("link[rel='preload'][as='font']")) result.preloaded.push((link.href || "").slice(0, 150));
      for (const link of document.querySelectorAll("link[rel='stylesheet']")) {
        const href = link.href || "";
        if (href.includes("fonts.googleapis.com")) result.googleFonts.push(href);
        if (href.includes("use.typekit.net")) result.typekit.push(href);
      }
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSFontFaceRule) {
              const family = rule.style.getPropertyValue("font-family").replace(/["']/g, "").trim();
              const display = rule.style.getPropertyValue("font-display") || "";
              const weight = rule.style.getPropertyValue("font-weight") || "400";
              const style = rule.style.getPropertyValue("font-style") || "normal";
              result.fontFaces.push({ family, weight, style, display });
              if (display) result.fontDisplay[display] = (result.fontDisplay[display] || 0) + 1;
              if (display === "swap") result.displaySwap++;
              result.customFonts++;
            }
          }
        } catch (e) {}
      }
      result.totalFonts = result.googleFonts.length + result.typekit.length + result.customFonts;
      return result;
    });

    // ═══ 21. SOCIAL LINKS & IDENTITY ════════════════════════
    log("Detecting social presence...");
    const socialLinks = await page.evaluate(() => {
      const platforms = { twitter: /twitter\.com|x\.com/i, github: /github\.com/i, linkedin: /linkedin\.com/i, discord: /discord\.(gg|com)/i, youtube: /youtube\.com/i, instagram: /instagram\.com/i, facebook: /facebook\.com/i, tiktok: /tiktok\.com/i, reddit: /reddit\.com/i, mastodon: /mastodon|fosstodon/i, bluesky: /bsky\.app/i, producthunt: /producthunt\.com/i, hackernews: /news\.ycombinator/i };
      const found = {};
      for (const a of document.querySelectorAll("a[href]")) {
        const href = a.href || "";
        for (const [name, pattern] of Object.entries(platforms)) {
          if (pattern.test(href) && !found[name]) found[name] = href.slice(0, 150);
        }
      }
      return found;
    });

    // ═══ 22. PRICING STRUCTURE ══════════════════════════════
    log("Detecting pricing structure...");
    const pricingData = await page.evaluate(() => {
      const result = { detected: false, tiers: [], currency: "", billingToggle: false, freeTier: false, enterprise: false };
      const pricingSection = document.querySelector("[class*='pricing'], [class*='plan'], [id*='pricing']");
      if (!pricingSection) return result;
      result.detected = true;
      const cards = pricingSection.querySelectorAll("[class*='card'], [class*='plan'], [class*='tier'], [class*='column']");
      for (const card of cards) {
        const name = card.querySelector("h2, h3, [class*='name'], [class*='title']")?.textContent?.trim()?.slice(0, 40) || "";
        const priceEl = card.querySelector("[class*='price'], [class*='amount']");
        const price = priceEl?.textContent?.trim()?.slice(0, 30) || "";
        const cta = card.querySelector("button, a[class*='btn']")?.textContent?.trim()?.slice(0, 30) || "";
        const features = [...card.querySelectorAll("li, [class*='feature']")].map(f => f.textContent.trim().slice(0, 60)).slice(0, 8);
        if (name || price) result.tiers.push({ name, price, cta, featureCount: features.length, features });
        if (/free|starter|\$0|€0/i.test(price + name)) result.freeTier = true;
        if (/enterprise|custom|contact/i.test(price + name + cta)) result.enterprise = true;
      }
      result.billingToggle = !!pricingSection.querySelector("[class*='toggle'], [class*='switch'], [role='tablist']");
      const priceText = pricingSection.textContent || "";
      if (priceText.includes("$")) result.currency = "USD";
      else if (priceText.includes("€")) result.currency = "EUR";
      else if (priceText.includes("£")) result.currency = "GBP";
      return result;
    });

    // ═══ 23. SCROLL PATTERNS ════════════════════════════════
    log("Analyzing scroll patterns...");
    const scrollPatterns = await page.evaluate(() => {
      const result = { smoothScroll: false, scrollSnap: false, parallax: false, stickyHeaders: 0, scrollIndicator: false, backToTop: false, infiniteScroll: false, lazyLoadTrigger: false, revealAnimations: 0 };
      result.smoothScroll = getComputedStyle(document.documentElement).scrollBehavior === "smooth";
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.scrollSnapType && cs.scrollSnapType !== "none") result.scrollSnap = true;
        if (cs.position === "sticky") result.stickyHeaders++;
        const classes = el.className?.toString() || "";
        if (classes.match(/parallax|rellax/i)) result.parallax = true;
        if (classes.match(/reveal|fade-in|slide-up|animate-on-scroll|aos|scroll-trigger/i)) result.revealAnimations++;
      }
      result.backToTop = !!document.querySelector("[class*='back-to-top'], [class*='scroll-top'], a[href='#top'], a[href='#']");
      result.scrollIndicator = !!document.querySelector("[class*='scroll-indicator'], [class*='progress-bar'][class*='scroll']");
      return result;
    });

    // ═══ 24. THIRD-PARTY SERVICES ═══════════════════════════
    log("Detecting third-party services...");
    const thirdPartyServices = await page.evaluate(() => {
      const result = { payments: [], errorTracking: [], cdns: [], maps: [], chat: [], auth: [], email: [], cms: [], ab: [] };
      const scripts = [...document.querySelectorAll("script[src]")].map(s => s.src);
      const links = [...document.querySelectorAll("link[href]")].map(l => l.href);
      const all = [...scripts, ...links].join(" ");

      // Payments
      if (all.match(/stripe/i)) result.payments.push("Stripe");
      if (all.match(/paddle/i)) result.payments.push("Paddle");
      if (all.match(/paypal/i)) result.payments.push("PayPal");
      if (all.match(/lemonsqueezy/i)) result.payments.push("Lemon Squeezy");

      // Error tracking
      if (all.match(/sentry/i)) result.errorTracking.push("Sentry");
      if (all.match(/bugsnag/i)) result.errorTracking.push("Bugsnag");
      if (all.match(/datadog/i)) result.errorTracking.push("Datadog");
      if (all.match(/logrocket/i)) result.errorTracking.push("LogRocket");
      if (all.match(/fullstory/i)) result.errorTracking.push("FullStory");

      // CDNs
      if (all.match(/cloudflare/i)) result.cdns.push("Cloudflare");
      if (all.match(/fastly/i)) result.cdns.push("Fastly");
      if (all.match(/unpkg/i)) result.cdns.push("unpkg");
      if (all.match(/cdnjs/i)) result.cdns.push("cdnjs");
      if (all.match(/jsdelivr/i)) result.cdns.push("jsDelivr");

      // Chat
      if (all.match(/intercom/i)) result.chat.push("Intercom");
      if (all.match(/drift/i)) result.chat.push("Drift");
      if (all.match(/crisp/i)) result.chat.push("Crisp");
      if (all.match(/zendesk/i)) result.chat.push("Zendesk");
      if (all.match(/hubspot/i)) result.chat.push("HubSpot");
      if (all.match(/tawk/i)) result.chat.push("Tawk.to");

      // Auth
      if (all.match(/auth0/i)) result.auth.push("Auth0");
      if (all.match(/clerk/i)) result.auth.push("Clerk");
      if (all.match(/firebase/i)) result.auth.push("Firebase");
      if (all.match(/supabase/i)) result.auth.push("Supabase");

      // Email
      if (all.match(/mailchimp/i)) result.email.push("Mailchimp");
      if (all.match(/convertkit/i)) result.email.push("ConvertKit");
      if (all.match(/sendgrid/i)) result.email.push("SendGrid");
      if (all.match(/resend/i)) result.email.push("Resend");

      // CMS
      if (all.match(/contentful/i)) result.cms.push("Contentful");
      if (all.match(/sanity/i)) result.cms.push("Sanity");
      if (all.match(/strapi/i)) result.cms.push("Strapi");
      if (all.match(/prismic/i)) result.cms.push("Prismic");

      // A/B testing
      if (all.match(/optimizely/i)) result.ab.push("Optimizely");
      if (all.match(/launchdarkly/i)) result.ab.push("LaunchDarkly");
      if (all.match(/split\.io/i)) result.ab.push("Split");
      if (all.match(/statsig/i)) result.ab.push("Statsig");

      return result;
    });

    // ═══ 25. MICRODATA & SCHEMA.ORG ═════════════════════════
    log("Extracting structured data...");
    const schemaData = await page.evaluate(() => {
      const result = { jsonLd: [], microdata: [], openGraph: {}, twitterCards: {} };
      for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const parsed = JSON.parse(script.textContent);
          const type = parsed["@type"] || (Array.isArray(parsed["@graph"]) ? parsed["@graph"].map(g => g["@type"]).join(", ") : "Unknown");
          result.jsonLd.push({ type, hasName: !!parsed.name, hasDescription: !!parsed.description, hasImage: !!parsed.image, hasUrl: !!parsed.url });
        } catch (e) {}
      }
      for (const el of document.querySelectorAll("[itemtype]")) {
        result.microdata.push({ type: el.getAttribute("itemtype").replace("https://schema.org/", "").replace("http://schema.org/", ""), props: [...el.querySelectorAll("[itemprop]")].map(p => p.getAttribute("itemprop")).slice(0, 10) });
      }
      for (const meta of document.querySelectorAll("meta[property^='og:']")) result.openGraph[meta.getAttribute("property").replace("og:", "")] = (meta.content || "").slice(0, 200);
      for (const meta of document.querySelectorAll("meta[name^='twitter:']")) result.twitterCards[meta.getAttribute("name").replace("twitter:", "")] = (meta.content || "").slice(0, 200);
      return result;
    });

    // ═══ 26. COLOR ACCESSIBILITY MATRIX ═════════════════════
    log("Building color accessibility matrix...");
    const colorMatrix = await page.evaluate(() => {
      const textColors = {}, bgColors = {};
      const pairs = [];
      let checked = 0;

      function rgbToHex(rgb) {
        if (!rgb || rgb === "transparent") return null;
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? "#" + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, "0")).join("") : null;
      }
      function lum(hex) {
        if (!hex?.startsWith("#") || hex.length !== 7) return null;
        const rgb = [1, 3, 5].map(i => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      }

      for (const el of document.querySelectorAll("p, span, a, h1, h2, h3, h4, h5, h6, li, button, label, td, th")) {
        if (checked > 200) break;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) continue;
        const cs = getComputedStyle(el);
        const fg = rgbToHex(cs.color), bg = rgbToHex(cs.backgroundColor);
        if (fg && bg && fg !== bg) {
          const l1 = lum(fg), l2 = lum(bg);
          if (l1 !== null && l2 !== null) {
            const ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
            const key = `${fg}|${bg}`;
            if (!pairs.find(p => p.key === key)) {
              pairs.push({
                key, fg, bg, ratio,
                aa: ratio >= 4.5, aaa: ratio >= 7, aaLarge: ratio >= 3,
                sample: el.textContent.trim().slice(0, 30),
              });
            }
          }
          checked++;
        }
      }
      return pairs.sort((a, b) => b.ratio - a.ratio).slice(0, 30);
    });

    // ═══ 27. TYPOGRAPHY DEEP ANALYSIS ════════════════════════
    log("Deep typography analysis...");
    const typographyDeep = await page.evaluate(() => {
      const r = { textAlign: {}, textDecoration: {}, textOverflow: {}, whiteSpace: {}, wordBreak: {}, textIndent: 0, writingModes: {}, fontFeatureSettings: {}, fontVariant: {}, textShadow: {}, lineClamp: 0, hyphens: 0, allCapsCount: 0, italicCount: 0, underlineLinks: 0, noUnderlineLinks: 0, monospacedBlocks: 0, avgCharsPerLine: 0, maxLineWidth: 0 };
      let charSamples = 0, totalChars = 0;
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) continue;
        if (cs.textAlign !== "start" && cs.textAlign !== "left") r.textAlign[cs.textAlign] = (r.textAlign[cs.textAlign] || 0) + 1;
        if (cs.textDecorationLine !== "none") r.textDecoration[cs.textDecorationLine] = (r.textDecoration[cs.textDecorationLine] || 0) + 1;
        if (cs.textOverflow !== "clip") r.textOverflow[cs.textOverflow] = (r.textOverflow[cs.textOverflow] || 0) + 1;
        if (cs.whiteSpace !== "normal") r.whiteSpace[cs.whiteSpace] = (r.whiteSpace[cs.whiteSpace] || 0) + 1;
        if (cs.wordBreak !== "normal") r.wordBreak[cs.wordBreak] = (r.wordBreak[cs.wordBreak] || 0) + 1;
        if (cs.writingMode !== "horizontal-tb") r.writingModes[cs.writingMode] = (r.writingModes[cs.writingMode] || 0) + 1;
        if (cs.fontFeatureSettings !== "normal") r.fontFeatureSettings[cs.fontFeatureSettings] = (r.fontFeatureSettings[cs.fontFeatureSettings] || 0) + 1;
        if (cs.textShadow !== "none") r.textShadow[cs.textShadow] = (r.textShadow[cs.textShadow] || 0) + 1;
        if (cs.webkitLineClamp && cs.webkitLineClamp !== "none") r.lineClamp++;
        if (cs.hyphens === "auto") r.hyphens++;
        if (cs.textTransform === "uppercase") r.allCapsCount++;
        if (cs.fontStyle === "italic") r.italicCount++;
        if (el.tagName === "A") { if (cs.textDecorationLine.includes("underline")) r.underlineLinks++; else r.noUnderlineLinks++; }
        if (cs.fontFamily.match(/mono|courier|consolas/i)) r.monospacedBlocks++;
        const text = el.textContent?.trim() || "";
        if (text.length > 10 && text.length < 500 && rect.width > 100 && charSamples < 50) {
          const charsPerLine = Math.round(text.length / Math.max(rect.height / parseFloat(cs.lineHeight), 1));
          totalChars += charsPerLine; charSamples++;
          if (rect.width > r.maxLineWidth) r.maxLineWidth = Math.round(rect.width);
        }
      }
      r.avgCharsPerLine = charSamples > 0 ? Math.round(totalChars / charSamples) : 0;
      return r;
    });

    // ═══ 28. COLOR CONTEXT ANALYSIS ═════════════════════════
    log("Analyzing color contexts...");
    const colorContext = await page.evaluate(() => {
      const r = { opacityUsage: {}, blendModes: {}, backdropFilters: {}, cssFilters: {}, accentColor: null, colorScheme: null, forcedColors: false, currentColorUsage: 0, transparentUsage: 0, hslUsage: 0, rgbUsage: 0, namedColors: 0 };
      const rootCs = getComputedStyle(document.documentElement);
      r.colorScheme = rootCs.colorScheme !== "normal" ? rootCs.colorScheme : null;
      r.accentColor = rootCs.accentColor !== "auto" ? rootCs.accentColor : null;
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.opacity !== "1") r.opacityUsage[cs.opacity] = (r.opacityUsage[cs.opacity] || 0) + 1;
        if (cs.mixBlendMode !== "normal") r.blendModes[cs.mixBlendMode] = (r.blendModes[cs.mixBlendMode] || 0) + 1;
        if (cs.backdropFilter && cs.backdropFilter !== "none") r.backdropFilters[cs.backdropFilter] = (r.backdropFilters[cs.backdropFilter] || 0) + 1;
        if (cs.filter && cs.filter !== "none") r.cssFilters[cs.filter] = (r.cssFilters[cs.filter] || 0) + 1;
        if (cs.color === "currentcolor" || cs.color === "currentColor") r.currentColorUsage++;
        if (cs.backgroundColor === "transparent" || cs.backgroundColor === "rgba(0, 0, 0, 0)") r.transparentUsage++;
      }
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) { if (rule.cssText) { if (rule.cssText.includes("hsl(") || rule.cssText.includes("hsla(")) r.hslUsage++; if (rule.cssText.match(/forced-colors/)) r.forcedColors = true; } } } catch (e) {}
      }
      return r;
    });

    // ═══ 29. FLEX & GRID DEEP ANALYSIS ══════════════════════
    log("Deep layout analysis...");
    const layoutDeep = await page.evaluate(() => {
      const r = { justifyContent: {}, alignItems: {}, flexWrap: {}, flexGrow: 0, flexShrink: 0, orderUsage: 0, gridAreas: {}, gridAutoFlow: {}, placeItems: {}, columnCount: 0, aspectRatioCSS: {}, subgrid: false, inlineSize: 0, blockSize: 0, logicalProps: 0 };
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.display === "flex" || cs.display === "inline-flex") {
          r.justifyContent[cs.justifyContent] = (r.justifyContent[cs.justifyContent] || 0) + 1;
          r.alignItems[cs.alignItems] = (r.alignItems[cs.alignItems] || 0) + 1;
          if (cs.flexWrap !== "nowrap") r.flexWrap[cs.flexWrap] = (r.flexWrap[cs.flexWrap] || 0) + 1;
        }
        if (cs.flexGrow !== "0") r.flexGrow++;
        if (cs.flexShrink !== "1") r.flexShrink++;
        if (cs.order !== "0") r.orderUsage++;
        if (cs.display === "grid" || cs.display === "inline-grid") {
          if (cs.gridAutoFlow !== "row") r.gridAutoFlow[cs.gridAutoFlow] = (r.gridAutoFlow[cs.gridAutoFlow] || 0) + 1;
          const areas = cs.gridTemplateAreas;
          if (areas && areas !== "none") r.gridAreas[areas.slice(0, 80)] = (r.gridAreas[areas.slice(0, 80)] || 0) + 1;
        }
        if (cs.columnCount && cs.columnCount !== "auto") r.columnCount++;
        if (cs.aspectRatio && cs.aspectRatio !== "auto") r.aspectRatioCSS[cs.aspectRatio] = (r.aspectRatioCSS[cs.aspectRatio] || 0) + 1;
      }
      for (const sheet of document.styleSheets) { try { for (const rule of sheet.cssRules) { if (rule.cssText?.includes("subgrid")) r.subgrid = true; if (rule.cssText?.includes("inline-size") || rule.cssText?.includes("block-size")) r.logicalProps++; } } catch (e) {} }
      return r;
    });

    // ═══ 30. INTERACTION PATTERNS ════════════════════════════
    log("Mapping interaction patterns...");
    const interactionPatterns = await page.evaluate(() => {
      const r = { cursorTypes: {}, pointerEvents: {}, touchAction: {}, userSelect: {}, resize: 0, scrollMargin: 0, scrollPadding: 0, overscrollBehavior: {}, willChange: {}, contentVisibility: 0, contain: {}, scrollbarCustom: false, focusWithin: false, hasHover: false, mediaHover: false };
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.cursor !== "auto" && cs.cursor !== "default") r.cursorTypes[cs.cursor] = (r.cursorTypes[cs.cursor] || 0) + 1;
        if (cs.pointerEvents !== "auto") r.pointerEvents[cs.pointerEvents] = (r.pointerEvents[cs.pointerEvents] || 0) + 1;
        if (cs.touchAction !== "auto") r.touchAction[cs.touchAction] = (r.touchAction[cs.touchAction] || 0) + 1;
        if (cs.userSelect !== "auto") r.userSelect[cs.userSelect] = (r.userSelect[cs.userSelect] || 0) + 1;
        if (cs.resize !== "none") r.resize++;
        if (cs.scrollMarginTop !== "0px") r.scrollMargin++;
        if (cs.scrollPaddingTop !== "auto" && cs.scrollPaddingTop !== "0px") r.scrollPadding++;
        if (cs.overscrollBehavior !== "auto") r.overscrollBehavior[cs.overscrollBehavior] = (r.overscrollBehavior[cs.overscrollBehavior] || 0) + 1;
        if (cs.willChange !== "auto") r.willChange[cs.willChange] = (r.willChange[cs.willChange] || 0) + 1;
        if (cs.contentVisibility === "auto") r.contentVisibility++;
        if (cs.contain !== "none") r.contain[cs.contain] = (r.contain[cs.contain] || 0) + 1;
      }
      for (const sheet of document.styleSheets) { try { for (const rule of sheet.cssRules) { const t = rule.cssText || ""; if (t.includes("::-webkit-scrollbar") || t.includes("scrollbar-width") || t.includes("scrollbar-color")) r.scrollbarCustom = true; if (t.includes(":focus-within")) r.focusWithin = true; if (t.includes(":hover")) r.hasHover = true; if (t.includes("hover: hover")) r.mediaHover = true; } } catch (e) {} }
      return r;
    });

    // ═══ 31. FORM DEEP ANALYSIS ═════════════════════════════
    log("Deep form analysis...");
    const formDeep = await page.evaluate(() => {
      const r = { inputTypes: {}, autocompleteAttrs: {}, requiredCount: 0, patternCount: 0, minMaxLength: 0, fieldsets: 0, legends: 0, inputModes: {}, formMethods: {}, formActions: [], encTypes: {}, datalists: 0, outputElements: 0, meterElements: 0, progressElements: 0, textareaCount: 0, selectCount: 0, radioGroups: 0, checkboxCount: 0, rangeCount: 0, colorInputs: 0, fileInputs: 0, hiddenInputs: 0 };
      for (const input of document.querySelectorAll("input")) {
        const type = input.type || "text";
        r.inputTypes[type] = (r.inputTypes[type] || 0) + 1;
        if (input.autocomplete && input.autocomplete !== "off") r.autocompleteAttrs[input.autocomplete] = (r.autocompleteAttrs[input.autocomplete] || 0) + 1;
        if (input.required) r.requiredCount++;
        if (input.pattern) r.patternCount++;
        if (input.minLength > 0 || input.maxLength > 0) r.minMaxLength++;
        if (input.inputMode) r.inputModes[input.inputMode] = (r.inputModes[input.inputMode] || 0) + 1;
        if (type === "radio") r.radioGroups++;
        if (type === "checkbox") r.checkboxCount++;
        if (type === "range") r.rangeCount++;
        if (type === "color") r.colorInputs++;
        if (type === "file") r.fileInputs++;
        if (type === "hidden") r.hiddenInputs++;
      }
      r.textareaCount = document.querySelectorAll("textarea").length;
      r.selectCount = document.querySelectorAll("select").length;
      r.fieldsets = document.querySelectorAll("fieldset").length;
      r.legends = document.querySelectorAll("legend").length;
      r.datalists = document.querySelectorAll("datalist").length;
      r.outputElements = document.querySelectorAll("output").length;
      r.meterElements = document.querySelectorAll("meter").length;
      r.progressElements = document.querySelectorAll("progress").length;
      for (const form of document.querySelectorAll("form")) {
        r.formMethods[form.method || "get"] = (r.formMethods[form.method || "get"] || 0) + 1;
        if (form.enctype) r.encTypes[form.enctype] = (r.encTypes[form.enctype] || 0) + 1;
      }
      return r;
    });

    // ═══ 32. MEDIA DEEP ANALYSIS ════════════════════════════
    log("Deep media analysis...");
    const mediaDeep = await page.evaluate(() => {
      const r = { pictureElements: 0, sourceElements: 0, videoElements: { count: 0, autoplay: 0, loop: 0, muted: 0, controls: 0, playsInline: 0 }, audioElements: 0, canvasElements: 0, iframesByDomain: {}, svgComplexity: { totalPaths: 0, totalElements: 0, avgPathsPerSvg: 0, viewBoxes: {} }, objectEmbeds: 0, figureElements: 0, figcaptionElements: 0, mapElements: 0, webpCount: 0, avifCount: 0, svgAsImg: 0, dataUriImages: 0, backgroundImages: 0 };
      r.pictureElements = document.querySelectorAll("picture").length;
      r.sourceElements = document.querySelectorAll("source").length;
      for (const v of document.querySelectorAll("video")) { r.videoElements.count++; if (v.autoplay) r.videoElements.autoplay++; if (v.loop) r.videoElements.loop++; if (v.muted) r.videoElements.muted++; if (v.controls) r.videoElements.controls++; if (v.playsInline) r.videoElements.playsInline++; }
      r.audioElements = document.querySelectorAll("audio").length;
      r.canvasElements = document.querySelectorAll("canvas").length;
      for (const iframe of document.querySelectorAll("iframe[src]")) {
        try { const domain = new URL(iframe.src).hostname.replace("www.", ""); r.iframesByDomain[domain] = (r.iframesByDomain[domain] || 0) + 1; } catch (e) {}
      }
      let svgCount = 0;
      for (const svg of document.querySelectorAll("svg")) {
        svgCount++;
        const paths = svg.querySelectorAll("path, circle, rect, line, polygon, polyline, ellipse").length;
        r.svgComplexity.totalPaths += paths;
        r.svgComplexity.totalElements += svg.querySelectorAll("*").length;
        const vb = svg.getAttribute("viewBox");
        if (vb) r.svgComplexity.viewBoxes[vb] = (r.svgComplexity.viewBoxes[vb] || 0) + 1;
      }
      r.svgComplexity.avgPathsPerSvg = svgCount > 0 ? Math.round(r.svgComplexity.totalPaths / svgCount) : 0;
      r.objectEmbeds = document.querySelectorAll("object, embed").length;
      r.figureElements = document.querySelectorAll("figure").length;
      r.figcaptionElements = document.querySelectorAll("figcaption").length;
      for (const img of document.querySelectorAll("img")) {
        const src = img.src || img.currentSrc || "";
        if (src.includes(".webp")) r.webpCount++;
        if (src.includes(".avif")) r.avifCount++;
        if (src.endsWith(".svg") || src.includes(".svg?")) r.svgAsImg++;
        if (src.startsWith("data:")) r.dataUriImages++;
      }
      for (const el of document.querySelectorAll("*")) { const bg = getComputedStyle(el).backgroundImage; if (bg && bg !== "none" && bg.includes("url(")) r.backgroundImages++; }
      return r;
    });

    // ═══ 33. NAVIGATION DEEP ANALYSIS ═══════════════════════
    log("Deep navigation analysis...");
    const navDeep = await page.evaluate(() => {
      const r = { targetBlank: 0, noopener: 0, noreferrer: 0, relTypes: {}, telLinks: 0, mailtoLinks: 0, downloadLinks: 0, hashLinks: 0, protocolLinks: {}, ariaCurrentLinks: 0, activeClassLinks: 0, nestedNavDepth: 0, megaMenu: false, sidebarLinks: 0, footerColumns: 0, legalLinks: [], sitemap: false, linksBySection: {} };
      for (const a of document.querySelectorAll("a")) {
        const href = a.href || "";
        const target = a.target || "";
        const rel = a.rel || "";
        if (target === "_blank") r.targetBlank++;
        if (rel.includes("noopener")) r.noopener++;
        if (rel.includes("noreferrer")) r.noreferrer++;
        if (rel) { for (const rt of rel.split(/\s+/)) r.relTypes[rt] = (r.relTypes[rt] || 0) + 1; }
        if (href.startsWith("tel:")) r.telLinks++;
        if (href.startsWith("mailto:")) r.mailtoLinks++;
        if (a.download !== undefined && a.download !== null && a.hasAttribute("download")) r.downloadLinks++;
        if (href.startsWith("#")) r.hashLinks++;
        const text = a.textContent.trim().toLowerCase();
        if (["privacy", "terms", "cookie", "legal", "imprint", "gdpr"].some(w => text.includes(w))) r.legalLinks.push(text.slice(0, 30));
        if (a.getAttribute("aria-current")) r.ariaCurrentLinks++;
        if (a.classList.toString().match(/active|current|selected/i)) r.activeClassLinks++;
      }
      const footer = document.querySelector("footer");
      if (footer) { r.footerColumns = footer.querySelectorAll("ul, [class*='column'], [class*='col-']").length; }
      const navEls = document.querySelectorAll("nav");
      for (const nav of navEls) { const nestedNavs = nav.querySelectorAll("nav, ul ul, [class*='submenu'], [class*='dropdown']").length; if (nestedNavs > r.nestedNavDepth) r.nestedNavDepth = nestedNavs; }
      r.megaMenu = !!document.querySelector("[class*='mega'], [class*='megamenu']");
      const sidebar = document.querySelector("aside, [class*='sidebar']");
      if (sidebar) r.sidebarLinks = sidebar.querySelectorAll("a").length;
      return r;
    });

    // ═══ 34. ACCESSIBILITY DEEP ANALYSIS ════════════════════
    log("Deep accessibility analysis...");
    const a11yDeep = await page.evaluate(() => {
      const r = { ariaAttributes: {}, ariaHidden: 0, ariaExpanded: 0, ariaDescribedBy: 0, ariaControls: 0, ariaOwns: 0, ariaLive: {}, langAttributes: 0, titleAttributes: 0, srOnlyElements: 0, tabOrder: [], focusableElements: 0, inertElements: 0, dialogElements: 0, alertDialogs: 0, ariaInvalid: 0, ariaRequired: 0, ariaDisabled: 0, autocompleteOff: 0, negativeTabindex: 0, positiveTabindex: 0, visuallyHiddenTechniques: { clipRect: 0, srOnly: 0, offscreen: 0, zeroSize: 0 } };
      for (const el of document.querySelectorAll("*")) {
        for (const attr of el.attributes) {
          if (attr.name.startsWith("aria-")) { r.ariaAttributes[attr.name] = (r.ariaAttributes[attr.name] || 0) + 1; }
        }
        if (el.getAttribute("aria-hidden") === "true") r.ariaHidden++;
        if (el.hasAttribute("aria-expanded")) r.ariaExpanded++;
        if (el.hasAttribute("aria-describedby")) r.ariaDescribedBy++;
        if (el.hasAttribute("aria-controls")) r.ariaControls++;
        if (el.hasAttribute("aria-owns")) r.ariaOwns++;
        if (el.hasAttribute("aria-invalid")) r.ariaInvalid++;
        if (el.hasAttribute("aria-required")) r.ariaRequired++;
        if (el.hasAttribute("aria-disabled")) r.ariaDisabled++;
        const live = el.getAttribute("aria-live");
        if (live) r.ariaLive[live] = (r.ariaLive[live] || 0) + 1;
        if (el.hasAttribute("lang") && el !== document.documentElement) r.langAttributes++;
        if (el.hasAttribute("title")) r.titleAttributes++;
        if (el.hasAttribute("inert")) r.inertElements++;
        if (el.autocomplete === "off") r.autocompleteOff++;
        const ti = el.getAttribute("tabindex");
        if (ti) { if (parseInt(ti) < 0) r.negativeTabindex++; if (parseInt(ti) > 0) r.positiveTabindex++; }
        const cs = getComputedStyle(el);
        const classes = el.className?.toString() || "";
        if (classes.match(/sr-only|visually-hidden|screen-reader/i)) r.srOnlyElements++;
        if (cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clip === "rect(1px, 1px, 1px, 1px)") r.visuallyHiddenTechniques.clipRect++;
        if (classes.match(/sr-only|screenreader/i)) r.visuallyHiddenTechniques.srOnly++;
      }
      r.focusableElements = document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1']), [contenteditable]").length;
      r.dialogElements = document.querySelectorAll("dialog").length;
      r.alertDialogs = document.querySelectorAll("[role='alertdialog']").length;
      return r;
    });

    // ═══ 35. PERFORMANCE DEEP ANALYSIS ══════════════════════
    log("Deep performance analysis...");
    const perfDeep = await page.evaluate(() => {
      const r = { moduleScripts: 0, classicScripts: 0, nomoduleScripts: 0, deferCount: 0, asyncCount: 0, inlineScriptBytes: 0, inlineStyleBytes: 0, webComponents: 0, shadowDOMs: 0, templateElements: 0, slotElements: 0, importMaps: 0, fetchPriority: { high: 0, low: 0, auto: 0 }, dnsPrefetch: 0, prerender: 0, modulePreload: 0, criticalCSS: 0, noscript: 0, loadingAttr: { eager: 0, lazy: 0 }, decodingAttr: { sync: 0, async: 0, auto: 0 }, intersectionObservers: 0, mutationObservers: 0, resizeObservers: 0, eventListenerCount: 0, cssContainment: 0, contentVisibility: 0 };
      for (const script of document.querySelectorAll("script")) {
        if (script.type === "module") r.moduleScripts++;
        else if (script.src) r.classicScripts++;
        if (script.noModule) r.nomoduleScripts++;
        if (script.defer) r.deferCount++;
        if (script.async) r.asyncCount++;
        if (!script.src) r.inlineScriptBytes += (script.textContent || "").length;
        if (script.type === "importmap") r.importMaps++;
      }
      for (const style of document.querySelectorAll("style")) r.inlineStyleBytes += (style.textContent || "").length;
      r.criticalCSS = document.querySelectorAll("head style").length;
      r.noscript = document.querySelectorAll("noscript").length;
      for (const link of document.querySelectorAll("link")) {
        if (link.rel === "dns-prefetch") r.dnsPrefetch++;
        if (link.rel === "prerender") r.prerender++;
        if (link.rel === "modulepreload") r.modulePreload++;
      }
      for (const el of document.querySelectorAll("[fetchpriority]")) {
        const fp = el.getAttribute("fetchpriority");
        r.fetchPriority[fp] = (r.fetchPriority[fp] || 0) + 1;
      }
      for (const img of document.querySelectorAll("img")) {
        const l = img.loading || "auto";
        if (l === "lazy") r.loadingAttr.lazy++; else if (l === "eager") r.loadingAttr.eager++;
        const d = img.decoding || "auto";
        r.decodingAttr[d] = (r.decodingAttr[d] || 0) + 1;
      }
      for (const el of document.querySelectorAll("*")) {
        if (el.shadowRoot) r.shadowDOMs++;
        if (el.tagName.includes("-")) r.webComponents++;
        const cs = getComputedStyle(el);
        if (cs.contain !== "none") r.cssContainment++;
        if (cs.contentVisibility === "auto") r.contentVisibility++;
      }
      r.templateElements = document.querySelectorAll("template").length;
      r.slotElements = document.querySelectorAll("slot").length;
      return r;
    });

    // ═══ 36. CONTENT METRICS ════════════════════════════════
    log("Analyzing content metrics...");
    const contentMetrics = await page.evaluate(() => {
      const r = { totalTextLength: 0, aboveFoldText: 0, belowFoldText: 0, contentToChromeRatio: 0, linkToTextRatio: 0, imageToTextRatio: 0, headingDensity: 0, listDensity: 0, tableCount: 0, codeBlocks: 0, preElements: 0, blockquotes: 0, abbreviations: 0, definitions: 0, timeElements: 0, markElements: 0, detailsElements: 0, summaryElements: 0, rubyElements: 0, mathElements: 0, wordCount: 0, paragraphCount: 0, avgParagraphLength: 0, longestParagraph: 0, shortestParagraph: Infinity, emptyParagraphs: 0, singleSentenceParagraphs: 0 };
      const viewportH = window.innerHeight;
      let linkChars = 0, textChars = 0;
      for (const el of document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, td, th, span, label, dt, dd")) {
        const text = el.textContent?.trim() || "";
        const rect = el.getBoundingClientRect();
        if (text.length > 0 && rect.width > 0) {
          r.totalTextLength += text.length;
          textChars += text.length;
          if (rect.top < viewportH) r.aboveFoldText += text.length;
          else r.belowFoldText += text.length;
        }
      }
      for (const a of document.querySelectorAll("a")) linkChars += (a.textContent?.trim() || "").length;
      r.linkToTextRatio = textChars > 0 ? Math.round((linkChars / textChars) * 100) : 0;
      const imgCount = document.querySelectorAll("img, picture, video").length;
      const paragraphs = document.querySelectorAll("p");
      r.paragraphCount = paragraphs.length;
      r.imageToTextRatio = paragraphs.length > 0 ? Math.round((imgCount / paragraphs.length) * 100) : 0;
      r.headingDensity = Math.round((document.querySelectorAll("h1,h2,h3,h4,h5,h6").length / Math.max(paragraphs.length, 1)) * 100);
      let totalWords = 0;
      for (const p of paragraphs) {
        const text = p.textContent?.trim() || "";
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        totalWords += words;
        if (text.length > 0) {
          if (words > r.longestParagraph) r.longestParagraph = words;
          if (words < r.shortestParagraph) r.shortestParagraph = words;
          if (!text.includes(".") || text.split(".").filter(s => s.trim().length > 0).length <= 1) r.singleSentenceParagraphs++;
        }
        if (text.length === 0) r.emptyParagraphs++;
      }
      r.wordCount = totalWords;
      r.avgParagraphLength = paragraphs.length > 0 ? Math.round(totalWords / paragraphs.length) : 0;
      if (r.shortestParagraph === Infinity) r.shortestParagraph = 0;
      r.listDensity = Math.round((document.querySelectorAll("ul, ol").length / Math.max(paragraphs.length, 1)) * 100);
      r.tableCount = document.querySelectorAll("table").length;
      r.codeBlocks = document.querySelectorAll("pre, code").length;
      r.preElements = document.querySelectorAll("pre").length;
      r.blockquotes = document.querySelectorAll("blockquote").length;
      r.abbreviations = document.querySelectorAll("abbr").length;
      r.definitions = document.querySelectorAll("dfn, dl").length;
      r.timeElements = document.querySelectorAll("time").length;
      r.markElements = document.querySelectorAll("mark").length;
      r.detailsElements = document.querySelectorAll("details").length;
      r.summaryElements = document.querySelectorAll("summary").length;
      r.mathElements = document.querySelectorAll("math, [class*='math'], [class*='equation'], [class*='katex'], [class*='mathjax']").length;
      const bodyRect = document.body.getBoundingClientRect();
      const navHeight = document.querySelector("nav")?.getBoundingClientRect()?.height || 0;
      const footerHeight = document.querySelector("footer")?.getBoundingClientRect()?.height || 0;
      const chromeHeight = navHeight + footerHeight;
      r.contentToChromeRatio = bodyRect.height > 0 ? Math.round(((bodyRect.height - chromeHeight) / bodyRect.height) * 100) : 0;
      return r;
    });

    log("Capturing screenshot...");
    const screenshot = await page.screenshot({ encoding: "base64", fullPage: false });

    return {
      url, identity, visual, cssVars, content, architecture, uxPatterns,
      behavior, motion, accessibility, seo, techStack, performance,
      darkMode, breakpoints,
      gradients, iconSystem, imageTreatments, interactiveStates,
      layoutSystem, fontLoading, socialLinks, pricingData,
      scrollPatterns, thirdPartyServices, schemaData, colorMatrix,
      typographyDeep, colorContext, layoutDeep, interactionPatterns,
      formDeep, mediaDeep, navDeep, a11yDeep, perfDeep, contentMetrics,
      screenshot,
    };
  } finally {
    await browser.close();
  }
}

// ═══════════════════════════════════════════════════════════════
// Interactive state helper (runs outside page.evaluate)
// ═══════════════════════════════════════════════════════════════

async function extractInteractiveStates(page) {
  const states = { hover: [], focus: [] };

  const selectors = await page.evaluate(() => {
    const result = [];
    let count = 0;
    for (const el of document.querySelectorAll("a, button, input, [role='button'], [tabindex='0']")) {
      if (count >= 12) break;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      const cs = getComputedStyle(el);
      result.push({
        x: rect.x + rect.width / 2, y: rect.y + rect.height / 2,
        tag: el.tagName.toLowerCase(),
        defaultBg: cs.backgroundColor, defaultColor: cs.color,
        defaultBorder: cs.borderColor, defaultShadow: cs.boxShadow,
        defaultTransform: cs.transform, defaultOutline: cs.outline,
      });
      count++;
    }
    return result;
  });

  for (const sel of selectors.slice(0, 8)) {
    try {
      await page.mouse.move(sel.x, sel.y);
      await new Promise(r => setTimeout(r, 250));
      const hoverState = await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, color: cs.color, border: cs.borderColor, shadow: cs.boxShadow, transform: cs.transform, cursor: cs.cursor };
      }, { x: sel.x, y: sel.y });

      if (hoverState && (hoverState.bg !== sel.defaultBg || hoverState.color !== sel.defaultColor || hoverState.shadow !== sel.defaultShadow)) {
        states.hover.push({
          tag: sel.tag, cursor: hoverState.cursor,
          changes: {
            bg: hoverState.bg !== sel.defaultBg ? { from: sel.defaultBg, to: hoverState.bg } : null,
            color: hoverState.color !== sel.defaultColor ? { from: sel.defaultColor, to: hoverState.color } : null,
            shadow: hoverState.shadow !== sel.defaultShadow ? { from: sel.defaultShadow, to: hoverState.shadow } : null,
            transform: hoverState.transform !== sel.defaultTransform ? { from: sel.defaultTransform, to: hoverState.transform } : null,
          },
        });
      }
    } catch (e) {}
  }

  await page.mouse.move(0, 0);
  return states;
}
