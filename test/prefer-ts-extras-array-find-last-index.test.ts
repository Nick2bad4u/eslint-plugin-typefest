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

const validFixtureName = "prefer-ts-extras-array-find-last-index.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-find-last-index.invalid.ts";
const skipPathInvalidCode = [
    "const numbers = [1, 2, 3];",
    "const index = numbers.findLastIndex((value) => value > 1);",
    "String(index);",
].join("\n");
const computedAccessValidCode = [
    "const numbers = [1, 2, 3];",
    'const index = numbers["findLastIndex"]((value) => value > 1);',
    "String(index);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    findLastIndex(predicate: (value: number) => boolean): number {",
    "        return predicate(3) ? 0 : -1;",
    "    },",
    "};",
    "const index = helper.findLastIndex((value) => value > 1);",
    "String(index);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-array-find-last-index",
    getPluginRule("prefer-ts-extras-array-find-last-index"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayFindLastIndex",
                    },
                    {
                        messageId: "preferTsExtrasArrayFindLastIndex",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture findLastIndex usage",
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
                name: "ignores computed findLastIndex member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array findLastIndex method",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-array-find-last-index.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
