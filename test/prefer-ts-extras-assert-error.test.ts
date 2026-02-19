/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-error.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-error");
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

ruleTester.run("prefer-ts-extras-assert-error", rule, {
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
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasAssertError" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: privateIdentifierValidCode,
            errors: [{ messageId: "preferTsExtrasAssertError" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidDirectThrowConsequentCode,
            errors: [{ messageId: "preferTsExtrasAssertError" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonErrorInstanceofValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonThrowOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-assert-error.skip.ts"
            ),
        },
    ],
});
