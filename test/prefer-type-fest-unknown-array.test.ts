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
            name: "reports fixture readonly unknown array aliases",
        },
        {
            code: inlineInvalidReadonlyArrayCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown array shorthand alias",
        },
        {
            code: inlineInvalidReadonlyNonArrayOperatorCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly operator over unknown[] type reference",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown array shorthand",
        },
        {
            code: inlineValidAnyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly any array shorthand",
        },
        {
            code: inlineValidNoTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array with concrete element type",
        },
        {
            code: inlineValidKeyofUnknownArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores keyof unknown[] type query",
        },
        {
            code: inlineValidMissingReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray without explicit unknown element",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-array.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
