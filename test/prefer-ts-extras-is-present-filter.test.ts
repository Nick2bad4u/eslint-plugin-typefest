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
const inlineInvalidReverseNullLooseCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => null != value);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidReverseUndefinedLooseCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => undefined != value);",
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
const inlineValidStrictUndefinedWithoutPredicateCode = [
    "declare const values: readonly (string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => value !== undefined);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidAndWithoutUndefinedCheckCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => value !== null && value !== '');",
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
                name: "reports fixture present-filter guards",
            },
            {
                code: inlineInvalidPredicateUndefinedStrictCode,
                errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports predicate using strict undefined inequality",
            },
            {
                code: inlineInvalidTypeofUndefinedGuardCode,
                errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports predicate using typeof undefined check",
            },
            {
                code: inlineInvalidReverseNullLooseCode,
                errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reverse null loose inequality predicate",
            },
            {
                code: inlineInvalidReverseUndefinedLooseCode,
                errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reverse undefined loose inequality predicate",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidStrictNullWithoutPredicateCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict null inequality without type predicate",
            },
            {
                code: inlineValidStrictUndefinedWithoutPredicateCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict undefined inequality without type predicate",
            },
            {
                code: inlineValidAndWithoutUndefinedCheckCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores logical and callback lacking undefined check",
            },
            {
                code: inlineValidFilterBlockBodyCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores block-body filter callback",
            },
            {
                code: inlineValidFunctionExpressionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores function expression callback",
            },
            {
                code: inlineValidComputedFilterCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed filter property access",
            },
            {
                code: inlineValidNoCallbackCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores filter call without callback",
            },
            {
                code: inlineValidDestructuredParameterCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores destructured callback parameter",
            },
            {
                code: inlineValidMapCallbackCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-filter map callback",
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
