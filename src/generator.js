/**
 * generator.js — STACK.md generator
 *
 * Produces a comprehensive product DNA document that gives AI agents
 * everything they need to rebuild a product that works, feels, and
 * thinks like the original — not just looks like it.
 *
 * For educational and experimental purposes only.
 */

export function generateStackMd(data) {
  const l = [];
  const ln = (t = "") => l.push(t);
  const hr = () => ln("---");

  const ds = data.designSystem;
  const voice = data.brandVoice;
  const ux = data.uxAnalysis;
  const bg = ds.colors.find(c => c.role === "background") || ds.colors.find(c => c.role === "surface");
  const text = ds.colors.find(c => c.role === "text-primary" || c.role === "text");
  const accent = ds.colors.find(c => c.role === "accent");

  // ── HEADER ─────────────────────────────────────────────────
  ln("# STACK.md");
  ln();
  ln(`> Source: \`${esc(data.url)}\``);
  ln(`> Extracted: ${new Date().toISOString().split("T")[0]}`);
  ln(`> Product DNA Score: **${data.dnaScore.overall}/100**`);
  ln(`> This file was generated for educational and experimental purposes only.`);
  ln();
  if (data.identity.description) ln(`**${esc(data.identity.description)}**`);
  ln();
  hr(); ln();

  // ── 1. PRODUCT IDENTITY ────────────────────────────────────
  ln("## 1. Product Identity");
  ln();
  ln(`- **Name:** ${esc(data.identity.ogSiteName || data.identity.title.split(/[|\-–—]/)[0].trim())}`);
  ln(`- **Tagline:** ${esc(data.identity.ogDescription || data.identity.description)}`);
  if (ux.pageType) ln(`- **Page type:** ${ux.pageType}`);
  ln(`- **Voice personality:** ${voice.contentPersonality || "neutral"}`);
  ln(`- **Conversion strategy:** ${ux.conversionStrategy}`);
  if (data.techStack.frameworks.length > 0) ln(`- **Built with:** ${data.techStack.frameworks.join(", ")}`);
  if (data.techStack.cssFramework) ln(`- **CSS framework:** ${data.techStack.cssFramework}`);
  ln(`- **Language:** ${data.identity.language || "en"}`);
  ln();
  if (data.uxPatterns.hero) {
    ln("### Hero");
    ln();
    if (data.uxPatterns.hero.headline) ln(`- **Headline:** "${esc(data.uxPatterns.hero.headline)}"`);
    if (data.uxPatterns.hero.subheadline) ln(`- **Subheadline:** "${esc(data.uxPatterns.hero.subheadline.slice(0, 150))}"`);
    if (data.uxPatterns.hero.cta) ln(`- **CTA:** "${esc(data.uxPatterns.hero.cta)}"`);
    ln(`- **Has image/video:** ${data.uxPatterns.hero.hasImage ? "Yes" : "No"}`);
    ln();
  }
  hr(); ln();

  // ── 2. PRODUCT DNA SCORE ───────────────────────────────────
  ln("## 2. Product DNA Score");
  ln();
  ln(`Overall: **${data.dnaScore.overall}/100**`);
  ln();
  ln("| Dimension | Score |");
  ln("|-----------|-------|");
  for (const [key, val] of Object.entries(data.dnaScore)) {
    if (key !== "overall") ln(`| ${key} | ${val}/100 |`);
  }
  ln();

  // Intelligence: Product Maturity
  if (data.intelligence?.productMaturity) {
    const pm = data.intelligence.productMaturity;
    ln(`### Product Maturity: ${pm.level} (${pm.score}/100)`);
    ln();
    if (pm.signals.length > 0) {
      for (const s of pm.signals.slice(0, 12)) ln(`- ${s}`);
      ln();
    }
  }

  // Intelligence: Audit Summary
  if (data.intelligence) {
    const i = data.intelligence;
    ln("### Audit Grades");
    ln();
    ln("| Audit | Grade | Score |");
    ln("|-------|-------|-------|");
    if (i.contentQuality) ln(`| Content Quality | ${i.contentQuality.grade} | ${i.contentQuality.score}/100 |`);
    if (i.seoAudit) ln(`| Technical SEO | ${i.seoAudit.grade} | ${i.seoAudit.score}/100 |`);
    if (i.performanceRisks) ln(`| Performance | ${i.performanceRisks.grade} | ${i.performanceRisks.score}/100 |`);
    if (i.accessibilityGrade) ln(`| Accessibility | ${i.accessibilityGrade.grade} | ${i.accessibilityGrade.score}/100 (${i.accessibilityGrade.wcagLevel}) |`);
    ln();

    // Conversion Funnel
    if (i.conversionFunnel) {
      const cf = i.conversionFunnel;
      ln(`### Conversion Funnel: ${cf.funnelType} (${cf.completeness}% complete)`);
      ln();
      for (const stage of cf.stages) {
        ln(`- ${stage.present ? "✓" : "✗"} **${stage.stage}:** ${stage.element}${stage.detail ? ` — ${esc(stage.detail)}` : ""}`);
      }
      ln();
    }
  }
  hr(); ln();

  // ── 3. BRAND VOICE & TONE ─────────────────────────────────
  ln("## 3. Brand Voice & Tone");
  ln();
  ln(`- **Personality:** ${voice.contentPersonality}`);
  ln(`- **Reading level:** ${voice.readingLevel} (avg ${voice.avgSentenceLength} words/sentence)`);
  ln(`- **Pronoun strategy:** ${voice.pronounStrategy}`);
  ln(`- **Punctuation style:** ${voice.punctuationStyle}`);
  ln(`- **Writing density:** ${voice.writingDensity}`);
  ln(`- **CTA pattern:** ${voice.ctaPattern}`);
  ln(`- **Vocabulary richness:** ${voice.vocabularyRichness}%`);
  ln();

  ln("### Tone Profile");
  ln();
  ln("| Dimension | Level |");
  ln("|-----------|-------|");
  for (const [key, val] of Object.entries(voice.toneProfile)) {
    const bar = "█".repeat(Math.round(val / 10)) + "░".repeat(10 - Math.round(val / 10));
    ln(`| ${key} | ${bar} ${val}% |`);
  }
  ln();

  // Intelligence: Readability
  if (data.intelligence?.readability?.fleschEase !== null) {
    const r = data.intelligence.readability;
    ln("### Readability Score");
    ln();
    ln(`- **Flesch Reading Ease:** ${r.fleschEase}/100 (${r.label})`);
    ln(`- **Flesch-Kincaid Grade:** ${r.fleschKincaid} (${r.grade} level)`);
    ln(`- **Stats:** ${r.stats.words} words, ${r.stats.sentences} sentences, avg ${r.stats.avgSentenceLen} words/sentence, ${r.stats.avgSyllablesPerWord} syllables/word`);
    ln();
  }

  // Intelligence: Emotional Tone
  if (data.intelligence?.emotionalTone?.dominant?.length > 0) {
    const et = data.intelligence.emotionalTone;
    ln("### Emotional Profile");
    ln();
    ln(`**Dominant:** ${et.profile}`);
    ln();
    const topEmotions = Object.entries(et.emotions).filter(([, v]) => v > 10).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (topEmotions.length > 0) {
      ln("| Emotion | Level |");
      ln("|---------|-------|");
      for (const [emotion, level] of topEmotions) {
        const bar = "█".repeat(Math.round(level / 10)) + "░".repeat(10 - Math.round(level / 10));
        ln(`| ${emotion} | ${bar} ${level}% |`);
      }
      ln();
    }
  }

  if (voice.topWords.length > 0) {
    ln("### Key Vocabulary");
    ln();
    ln(`${voice.topWords.slice(0, 15).map(w => `\`${esc(w.word)}\` (${w.count})`).join(", ")}`);
    ln();
  }

  if (data.content.ctaTexts.length > 0) {
    ln("### CTA Language");
    ln();
    for (const cta of data.content.ctaTexts.slice(0, 10)) ln(`- "${esc(cta)}"`);
    ln();
  }

  if (data.content.microcopy.length > 0) {
    ln("### Microcopy Examples");
    ln();
    for (const mc of data.content.microcopy.slice(0, 8)) ln(`- "${esc(mc.slice(0, 100))}"`);
    ln();
  }
  hr(); ln();

  // ── 4. CONTENT STRATEGY ────────────────────────────────────
  ln("## 4. Content Strategy");
  ln();
  ln(`- **Total paragraphs:** ${data.content.paragraphCount}`);
  ln(`- **Heading count:** ${data.content.headingTexts.length}`);
  ln(`- **Writing density:** ${voice.writingDensity}`);
  ln();

  if (data.content.headingTexts.length > 0) {
    ln("### Content Hierarchy");
    ln();
    for (const h of data.content.headingTexts.slice(0, 15)) ln(`- ${esc(h)}`);
    ln();
  }

  // Intelligence: Headline Formulas
  if (data.intelligence?.headlines?.length > 0) {
    ln("### Headline Analysis");
    ln();
    const formulas = {};
    for (const h of data.intelligence.headlines) { formulas[h.formula] = (formulas[h.formula] || 0) + 1; }
    ln(`**Formulas used:** ${Object.entries(formulas).sort((a, b) => b[1] - a[1]).map(([f, c]) => `${f} (${c})`).join(", ")}`);
    ln();
    const powerHeadlines = data.intelligence.headlines.filter(h => h.hasPowerWord || h.emotional);
    if (powerHeadlines.length > 0) ln(`**Power/emotional headlines:** ${powerHeadlines.length}/${data.intelligence.headlines.length}`);
    ln();
  }

  // Intelligence: Content Quality
  if (data.intelligence?.contentQuality) {
    const cq = data.intelligence.contentQuality;
    ln(`### Content Quality: ${cq.grade} (${cq.score}/100)`);
    ln();
    const failing = cq.checks.filter(c => !c.pass);
    if (failing.length > 0) {
      ln("**Needs improvement:**");
      ln();
      for (const f of failing) ln(`- ${f.name}`);
      ln();
    }
  }

  if (data.content.labels.length > 0) {
    ln("### Form Labels");
    ln();
    for (const lab of data.content.labels.slice(0, 8)) ln(`- ${esc(lab)}`);
    ln();
  }

  if (data.content.placeholders.length > 0) {
    ln("### Placeholder Text");
    ln();
    for (const ph of data.content.placeholders.slice(0, 8)) ln(`- "${esc(ph)}"`);
    ln();
  }
  hr(); ln();

  // ── 5. VISUAL DESIGN SYSTEM ────────────────────────────────
  ln("## 5. Visual Design System");
  ln();
  ln(`- **Mode:** ${ds.isDark ? "Dark" : "Light"}${data.darkMode ? " (dark mode available)" : ""}`);
  ln(`- **Primary font:** ${ds.fonts[0]?.families[0] || "system-ui"}`);
  if (ds.fonts[1]) ln(`- **Secondary font:** ${ds.fonts[1].families[0]}`);
  if (accent) ln(`- **Accent:** \`${accent.hex}\``);
  if (bg) ln(`- **Background:** \`${bg.hex}\``);
  if (text) ln(`- **Text:** \`${text.hex}\``);
  if (ds.gridSystem) ln(`- **Spacing grid:** ${ds.gridSystem.base}px (${ds.gridSystem.adherence}% adherence)`);
  ln();

  ln("### Color Palette");
  ln();
  ln("| Hex | Role | Count |");
  ln("|-----|------|-------|");
  for (const c of ds.colors.slice(0, 16)) ln(`| \`${c.hex}\` | ${c.role} | ${c.count} |`);
  ln();

  // Intelligence: Color Psychology
  if (data.intelligence?.colorPsychology) {
    const cp = data.intelligence.colorPsychology;
    ln("### Color Psychology");
    ln();
    ln(`- **Temperature:** ${cp.temperature}`);
    ln(`- **Harmony:** ${cp.harmony}`);
    if (cp.dominantHue) ln(`- **Dominant hue:** ${cp.dominantHue}`);
    ln(`- **Avg lightness:** ${cp.avgLightness}% · **Avg saturation:** ${cp.avgSaturation}%`);
    if (cp.mood.length > 0) ln(`- **Mood:** ${cp.mood.join(", ")}`);
    ln();
  }

  if (Object.keys(ds.cssVars).length > 0) {
    ln("### CSS Custom Properties");
    ln();
    ln("```css");
    for (const [k, v] of Object.entries(ds.cssVars).slice(0, 30)) ln(`${k}: ${esc(v)};`);
    ln("```");
    ln();
  }

  if (data.darkMode) {
    ln("### Dark Mode Overrides");
    ln();
    ln("```css");
    for (const [k, v] of Object.entries(data.darkMode).slice(0, 20)) ln(`${k}: ${esc(v)};`);
    ln("```");
    ln();
  }

  ln("### Typography");
  ln();
  for (const f of ds.fonts) ln(`- **${f.role}:** \`${esc(f.families.join(", "))}\` (${f.count} uses)`);
  ln();

  if (Object.keys(ds.headingMap).length > 0) {
    ln("### Heading Hierarchy");
    ln();
    ln("| Level | Size | Weight | Line Height | Letter Spacing |");
    ln("|-------|------|--------|-------------|----------------|");
    for (const [level, h] of Object.entries(ds.headingMap).sort()) {
      ln(`| ${level} | ${h.size} | ${h.weight} | ${h.lineHeight} | ${h.letterSpacing || "normal"} |`);
    }
    ln();
  }

  ln("### Spacing Scale");
  ln();
  ln(`${ds.spacingScale.slice(0, 12).map(s => `\`${s.value}\``).join(", ")}`);
  ln();

  ln("### Depth");
  ln();
  if (ds.radii.length > 0) ln(`- **Border radius:** ${ds.radii.slice(0, 4).map(r => `\`${r.value}\``).join(", ")}`);
  if (ds.shadows.length > 0) ln(`- **Shadow levels:** ${ds.shadows.length} (${ds.shadows.map(s => s.level).join(", ")})`);
  ln();

  if (data.gradientList?.length > 0) {
    ln("### Gradients");
    ln();
    for (const g of data.gradientList.slice(0, 5)) {
      const tr = g.value.length > 90 ? g.value.slice(0, 90) + "..." : g.value;
      ln(`- \`${esc(tr)}\` (${g.count} uses)`);
    }
    ln();
  }

  if (data.fontLoading) {
    const fl = data.fontLoading;
    if (fl.totalFonts > 0 || fl.displaySwap > 0) {
      ln("### Font Loading");
      ln();
      if (fl.googleFonts.length > 0) ln(`- Google Fonts: ${fl.googleFonts.length} stylesheet(s)`);
      if (fl.typekit.length > 0) ln(`- Typekit: ${fl.typekit.length} stylesheet(s)`);
      if (fl.customFonts > 0) ln(`- Custom @font-face: ${fl.customFonts} declarations`);
      if (fl.preloaded.length > 0) ln(`- Preloaded fonts: ${fl.preloaded.length}`);
      if (fl.displaySwap > 0) ln(`- font-display: swap: ${fl.displaySwap} faces`);
      if (Object.keys(fl.fontDisplay).length > 0) ln(`- font-display values: ${Object.entries(fl.fontDisplay).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      ln();
    }
  }
  hr(); ln();

  // ── 6. COMPONENT STYLING ──────────────────────────────────
  ln("## 6. Component Styling");
  ln();
  for (const comp of ds.components) {
    ln(`### ${cap(comp.type)}s (${comp.count} found)`);
    ln();
    for (let i = 0; i < comp.variants.length; i++) {
      const v = comp.variants[i];
      ln(`**Variant ${i + 1}**${v.sample ? ` ("${esc(v.sample)}")` : ""}`);
      ln();
      ln("```");
      for (const [key, val] of Object.entries(v)) {
        if (val && val !== "none" && !["sample", "text", "classes"].includes(key)) ln(`${kebab(key)}: ${val}`);
      }
      ln("```");
      ln();
    }
  }
  hr(); ln();

  // ── 7. UX PATTERNS ────────────────────────────────────────
  ln("## 7. UX Patterns");
  ln();
  ln(`- **Page type:** ${ux.pageType}`);
  ln(`- **Conversion strategy:** ${ux.conversionStrategy}`);
  ln(`- **Navigation complexity:** ${ux.navigationComplexity}`);
  ln(`- **Interactivity level:** ${ux.interactivityLevel}`);
  ln();

  if (ux.patternSummary.length > 0) {
    ln("### Detected Patterns");
    ln();
    for (const p of ux.patternSummary) ln(`- ${p}`);
    ln();
  }

  if (ux.userJourneySignals.length > 0) {
    ln("### User Journey Signals");
    ln();
    for (const s of ux.userJourneySignals) ln(`- ${esc(s)}`);
    ln();
  }

  // Intelligence: Trust Signals
  if (data.intelligence?.trustSignals?.totalSignals > 0) {
    const ts = data.intelligence.trustSignals;
    ln(`### Trust Signals (${ts.trustLevel})`);
    ln();
    for (const [category, items] of Object.entries(ts.signals)) {
      if (items.length > 0) ln(`- **${category}:** ${items.join(", ")}`);
    }
    ln();
  }

  if (data.uxPatterns.forms.length > 0) {
    ln("### Forms");
    ln();
    for (const f of data.uxPatterns.forms.slice(0, 5)) {
      ln(`- ${f.fields} fields, submit: "${esc(f.submitText)}", method: ${f.method}`);
    }
    ln();
  }

  if (data.uxPatterns.stickyElements.length > 0) {
    ln("### Sticky Elements");
    ln();
    for (const s of data.uxPatterns.stickyElements.slice(0, 5)) {
      ln(`- \`<${s.tag}>\` (${s.position}, ${s.height}px)`);
    }
    ln();
  }

  if (data.pricingData?.detected) {
    ln("### Pricing Structure");
    ln();
    if (data.pricingData.currency) ln(`- Currency: ${data.pricingData.currency}`);
    if (data.pricingData.billingToggle) ln("- Billing toggle: Yes (monthly/annual)");
    if (data.pricingData.freeTier) ln("- Free tier: Yes");
    if (data.pricingData.enterprise) ln("- Enterprise/custom tier: Yes");
    ln(`- Tiers: ${data.pricingData.tiers.length}`);
    ln();
    for (const tier of data.pricingData.tiers.slice(0, 5)) {
      ln(`**${esc(tier.name)}** ${esc(tier.price)}`);
      if (tier.cta) ln(`  CTA: "${esc(tier.cta)}"`);
      if (tier.featureCount > 0) ln(`  ${tier.featureCount} features listed`);
      ln();
    }
  }
  hr(); ln();

  // ── 8. INFORMATION ARCHITECTURE ───────────────────────────
  ln("## 8. Information Architecture");
  ln();
  if (data.architecture.navLinks.length > 0) {
    ln("### Navigation");
    ln();
    for (const link of data.architecture.navLinks.slice(0, 15)) ln(`- ${esc(link.text)}${link.isExternal ? " ↗" : ""}`);
    ln();
  }

  if (data.architecture.sections.length > 0) {
    ln("### Page Sections");
    ln();
    for (const s of data.architecture.sections.slice(0, 12)) {
      const label = s.heading ? esc(s.heading) : `(unnamed${s.id ? " #" + s.id : ""})`;
      ln(`- ${label}`);
    }
    ln();
  }

  if (data.architecture.footerLinks.length > 0) {
    ln("### Footer");
    ln();
    for (const link of data.architecture.footerLinks.slice(0, 15)) ln(`- ${esc(link.text)}`);
    ln();
  }

  ln("### Structure Stats");
  ln();
  ln(`- Internal links: ${data.architecture.internalLinks.length}`);
  ln(`- External links: ${data.architecture.externalLinks.length}`);
  ln(`- Sections: ${data.architecture.sections.length}`);
  ln(`- DOM depth: ${data.architecture.depth} levels`);
  ln(`- Search: ${data.architecture.search ? "Yes" : "No"}`);
  ln(`- Breadcrumbs: ${data.architecture.breadcrumbs.length > 0 ? "Yes" : "No"}`);
  ln();
  hr(); ln();

  // ── 9. COMPONENT BEHAVIOR ─────────────────────────────────
  ln("## 9. Component Behavior");
  ln();
  const beh = data.behavior;

  ln("### Interactive Patterns");
  ln();
  ln(`| Pattern | Count |`);
  ln(`|---------|-------|`);
  if (beh.tooltips > 0) ln(`| Tooltips | ${beh.tooltips} |`);
  if (beh.modals > 0) ln(`| Modals/Dialogs | ${beh.modals} |`);
  if (beh.popovers > 0) ln(`| Popovers | ${beh.popovers} |`);
  if (beh.drawers > 0) ln(`| Drawers | ${beh.drawers} |`);
  if (beh.toasts > 0) ln(`| Toasts | ${beh.toasts} |`);
  if (beh.datePickers > 0) ln(`| Date pickers | ${beh.datePickers} |`);
  if (beh.fileUploads > 0) ln(`| File uploads | ${beh.fileUploads} |`);
  if (beh.autoComplete > 0) ln(`| Autocomplete | ${beh.autoComplete} |`);
  if (beh.dragDrop) ln(`| Drag & drop | Yes |`);
  ln();

  if (beh.formValidation.html5 > 0 || beh.formValidation.custom > 0) {
    ln("### Form Validation");
    ln();
    ln(`- HTML5 validation: ${beh.formValidation.html5} fields`);
    ln(`- Custom validation: ${beh.formValidation.custom} fields`);
    ln(`- Inline errors: ${beh.formValidation.inline ? "Yes" : "No"}`);
    ln();
  }

  ln("### Focus Management");
  ln();
  ln(`- Focus-visible styles: ${beh.focusManagement.focusVisible ? "Yes" : "No"}`);
  ln(`- Skip link: ${beh.focusManagement.skipLink ? "Yes" : "No"}`);
  ln();

  if (data.interactiveStates?.hover?.length > 0) {
    ln("### Hover Effects");
    ln();
    for (const h of data.interactiveStates.hover.slice(0, 6)) {
      ln(`**${h.tag}** (cursor: ${h.cursor})`);
      ln();
      ln("```");
      for (const [prop, change] of Object.entries(h.changes)) {
        if (change) ln(`${prop}: ${change.from} → ${change.to}`);
      }
      ln("```");
      ln();
    }
  }
  hr(); ln();

  // ── 10. MOTION & ANIMATION ────────────────────────────────
  ln("## 10. Motion & Animation");
  ln();
  const mot = data.motion;
  if (Object.keys(mot.durations).length > 0) {
    ln("### Durations");
    ln();
    for (const [dur, count] of Object.entries(mot.durations).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) ln(`- \`${dur}\` (${count} uses)`);
    ln();
  }
  if (Object.keys(mot.easings).length > 0) {
    ln("### Easings");
    ln();
    for (const [e, c] of Object.entries(mot.easings).sort((a, b) => b[1] - a[1]).slice(0, 5)) ln(`- \`${esc(e)}\` (${c} uses)`);
    ln();
  }
  if (mot.keyframes.length > 0) {
    ln("### Keyframe Animations");
    ln();
    for (const kf of mot.keyframes) ln(`- \`@keyframes ${esc(kf.name)}\` (${kf.steps} steps)`);
    ln();
  }
  if (mot.animatedElements > 0) ln(`${mot.animatedElements} elements with active CSS animations.`);
  ln();

  if (data.scrollPatterns) {
    const sp = data.scrollPatterns;
    const scrollFeatures = [];
    if (sp.smoothScroll) scrollFeatures.push("smooth scrolling");
    if (sp.scrollSnap) scrollFeatures.push("scroll snap");
    if (sp.parallax) scrollFeatures.push("parallax");
    if (sp.backToTop) scrollFeatures.push("back-to-top button");
    if (sp.scrollIndicator) scrollFeatures.push("scroll indicator");
    if (sp.revealAnimations > 0) scrollFeatures.push(`${sp.revealAnimations} scroll-reveal animations`);
    if (scrollFeatures.length > 0) {
      ln("### Scroll Behavior");
      ln();
      for (const f of scrollFeatures) ln(`- ${f}`);
      ln();
    }
  }
  hr(); ln();

  // ── 11. RESPONSIVE STRATEGY ───────────────────────────────
  ln("## 11. Responsive Strategy");
  ln();
  if (data.breakpointList.length > 0) {
    ln("### Breakpoints");
    ln();
    ln("| Breakpoint | CSS Rules |");
    ln("|------------|-----------|");
    for (const bp of data.breakpointList) ln(`| ${bp.px}px | ${bp.ruleCount} |`);
    ln();
  } else {
    ln("No breakpoints detected in stylesheets.");
    ln();
  }
  hr(); ln();

  // ── 12. ACCESSIBILITY PROFILE ─────────────────────────────
  if (data.accessibility) {
    ln("## 12. Accessibility Profile");
    ln();
    const a = data.accessibility;
    if (a.contrastIssues.length > 0) {
      ln("### Contrast Issues");
      ln();
      ln("| Text | Fg | Bg | Ratio |");
      ln("|------|----|----|-------|");
      for (const issue of a.contrastIssues.slice(0, 10)) ln(`| "${esc(issue.text.slice(0, 20))}" | \`${issue.fg}\` | \`${issue.bg}\` | ${issue.ratio}:1 |`);
      ln();
    } else {
      ln("No contrast issues detected.");
      ln();
    }

    ln("### Structure");
    ln();
    ln(`- Skip link: ${a.skipLink ? "Present" : "Missing"}`);
    ln(`- Focus styles: ${a.focusVisible ? "Defined" : "Not detected"}`);
    ln(`- Images missing alt: ${a.missingAlt}`);
    ln(`- ARIA labels: ${a.ariaLabels}`);
    ln(`- Form labels: ${a.formLabels.labeled} labeled, ${a.formLabels.unlabeled} unlabeled`);
    ln(`- Live regions: ${a.liveRegions}`);
    ln(`- prefers-reduced-motion: ${a.reducedMotion ? "Supported" : "Not detected"}`);
    ln();

    if (a.headingOrder.length > 0) {
      ln(`### Heading Order: ${a.headingOrder.join(" → ")}`);
      ln();
    }

    if (data.colorPairings?.total > 0) {
      ln("### Color Accessibility Matrix");
      ln();
      ln(`${data.colorPairings.accessible.length} accessible pairs, ${data.colorPairings.failing.length} failing pairs out of ${data.colorPairings.total} tested.`);
      ln();
      if (data.colorPairings.failing.length > 0) {
        ln("**Failing pairs:**");
        ln();
        ln("| Fg | Bg | Ratio | Sample |");
        ln("|----|----|----- -|--------|");
        for (const p of data.colorPairings.failing.slice(0, 8)) {
          ln(`| \`${p.fg}\` | \`${p.bg}\` | ${p.ratio}:1 | "${esc(p.sample)}" |`);
        }
        ln();
      }
    }
    hr(); ln();
  }

  // ── 13. SEO & PERFORMANCE ─────────────────────────────────
  ln("## 13. SEO & Performance");
  ln();
  ln("### SEO");
  ln();
  ln(`- Title: "${esc(data.identity.title)}" (${data.seo.titleLength} chars)`);
  ln(`- Meta description: ${data.seo.descriptionLength} chars`);
  ln(`- H1 count: ${data.seo.h1Count}${data.seo.h1Count === 1 ? " (correct)" : data.seo.h1Count === 0 ? " (missing)" : " (multiple)"}`);
  ln(`- Image alt coverage: ${data.seo.imageAltCoverage}%`);
  ln(`- Structured data: ${data.seo.structuredData.length > 0 ? data.seo.structuredData.join(", ") : "None"}`);
  ln(`- Canonical: ${data.identity.canonical ? "Set" : "Not set"}`);
  ln(`- Lazy images: ${data.seo.lazyImages}/${data.seo.totalImages}`);
  ln();

  if (Object.keys(data.seo.openGraph).length > 0) {
    ln("### Open Graph");
    ln();
    for (const [k, v] of Object.entries(data.seo.openGraph)) ln(`- \`${k}\`: ${esc(v.slice(0, 100))}`);
    ln();
  }

  ln("### Performance");
  ln();
  ln(`- DOM nodes: ${data.performance.domNodeCount}`);
  ln(`- Scripts: ${data.performance.scriptCount} (${data.performance.asyncScripts} async, ${data.performance.deferScripts} defer)`);
  ln(`- Stylesheets: ${data.performance.stylesheetCount}`);
  ln(`- Third-party scripts: ${data.performance.thirdPartyScripts}`);
  ln(`- Preloads: ${data.performance.preloads}`);
  ln(`- Preconnects: ${data.performance.preconnects}`);
  ln(`- Service worker: ${data.performance.serviceWorker ? "Active" : "None"}`);
  ln();
  hr(); ln();

  // ── 14. TECHNOLOGY STACK ──────────────────────────────────
  ln("## 14. Technology Stack");
  ln();
  if (data.techStack.frameworks.length > 0) ln(`- **Frameworks:** ${data.techStack.frameworks.join(", ")}`);
  if (data.techStack.cssFramework) ln(`- **CSS:** ${data.techStack.cssFramework}`);
  if (data.techStack.analytics.length > 0) ln(`- **Analytics:** ${data.techStack.analytics.join(", ")}`);
  if (data.techStack.hosting.length > 0) ln(`- **Hosting:** ${data.techStack.hosting.join(", ")}`);
  ln();
  if (data.techStack.fonts.urls.length > 0) {
    ln("### Font Sources");
    ln();
    for (const url of data.techStack.fonts.urls.slice(0, 5)) ln(`- ${esc(url)}`);
    ln();
  }

  // Third-party services
  if (data.thirdPartyServices) {
    const svc = data.thirdPartyServices;
    const allServices = [...(svc.payments || []), ...(svc.errorTracking || []), ...(svc.chat || []), ...(svc.auth || []), ...(svc.email || []), ...(svc.cms || []), ...(svc.ab || [])];
    if (allServices.length > 0) {
      ln("### Third-Party Services");
      ln();
      if (svc.payments.length > 0) ln(`- **Payments:** ${svc.payments.join(", ")}`);
      if (svc.errorTracking.length > 0) ln(`- **Error tracking:** ${svc.errorTracking.join(", ")}`);
      if (svc.chat.length > 0) ln(`- **Chat:** ${svc.chat.join(", ")}`);
      if (svc.auth.length > 0) ln(`- **Auth:** ${svc.auth.join(", ")}`);
      if (svc.email.length > 0) ln(`- **Email:** ${svc.email.join(", ")}`);
      if (svc.cms.length > 0) ln(`- **CMS:** ${svc.cms.join(", ")}`);
      if (svc.ab.length > 0) ln(`- **A/B testing:** ${svc.ab.join(", ")}`);
      if (svc.cdns.length > 0) ln(`- **CDNs:** ${svc.cdns.join(", ")}`);
      ln();
    }
  }
  hr(); ln();

  // ── 15. ICONS & IMAGE SYSTEM ──────────────────────────────
  if (data.iconSystem || data.imageTreatments) {
    ln("## 15. Icons & Media");
    ln();

    if (data.iconSystem) {
      const ic = data.iconSystem;
      ln("### Icon System");
      ln();
      ln(`- Inline SVGs: ${ic.svgInline}`);
      ln(`- SVG sprites: ${ic.svgSprite}`);
      ln(`- Icon font: ${ic.iconFont ? `Yes (${esc(ic.iconFontFamily)})` : "No"}`);
      ln(`- Total icons: ${ic.totalIcons}`);
      if (Object.keys(ic.svgSizes).length > 0) {
        ln(`- Common sizes: ${Object.entries(ic.svgSizes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, c]) => `${s} (${c})`).join(", ")}`);
      }
      if (ic.iconClasses.length > 0) {
        ln(`- Icon classes: ${ic.iconClasses.slice(0, 8).map(c => `\`${esc(c)}\``).join(", ")}`);
      }
      ln();
    }

    if (data.imageTreatments) {
      const img = data.imageTreatments;
      ln("### Image Treatments");
      ln();
      ln(`- Total images: ${img.count}`);
      ln(`- Average size: ${img.avgWidth}x${img.avgHeight}`);
      ln(`- Lazy loaded: ${img.lazyLoaded}/${img.count}`);
      if (img.srcset > 0) ln(`- Responsive (srcset): ${img.srcset}`);
      if (img.decorative > 0) ln(`- Decorative (alt=""): ${img.decorative}`);
      if (Object.keys(img.formats).length > 0) ln(`- Formats: ${Object.entries(img.formats).map(([f, c]) => `${f} (${c})`).join(", ")}`);
      if (Object.keys(img.objectFit).length > 0) ln(`- Object-fit: ${Object.entries(img.objectFit).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      if (Object.keys(img.aspectRatios).length > 0) ln(`- Aspect ratios: ${Object.entries(img.aspectRatios).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      if (img.hero) ln(`- Hero image: ${img.hero.width}x${img.hero.height} (${img.hero.format})`);
      ln();
    }
    hr(); ln();
  }

  // ── 16. LAYOUT SYSTEM ─────────────────────────────────────
  if (data.layoutSystem) {
    const ls = data.layoutSystem;
    if (ls.flexCount > 0 || ls.gridCount > 0) {
      ln("## 16. Layout System");
      ln();
      ln(`- Flex containers: ${ls.flexCount}`);
      ln(`- Grid containers: ${ls.gridCount}`);
      ln(`- Sticky elements: ${ls.stickyCount}`);
      ln(`- Fixed elements: ${ls.fixedCount}`);
      ln(`- Container queries: ${ls.containerQueries ? "Yes" : "No"}`);
      ln();

      if (Object.keys(ls.gridTemplates).length > 0) {
        ln("### Grid Templates");
        ln();
        for (const [tmpl, count] of Object.entries(ls.gridTemplates).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
          ln(`- \`${esc(tmpl)}\` (${count} uses)`);
        }
        ln();
      }

      if (data.containerWidths.length > 0) {
        ln("### Container Widths");
        ln();
        for (const c of data.containerWidths) ln(`- \`max-width: ${esc(c.value)}\` (${c.count} uses)`);
        ln();
      }

      if (Object.keys(ls.gapValues).length > 0) {
        ln("### Gap Values");
        ln();
        ln(`${Object.entries(ls.gapValues).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).slice(0, 8).map(([v]) => `\`${v}\``).join(", ")}`);
        ln();
      }
      hr(); ln();
    }
  }

  // ── 17. SOCIAL PRESENCE ───────────────────────────────────
  if (Object.keys(data.socialLinks).length > 0) {
    ln("## 17. Social Presence");
    ln();
    for (const [platform, url] of Object.entries(data.socialLinks)) {
      ln(`- **${cap(platform)}:** ${esc(url)}`);
    }
    ln();
    hr(); ln();
  }

  // ── 18. STRUCTURED DATA ───────────────────────────────────
  if (data.schemaData) {
    const sd = data.schemaData;
    if (sd.jsonLd.length > 0 || sd.microdata.length > 0) {
      ln("## 18. Structured Data");
      ln();
      if (sd.jsonLd.length > 0) {
        ln("### JSON-LD");
        ln();
        for (const item of sd.jsonLd) {
          const props = [item.hasName ? "name" : null, item.hasDescription ? "description" : null, item.hasImage ? "image" : null, item.hasUrl ? "url" : null].filter(Boolean);
          ln(`- **${esc(item.type)}** ${props.length > 0 ? `(${props.join(", ")})` : ""}`);
        }
        ln();
      }
      if (sd.microdata.length > 0) {
        ln("### Microdata");
        ln();
        for (const item of sd.microdata.slice(0, 5)) {
          ln(`- **${esc(item.type)}** props: ${item.props.map(p => `\`${esc(p)}\``).join(", ")}`);
        }
        ln();
      }
      hr(); ln();
    }
  }

  // ── 19. DEEP EXTRACTION REPORT ─────────────────────────────
  ln("## 19. Deep Extraction Report");
  ln();

  if (data.typographyDeep) {
    const td = data.typographyDeep;
    ln("### Typography Deep");
    ln();
    if (td.avgCharsPerLine > 0) ln(`- Avg characters per line: ${td.avgCharsPerLine}`);
    if (td.maxLineWidth > 0) ln(`- Max line width: ${td.maxLineWidth}px`);
    if (td.allCapsCount > 0) ln(`- All-caps elements: ${td.allCapsCount}`);
    if (td.italicCount > 0) ln(`- Italic elements: ${td.italicCount}`);
    if (td.monospacedBlocks > 0) ln(`- Monospaced blocks: ${td.monospacedBlocks}`);
    ln(`- Links: ${td.underlineLinks} underlined, ${td.noUnderlineLinks} no-underline`);
    if (td.lineClamp > 0) ln(`- Line-clamped elements: ${td.lineClamp}`);
    if (td.hyphens > 0) ln(`- Hyphenated elements: ${td.hyphens}`);
    if (Object.keys(td.textAlign).length > 0) ln(`- Text alignment: ${Object.entries(td.textAlign).map(([k, v]) => `${k} (${v})`).join(", ")}`);
    if (Object.keys(td.textShadow).length > 0) ln(`- Text shadows: ${Object.keys(td.textShadow).length} distinct`);
    ln();
  }

  if (data.colorContext) {
    const cc = data.colorContext;
    const hasData = Object.keys(cc.blendModes).length > 0 || Object.keys(cc.backdropFilters).length > 0 || Object.keys(cc.cssFilters).length > 0 || cc.colorScheme || cc.accentColor;
    if (hasData) {
      ln("### Color Context");
      ln();
      if (cc.colorScheme) ln(`- color-scheme: ${cc.colorScheme}`);
      if (cc.accentColor) ln(`- accent-color: ${cc.accentColor}`);
      if (cc.forcedColors) ln("- forced-colors media query: detected");
      if (Object.keys(cc.blendModes).length > 0) ln(`- Blend modes: ${Object.entries(cc.blendModes).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      if (Object.keys(cc.backdropFilters).length > 0) ln(`- Backdrop filters: ${Object.keys(cc.backdropFilters).length} distinct`);
      if (Object.keys(cc.cssFilters).length > 0) ln(`- CSS filters: ${Object.keys(cc.cssFilters).length} distinct`);
      if (Object.keys(cc.opacityUsage).length > 0) ln(`- Opacity values: ${Object.entries(cc.opacityUsage).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      ln();
    }
  }

  if (data.layoutDeep) {
    const ld = data.layoutDeep;
    ln("### Layout Deep");
    ln();
    if (Object.keys(ld.justifyContent).length > 0) ln(`- justify-content: ${Object.entries(ld.justifyContent).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} (${v})`).join(", ")}`);
    if (Object.keys(ld.alignItems).length > 0) ln(`- align-items: ${Object.entries(ld.alignItems).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} (${v})`).join(", ")}`);
    if (Object.keys(ld.flexWrap).length > 0) ln(`- flex-wrap: ${Object.entries(ld.flexWrap).map(([k, v]) => `${k} (${v})`).join(", ")}`);
    if (ld.flexGrow > 0) ln(`- flex-grow used: ${ld.flexGrow} elements`);
    if (ld.orderUsage > 0) ln(`- CSS order used: ${ld.orderUsage} elements`);
    if (ld.columnCount > 0) ln(`- Multi-column layout: ${ld.columnCount} elements`);
    if (ld.subgrid) ln("- CSS subgrid: detected");
    if (ld.logicalProps > 0) ln(`- Logical properties: ${ld.logicalProps} rules`);
    if (Object.keys(ld.aspectRatioCSS).length > 0) ln(`- CSS aspect-ratio: ${Object.entries(ld.aspectRatioCSS).map(([k, v]) => `${k} (${v})`).join(", ")}`);
    ln();
  }

  if (data.interactionPatterns) {
    const ip = data.interactionPatterns;
    const hasData = Object.keys(ip.cursorTypes).length > 0 || ip.scrollbarCustom || ip.mediaHover || ip.contentVisibility > 0;
    if (hasData) {
      ln("### Interaction Patterns");
      ln();
      if (Object.keys(ip.cursorTypes).length > 0) ln(`- Cursor types: ${Object.entries(ip.cursorTypes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      if (ip.scrollbarCustom) ln("- Custom scrollbar: detected");
      if (ip.mediaHover) ln("- @media (hover: hover): detected");
      if (ip.focusWithin) ln("- :focus-within: detected");
      if (ip.scrollMargin > 0) ln(`- scroll-margin: ${ip.scrollMargin} elements`);
      if (ip.contentVisibility > 0) ln(`- content-visibility: auto: ${ip.contentVisibility} elements`);
      if (Object.keys(ip.willChange).length > 0) ln(`- will-change hints: ${Object.entries(ip.willChange).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      ln();
    }
  }

  if (data.formDeep) {
    const fd = data.formDeep;
    const totalInputs = Object.values(fd.inputTypes).reduce((a, b) => a + b, 0);
    if (totalInputs > 0 || fd.selectCount > 0 || fd.textareaCount > 0) {
      ln("### Form Deep");
      ln();
      if (Object.keys(fd.inputTypes).length > 0) ln(`- Input types: ${Object.entries(fd.inputTypes).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      if (fd.textareaCount > 0) ln(`- Textareas: ${fd.textareaCount}`);
      if (fd.selectCount > 0) ln(`- Selects: ${fd.selectCount}`);
      ln(`- Required: ${fd.requiredCount}, Pattern: ${fd.patternCount}, Min/max length: ${fd.minMaxLength}`);
      if (fd.fieldsets > 0) ln(`- Fieldsets: ${fd.fieldsets}, Legends: ${fd.legends}`);
      if (Object.keys(fd.autocompleteAttrs).length > 0) ln(`- Autocomplete: ${Object.entries(fd.autocompleteAttrs).map(([k, v]) => `${k} (${v})`).join(", ")}`);
      if (fd.hiddenInputs > 0) ln(`- Hidden inputs: ${fd.hiddenInputs}`);
      ln();
    }
  }

  if (data.mediaDeep) {
    const md2 = data.mediaDeep;
    ln("### Media Deep");
    ln();
    if (md2.pictureElements > 0) ln(`- Picture elements: ${md2.pictureElements}`);
    if (md2.videoElements.count > 0) ln(`- Videos: ${md2.videoElements.count} (autoplay: ${md2.videoElements.autoplay}, loop: ${md2.videoElements.loop}, muted: ${md2.videoElements.muted})`);
    if (md2.audioElements > 0) ln(`- Audio: ${md2.audioElements}`);
    if (md2.canvasElements > 0) ln(`- Canvas: ${md2.canvasElements}`);
    if (md2.figureElements > 0) ln(`- Figure/figcaption: ${md2.figureElements}/${md2.figcaptionElements}`);
    if (md2.svgComplexity.totalPaths > 0) ln(`- SVG complexity: ${md2.svgComplexity.totalPaths} paths total, avg ${md2.svgComplexity.avgPathsPerSvg}/svg`);
    if (md2.webpCount > 0) ln(`- WebP images: ${md2.webpCount}`);
    if (md2.avifCount > 0) ln(`- AVIF images: ${md2.avifCount}`);
    if (md2.dataUriImages > 0) ln(`- Data URI images: ${md2.dataUriImages}`);
    if (md2.backgroundImages > 0) ln(`- CSS background images: ${md2.backgroundImages}`);
    if (Object.keys(md2.iframesByDomain).length > 0) ln(`- Iframes: ${Object.entries(md2.iframesByDomain).map(([k, v]) => `${k} (${v})`).join(", ")}`);
    ln();
  }

  if (data.navDeep) {
    const nd = data.navDeep;
    ln("### Navigation Deep");
    ln();
    if (nd.targetBlank > 0) ln(`- External links (target=_blank): ${nd.targetBlank}`);
    if (nd.telLinks > 0) ln(`- Phone links: ${nd.telLinks}`);
    if (nd.mailtoLinks > 0) ln(`- Email links: ${nd.mailtoLinks}`);
    if (nd.downloadLinks > 0) ln(`- Download links: ${nd.downloadLinks}`);
    if (nd.hashLinks > 0) ln(`- Anchor links: ${nd.hashLinks}`);
    if (nd.megaMenu) ln("- Mega menu: detected");
    if (nd.nestedNavDepth > 0) ln(`- Nested nav depth: ${nd.nestedNavDepth}`);
    if (nd.footerColumns > 0) ln(`- Footer columns: ${nd.footerColumns}`);
    if (nd.sidebarLinks > 0) ln(`- Sidebar links: ${nd.sidebarLinks}`);
    if (nd.legalLinks.length > 0) ln(`- Legal links: ${nd.legalLinks.join(", ")}`);
    ln();
  }

  if (data.a11yDeep) {
    const ad = data.a11yDeep;
    ln("### Accessibility Deep");
    ln();
    ln(`- Focusable elements: ${ad.focusableElements}`);
    if (ad.ariaHidden > 0) ln(`- aria-hidden: ${ad.ariaHidden}`);
    if (ad.ariaExpanded > 0) ln(`- aria-expanded: ${ad.ariaExpanded}`);
    if (ad.ariaControls > 0) ln(`- aria-controls: ${ad.ariaControls}`);
    if (ad.srOnlyElements > 0) ln(`- Screen-reader-only text: ${ad.srOnlyElements}`);
    if (ad.dialogElements > 0) ln(`- Dialog elements: ${ad.dialogElements}`);
    if (ad.langAttributes > 0) ln(`- Element-level lang attrs: ${ad.langAttributes}`);
    if (ad.positiveTabindex > 0) ln(`- Positive tabindex (anti-pattern): ${ad.positiveTabindex}`);
    if (ad.negativeTabindex > 0) ln(`- Negative tabindex: ${ad.negativeTabindex}`);
    const topAria = Object.entries(ad.ariaAttributes).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (topAria.length > 0) ln(`- Top ARIA attrs: ${topAria.map(([k, v]) => `${k} (${v})`).join(", ")}`);
    ln();
  }

  if (data.perfDeep) {
    const pd = data.perfDeep;
    ln("### Performance Deep");
    ln();
    if (pd.moduleScripts > 0) ln(`- Module scripts: ${pd.moduleScripts}`);
    if (pd.classicScripts > 0) ln(`- Classic scripts: ${pd.classicScripts}`);
    if (pd.criticalCSS > 0) ln(`- Critical CSS (inline in head): ${pd.criticalCSS}`);
    if (pd.inlineScriptBytes > 0) ln(`- Inline script size: ${(pd.inlineScriptBytes / 1024).toFixed(1)}KB`);
    if (pd.inlineStyleBytes > 0) ln(`- Inline style size: ${(pd.inlineStyleBytes / 1024).toFixed(1)}KB`);
    if (pd.webComponents > 0) ln(`- Web components: ${pd.webComponents}`);
    if (pd.shadowDOMs > 0) ln(`- Shadow DOMs: ${pd.shadowDOMs}`);
    if (pd.importMaps > 0) ln(`- Import maps: ${pd.importMaps}`);
    if (pd.cssContainment > 0) ln(`- CSS containment: ${pd.cssContainment} elements`);
    if (pd.contentVisibility > 0) ln(`- content-visibility: auto: ${pd.contentVisibility}`);
    if (pd.fetchPriority.high > 0) ln(`- fetchpriority=high: ${pd.fetchPriority.high}`);
    if (pd.loadingAttr.lazy > 0) ln(`- loading=lazy: ${pd.loadingAttr.lazy}`);
    if (pd.dnsPrefetch > 0) ln(`- dns-prefetch: ${pd.dnsPrefetch}`);
    if (pd.modulePreload > 0) ln(`- modulepreload: ${pd.modulePreload}`);
    ln();
  }

  if (data.contentMetrics) {
    const cm = data.contentMetrics;
    ln("### Content Metrics");
    ln();
    ln(`- Total words: ${cm.wordCount}`);
    ln(`- Paragraphs: ${cm.paragraphCount} (avg ${cm.avgParagraphLength} words, longest ${cm.longestParagraph})`);
    ln(`- Above-fold text: ${Math.round(cm.aboveFoldText / Math.max(cm.totalTextLength, 1) * 100)}%`);
    ln(`- Content-to-chrome ratio: ${cm.contentToChromeRatio}%`);
    ln(`- Link-to-text ratio: ${cm.linkToTextRatio}%`);
    ln(`- Heading density: ${cm.headingDensity}%`);
    if (cm.tableCount > 0) ln(`- Tables: ${cm.tableCount}`);
    if (cm.codeBlocks > 0) ln(`- Code blocks: ${cm.codeBlocks}`);
    if (cm.blockquotes > 0) ln(`- Blockquotes: ${cm.blockquotes}`);
    if (cm.detailsElements > 0) ln(`- Details/summary: ${cm.detailsElements}`);
    if (cm.mathElements > 0) ln(`- Math elements: ${cm.mathElements}`);
    if (cm.timeElements > 0) ln(`- Time elements: ${cm.timeElements}`);
    ln();
  }
  hr(); ln();

  // ── 20. AGENT BUILD GUIDE ─────────────────────────────────
  ln("## 20. Agent Build Guide");
  ln();
  ln("### Quick Reference");
  ln();
  ln("```");
  for (const c of ds.colors.filter(c => ["background", "text-primary", "accent", "surface", "border"].includes(c.role)).slice(0, 6)) ln(`${c.role}: ${c.hex}`);
  ln(`font-primary: ${ds.fonts[0]?.families[0] || "system-ui"}`);
  if (ds.fonts[1]) ln(`font-secondary: ${ds.fonts[1].families[0]}`);
  if (ds.gridSystem) ln(`spacing-grid: ${ds.gridSystem.base}px`);
  if (ds.radii[0]) ln(`radius: ${ds.radii[0].value}`);
  ln(`voice: ${voice.contentPersonality}`);
  ln(`page-type: ${ux.pageType}`);
  ln("```");
  ln();

  ln("### Full Prompt");
  ln();
  ln("```");
  ln("Build a product page with the following DNA:");
  ln();
  ln("IDENTITY:");
  ln(`  Name: ${esc(data.identity.ogSiteName || data.identity.title.split(/[|\-–—]/)[0].trim())}`);
  ln(`  Type: ${ux.pageType}`);
  ln(`  Voice: ${voice.contentPersonality}`);
  ln(`  CTA style: ${voice.ctaPattern}`);
  ln();
  ln("VISUAL:");
  for (const c of ds.colors.slice(0, 6)) ln(`  ${c.role}: ${c.hex}`);
  ln(`  Primary font: ${ds.fonts[0]?.families[0] || "system-ui"}`);
  if (ds.fonts[1]) ln(`  Secondary font: ${ds.fonts[1].families[0]}`);
  for (const [level, h] of Object.entries(ds.headingMap).sort()) ln(`  ${level}: ${h.size} / ${h.weight}`);
  if (ds.gridSystem) ln(`  Spacing: ${ds.gridSystem.base}px grid`);
  if (ds.radii[0]) ln(`  Radius: ${ds.radii[0].value}`);
  if (ds.shadows[0]) ln(`  Shadow: ${ds.shadows[0].value.slice(0, 60)}`);
  ln();
  ln("VOICE:");
  ln(`  Tone: ${voice.contentPersonality}`);
  ln(`  Reading level: ${voice.readingLevel}`);
  ln(`  Pronouns: ${voice.pronounStrategy}`);
  ln(`  CTA style: ${voice.ctaPattern}`);
  if (data.content.ctaTexts[0]) ln(`  Example CTA: "${esc(data.content.ctaTexts[0])}"`);
  ln();
  ln("UX:");
  ln(`  Patterns: ${ux.patternSummary.join(", ") || "none detected"}`);
  ln(`  Navigation: ${ux.navigationComplexity}`);
  ln(`  Interactivity: ${ux.interactivityLevel}`);
  if (data.uxPatterns.hero?.headline) ln(`  Hero headline: "${esc(data.uxPatterns.hero.headline.slice(0, 80))}"`);
  ln("```");
  ln();

  return l.join("\n");
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function esc(s) {
  if (typeof s !== "string") return "";
  return s.replace(/<[^>]*>/g, "").replace(/on\w+\s*=/gi, "").replace(/javascript:/gi, "").replace(/[|]/g, "\\|");
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function kebab(s) { return s.replace(/([A-Z])/g, "-$1").toLowerCase(); }
