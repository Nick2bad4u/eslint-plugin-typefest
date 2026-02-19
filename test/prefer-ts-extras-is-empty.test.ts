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
        },
        {
            code: leftLiteralInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: unionTupleInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: mutableTupleInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsEmpty" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonLengthValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonEqualityValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: mixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-is-empty.skip.ts"
            ),
        },
    ],
});
