/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-map.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-map");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-map.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-map.invalid.ts";
const inlineInvalidMapCode = "type Input = Map<unknown, unknown>;";
const inlineInvalidReadonlyMapCode =
    "type Input = ReadonlyMap<unknown, unknown>;";
const inlineValidMixedMapCode = "type Input = Map<string, unknown>;";
const inlineValidMixedReadonlyMapCode =
    "type Input = ReadonlyMap<unknown, string>;";
const skipPathInvalidCode = inlineInvalidReadonlyMapCode;

ruleTester.run("prefer-type-fest-unknown-map", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferUnknownMap",
                },
                {
                    messageId: "preferUnknownMap",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidReadonlyMapCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: inlineInvalidMapCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMixedMapCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMixedReadonlyMapCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-map.skip.ts"
            ),
        },
    ],
});
