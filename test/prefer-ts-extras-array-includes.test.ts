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

const validFixtureName = "prefer-ts-extras-array-includes.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-includes.invalid.ts";
const skipPathInvalidCode = [
    "const values = [1, 2, 3];",
    "const hasValue = values.includes(2);",
    "String(hasValue);",
].join("\n");
const computedAccessValidCode = [
    "const values = [1, 2, 3];",
    'const hasValue = values["includes"](2);',
    "String(hasValue);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    includes(value: number): boolean {",
    "        return value === 1;",
    "    },",
    "};",
    "const hasValue = helper.includes(1);",
    "String(hasValue);",
].join("\n");
const wrongPropertyValidCode = [
    "const values = [1, 2, 3];",
    "const hasValue = values.some((value) => value === 2);",
    "String(hasValue);",
].join("\n");
const readonlyArrayInvalidCode = [
    "declare const values: readonly number[];",
    "const hasValue = values.includes(2);",
    "String(hasValue);",
].join("\n");
const unionWithNonArrayValidCode = [
    "declare const values: number[] | number;",
    "const hasValue = values.includes(2);",
    "String(hasValue);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-array-includes",
    getPluginRule("prefer-ts-extras-array-includes"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayIncludes",
                    },
                    {
                        messageId: "preferTsExtrasArrayIncludes",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture-based includes usages",
            },
            {
                code: readonlyArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayIncludes" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports readonly array includes call",
            },
            {
                code: unionWithNonArrayValidCode,
                errors: [{ messageId: "preferTsExtrasArrayIncludes" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union containing array when calling includes",
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
                name: "ignores computed includes member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array includes method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-includes array method calls",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-array-includes.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
