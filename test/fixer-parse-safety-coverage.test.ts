/**
 * @packageDocumentation
 * Coverage guard ensuring fixable/suggestion-capable rules retain parser-backed
 * fast-check parse-safety tests in their corresponding rule test files.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const projectRootPath = process.cwd();
const rulesDirectoryPath = path.resolve(projectRootPath, "src/rules");
const testsDirectoryPath = path.resolve(projectRootPath, "test");

const collectRuleIdsRequiringParseSafety = (): readonly string[] => {
    const ruleEntries = readdirSync(rulesDirectoryPath, {
        withFileTypes: true,
    });
    const requiringCoverageRuleIds: string[] = [];

    for (const ruleEntry of ruleEntries) {
        if (ruleEntry.isFile() && ruleEntry.name.endsWith(".ts")) {
            const ruleFilePath = path.join(rulesDirectoryPath, ruleEntry.name);
            const ruleSource = readFileSync(ruleFilePath, "utf8");
            const requiresParseSafetyCoverage =
                ruleSource.includes('fixable: "code"') ||
                ruleSource.includes("hasSuggestions: true");

            if (requiresParseSafetyCoverage) {
                requiringCoverageRuleIds.push(
                    path.basename(ruleEntry.name, ".ts")
                );
            }
        }
    }

    return requiringCoverageRuleIds.toSorted((left, right) =>
        left.localeCompare(right)
    );
};

describe("fixer parse-safety coverage", () => {
    it("ensures each fixable/suggestion rule test includes parser + fast-check parse guards", () => {
        const ruleIds = collectRuleIdsRequiringParseSafety();

        expect(ruleIds.length).toBeGreaterThan(0);

        const missingTestFiles: string[] = [];
        const missingParserGuards: string[] = [];
        const missingFastCheckGuards: string[] = [];

        for (const ruleId of ruleIds) {
            const ruleTestFilePath = path.join(
                testsDirectoryPath,
                `${ruleId}.test.ts`
            );

            if (existsSync(ruleTestFilePath)) {
                const testSource = readFileSync(ruleTestFilePath, "utf8");

                if (!testSource.includes("parseForESLint")) {
                    missingParserGuards.push(ruleId);
                }

                if (!testSource.includes("fast-check:")) {
                    missingFastCheckGuards.push(ruleId);
                }
            } else {
                missingTestFiles.push(ruleId);
            }
        }

        expect(missingTestFiles).toStrictEqual([]);
        expect(missingParserGuards).toStrictEqual([]);
        expect(missingFastCheckGuards).toStrictEqual([]);
    });
});
