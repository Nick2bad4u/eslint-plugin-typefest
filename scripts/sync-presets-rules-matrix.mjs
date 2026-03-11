/**
 * @packageDocumentation
 * Synchronize or validate the presets page rule matrix from canonical rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import builtPlugin from "../dist/plugin.js";
import { generateReadmeRulesSectionFromRules } from "./sync-readme-rules-table.mjs";

/**
 * @typedef {Readonly<{
 *     meta?: {
 *         docs?: {
 *             typefestConfigs?: readonly string[] | string;
 *             url?: string;
 *         };
 *         fixable?: string;
 *         hasSuggestions?: boolean;
 *     };
 * }>} RuleModule
 */

/** @typedef {Readonly<Record<string, RuleModule>>} RulesMap */

const matrixSectionHeading = "## Rule matrix";

/**
 * Normalize markdown table row spacing so formatter-aligned columns compare
 * equivalently to compact generated rows.
 *
 * @param {string} markdown
 *
 * @returns {string}
 */
const normalizeMarkdownTableSpacing = (markdown) =>
    markdown
        .replace(/\r\n/gv, "\n")
        .split("\n")
        .map((line) => {
            const trimmedLine = line.trimEnd();

            if (!/^\|.*\|$/v.test(trimmedLine)) {
                return trimmedLine;
            }

            const cells = trimmedLine
                .split("|")
                .slice(1, -1)
                .map((cell) => {
                    const trimmedCell = cell.trim();

                    if (!/^:?-+:?$/v.test(trimmedCell)) {
                        return trimmedCell;
                    }

                    const hasStartColon = trimmedCell.startsWith(":");
                    const hasEndColon = trimmedCell.endsWith(":");

                    if (hasStartColon && hasEndColon) {
                        return ":-:";
                    }

                    if (hasStartColon) {
                        return ":--";
                    }

                    if (hasEndColon) {
                        return "--:";
                    }

                    return "---";
                });

            return `| ${cells.join(" | ")} |`;
        })
        .join("\n");

/**
 * Generate the canonical presets page rule-matrix section from plugin rules
 * metadata.
 *
 * @param {RulesMap} rules - Plugin `rules` map.
 *
 * @returns {string} Full markdown section text starting at `## Rule matrix`.
 */
export const generatePresetsRulesMatrixSectionFromRules = (rules) => {
    const readmeRulesSection = generateReadmeRulesSectionFromRules(rules)
        .replace(/\r\n/gv, "\n")
        .split("\n");

    const rulesBodyWithoutHeading = readmeRulesSection.slice(2);

    return [
        matrixSectionHeading,
        "",
        ...rulesBodyWithoutHeading,
    ].join("\n");
};

/**
 * @param {{ writeChanges: boolean }} input
 */
const syncPresetsRulesMatrix = async ({ writeChanges }) => {
    const workspaceRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const presetsIndexPath = resolve(
        workspaceRoot,
        "docs/rules/presets/index.md"
    );
    const presetsIndexMarkdown = await readFile(presetsIndexPath, "utf8");

    const headingOffset = presetsIndexMarkdown.indexOf(matrixSectionHeading);

    if (headingOffset < 0) {
        throw new Error(
            "docs/rules/presets/index.md is missing the '## Rule matrix' section heading."
        );
    }

    const nextHeadingOffset = presetsIndexMarkdown.indexOf(
        "\n## ",
        headingOffset + matrixSectionHeading.length
    );

    const sectionEndOffset =
        nextHeadingOffset < 0
            ? presetsIndexMarkdown.length
            : nextHeadingOffset + 1;

    const existingSection = presetsIndexMarkdown.slice(
        headingOffset,
        sectionEndOffset
    );
    const generatedSection = generatePresetsRulesMatrixSectionFromRules(
        /** @type {RulesMap} */ (builtPlugin.rules)
    );

    if (
        normalizeMarkdownTableSpacing(existingSection) ===
        normalizeMarkdownTableSpacing(generatedSection)
    ) {
        return {
            changed: false,
        };
    }

    const markdownPrefix = presetsIndexMarkdown
        .slice(0, headingOffset)
        .trimEnd();
    const markdownSuffix = presetsIndexMarkdown.slice(sectionEndOffset);
    const nextPresetsMarkdown =
        `${markdownPrefix}\n\n${generatedSection}` + markdownSuffix;

    if (!writeChanges) {
        return {
            changed: true,
        };
    }

    await writeFile(presetsIndexPath, nextPresetsMarkdown, "utf8");

    return {
        changed: true,
    };
};

const runCli = async () => {
    const writeChanges = process.argv.includes("--write");
    const result = await syncPresetsRulesMatrix({ writeChanges });

    if (!result.changed) {
        console.log("Presets rule matrix is already synchronized.");

        return;
    }

    if (writeChanges) {
        console.log("Presets rule matrix synchronized from plugin metadata.");

        return;
    }

    console.error(
        "Presets rule matrix is out of sync. Run: node scripts/sync-presets-rules-matrix.mjs --write"
    );
    process.exitCode = 1;
};

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await runCli();
}
