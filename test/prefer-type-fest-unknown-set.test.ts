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
            name: "reports fixture UnknownSet aliases",
        },
        {
            code: inlineInvalidReadonlySetCode,
            errors: [{ messageId: "preferUnknownSet" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline ReadonlySet<unknown> alias",
        },
    ],
    valid: [
        {
            code: inlineInvalidSetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable Set<unknown> alias",
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidSetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable Set with concrete element type",
        },
        {
            code: inlineValidReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet with concrete element type",
        },
        {
            code: inlineValidReadonlySetNoTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet without type arguments",
        },
        {
            code: inlineValidReadonlySetWrongArityCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet with invalid generic arity",
        },
        {
            code: inlineValidGlobalReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlySet reference",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-set.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
