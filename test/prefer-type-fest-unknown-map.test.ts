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
const inlineValidReadonlyMapNoTypeArgumentsCode = "type Input = ReadonlyMap;";
const inlineValidReadonlyMapWrongArityCode =
    "type Input = ReadonlyMap<unknown, unknown, unknown>;";
const inlineValidGlobalReadonlyMapCode =
    "type Input = globalThis.ReadonlyMap<unknown, unknown>;";
const skipPathInvalidCode = inlineInvalidReadonlyMapCode;
const inlineFixableCode = [
    'import type { UnknownMap } from "type-fest";',
    "",
    "type Input = ReadonlyMap<unknown, unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownMap } from "type-fest";',
    "",
    "type Input = UnknownMap;",
].join("\n");

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
            name: "reports fixture UnknownMap aliases",
        },
        {
            code: inlineInvalidReadonlyMapCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown map shorthand",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlyMap<unknown, unknown> when UnknownMap import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: inlineInvalidMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown map shorthand alias",
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidMixedMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown map alias",
        },
        {
            code: inlineValidMixedReadonlyMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly map with mismatched value type",
        },
        {
            code: inlineValidReadonlyMapNoTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyMap without generic arguments",
        },
        {
            code: inlineValidReadonlyMapWrongArityCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyMap with wrong generic arity",
        },
        {
            code: inlineValidGlobalReadonlyMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlyMap reference",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-map.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
