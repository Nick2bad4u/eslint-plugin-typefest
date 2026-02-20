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
                name: "reports fixture array.join usage",
            },
            {
                code: unionArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayJoin" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union of mutable and readonly arrays",
            },
            {
                code: unionWithCustomValidCode,
                errors: [{ messageId: "preferTsExtrasArrayJoin" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union including custom join receiver",
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
                name: "ignores computed join member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array join method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-join array method call",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-array-join.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
