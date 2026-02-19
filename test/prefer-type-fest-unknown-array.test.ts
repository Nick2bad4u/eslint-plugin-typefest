/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-array.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-array");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-array.invalid.ts";
const inlineInvalidReadonlyArrayCode = "type Input = readonly unknown[];";
const inlineValidArrayCode = "type Input = unknown[];";
const inlineValidAnyArrayCode = "type Input = readonly any[];";
const inlineValidNoTypeArgumentCode = "type Input = ReadonlyArray<string>;";
const inlineValidKeyofUnknownArrayCode = "type Input = keyof unknown[];";
const inlineInvalidReadonlyNonArrayOperatorCode =
    "type Input = readonly ReadonlyArray<unknown>;";
const inlineValidMissingReadonlyArrayTypeArgumentCode =
    "type Input = ReadonlyArray;";
const skipPathInvalidCode = inlineInvalidReadonlyArrayCode;

ruleTester.run("prefer-type-fest-unknown-array", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferUnknownArray",
                },
                {
                    messageId: "preferUnknownArray",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidReadonlyArrayCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidReadonlyNonArrayOperatorCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidArrayCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidAnyArrayCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidNoTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidKeyofUnknownArrayCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMissingReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-array.skip.ts"
            ),
        },
    ],
});
