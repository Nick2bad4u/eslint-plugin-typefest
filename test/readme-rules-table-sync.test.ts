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

        expect(readmeRulesSection).toBe(expectedRulesSection);
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
