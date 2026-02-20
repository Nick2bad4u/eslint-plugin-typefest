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
const invalidDirectThrowConsequentCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) throw new TypeError('Missing value');",
    "",
    "    return value;",
    "}",
].join("\n");
const binaryEqWithoutNullValidCode = [
    "function ensureValue(value: string | null, fallback: string): string {",
    "    if (value == fallback) {",
    "        throw new TypeError('Unexpected equality');",
    "    }",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");
const logicalWithNonBinaryTermValidCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value === null || !value) {",
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
                name: "reports fixture nullish guard patterns",
            },
            {
                code: inlineInvalidEqNullCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports loose null comparison guard",
            },
            {
                code: inlineInvalidLogicalCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict null-or-undefined logical guard",
            },
            {
                code: inlineInvalidLogicalReversedCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict logical guard with reversed operands",
            },
            {
                code: invalidNullOnLeftEqGuardCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports loose null guard with literal on left",
            },
            {
                code: invalidDirectThrowConsequentCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports direct-throw loose null guard",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: nonThrowConsequentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores guard with non-throw consequent",
            },
            {
                code: multiStatementThrowBlockValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores throw block with additional statement",
            },
            {
                code: sameKindLogicalValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores repeated null comparison kind",
            },
            {
                code: alternateBranchValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores guard with explicit else branch",
            },
            {
                code: mismatchedLogicalExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mismatched logical nullish subjects",
            },
            {
                code: nonNullishLogicalValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-nullish logical comparisons",
            },
            {
                code: nonEqualityTestValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-equality guard expression",
            },
            {
                code: binaryEqWithoutNullValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores equality check that omits nullish literals",
            },
            {
                code: logicalWithNonBinaryTermValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores logical guard containing non-binary term",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-assert-present.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
