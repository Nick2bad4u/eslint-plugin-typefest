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

const validFixtureName = "prefer-ts-extras-array-find.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-find.invalid.ts";
const skipPathInvalidCode = [
    "const numbers = [1, 2, 3];",
    "const found = numbers.find((value) => value === 2);",
    "String(found);",
].join("\n");
const computedAccessValidCode = [
    "const numbers = [1, 2, 3];",
    'const found = numbers["find"]((value) => value === 2);',
    "String(found);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    find(predicate: (value: number) => boolean): number | undefined {",
    "        return predicate(1) ? 1 : undefined;",
    "    },",
    "};",
    "const found = helper.find((value) => value === 1);",
    "String(found);",
].join("\n");
const wrongPropertyValidCode = [
    "const numbers = [1, 2, 3];",
    "const found = numbers.filter((value) => value === 1);",
    "String(found);",
].join("\n");
const unionArrayInvalidCode = [
    "declare const numbers: number[] | readonly number[];",
    "const found = numbers.find((value) => value === 2);",
    "String(found);",
].join("\n");
const unionWithCustomValidCode = [
    "type Custom = {",
    "    find(predicate: (value: number) => boolean): number | undefined;",
    "};",
    "declare const numbers: number[] | Custom;",
    "const found = numbers.find((value) => value === 2);",
    "String(found);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-array-find",
    getPluginRule("prefer-ts-extras-array-find"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayFind",
                    },
                    {
                        messageId: "preferTsExtrasArrayFind",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayFind" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionWithCustomValidCode,
                errors: [{ messageId: "preferTsExtrasArrayFind" }],
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
                    "prefer-ts-extras-array-find.skip.ts"
                ),
            },
        ],
    }
);
