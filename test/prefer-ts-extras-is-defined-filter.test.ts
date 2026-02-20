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
const strictEqualityUndefinedValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value === undefined);",
    "String(definedValues);",
].join("\n");
const nonUndefinedLooseComparisonValidCode = [
    "const values: Array<number | null> = [1, null, 2];",
    "const definedValues = values.filter((value) => value != null);",
    "String(definedValues);",
].join("\n");
const identifierBodyValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value);",
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
const inlineFixableCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value !== undefined);",
    "String(definedValues);",
].join("\n");
const inlineFixableOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");

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
                name: "reports fixture filter guards for undefined",
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports arrow predicate value !== undefined",
            },
            {
                code: inlineInvalidRightSideCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports arrow predicate undefined !== value",
            },
            {
                code: typeofInvalidCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports typeof undefined predicate",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes filter callback to isDefined when import is in scope",
                output: inlineFixableOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: nonFilterValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-filter array method",
            },
            {
                code: noArgumentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores filter call without callback",
            },
            {
                code: functionExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores function-expression callback",
            },
            {
                code: blockBodyArrowValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores block-body arrow callback",
            },
            {
                code: twoParamsArrowValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores callback using additional index parameter",
            },
            {
                code: destructuredParamValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores destructured callback parameter",
            },
            {
                code: typeofRightInvalidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores reversed typeof undefined comparison",
            },
            {
                code: strictEqualityUndefinedValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict equality comparison against undefined",
            },
            {
                code: nonUndefinedLooseComparisonValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores loose comparison against null",
            },
            {
                code: identifierBodyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores callback returning identifier directly",
            },
            {
                code: computedFilterValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed filter property access",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-is-defined-filter.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
