/**
 * reporter.js — Generate HTML report from product DNA data
 * For educational and experimental purposes only.
 */

export function generateHTMLReport(data) {
  const score = data.dnaScore || {};
  const ds = data.designSystem || {};
  const voice = data.brandVoice || {};
  const ux = data.uxAnalysis || {};
  const intel = data.intelligence || {};
  const identity = data.identity || {};

  const primaryColor = (ds.colors || [])[0]?.hex || "#5e6ad2";
  const siteName = identity.ogSiteName || identity.title?.split(/[|\-–—]/)[0]?.trim() || "Unknown";

  const scoreDimensions = Object.entries(score)
    .filter(([k, v]) => typeof v === "number" && k !== "overall")
    .map(([k, v]) => `<div class="score-item"><div class="score-bar"><div class="score-fill" style="width:${v}%;background:${v>=70?'#22c55e':v>=40?'#eab308':'#ef4444'}"></div></div><span class="score-label">${k}</span><span class="score-value">${v}</span></div>`)
    .join("\n");

  const colorSwatches = (ds.colors || []).slice(0, 12)
    .map(c => `<div class="swatch" style="background:${esc(c.hex)}" title="${esc(c.hex)} (${c.role || 'unknown'})">${esc(c.hex)}</div>`)
    .join("\n");

  const fontList = (ds.fonts || []).slice(0, 4)
    .map(f => `<div class="font-item"><span class="font-sample" style="font-family:${esc(f.family)}">${esc(f.family)}</span><span class="font-weight">${f.weight || ""}</span></div>`)
    .join("\n");

  const intelCards = [];
  if (intel.croAudit) intelCards.push(card("CRO Audit", intel.croAudit.grade, intel.croAudit.score));
  if (intel.mobileUX) intelCards.push(card("Mobile UX", intel.mobileUX.grade, intel.mobileUX.score));
  if (intel.designSystemMaturity) intelCards.push(card("Design System", intel.designSystemMaturity.level, intel.designSystemMaturity.score));
  if (intel.brandConsistency) intelCards.push(card("Brand", intel.brandConsistency.grade, intel.brandConsistency.score));
  if (intel.infoHierarchy) intelCards.push(card("Hierarchy", intel.infoHierarchy.grade, intel.infoHierarchy.score));
  if (intel.enterpriseReadiness) intelCards.push(card("Enterprise", intel.enterpriseReadiness.level, intel.enterpriseReadiness.score));
  if (intel.plgPatterns) intelCards.push(card("GTM", intel.plgPatterns.motion, intel.plgPatterns.score));

  const techInfo = data.techStack || {};
  const techItems = [];
  if (techInfo.framework) techItems.push(`<li>Framework: <strong>${esc(techInfo.framework)}</strong></li>`);
  if (techInfo.cssFramework) techItems.push(`<li>CSS: <strong>${esc(techInfo.cssFramework)}</strong></li>`);
  if (techInfo.analytics?.length) techItems.push(`<li>Analytics: ${techInfo.analytics.map(a => esc(a)).join(", ")}</li>`);
  if (techInfo.hosting) techItems.push(`<li>Hosting: <strong>${esc(techInfo.hosting)}</strong></li>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>STACK.md Report — ${esc(siteName)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,-apple-system,sans-serif;background:#0a0a0a;color:#e5e5e5;line-height:1.6}
.container{max-width:1100px;margin:0 auto;padding:40px 24px}
h1{font-size:2rem;font-weight:700;margin-bottom:8px}
h2{font-size:1.25rem;font-weight:600;margin:32px 0 16px;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.05em;font-size:0.75rem}
.subtitle{color:#737373;font-size:0.9rem;margin-bottom:32px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px}
.card{background:#171717;border:1px solid #262626;border-radius:12px;padding:20px}
.card-label{font-size:0.75rem;color:#737373;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px}
.card-value{font-size:1.5rem;font-weight:700}
.card-sub{font-size:0.8rem;color:#a3a3a3;margin-top:4px}
.overall-score{font-size:4rem;font-weight:800;background:linear-gradient(135deg,${primaryColor},#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px}
.score-item{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.score-bar{flex:1;height:8px;background:#262626;border-radius:4px;overflow:hidden}
.score-fill{height:100%;border-radius:4px;transition:width 0.6s ease}
.score-label{width:100px;font-size:0.8rem;color:#a3a3a3}
.score-value{width:30px;text-align:right;font-size:0.8rem;font-weight:600}
.swatches{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.swatch{width:48px;height:48px;border-radius:8px;font-size:0.55rem;display:flex;align-items:end;justify-content:center;padding-bottom:4px;color:rgba(255,255,255,0.7);text-shadow:0 1px 2px rgba(0,0,0,0.5);border:1px solid #333}
.font-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #262626}
.font-sample{font-size:1rem}.font-weight{color:#737373;font-size:0.8rem}
.intel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.intel-card{background:#171717;border:1px solid #262626;border-radius:10px;padding:16px;text-align:center}
.intel-score{font-size:1.5rem;font-weight:700;margin-bottom:2px}
.intel-label{font-size:0.7rem;color:#737373;text-transform:uppercase;letter-spacing:0.04em}
.intel-grade{font-size:0.8rem;color:#a3a3a3;margin-top:4px}
ul{list-style:none;padding:0}
li{padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:0.9rem}
li strong{color:#fff}
.footer{text-align:center;padding:40px 0;color:#525252;font-size:0.75rem}
.footer a{color:#737373}
</style>
</head>
<body>
<div class="container">
<h1>${esc(siteName)}</h1>
<p class="subtitle">Product DNA extracted from ${esc(data.url)} by stackmd</p>

<h2>DNA Score</h2>
<div class="grid">
<div class="card">
<div class="card-label">Overall</div>
<div class="overall-score">${score.overall || 0}</div>
<div class="card-sub">out of 100</div>
</div>
<div class="card" style="grid-column:span 2">
${scoreDimensions}
</div>
</div>

<h2>Intelligence</h2>
<div class="intel-grid">
${intelCards.join("\n")}
</div>

<h2>Colors</h2>
<div class="swatches">${colorSwatches}</div>

<h2>Typography</h2>
<div class="card">${fontList || "<p>No fonts detected</p>"}</div>

<h2>Technology Stack</h2>
<div class="card"><ul>${techItems.join("\n") || "<li>Not detected</li>"}</ul></div>

<h2>Brand Voice</h2>
<div class="grid">
<div class="card"><div class="card-label">Personality</div><div class="card-value" style="font-size:1rem">${(voice.personality || []).join(", ") || "—"}</div></div>
<div class="card"><div class="card-label">Reading Level</div><div class="card-value" style="font-size:1rem">${voice.readingLevel || "—"}</div></div>
<div class="card"><div class="card-label">Formality</div><div class="card-value" style="font-size:1rem">${voice.formality || "—"}</div></div>
</div>

<h2>UX Profile</h2>
<div class="grid">
<div class="card"><div class="card-label">Page Type</div><div class="card-value" style="font-size:1rem">${ux.pageType || "—"}</div></div>
<div class="card"><div class="card-label">Conversion</div><div class="card-value" style="font-size:1rem">${ux.conversionStrategy || "—"}</div></div>
<div class="card"><div class="card-label">Interactivity</div><div class="card-value" style="font-size:1rem">${ux.interactivityLevel || "—"}</div></div>
</div>

<div class="footer">Generated by <a href="https://github.com/Dragoon0x/stackmd">stackmd</a></div>
</div>
</body>
</html>`;
}

function card(label, grade, score) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  return `<div class="intel-card"><div class="intel-score" style="color:${color}">${score}</div><div class="intel-label">${esc(label)}</div><div class="intel-grade">${esc(String(grade))}</div></div>`;
}

function esc(s) {
  if (typeof s !== "string") return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
