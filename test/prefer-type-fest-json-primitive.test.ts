/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-primitive.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-json-primitive");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-primitive.valid.ts";
const partialValidFixtureName =
    "prefer-type-fest-json-primitive.partial.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-primitive.invalid.ts";
const skipFixtureName = "tests/prefer-type-fest-json-primitive.skip.ts";
const nonKeywordUnionValidCode =
    "type Payload = string | number | boolean | bigint;";
const duplicatePrimitiveUnionValidCode =
    "type Payload = string | number | boolean | number;";

ruleTester.run("prefer-type-fest-json-primitive", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferJsonPrimitive",
                },
                {
                    messageId: "preferJsonPrimitive",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonPrimitive-like unions",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(partialValidFixtureName),
            filename: typedFixturePath(partialValidFixtureName),
            name: "accepts partial primitive union fixture",
        },
        {
            code: nonKeywordUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union containing non-json primitive keyword",
        },
        {
            code: duplicatePrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores duplicate member primitive union",
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
