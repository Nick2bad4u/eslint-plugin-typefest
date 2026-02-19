/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-not.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-not");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-not.valid.ts";
const invalidFixtureName = "prefer-ts-extras-not.invalid.ts";
const inlineInvalidArrowNegatedPredicateCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidFilterWithoutArgumentsCode = [
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const maybeEntries = nullableEntries.filter();",
    "",
    "String(maybeEntries.length);",
].join("\n");
const inlineValidMapNegatedPredicateCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const mappedEntries = nullableEntries.map((value) => !isPresent(value));",
    "",
    "String(mappedEntries.length);",
].join("\n");
const inlineValidFunctionExpressionCallbackCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(function (value) {",
    "    return !isPresent(value);",
    "});",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidTwoParamsCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value, index) => !isPresent(value));",
    "",
    "String(index);",
    "String(missingEntries.length);",
].join("\n");
const inlineValidNonIdentifierParameterCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(([value]) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidNotUnaryExpressionCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidUnaryNotCallExpressionCode = [
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !value);",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidPredicateWithTwoArgumentsCode = [
    "declare function isPresent<TValue>(value: TValue, fallback: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value, value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidMismatchedArgumentNameCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "declare const differentValue: null | string;",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(differentValue));",
    "",
    "String(value);",
    "String(missingEntries.length);",
].join("\n");
const inlineValidIdentifierCallbackCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const isMissing = (value: null | string): boolean => !isPresent(value);",
    "const missingEntries = nullableEntries.filter(isMissing);",
    "",
    "String(missingEntries.length);",
].join("\n");

ruleTester.run("prefer-ts-extras-not", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasNot",
                },
                {
                    messageId: "preferTsExtrasNot",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidArrowNegatedPredicateCode,
            errors: [{ messageId: "preferTsExtrasNot" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidFilterWithoutArgumentsCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMapNegatedPredicateCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidFunctionExpressionCallbackCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidTwoParamsCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidNonIdentifierParameterCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidNotUnaryExpressionCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidUnaryNotCallExpressionCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidPredicateWithTwoArgumentsCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMismatchedArgumentNameCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidIdentifierCallbackCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
        },
    ],
});
