#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { stack } from "../src/index.js";
import { compare, generateComparisonMd } from "../src/comparator.js";
import { generateHTMLReport } from "../src/reporter.js";
import { writeFileSync } from "fs";
import { resolve } from "path";

const program = new Command();

program
  .name("stackmd")
  .description("Extract full product DNA from any live URL into a STACK.md")
  .version("0.2.0");

program
  .argument("<url>", "URL to extract product DNA from")
  .option("-o, --output <path>", "output file path", "./STACK.md")
  .option("--json", "also output raw data as JSON", false)
  .option("--html", "also output HTML visual report", false)
  .option("--dark", "extract dark mode tokens", false)
  .option("--wait <ms>", "wait time for dynamic content", "3000")
  .option("--compare <url>", "compare with another URL")
  .action(async (url, options) => {
    console.log("");
    console.log(chalk.bold("  stackmd") + chalk.dim("  \u00b7 full product DNA extraction"));
    console.log(chalk.dim(`  ${url}`));
    if (options.compare) console.log(chalk.dim(`  vs ${options.compare}`));
    console.log("");

    const spinner = ora({ text: "Launching browser...", color: "cyan" }).start();

    try {
      const extractOpts = {
        wait: parseInt(options.wait),
        extractDark: options.dark,
        onProgress: (msg) => { spinner.text = msg; },
      };

      const result = await stack(url, extractOpts);
      spinner.succeed("Extraction complete");

      if (options.compare) {
        spinner.start("Extracting comparison target...");
        const resultB = await stack(options.compare, extractOpts);
        spinner.succeed("Comparison extraction complete");

        const report = compare(result.data, resultB.data);
        const comparisonMd = generateComparisonMd(report);

        const outputPath = resolve(options.output.replace(/\.md$/, ".comparison.md"));
        writeFileSync(outputPath, comparisonMd, "utf-8");
        console.log("");
        console.log(chalk.green("  \u2713") + ` Comparison \u2192 ${outputPath}`);

        const pathA = resolve(options.output);
        writeFileSync(pathA, result.markdown, "utf-8");
        console.log(chalk.green("  \u2713") + ` Site A STACK.md \u2192 ${pathA}`);

        const pathB = resolve(options.output.replace(/\.md$/, ".b.md"));
        writeFileSync(pathB, resultB.markdown, "utf-8");
        console.log(chalk.green("  \u2713") + ` Site B STACK.md \u2192 ${pathB}`);

        console.log("");
        printSummary(result.data, "Site A");
        printSummary(resultB.data, "Site B");
        return;
      }

      console.log("");

      const outputPath = resolve(options.output);
      writeFileSync(outputPath, result.markdown, "utf-8");
      console.log(chalk.green("  \u2713") + ` STACK.md \u2192 ${outputPath}`);

      if (options.json) {
        const jsonPath = outputPath.replace(/\.md$/, ".json");
        writeFileSync(jsonPath, JSON.stringify(result.data, null, 2), "utf-8");
        console.log(chalk.green("  \u2713") + ` Raw data \u2192 ${jsonPath}`);
      }

      if (options.html) {
        const htmlPath = outputPath.replace(/\.md$/, ".html");
        const htmlReport = generateHTMLReport(result.data);
        writeFileSync(htmlPath, htmlReport, "utf-8");
        console.log(chalk.green("  \u2713") + ` HTML report \u2192 ${htmlPath}`);
      }

      printSummary(result.data);

    } catch (err) {
      spinner.fail("Extraction failed");
      console.error(chalk.red(`\n  ${err.message}\n`));
      process.exit(1);
    }
  });

function printSummary(d, label = "") {
  const score = d.dnaScore || {};
  const prefix = label ? chalk.bold(`  [${label}] `) : "  ";
  console.log("");
  console.log(chalk.dim(`${prefix}Summary`));
  console.log(
    chalk.dim(`${prefix}${(d.designSystem?.colors || []).length} colors \u00b7 ${(d.designSystem?.fonts || []).length} fonts \u00b7 `) +
    chalk.dim(`${(d.designSystem?.components || []).length} components \u00b7 ${(d.uxAnalysis?.patternSummary || []).length} UX patterns`)
  );
  console.log(
    chalk.dim(`${prefix}Voice: `) + chalk.white(d.brandVoice?.contentPersonality || "unknown") +
    chalk.dim(" \u00b7 Page: ") + chalk.white(d.uxAnalysis?.pageType || "unknown") +
    chalk.dim(" \u00b7 Score: ") + chalk[score.overall > 70 ? "green" : "yellow"](`${score.overall || 0}/100`)
  );
  if (d.techStack?.frameworks?.length > 0)
    console.log(chalk.dim(`${prefix}Stack: ${d.techStack.frameworks.join(", ")}${d.techStack.cssFramework ? " + " + d.techStack.cssFramework : ""}`));

  const intel = d.intelligence || {};
  const intelLine = [];
  if (intel.croAudit) intelLine.push(`CRO:${intel.croAudit.grade}`);
  if (intel.mobileUX) intelLine.push(`Mobile:${intel.mobileUX.grade}`);
  if (intel.designSystemMaturity) intelLine.push(`DS:${intel.designSystemMaturity.level}`);
  if (intel.plgPatterns) intelLine.push(`GTM:${intel.plgPatterns.motion}`);
  if (intel.enterpriseReadiness) intelLine.push(`Ent:${intel.enterpriseReadiness.level}`);
  if (intelLine.length) console.log(chalk.dim(`${prefix}Intel: `) + chalk.cyan(intelLine.join(" \u00b7 ")));
  console.log(chalk.dim(`${prefix}64 extraction passes \u00b7 19 intelligence engines`));
  console.log("");
}

program.parse();
