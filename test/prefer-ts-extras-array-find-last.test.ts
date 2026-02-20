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

const validFixtureName = "prefer-ts-extras-array-find-last.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-find-last.invalid.ts";
const skipPathInvalidCode = [
    "const numbers = [1, 2, 3];",
    "const found = numbers.findLast((value) => value > 1);",
    "String(found);",
].join("\n");
const computedAccessValidCode = [
    "const numbers = [1, 2, 3];",
    'const found = numbers["findLast"]((value) => value > 1);',
    "String(found);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    findLast(predicate: (value: number) => boolean): number | undefined {",
    "        return predicate(3) ? 3 : undefined;",
    "    },",
    "};",
    "const found = helper.findLast((value) => value > 1);",
    "String(found);",
].join("\n");
const wrongPropertyValidCode = [
    "const numbers = [1, 2, 3];",
    "const found = numbers.find((value) => value > 1);",
    "String(found);",
].join("\n");
const unionArrayInvalidCode = [
    "declare const numbers: number[] | readonly number[];",
    "const found = numbers.findLast((value) => value > 1);",
    "String(found);",
].join("\n");
const unionWithCustomValidCode = [
    "type Custom = {",
    "    findLast(predicate: (value: number) => boolean): number | undefined;",
    "};",
    "declare const numbers: number[] | Custom;",
    "const found = numbers.findLast((value) => value > 1);",
    "String(found);",
].join("\n");
const inlineFixableCode = [
    'import { arrayFindLast } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const found = sample.findLast((value) => value > 1);",
].join("\n");
const inlineFixableOutput = [
    'import { arrayFindLast } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const found = arrayFindLast(sample, (value) => value > 1);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-array-find-last",
    getPluginRule("prefer-ts-extras-array-find-last"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayFindLast",
                    },
                    {
                        messageId: "preferTsExtrasArrayFindLast",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture findLast usage",
            },
            {
                code: unionArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayFindLast" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union of mutable and readonly arrays",
            },
            {
                code: unionWithCustomValidCode,
                errors: [{ messageId: "preferTsExtrasArrayFindLast" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union including custom findLast receiver",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayFindLast" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes array.findLast() when arrayFindLast import is in scope",
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
                name: "ignores computed findLast member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array findLast method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-findLast array method call",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-array-find-last.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
