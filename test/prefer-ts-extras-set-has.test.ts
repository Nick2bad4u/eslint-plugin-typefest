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

const validFixtureName = "prefer-ts-extras-set-has.valid.ts";
const invalidFixtureName = "prefer-ts-extras-set-has.invalid.ts";
const skipPathInvalidCode = [
    "const values = new Set([1, 2, 3]);",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const computedAccessValidCode = [
    "const values = new Set([1, 2, 3]);",
    'const hasValue = values["has"](2);',
    "String(hasValue);",
].join("\n");
const nonSetReceiverValidCode = [
    "const helper = {",
    "    has(value: number): boolean {",
    "        return value === 1;",
    "    },",
    "};",
    "const hasValue = helper.has(1);",
    "String(hasValue);",
].join("\n");
const unionSetInvalidCode = [
    "const values: Set<number> | ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const mixedUnionInvalidCode = [
    "declare const values: Set<number> | Map<number, number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const declaredUnionSetInvalidCode = [
    "declare const values: Set<number> | ReadonlySet<number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-set-has",
    getPluginRule("prefer-ts-extras-set-has"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasSetHas",
                    },
                    {
                        messageId: "preferTsExtrasSetHas",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: unionSetInvalidCode,
                errors: [{ messageId: "preferTsExtrasSetHas" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: mixedUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasSetHas" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: declaredUnionSetInvalidCode,
                errors: [{ messageId: "preferTsExtrasSetHas" }],
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
                code: nonSetReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-set-has.skip.ts"
                ),
            },
        ],
    }
);
