/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-array.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-json-array");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-array.invalid.ts";

ruleTester.run("prefer-type-fest-json-array", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferJsonArray",
                },
                {
                    messageId: "preferJsonArray",
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
    ],
});
