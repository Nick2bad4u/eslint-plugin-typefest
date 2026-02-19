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

const validFixtureName = "prefer-ts-extras-assert-present.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-present.invalid.ts";

const inlineInvalidEqNullCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const inlineInvalidLogicalCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const inlineInvalidLogicalReversedCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (undefined === value || null === value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const nonThrowConsequentValidCode = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value == null) {",
    "        return null;",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const multiStatementThrowBlockValidCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        String(value);",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const sameKindLogicalValidCode = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value === null || value === null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const alternateBranchValidCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError('Missing value');",
    "    } else {",
    "        return value;",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const mismatchedLogicalExpressionValidCode = [
    "function ensureValue(value: string | null | undefined, fallback: string | null | undefined): string {",
    "    if (value === null || fallback === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value ?? fallback ?? 'fallback';",
    "}",
].join("\n");
const nonNullishLogicalValidCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === '' || value === 'missing') {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value ?? 'fallback';",
    "}",
].join("\n");
const nonEqualityTestValidCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (!value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const invalidNullOnLeftEqGuardCode = [
    "function ensureValue(value: string | null): string {",
    "    if (null == value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const skipPathInvalidCode = inlineInvalidEqNullCode;

ruleTester.run(
    "prefer-ts-extras-assert-present",
    getPluginRule("prefer-ts-extras-assert-present"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                    },
                    {
                        messageId: "preferTsExtrasAssertPresent",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidEqNullCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidLogicalCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidLogicalReversedCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: invalidNullOnLeftEqGuardCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: nonThrowConsequentValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: multiStatementThrowBlockValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: sameKindLogicalValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: alternateBranchValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mismatchedLogicalExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: nonNullishLogicalValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: nonEqualityTestValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-assert-present.skip.ts"
                ),
            },
        ],
    }
);
