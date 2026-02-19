/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-set.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-set");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-set.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-set.invalid.ts";
const inlineInvalidSetCode = "type Input = Set<unknown>;";
const inlineInvalidReadonlySetCode = "type Input = ReadonlySet<unknown>;";
const inlineValidSetCode = "type Input = Set<string>;";
const inlineValidReadonlySetCode = "type Input = ReadonlySet<number>;";
const inlineValidReadonlySetNoTypeArgumentsCode = "type Input = ReadonlySet;";
const inlineValidReadonlySetWrongArityCode =
    "type Input = ReadonlySet<unknown, unknown>;";
const inlineValidGlobalReadonlySetCode =
    "type Input = globalThis.ReadonlySet<unknown>;";
const skipPathInvalidCode = inlineInvalidReadonlySetCode;

ruleTester.run("prefer-type-fest-unknown-set", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferUnknownSet",
                },
                {
                    messageId: "preferUnknownSet",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidReadonlySetCode,
            errors: [{ messageId: "preferUnknownSet" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: inlineInvalidSetCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidSetCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidReadonlySetNoTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidReadonlySetWrongArityCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidGlobalReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-set.skip.ts"
            ),
        },
    ],
});
