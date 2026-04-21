/**
 * comparator.js — Compare two product DNA extractions
 * For educational and experimental purposes only.
 */

/**
 * Compare two already-analyzed data objects (no puppeteer needed).
 */
export function compare(dataA, dataB) {
  const report = { urlA: dataA.url, urlB: dataB.url, sections: [] };

  const scoreA = dataA.dnaScore || {};
  const scoreB = dataB.dnaScore || {};
  const scoreDiffs = [];
  for (const key of Object.keys(scoreA)) {
    if (typeof scoreA[key] === "number" && typeof scoreB[key] === "number") {
      scoreDiffs.push({ dimension: key, a: scoreA[key], b: scoreB[key], diff: scoreA[key] - scoreB[key] });
    }
  }
  report.sections.push({ title: "DNA Score Comparison", data: scoreDiffs });

  const dsA = dataA.designSystem || {};
  const dsB = dataB.designSystem || {};
  report.sections.push({ title: "Design System", data: {
    fonts: { a: (dsA.fonts || []).map(f => f.family), b: (dsB.fonts || []).map(f => f.family) },
    colorCount: { a: (dsA.colors || []).length, b: (dsB.colors || []).length },
    spacingScale: { a: (dsA.spacing || []).length, b: (dsB.spacing || []).length },
  }});

  const techA = dataA.techStack || {};
  const techB = dataB.techStack || {};
  report.sections.push({ title: "Technology Stack", data: {
    framework: { a: techA.framework || "unknown", b: techB.framework || "unknown" },
    cssFramework: { a: techA.cssFramework || "unknown", b: techB.cssFramework || "unknown" },
  }});

  const voiceA = dataA.brandVoice || {};
  const voiceB = dataB.brandVoice || {};
  report.sections.push({ title: "Brand Voice", data: {
    personality: { a: voiceA.personality || [], b: voiceB.personality || [] },
    readingLevel: { a: voiceA.readingLevel || "unknown", b: voiceB.readingLevel || "unknown" },
    formality: { a: voiceA.formality || "unknown", b: voiceB.formality || "unknown" },
  }});

  const uxA = dataA.uxAnalysis || {};
  const uxB = dataB.uxAnalysis || {};
  report.sections.push({ title: "UX Analysis", data: {
    pageType: { a: uxA.pageType || "unknown", b: uxB.pageType || "unknown" },
    conversionStrategy: { a: uxA.conversionStrategy || "unknown", b: uxB.conversionStrategy || "unknown" },
  }});

  const intelA = dataA.intelligence || {};
  const intelB = dataB.intelligence || {};
  const intelDiffs = {};
  for (const key of ["croAudit", "mobileUX", "designSystemMaturity", "brandConsistency", "enterpriseReadiness"]) {
    if (intelA[key]?.score !== undefined && intelB[key]?.score !== undefined) {
      intelDiffs[key] = { a: intelA[key].score, b: intelB[key].score, diff: intelA[key].score - intelB[key].score };
    }
  }
  if (Object.keys(intelDiffs).length) report.sections.push({ title: "Intelligence Scores", data: intelDiffs });

  return report;
}

export function generateComparisonMd(report) {
  const lines = [];
  const ln = (s = "") => lines.push(s);

  ln("# Product DNA Comparison");
  ln();
  ln(`**Site A**: ${esc(report.urlA)}`);
  ln(`**Site B**: ${esc(report.urlB)}`);
  ln();

  for (const section of report.sections) {
    ln(`## ${section.title}`);
    ln();

    if (Array.isArray(section.data)) {
      ln("| Dimension | Site A | Site B | Delta |");
      ln("|-----------|--------|--------|-------|");
      for (const row of section.data) {
        const diff = row.diff > 0 ? `+${row.diff}` : `${row.diff}`;
        ln(`| ${row.dimension} | ${row.a} | ${row.b} | ${diff} |`);
      }
    } else {
      ln("| Dimension | Site A | Site B |");
      ln("|-----------|--------|--------|");
      for (const [key, val] of Object.entries(section.data)) {
        const aVal = Array.isArray(val.a) ? val.a.join(", ") || "none" : val.a;
        const bVal = Array.isArray(val.b) ? val.b.join(", ") || "none" : val.b;
        ln(`| ${key} | ${esc(String(aVal))} | ${esc(String(bVal))} |`);
      }
    }
    ln();
  }

  return lines.join("\n");
}

function esc(s) {
  if (typeof s !== "string") return "";
  return s.replace(/[|]/g, "\\|").replace(/<[^>]*>/g, "").replace(/javascript:/gi, "");
}
