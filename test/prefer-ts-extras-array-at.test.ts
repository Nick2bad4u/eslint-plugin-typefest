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

const validFixtureName = "prefer-ts-extras-array-at.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-at.invalid.ts";
const skipPathInvalidCode = [
    "const values = [1, 2, 3];",
    "const value = values.at(0);",
    "String(value);",
].join("\n");
const computedAccessValidCode = [
    "const values = [1, 2, 3];",
    'const value = values["at"](0);',
    "String(value);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    at(index: number): number {",
    "        return index;",
    "    },",
    "};",
    "const value = helper.at(0);",
    "String(value);",
].join("\n");
const readonlyArrayInvalidCode = [
    "declare const values: readonly number[];",
    "const value = values.at(0);",
    "String(value);",
].join("\n");
const unionWithNonArrayValidCode = [
    "declare const values: number[] | number;",
    "const value = values.at(0);",
    "String(value);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-array-at",
    getPluginRule("prefer-ts-extras-array-at"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayAt",
                    },
                    {
                        messageId: "preferTsExtrasArrayAt",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: readonlyArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionWithNonArrayValidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
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
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-array-at.skip.ts"
                ),
            },
        ],
    }
);
