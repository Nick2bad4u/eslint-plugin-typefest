/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-first.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-first");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-first.valid.ts";
const writeTargetValidFixtureName =
    "prefer-ts-extras-array-first.write-target.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-first.invalid.ts";
const skipFixtureName = "tests/prefer-ts-extras-array-first.skip.ts";
const inlineInvalidUnionArrayCode = [
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const firstStatus = monitorStatuses[0];",
    "String(firstStatus);",
].join("\n");
const inlineInvalidStringZeroCode = [
    "declare const monitorStatuses: readonly string[];",
    'const firstStatus = monitorStatuses["0"];',
    "String(firstStatus);",
].join("\n");
const inlineInvalidUnaryVoidCode = [
    "declare const monitorStatuses: readonly string[];",
    "void monitorStatuses[0];",
].join("\n");
const inlineValidDeleteWriteTargetCode = [
    "const mutableStatuses = ['down', 'up'];",
    "delete mutableStatuses[0];",
    "String(mutableStatuses);",
].join("\n");

ruleTester.run("prefer-ts-extras-array-first", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayFirst",
                },
                {
                    messageId: "preferTsExtrasArrayFirst",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidUnionArrayCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidStringZeroCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidUnaryVoidCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(writeTargetValidFixtureName),
            filename: typedFixturePath(writeTargetValidFixtureName),
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
