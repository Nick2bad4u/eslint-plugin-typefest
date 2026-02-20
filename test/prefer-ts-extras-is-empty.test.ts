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

const rule = getPluginRule("prefer-ts-extras-is-empty");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-empty.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-empty.invalid.ts";
const skipPathInvalidCode = [
    "const values = [1, 2, 3];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const leftLiteralInvalidCode = [
    "const values = [1, 2, 3];",
    "const isEmpty = 0 === values.length;",
    "String(isEmpty);",
].join("\n");
const unionTupleInvalidCode = [
    "const values: [number, ...number[]] | [string, ...string[]] = [1];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const mutableTupleInvalidCode = [
    "const values: [number, ...number[]] = [1, 2];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const arrayUnionInvalidCode = [
    "declare const values: readonly number[] | string[];",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const nonLengthValidCode = [
    "const values = [1, 2, 3];",
    "const meta = { size: values.length };",
    "const isEmpty = meta.size === 0;",
    "String(isEmpty);",
].join("\n");
const nonEqualityValidCode = [
    "const values = [1, 2, 3];",
    "const isEmpty = values.length !== 0;",
    "String(isEmpty);",
].join("\n");
const mixedUnionValidCode = [
    "const values: string | string[] = 'a';",
    "const isEmpty = values.length === 0;",
    "String(isEmpty);",
].join("\n");
const inlineFixableCode = [
    'import { isEmpty } from "ts-extras";',
    "",
    "const values = [1, 2, 3] as const;",
    "const empty = values.length === 0;",
].join("\n");
const inlineFixableOutput = [
    'import { isEmpty } from "ts-extras";',
    "",
    "const values = [1, 2, 3] as const;",
    "const empty = isEmpty(values);",
].join("\n");

ruleTester.run("prefer-ts-extras-is-empty", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture length===0 checks",
        },
        {
            code: leftLiteralInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports 0===array.length comparison",
        },
        {
            code: unionTupleInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of non-empty tuples compared against zero length",
        },
        {
            code: mutableTupleInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mutable non-empty tuple length check",
        },
        {
            code: arrayUnionInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of array-like values length check",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes array length equality when isEmpty import is in scope",
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
            code: nonLengthValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-length property comparison",
        },
        {
            code: nonEqualityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-equality length comparison",
        },
        {
            code: mixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mixed string-or-array union length check",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-is-empty.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
