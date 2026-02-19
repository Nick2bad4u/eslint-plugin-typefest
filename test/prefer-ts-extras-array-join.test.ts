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

const validFixtureName = "prefer-ts-extras-array-join.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-join.invalid.ts";
const skipPathInvalidCode = [
    "const values = ['a', 'b'];",
    "const joined = values.join('-');",
    "String(joined);",
].join("\n");
const computedAccessValidCode = [
    "const values = ['a', 'b'];",
    'const joined = values["join"]("-");',
    "String(joined);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    join(separator: string): string {",
    "        return separator;",
    "    },",
    "};",
    "const joined = helper.join('-');",
    "String(joined);",
].join("\n");
const wrongPropertyValidCode = [
    "const values = ['a', 'b'];",
    "const joined = values.toString();",
    "String(joined);",
].join("\n");
const unionArrayInvalidCode = [
    "declare const values: string[] | readonly string[];",
    "const joined = values.join('-');",
    "String(joined);",
].join("\n");
const unionWithCustomValidCode = [
    "type Custom = {",
    "    join(separator?: string): string;",
    "};",
    "declare const values: string[] | Custom;",
    "const joined = values.join('-');",
    "String(joined);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-array-join",
    getPluginRule("prefer-ts-extras-array-join"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayJoin",
                    },
                    {
                        messageId: "preferTsExtrasArrayJoin",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayJoin" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionWithCustomValidCode,
                errors: [{ messageId: "preferTsExtrasArrayJoin" }],
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
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-array-join.skip.ts"
                ),
            },
        ],
    }
);
