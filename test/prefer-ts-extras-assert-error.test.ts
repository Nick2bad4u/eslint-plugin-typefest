/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-error.test` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { describe, expect, it } from "vitest";

import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-assert-error";
const docsDescription =
    "require ts-extras assertError over manual instanceof Error throw guards.";
const docsUrl =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-assert-error.md";
const preferTsExtrasAssertErrorMessage =
    "Prefer `assertError` from `ts-extras` over manual `instanceof Error` throw guards.";
const suggestTsExtrasAssertErrorMessage =
    "Replace this manual guard with `assertError(...)` from `ts-extras`.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-error.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-error.invalid.ts";
const inlineInvalidCode = [
    "function ensureError(value: unknown): asserts value is Error {",
    "    if (!(value instanceof Error)) {",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const inlineInvalidDirectThrowConsequentCode = [
    "function ensureError(value: unknown): asserts value is Error {",
    "    if (!(value instanceof Error))",
    "        throw new TypeError('Expected Error');",
    "}",
].join("\n");
const nonErrorInstanceofValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof TypeError)) {",
    "        throw new TypeError('Expected TypeError');",
    "    }",
    "}",
].join("\n");
const nonThrowOnlyValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error)) {",
    "        String(value);",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const singleExpressionConsequentValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error)) {",
    "        String(value);",
    "    }",
    "}",
].join("\n");
const throwThenTrailingStatementValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value instanceof Error)) {",
    "        throw new TypeError('Expected Error');",
    "        String(value);",
    "    }",
    "}",
].join("\n");
const nonNegatedInstanceofValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (value instanceof Error) {",
    "        throw new TypeError('Unexpected Error');",
    "    }",
    "}",
].join("\n");
const nonInstanceofBinaryValidCode = [
    "function ensureError(value: unknown): void {",
    "    if (!(value !== Error)) {",
    "        throw new TypeError('Expected Error constructor mismatch');",
    "    }",
    "}",
].join("\n");
const privateIdentifierValidCode = [
    "class ErrorContainer {",
    "    #value: unknown;",
    "",
    "    constructor(value: unknown) {",
    "        this.#value = value;",
    "    }",
    "",
    "    ensureError(): void {",
    "        if (!(this.#value instanceof Error)) {",
    "            throw new TypeError('Expected Error');",
    "        }",
    "    }",
    "}",
].join("\n");
const skipPathInvalidCode = inlineInvalidCode;
const inlineSuggestableCode = [
    'import { assertError } from "ts-extras";',
    "",
    "function ensureError(value: unknown): asserts value is Error {",
    "    if (!(value instanceof Error)) {",
    "        throw new TypeError('Expected Error');",
    "    }",
    "}",
].join("\n");
const inlineSuggestableOutput = [
    'import { assertError } from "ts-extras";',
    "",
    "function ensureError(value: unknown): asserts value is Error {",
    "    assertError(value);",
    "}",
].join("\n");
const inlineInvalidSuggestionOutputCode = [
    'import { assertError } from "ts-extras";',
    "function ensureError(value: unknown): asserts value is Error {",
    "    assertError(value);",
    "}",
].join("\n");
const privateIdentifierInvalidSuggestionOutputCode = [
    'import { assertError } from "ts-extras";',
    "class ErrorContainer {",
    "    #value: unknown;",
    "",
    "    constructor(value: unknown) {",
    "        this.#value = value;",
    "    }",
    "",
    "    ensureError(): void {",
    "        assertError(this.#value);",
    "    }",
    "}",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferTsExtrasAssertError: preferTsExtrasAssertErrorMessage,
        suggestTsExtrasAssertError: suggestTsExtrasAssertErrorMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-assert-error metadata literals", () => {
    it("declares authored docs URL and hasSuggestions literals", () => {
        expect(rule.meta.docs.url).toBe(docsUrl);
        expect(rule.meta.hasSuggestions).toBe(true);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                },
                {
                    messageId: "preferTsExtrasAssertError",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture assert-error guard patterns",
        },
        {
            code: inlineInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports negated instanceof Error guard",
        },
        {
            code: privateIdentifierValidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: privateIdentifierInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports private field instanceof Error guard",
        },
        {
            code: inlineInvalidDirectThrowConsequentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct-throw instanceof Error guard",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertError",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertError",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests assertError() replacement when import is in scope",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonErrorInstanceofValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores instanceof TypeError guard",
        },
        {
            code: nonThrowOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard block with extra side effect",
        },
        {
            code: singleExpressionConsequentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard block without throw statement",
        },
        {
            code: throwThenTrailingStatementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard block with throw plus trailing statement",
        },
        {
            code: nonNegatedInstanceofValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-negated instanceof Error guard",
        },
        {
            code: nonInstanceofBinaryValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-instanceof binary guard",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-assert-error.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
