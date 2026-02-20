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
const inlineValidStrictAbsentOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || maybeValue !== undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentSameKindCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || maybeValue === null;",
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
const inlineInvalidMapCallbackStrictPresentCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const mapped = values.map((value) => value !== null && value !== undefined);",
    "String(mapped.length);",
].join("\n");
const inlineInvalidMapCallbackStrictAbsentCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const mapped = values.map((value) => value === null || value === undefined);",
    "String(mapped.length);",
].join("\n");
const inlineValidFilterCallbackLogicalComparisonCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const presentValues = values.filter((value) => value !== null && value !== undefined);",
    "const missingValues = values.filter((value) => value === null || value === undefined);",
    "String(presentValues.length + missingValues.length);",
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
                name: "reports fixture strict present and absent checks",
            },
            {
                code: inlineInvalidStrictPresentComparisonCode,
                errors: [{ messageId: "preferTsExtrasIsPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict present conjunction check",
            },
            {
                code: inlineInvalidStrictAbsentComparisonCode,
                errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict absent disjunction check",
            },
            {
                code: inlineInvalidMapCallbackStrictPresentCode,
                errors: [{ messageId: "preferTsExtrasIsPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict present check inside map callback",
            },
            {
                code: inlineInvalidMapCallbackStrictAbsentCode,
                errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict absent check inside map callback",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidThreeTermStrictPresentCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores three-term strict present conjunction",
            },
            {
                code: inlineValidStrictPresentWithNonBinaryTermCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present conjunction with non-binary term",
            },
            {
                code: inlineValidStrictPresentOperatorMismatchCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check with operator mismatch",
            },
            {
                code: inlineValidStrictPresentSameKindCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check using repeated null branch",
            },
            {
                code: inlineValidThreeTermStrictAbsentCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores three-term strict absent disjunction",
            },
            {
                code: inlineValidStrictAbsentWithNonBinaryTermCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent disjunction with non-binary term",
            },
            {
                code: inlineValidStrictAbsentOperatorMismatchCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent check with operator mismatch",
            },
            {
                code: inlineValidStrictAbsentSameKindCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent check using repeated null branch",
            },
            {
                code: inlineValidUndefinedOnLeftComparisonCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores undefined comparison with literal on left",
            },
            {
                code: inlineValidNonNullishBinaryComparisonCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-nullish binary comparison",
            },
            {
                code: inlineValidFilterCallbackLogicalComparisonCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict checks inside filter callbacks",
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
                name: "skips file under tests fixture path",
            },
        ],
    }
);
