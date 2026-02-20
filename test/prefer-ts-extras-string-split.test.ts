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

const validFixtureName = "prefer-ts-extras-string-split.valid.ts";
const invalidFixtureName = "prefer-ts-extras-string-split.invalid.ts";

const inlineInvalidCode = [
    "const value = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

const computedAccessValidCode = [
    "const value = 'a,b';",
    'const parts = value["split"](",");',
    "String(parts);",
].join("\n");

const nonStringReceiverValidCode = [
    "const helper = {",
    "    split(separator: string): readonly string[] {",
    "        return [separator];",
    "    },",
    "};",
    "const parts = helper.split(',');",
    "String(parts);",
].join("\n");
const differentStringMethodValidCode = [
    "const value = 'a,b';",
    "const normalized = value.toUpperCase();",
    "String(normalized);",
].join("\n");
const unionStringInvalidCode = [
    "const value: 'a,b' | 'c,d' = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const mixedUnionInvalidCode = [
    "declare const value: string | { split(separator: string): readonly string[] };",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const declaredStringUnionInvalidCode = [
    "declare const value: string | String;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");

const skipPathInvalidCode = inlineInvalidCode;
const inlineFixableCode = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = value.split(',');",
].join("\n");
const inlineFixableOutput = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = stringSplit(value, ',');",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-string-split",
    getPluginRule("prefer-ts-extras-string-split"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture string.split usage",
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports direct string.split call",
            },
            {
                code: unionStringInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports literal string union split call",
            },
            {
                code: mixedUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports mixed union split call",
            },
            {
                code: declaredStringUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared string object union split call",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes string.split() when stringSplit import is in scope",
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
                code: computedAccessValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed split member access",
            },
            {
                code: nonStringReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-string split method",
            },
            {
                code: differentStringMethodValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-split string method call",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-string-split.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
