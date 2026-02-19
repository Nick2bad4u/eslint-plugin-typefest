/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-present.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-is-present.skip.ts";
const invalidFixtureName = "prefer-ts-extras-is-present.invalid.ts";
const inlineValidThreeTermStrictPresentCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue =",
    "    maybeValue !== null && hasPermission && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNonBinaryTermCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue = maybeValue !== null && hasPermission;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue === undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentSameKindCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue !== null;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidThreeTermStrictAbsentCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue =",
    "    maybeValue === null || hasPermission || maybeValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentWithNonBinaryTermCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue = maybeValue === null || hasPermission;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidUndefinedOnLeftComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const hasUndefinedValue = undefined == maybeValue;",
    "",
    "String(hasUndefinedValue);",
].join("\n");
const inlineValidNonNullishBinaryComparisonCode = [
    "declare const firstValue: string;",
    "declare const secondValue: string;",
    "",
    "const hasSameValue = firstValue === secondValue;",
    "",
    "String(hasSameValue);",
].join("\n");
const inlineInvalidStrictPresentComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (maybeValue !== null && maybeValue !== undefined) {",
    "    String(maybeValue);",
    "}",
].join("\n");
const inlineInvalidStrictAbsentComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (maybeValue === null || maybeValue === undefined) {",
    "    String(maybeValue);",
    "}",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-is-present",
    getPluginRule("prefer-ts-extras-is-present"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresentNegated" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresentNegated" },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidStrictPresentComparisonCode,
                errors: [{ messageId: "preferTsExtrasIsPresent" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidStrictAbsentComparisonCode,
                errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidThreeTermStrictPresentCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidStrictPresentWithNonBinaryTermCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidStrictPresentOperatorMismatchCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidStrictPresentSameKindCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidThreeTermStrictAbsentCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidStrictAbsentWithNonBinaryTermCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidUndefinedOnLeftComparisonCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidNonNullishBinaryComparisonCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: readTypedFixture(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                filename: typedFixturePath(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
            },
        ],
    }
);
