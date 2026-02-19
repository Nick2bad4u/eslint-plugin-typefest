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
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionStringInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: mixedUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: declaredStringUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: computedAccessValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: nonStringReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-string-split.skip.ts"
                ),
            },
        ],
    }
);
