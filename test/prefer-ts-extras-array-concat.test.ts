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

const validFixtureName = "prefer-ts-extras-array-concat.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-concat.invalid.ts";
const skipPathInvalidCode = [
    "const numbers = [1, 2, 3];",
    "const merged = numbers.concat([4]);",
    "String(merged);",
].join("\n");
const computedAccessValidCode = [
    "const numbers = [1, 2, 3];",
    'const merged = numbers["concat"]([4]);',
    "String(merged);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    concat(values: readonly number[]): readonly number[] {",
    "        return values;",
    "    },",
    "};",
    "const merged = helper.concat([1, 2]);",
    "String(merged);",
].join("\n");
const wrongPropertyValidCode = [
    "const numbers = [1, 2, 3];",
    "const merged = numbers.map((value) => value);",
    "String(merged);",
].join("\n");
const unionArrayInvalidCode = [
    "declare const numbers: number[] | readonly number[];",
    "const merged = numbers.concat([4]);",
    "String(merged);",
].join("\n");
const unionWithCustomValidCode = [
    "type Custom = {",
    "    concat(values: readonly number[]): readonly number[];",
    "};",
    "declare const numbers: number[] | Custom;",
    "const merged = numbers.concat([4]);",
    "String(merged);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-array-concat",
    getPluginRule("prefer-ts-extras-array-concat"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayConcat",
                    },
                    {
                        messageId: "preferTsExtrasArrayConcat",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayConcat" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionWithCustomValidCode,
                errors: [{ messageId: "preferTsExtrasArrayConcat" }],
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
                    "prefer-ts-extras-array-concat.skip.ts"
                ),
            },
        ],
    }
);
