/**
 * @packageDocumentation
 * Coverage guard ensuring fixable/suggestion-capable rules retain parser-backed
 * fast-check parse-safety tests in their corresponding rule test files.
 */

import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";

const projectRootPath = process.cwd();
const testsDirectoryPath = path.resolve(projectRootPath, "test");

/** Entry tuple type returned by `Object.entries(typefestPlugin.rules)`. */
type RuleEntry = readonly [RuleName, RuleModule];
/** Individual rule module type from plugin rule registry. */
type RuleModule = (typeof typefestPlugin.rules)[RuleName];
/** Registered plugin rule-name union. */
type RuleName = keyof typeof typefestPlugin.rules;

const ruleRequiresParseSafetyCoverage = (
    ruleModule: Readonly<RuleModule>
): boolean => {
    const meta = ruleModule.meta;

    if (!meta) {
        return false;
    }

    return meta.fixable === "code" || meta.hasSuggestions === true;
};

const collectRuleIdsRequiringParseSafety = (): readonly string[] => {
    const requiringCoverageRuleIds: string[] = [];
    const ruleEntries = Object.entries(typefestPlugin.rules) as RuleEntry[];

    for (const [ruleId, ruleModule] of ruleEntries) {
        if (ruleRequiresParseSafetyCoverage(ruleModule)) {
            requiringCoverageRuleIds.push(ruleId);
        }
    }

    return requiringCoverageRuleIds.toSorted((left, right) =>
        left.localeCompare(right)
    );
};

const pushRuleIdIfMarkerMissing = ({
    marker,
    missingRuleIds,
    ruleId,
    testSource,
}: Readonly<{
    marker: string;
    missingRuleIds: string[];
    ruleId: string;
    testSource: string;
}>): void => {
    if (!testSource.includes(marker)) {
        missingRuleIds.push(ruleId);
    }
};

const expectNoMissingRuleCoverage = ({
    markerDescription,
    missingRuleIds,
}: Readonly<{
    markerDescription: string;
    missingRuleIds: readonly string[];
}>): void => {
    expect(
        missingRuleIds,
        `Missing ${markerDescription} coverage for: ${missingRuleIds.toSorted((left, right) => left.localeCompare(right)).join(", ")}`
    ).toStrictEqual([]);
};

describe("fixer parse-safety coverage", () => {
    it("ensures each fixable/suggestion rule test includes parser + fast-check parse guards", () => {
        const ruleIds = collectRuleIdsRequiringParseSafety();

        expect(ruleIds.length).toBeGreaterThan(0);

        const missingTestFiles: string[] = [];
        const missingParserGuards: string[] = [];
        const missingFastCheckAssertions: string[] = [];
        const missingFastCheckProperties: string[] = [];
        const missingFastCheckGuards: string[] = [];

        for (const ruleId of ruleIds) {
            const ruleTestFilePath = path.join(
                testsDirectoryPath,
                `${ruleId}.test.ts`
            );

            if (existsSync(ruleTestFilePath)) {
                const testSource = readFileSync(ruleTestFilePath, "utf8");

                pushRuleIdIfMarkerMissing({
                    marker: "parseForESLint",
                    missingRuleIds: missingParserGuards,
                    ruleId,
                    testSource,
                });
                pushRuleIdIfMarkerMissing({
                    marker: "fc.assert(",
                    missingRuleIds: missingFastCheckAssertions,
                    ruleId,
                    testSource,
                });
                pushRuleIdIfMarkerMissing({
                    marker: "fc.property(",
                    missingRuleIds: missingFastCheckProperties,
                    ruleId,
                    testSource,
                });
                pushRuleIdIfMarkerMissing({
                    marker: "fast-check:",
                    missingRuleIds: missingFastCheckGuards,
                    ruleId,
                    testSource,
                });
            } else {
                missingTestFiles.push(ruleId);
            }
        }

        expectNoMissingRuleCoverage({
            markerDescription: "rule test file",
            missingRuleIds: missingTestFiles,
        });
        expectNoMissingRuleCoverage({
            markerDescription: "parseForESLint marker",
            missingRuleIds: missingParserGuards,
        });
        expectNoMissingRuleCoverage({
            markerDescription: "fast-check assertion marker (fc.assert)",
            missingRuleIds: missingFastCheckAssertions,
        });
        expectNoMissingRuleCoverage({
            markerDescription: "fast-check property marker (fc.property)",
            missingRuleIds: missingFastCheckProperties,
        });
        expectNoMissingRuleCoverage({
            markerDescription: "fast-check test label marker (fast-check:)",
            missingRuleIds: missingFastCheckGuards,
        });
    });
});
