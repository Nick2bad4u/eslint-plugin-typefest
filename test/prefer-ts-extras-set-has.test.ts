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
const setDifferentMethodValidCode = [
    "const values = new Set([1, 2, 3]);",
    "values.clear();",
    "String(values.size);",
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
                name: "reports fixture set.has usage",
            },
            {
                code: unionSetInvalidCode,
                errors: [{ messageId: "preferTsExtrasSetHas" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union of set and readonly set",
            },
            {
                code: mixedUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasSetHas" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union of set and map when calling has",
            },
            {
                code: declaredUnionSetInvalidCode,
                errors: [{ messageId: "preferTsExtrasSetHas" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared set-like union has call",
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
                name: "ignores computed has member access",
            },
            {
                code: nonSetReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom object has method",
            },
            {
                code: setDifferentMethodValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-has set method invocation",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-set-has.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
