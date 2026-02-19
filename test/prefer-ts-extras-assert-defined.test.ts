/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-defined.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-defined");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-defined.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-defined.invalid.ts";
const undefinedOnLeftInvalidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (undefined === value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const looseEqualityInvalidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value == undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonUndefinedValidCode = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonThrowOnlyValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        String(value);",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const alternateValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    } else {",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const skipPathInvalidCode = undefinedOnLeftInvalidCode;

ruleTester.run("prefer-ts-extras-assert-defined", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: undefinedOnLeftInvalidCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: looseEqualityInvalidCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonThrowOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: alternateValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-assert-defined.skip.ts"
            ),
        },
    ],
});
