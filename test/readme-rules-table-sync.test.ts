/**
 * @packageDocumentation
 * Contract test that keeps README rule matrix synchronized with plugin metadata.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { generateReadmeRulesSectionFromRules } from "../scripts/sync-readme-rules-table.mjs";
import typefestPlugin from "../src/plugin";

const RULES_SECTION_HEADING = "## Rules";
const RULES_SECTION_SNAPSHOT_PATH = path.join(
    "__snapshots__",
    "readme-rules-section.generated.md"
);

/**
 * Normalize markdown table row spacing so formatter-aligned columns compare
 * equivalently to compact generated table rows.
 *
 * @param markdown - Rules section markdown.
 *
 * @returns Normalized markdown preserving semantics.
 */
const normalizeRulesSectionMarkdown = (markdown: string): string =>
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
 * Extract the README rules section body beginning at `## Rules`.
 *
 * @param markdown - Full README markdown source.
 *
 * @returns Rules section markdown including heading.
 */
const extractRulesSection = (markdown: string): string => {
    const headingOffset = markdown.indexOf(RULES_SECTION_HEADING);

    if (headingOffset === -1) {
        throw new Error("README.md is missing the `## Rules` section heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        headingOffset + RULES_SECTION_HEADING.length
    );

    const sectionEndOffset =
        nextHeadingOffset === -1 ? markdown.length : nextHeadingOffset + 1;

    return markdown.slice(headingOffset, sectionEndOffset);
};

describe("readme rules table synchronization", () => {
    it("matches the canonical rules matrix generated from plugin metadata", async () => {
        const readmePath = path.join(process.cwd(), "README.md");
        const readmeMarkdown = await fs.readFile(readmePath, "utf8");

        const readmeRulesSection = extractRulesSection(readmeMarkdown);
        const expectedRulesSection = generateReadmeRulesSectionFromRules(
            typefestPlugin.rules
        );

        expect(normalizeRulesSectionMarkdown(readmeRulesSection)).toBe(
            normalizeRulesSectionMarkdown(expectedRulesSection)
        );
    });

    it("keeps generated rules markdown snapshot-stable", async () => {
        const generatedRulesSection = generateReadmeRulesSectionFromRules(
            typefestPlugin.rules
        );

        await expect(generatedRulesSection).toMatchFileSnapshot(
            RULES_SECTION_SNAPSHOT_PATH
        );
    });
});
