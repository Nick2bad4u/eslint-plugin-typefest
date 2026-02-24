/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-infinite.test` behavior.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-infinite");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-infinite.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-infinite.invalid.ts";
const inlineInvalidPositiveInfinityCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric == Number.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidLeftInfinityCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = Infinity === metric;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidNonEqualityOperatorCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric > Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidWithoutInfinityReferenceCode = [
    "declare const metric: number;",
    "declare const fallbackMetric: number;",
    "",
    "const hasSameMetric = metric === fallbackMetric;",
    "",
    "String(hasSameMetric);",
].join("\n");
const inlineValidComputedInfinityMemberCode = [
    "declare const metric: number;",
    "",
    'const isInfiniteMetric = metric === Number["POSITIVE_INFINITY"];',
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidOtherObjectInfinityMemberCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Math.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidNonInfinityNumberPropertyCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.MAX_VALUE;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableDualSignCode = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableDualSignOutput = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = isInfinite(metric);",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableInfinityIdentifierDualSignCode = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = Infinity === metric || Number.NEGATIVE_INFINITY === metric;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableInfinityIdentifierDualSignOutput = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = isInfinite(metric);",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidMixedStrictnessDualSignCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric == Number.POSITIVE_INFINITY || metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidSameSignStrictDisjunctionCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidDifferentComparedExpressionsCode = [
    "declare const firstMetric: number;",
    "declare const secondMetric: number;",
    "",
    "const isInfiniteMetric = firstMetric === Number.POSITIVE_INFINITY || secondMetric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidLogicalAndDualSignCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY && metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidMathNegativeInfinityDisjunctionCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Math.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-is-infinite",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras isInfinite over direct Infinity equality checks for consistent predicate helper usage.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasIsInfinite:
                "Prefer `isInfinite` from `ts-extras` over direct Infinity equality checks.",
        },
        name: "prefer-ts-extras-is-infinite",
    }
);

describe("prefer-ts-extras-is-infinite source assertions", () => {
    it("keeps is-infinite helper guards and comparisons in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-is-infinite.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('node.property.type === "Identifier" &&');
        expect(ruleSource).toContain(
            '(node.property.name === "POSITIVE_INFINITY" ||\n            node.property.name === "NEGATIVE_INFINITY")'
        );
        expect(ruleSource).toContain(
            'if (node.type === "Identifier" && node.name === "Infinity") {'
        );
        expect(ruleSource).toContain('node.object.name !== "Number" ||');
        expect(ruleSource).toContain('node.property.type !== "Identifier"');
        expect(ruleSource).toContain(
            'if (node.property.name === "NEGATIVE_INFINITY") {'
        );
        expect(ruleSource).toContain(
            '(expression.operator !== "==" && expression.operator !== "===")'
        );
        expect(ruleSource).toContain("if (leftKind && !rightKind) {");
        expect(ruleSource).toContain('if (node.operator !== "||") {');
        expect(ruleSource).toContain(
            'if (left.operator !== "===" || right.operator !== "===") {'
        );
        expect(ruleSource).toContain("if (left.kind === right.kind) {");
        expect(ruleSource).toContain(
            "sourceCode.getText(left.comparedExpression).trim() ==="
        );
        expect(ruleSource).toContain(
            "sourceCode.getText(right.comparedExpression).trim()"
        );
        expect(ruleSource).toContain('parent?.type === "LogicalExpression" &&');
    });
});

ruleTester.run("prefer-ts-extras-is-infinite", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsInfinite",
                },
                {
                    messageId: "preferTsExtrasIsInfinite",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture infinity comparisons",
        },
        {
            code: inlineInvalidPositiveInfinityCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose equality against Number.POSITIVE_INFINITY",
        },
        {
            code: inlineInvalidLeftInfinityCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict equality with Infinity literal on left",
        },
        {
            code: inlineFixableDualSignCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes strict dual-sign infinity disjunction when isInfinite import is in scope",
            output: inlineFixableDualSignOutput,
        },
        {
            code: inlineFixableInfinityIdentifierDualSignCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes strict dual-sign disjunction when Infinity identifier appears on left",
            output: inlineFixableInfinityIdentifierDualSignOutput,
        },
        {
            code: inlineInvalidMixedStrictnessDualSignCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mixed strictness dual-sign disjunction without treating it as safe helper target",
        },
        {
            code: inlineInvalidSameSignStrictDisjunctionCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict disjunction comparing only positive infinity variants",
        },
        {
            code: inlineInvalidDifferentComparedExpressionsCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict dual-sign disjunction when compared expressions differ",
        },
        {
            code: inlineInvalidLogicalAndDualSignCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports logical-and dual-sign comparisons without collapsing into helper form",
        },
        {
            code: inlineInvalidMathNegativeInfinityDisjunctionCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports only Number infinity comparisons when paired side is non-Number member",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidNonEqualityOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-equality infinity comparison",
        },
        {
            code: inlineValidWithoutInfinityReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparison without infinity reference",
        },
        {
            code: inlineValidComputedInfinityMemberCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Number infinity member access",
        },
        {
            code: inlineValidOtherObjectInfinityMemberCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores infinity member access on non-Number object",
        },
        {
            code: inlineValidNonInfinityNumberPropertyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number member comparisons that are not infinity constants",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
