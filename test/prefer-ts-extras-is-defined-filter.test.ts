/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-defined-filter.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-defined-filter.invalid.ts";

const inlineInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value !== undefined);",
    "String(definedValues);",
].join("\n");

const inlineInvalidRightSideCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => undefined !== value);",
    "String(definedValues);",
].join("\n");
const typeofInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => typeof value !== 'undefined');",
    "String(definedValues);",
].join("\n");
const typeofRightInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => 'undefined' !== typeof value);",
    "String(definedValues);",
].join("\n");

const nonFilterValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.map((value) => value);",
    "String(definedValues);",
].join("\n");
const noArgumentValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter();",
    "String(definedValues);",
].join("\n");
const functionExpressionValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(function (value) {",
    "    return value !== undefined;",
    "});",
    "String(definedValues);",
].join("\n");
const blockBodyArrowValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => {",
    "    return value !== undefined;",
    "});",
    "String(definedValues);",
].join("\n");
const twoParamsArrowValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value, index) => value !== undefined && index >= 0);",
    "String(definedValues);",
].join("\n");
const destructuredParamValidCode = [
    "const values: Array<{ value: number | undefined }> = [{ value: 1 }, { value: undefined }];",
    "const definedValues = values.filter(({ value }) => value !== undefined);",
    "String(definedValues);",
].join("\n");

const computedFilterValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    'const definedValues = values["filter"]((value) => value !== undefined);',
    "String(definedValues);",
].join("\n");

const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run(
    "prefer-ts-extras-is-defined-filter",
    getPluginRule("prefer-ts-extras-is-defined-filter"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasIsDefinedFilter" },
                    { messageId: "preferTsExtrasIsDefinedFilter" },
                    { messageId: "preferTsExtrasIsDefinedFilter" },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidRightSideCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: typeofInvalidCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: nonFilterValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: noArgumentValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: functionExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: blockBodyArrowValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: twoParamsArrowValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: destructuredParamValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: typeofRightInvalidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: computedFilterValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-is-defined-filter.skip.ts"
                ),
            },
        ],
    }
);
