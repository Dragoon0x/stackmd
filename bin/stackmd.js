#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { stack } from "../src/index.js";
import { writeFileSync } from "fs";
import { resolve } from "path";

const program = new Command();

program
  .name("stackmd")
  .description("Extract full product DNA from any live URL into a STACK.md")
  .version("0.1.0");

program
  .argument("<url>", "URL to extract product DNA from")
  .option("-o, --output <path>", "output file path", "./STACK.md")
  .option("--json", "also output raw data as JSON", false)
  .option("--dark", "extract dark mode tokens", false)
  .option("--wait <ms>", "wait time for dynamic content", "3000")
  .action(async (url, options) => {
    console.log("");
    console.log(chalk.bold("  stackmd") + chalk.dim("  · full product DNA extraction"));
    console.log(chalk.dim(`  ${url}`));
    console.log("");

    const spinner = ora({ text: "Launching browser...", color: "cyan" }).start();

    try {
      const result = await stack(url, {
        wait: parseInt(options.wait),
        extractDark: options.dark,
        onProgress: (msg) => { spinner.text = msg; },
      });

      spinner.succeed("Extraction complete");
      console.log("");

      const outputPath = resolve(options.output);
      writeFileSync(outputPath, result.markdown, "utf-8");
      console.log(chalk.green("  ✓") + ` STACK.md → ${outputPath}`);

      if (options.json) {
        const jsonPath = outputPath.replace(/\.md$/, ".json");
        writeFileSync(jsonPath, JSON.stringify(result.data, null, 2), "utf-8");
        console.log(chalk.green("  ✓") + ` Raw data → ${jsonPath}`);
      }

      const d = result.data;
      const score = d.dnaScore;
      console.log("");
      console.log(chalk.dim("  Summary"));
      console.log(
        chalk.dim(`  ${d.designSystem.colors.length} colors · ${d.designSystem.fonts.length} fonts · `) +
        chalk.dim(`${d.designSystem.components.length} components · ${d.uxAnalysis.patternSummary.length} UX patterns`)
      );
      console.log(
        chalk.dim("  Voice: ") + chalk.white(d.brandVoice.contentPersonality) +
        chalk.dim(" · Page: ") + chalk.white(d.uxAnalysis.pageType) +
        chalk.dim(" · Score: ") + chalk[score.overall > 70 ? "green" : "yellow"](`${score.overall}/100`)
      );
      if (d.techStack.frameworks.length > 0)
        console.log(chalk.dim(`  Stack: ${d.techStack.frameworks.join(", ")}${d.techStack.cssFramework ? " + " + d.techStack.cssFramework : ""}`));
      console.log("");
    } catch (err) {
      spinner.fail("Extraction failed");
      console.error(chalk.red(`\n  ${err.message}\n`));
      process.exit(1);
    }
  });

program.parse();
