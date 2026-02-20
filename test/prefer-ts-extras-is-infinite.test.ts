/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-infinite.test` behavior.
 */
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
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
