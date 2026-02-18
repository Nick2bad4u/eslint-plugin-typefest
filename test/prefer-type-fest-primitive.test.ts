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
