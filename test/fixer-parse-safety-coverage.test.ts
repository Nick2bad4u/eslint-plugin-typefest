/**
 * @packageDocumentation
 * Coverage guard ensuring fixable/suggestion-capable rules retain parser-backed
 * fast-check parse-safety tests in their corresponding rule test files.
 */

import parser from "@typescript-eslint/parser";
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

type CoverageInspection = Readonly<{
    observedCallExpressions: ReadonlySet<string>;
}>;

type CoverageMarker = Readonly<{
    description: string;
    matcher: (inspection: CoverageInspection) => boolean;
}>;

const getCallExpressionName = (callee: unknown): null | string => {
    if (typeof callee !== "object" || callee === null) {
        return null;
    }

    const calleeRecord = callee as Readonly<Record<string, unknown>>;

    if (
        calleeRecord["type"] === "Identifier" &&
        typeof calleeRecord["name"] === "string"
    ) {
        return calleeRecord["name"];
    }

    if (
        calleeRecord["type"] !== "MemberExpression" ||
        calleeRecord["computed"] !== false
    ) {
        return null;
    }

    const memberObject = calleeRecord["object"];
    const memberProperty = calleeRecord["property"];

    if (
        typeof memberObject !== "object" ||
        memberObject === null ||
        typeof memberProperty !== "object" ||
        memberProperty === null
    ) {
        return null;
    }

    const objectRecord = memberObject as Readonly<Record<string, unknown>>;
    const propertyRecord = memberProperty as Readonly<Record<string, unknown>>;

    if (
        objectRecord["type"] !== "Identifier" ||
        typeof objectRecord["name"] !== "string" ||
        propertyRecord["type"] !== "Identifier" ||
        typeof propertyRecord["name"] !== "string"
    ) {
        return null;
    }

    return `${objectRecord["name"]}.${propertyRecord["name"]}`;
};

const isObjectRecord = (
    value: unknown
): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

const enqueueChildNodes = ({
    nodeRecord,
    nodesToVisit,
}: Readonly<{
    nodeRecord: Readonly<Record<string, unknown>>;
    nodesToVisit: unknown[];
}>): void => {
    for (const value of Object.values(nodeRecord)) {
        if (Array.isArray(value)) {
            for (const arrayValue of value) {
                nodesToVisit.push(arrayValue);
            }
        } else if (isObjectRecord(value)) {
            nodesToVisit.push(value);
        }
    }
};

const collectObservedCallExpressionFromNode = ({
    nodeRecord,
    observedCallExpressions,
}: Readonly<{
    nodeRecord: Readonly<Record<string, unknown>>;
    observedCallExpressions: Set<string>;
}>): void => {
    if (nodeRecord["type"] !== "CallExpression") {
        return;
    }

    const callExpressionName = getCallExpressionName(nodeRecord["callee"]);

    if (callExpressionName !== null) {
        observedCallExpressions.add(callExpressionName);
    }
};

const collectObservedCallExpressions = (
    sourceText: string
): ReadonlySet<string> => {
    try {
        const parsed = parser.parseForESLint(sourceText, {
            ecmaVersion: "latest",
            loc: false,
            range: false,
            sourceType: "module",
        });

        const observedCallExpressions = new Set<string>();
        const nodesToVisit: unknown[] = [parsed.ast];

        while (nodesToVisit.length > 0) {
            const currentNode = nodesToVisit.pop();

            if (isObjectRecord(currentNode)) {
                collectObservedCallExpressionFromNode({
                    nodeRecord: currentNode,
                    observedCallExpressions,
                });
                enqueueChildNodes({
                    nodeRecord: currentNode,
                    nodesToVisit,
                });
            }
        }

        return observedCallExpressions;
    } catch {
        return new Set<string>();
    }
};

const createCallExpressionCoverageMarker = ({
    callExpressionName,
    description,
}: Readonly<{
    callExpressionName: string;
    description: string;
}>): CoverageMarker => ({
    description,
    matcher: (inspection) =>
        inspection.observedCallExpressions.has(callExpressionName),
});

const coverageMarkers: readonly CoverageMarker[] = [
    createCallExpressionCoverageMarker({
        callExpressionName: "parser.parseForESLint",
        description: "parseForESLint call",
    }),
    createCallExpressionCoverageMarker({
        callExpressionName: "fc.assert",
        description: "fast-check assertion call (fc.assert)",
    }),
    createCallExpressionCoverageMarker({
        callExpressionName: "fc.property",
        description: "fast-check property call (fc.property)",
    }),
];

const pushRuleIdIfMarkerMissing = ({
    inspection,
    marker,
    missingRuleIds,
    ruleId,
}: Readonly<{
    inspection: CoverageInspection;
    marker: CoverageMarker;
    missingRuleIds: string[];
    ruleId: string;
}>): void => {
    if (!marker.matcher(inspection)) {
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
        const missingRuleIdsByMarkerDescription = new Map<string, string[]>(
            coverageMarkers.map((marker) => [marker.description, []])
        );

        for (const ruleId of ruleIds) {
            const ruleTestFilePath = path.join(
                testsDirectoryPath,
                `${ruleId}.test.ts`
            );

            if (existsSync(ruleTestFilePath)) {
                const testSource = readFileSync(ruleTestFilePath, "utf8");
                const coverageInspection: CoverageInspection = {
                    observedCallExpressions:
                        collectObservedCallExpressions(testSource),
                };

                for (const marker of coverageMarkers) {
                    const missingRuleIds =
                        missingRuleIdsByMarkerDescription.get(
                            marker.description
                        );

                    if (missingRuleIds) {
                        pushRuleIdIfMarkerMissing({
                            inspection: coverageInspection,
                            marker,
                            missingRuleIds,
                            ruleId,
                        });
                    }
                }
            } else {
                missingTestFiles.push(ruleId);
            }
        }

        expectNoMissingRuleCoverage({
            markerDescription: "rule test file",
            missingRuleIds: missingTestFiles,
        });
        for (const marker of coverageMarkers) {
            const missingRuleIds =
                missingRuleIdsByMarkerDescription.get(marker.description) ?? [];

            expectNoMissingRuleCoverage({
                markerDescription: marker.description,
                missingRuleIds,
            });
        }
    });
});
