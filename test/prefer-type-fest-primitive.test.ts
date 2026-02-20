/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-primitive.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-primitive");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-primitive.valid.ts";
const partialValidFixtureName = "prefer-type-fest-primitive.partial.valid.ts";
const invalidFixtureName = "prefer-type-fest-primitive.invalid.ts";
const skipFixtureName = "tests/prefer-type-fest-primitive.skip.ts";
const nonPrimitiveKeywordUnionValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | object;";
const inlineFixableCode = [
    'import type { Primitive } from "type-fest";',
    "",
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | undefined;",
].join("\n");
const inlineFixableOutput = [
    'import type { Primitive } from "type-fest";',
    "",
    "type PrimitiveLike = Primitive;",
].join("\n");

ruleTester.run("prefer-type-fest-primitive", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferPrimitive",
                },
                {
                    messageId: "preferPrimitive",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture primitive alias unions",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes primitive keyword union when Primitive import is in scope",
            output: inlineFixableOutput,
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
            code: nonPrimitiveKeywordUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union containing non-primitive object keyword",
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
