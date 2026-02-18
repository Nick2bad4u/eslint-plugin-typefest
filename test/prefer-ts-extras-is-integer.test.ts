/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-integer.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-integer");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-integer.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-integer.invalid.ts";

ruleTester.run("prefer-ts-extras-is-integer", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsInteger",
                },
                {
                    messageId: "preferTsExtrasIsInteger",
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
