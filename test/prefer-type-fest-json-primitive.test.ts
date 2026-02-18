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
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(partialValidFixtureName),
            filename: typedFixturePath(partialValidFixtureName),
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
        },
    ],
});
