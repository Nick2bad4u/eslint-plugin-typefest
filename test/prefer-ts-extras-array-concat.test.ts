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
const inlineFixableCode = [
    'import { arrayConcat } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const merged = sample.concat([4]);",
].join("\n");
const inlineFixableOutput = [
    'import { arrayConcat } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const merged = arrayConcat(sample, [4]);",
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
                name: "reports fixture array.concat usage",
            },
            {
                code: unionArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayConcat" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union of mutable and readonly arrays",
            },
            {
                code: unionWithCustomValidCode,
                errors: [{ messageId: "preferTsExtrasArrayConcat" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union including custom concat receiver",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayConcat" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes array.concat() when arrayConcat import is in scope",
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
                name: "ignores computed concat member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array concat method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-concat array method call",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-array-concat.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
