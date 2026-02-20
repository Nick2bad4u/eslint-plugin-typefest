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
            name: "reports fixture last-index array reads",
        },
        {
            code: inlineInvalidUnionArrayCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports last-index read on readonly array union",
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports tuple last-index read via length arithmetic",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(patternValidFixtureName),
            filename: typedFixturePath(patternValidFixtureName),
            name: "accepts fixture pattern-safe variants",
        },
        {
            code: inlineValidDeleteWriteTargetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores delete write-target last index usage",
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
