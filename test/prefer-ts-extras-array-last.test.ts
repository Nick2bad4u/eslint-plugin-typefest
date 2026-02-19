/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-last.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-last");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-last.valid.ts";
const patternValidFixtureName = "prefer-ts-extras-array-last.patterns.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-last.invalid.ts";
const skipFixtureName = "tests/prefer-ts-extras-array-last.skip.ts";
const inlineInvalidUnionArrayCode = [
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const lastStatus = monitorStatuses[monitorStatuses.length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineInvalidTupleCode = [
    "const monitorStatuses: [string, string] = ['down', 'up'];",
    "const lastStatus = monitorStatuses[monitorStatuses.length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineValidDeleteWriteTargetCode = [
    "const mutableStatuses = ['down', 'up'];",
    "delete mutableStatuses[mutableStatuses.length - 1];",
    "String(mutableStatuses);",
].join("\n");

ruleTester.run("prefer-ts-extras-array-last", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayLast",
                },
                {
                    messageId: "preferTsExtrasArrayLast",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidUnionArrayCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(patternValidFixtureName),
            filename: typedFixturePath(patternValidFixtureName),
        },
        {
            code: inlineValidDeleteWriteTargetCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
        },
    ],
});
