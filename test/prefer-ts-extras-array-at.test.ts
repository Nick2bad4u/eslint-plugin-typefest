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

const validFixtureName = "prefer-ts-extras-array-at.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-at.invalid.ts";
const computedAccessValidCode = [
    "const values = [1, 2, 3];",
    'const value = values["at"](0);',
    "String(value);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    at(index: number): number {",
    "        return index;",
    "    },",
    "};",
    "const value = helper.at(0);",
    "String(value);",
].join("\n");
const wrongPropertyValidCode = [
    "const values = [1, 2, 3];",
    "const value = values.find((item) => item === 2);",
    "String(value);",
].join("\n");
const readonlyArrayInvalidCode = [
    "declare const values: readonly number[];",
    "const value = values.at(0);",
    "String(value);",
].join("\n");
const readonlyArrayInvalidOutput = [
    'import { arrayAt } from "ts-extras";',
    "declare const values: readonly number[];",
    "const value = arrayAt(values, 0);",
    "String(value);",
].join("\n");
const unionWithNonArrayValidCode = [
    "declare const values: number[] | number;",
    "const value = values.at(0);",
    "String(value);",
].join("\n");
const unionWithNonArrayOutput = [
    'import { arrayAt } from "ts-extras";',
    "declare const values: number[] | number;",
    "const value = arrayAt(values, 0);",
    "String(value);",
].join("\n");
const inlineFixableCode = [
    'import { arrayAt } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const value = sample.at(0);",
].join("\n");
const inlineFixableOutput = [
    'import { arrayAt } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const value = arrayAt(sample, 0);",
].join("\n");
const disableImportInsertionSettings = {
    typefest: {
        disableImportInsertionFixes: true,
    },
};
const disableAllAutofixesSettings = {
    typefest: {
        disableAllAutofixes: true,
    },
};

ruleTester.run(
    "prefer-ts-extras-array-at",
    getPluginRule("prefer-ts-extras-array-at"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayAt",
                    },
                    {
                        messageId: "preferTsExtrasArrayAt",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture-based .at usages",
            },
            {
                code: readonlyArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports readonly array .at call",
                output: readonlyArrayInvalidOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes array.at() when arrayAt import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "still autofixes when disableImportInsertionFixes is enabled and import already exists",
                output: inlineFixableOutput,
                settings: disableImportInsertionSettings,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "skips all autofixes when disableAllAutofixes is enabled",
                output: null,
                settings: disableAllAutofixesSettings,
            },
            {
                code: unionWithNonArrayValidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union containing array when calling .at",
                output: unionWithNonArrayOutput,
            },
            {
                code: unionWithNonArrayValidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "skips autofix when import insertion fixes are globally disabled",
                output: null,
                settings: disableImportInsertionSettings,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: computedAccessValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed .at member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array at method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-at array method calls",
            },
        ],
    }
);
