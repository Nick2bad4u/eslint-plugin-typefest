/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present-filter.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const invalidFixtureName = "prefer-ts-extras-is-present-filter.invalid.ts";
const validFixtureName = "prefer-ts-extras-is-present-filter.valid.ts";
const inlineInvalidPredicateUndefinedStrictCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidTypeofUndefinedGuardCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    '    (value): value is string => value !== null && typeof value !== "undefined"',
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidStrictNullWithoutPredicateCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => value !== null);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidFilterBlockBodyCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => {",
    "    return value != null;",
    "});",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidFunctionExpressionCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter(function (value) {",
    "    return value != null;",
    "});",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidComputedFilterCode = [
    "declare const values: readonly (null | string)[];",
    "",
    'const presentValues = values["filter"]((value) => value != null);',
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidNoCallbackCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter();",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidDestructuredParameterCode = [
    "declare const values: readonly ({ readonly value: null | string })[];",
    "",
    "const presentValues = values.filter(({ value }) => value != null);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidMapCallbackCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const mapped = values.map((value) => value != null);",
    "",
    "String(mapped.length);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-is-present-filter",
    getPluginRule("prefer-ts-extras-is-present-filter"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasIsPresentFilter" },
                    { messageId: "preferTsExtrasIsPresentFilter" },
                    { messageId: "preferTsExtrasIsPresentFilter" },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidPredicateUndefinedStrictCode,
                errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidTypeofUndefinedGuardCode,
                errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidStrictNullWithoutPredicateCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidFilterBlockBodyCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidFunctionExpressionCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidComputedFilterCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidNoCallbackCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidDestructuredParameterCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidMapCallbackCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
            },
        ],
    }
);
